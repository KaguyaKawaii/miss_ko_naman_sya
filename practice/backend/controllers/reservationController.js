// controllers/reservationController.js
const Reservation = require("../models/Reservation");
const Notification = require("../models/Notification");
const ArchivedReservation = require("../models/ArchivedReservation");
const User = require("../models/User");
const Room = require("../models/Room");
const sendEmail = require("../mailer");
const logAction = require("../utils/logAction");
const generateReservationEmail = require("../utils/generateReservationEmail");
const availabilityService = require("../services/availabilityService");
const Admin = require("../models/Admin");


/* ------------------------------------------------
   ✅ CHECK USER RESERVATION LIMIT
------------------------------------------------ */
exports.checkUserReservationLimit = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, time, asMain } = req.query;

    if (!date || !time) {
      return res.status(400).json({ blocked: true, reason: "Date and time are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ blocked: true, reason: "User not found." });

    // Calculate selected range
    const selectedStart = new Date(`${date}T${time}:00.000Z`);
    const selectedEnd = new Date(selectedStart.getTime() + 60 * 60 * 1000);

    // Check conflicts (main + participant)
    const conflictingReservations = await Reservation.find({
      status: { $in: ["Approved", "Pending"] },
      $or: [{ userId }, { "participants.idNumber": user.id_number }],
      datetime: { $lt: selectedEnd },
      endDatetime: { $gt: selectedStart }
    });

    if (conflictingReservations.length > 0) {
      return res.json({ blocked: true, reason: "You already have a conflicting reservation during this time." });
    }

    // Weekly limit check (only for main user)
    if (asMain === "true") {
      const weekStart = new Date(selectedStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const mainReservations = await Reservation.find({
        userId,
        status: { $in: ["Approved", "Pending"] },
        datetime: { $gte: weekStart, $lte: weekEnd }
      });

      const reservedDays = new Set(mainReservations.map(r => new Date(r.datetime).toISOString().split("T")[0]));
      if (reservedDays.has(date)) return res.json({ blocked: true, reason: "You already have a reservation on this day." });
      if (reservedDays.size >= 2) return res.json({ blocked: true, reason: "You already used your 2 reservation days this week." });
    }

    res.json({ blocked: false });
  } catch (err) {
    console.error("Reservation limit check error:", err);
    res.status(500).json({ blocked: true, reason: err.message });
  }
};

/* ------------------------------------------------
   ✅ GET RESERVATIONS
------------------------------------------------ */


// In reservationController.js - getAllReservations function
exports.getAllReservations = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};

    if (userId) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === "Staff" && user.floor && user.floor !== "N/A") {
        // Normalize floor names for matching
        const normalizeFloor = (floorName) => {
          if (!floorName) return "";
          const normalized = floorName.toLowerCase().trim();
          
          if (normalized.includes("2nd") || normalized.includes("second")) return "2nd Floor";
          if (normalized.includes("3rd") || normalized.includes("third")) return "3rd Floor";
          if (normalized.includes("4th") || normalized.includes("fourth")) return "4th Floor";
          if (normalized.includes("5th") || normalized.includes("fifth")) return "5th Floor";
          
          return floorName;
        };

        const normalizedStaffFloor = normalizeFloor(user.floor);
        
        // Use regex to match floor names with different formats
        query.location = { 
          $regex: normalizedStaffFloor.replace(" Floor", "").trim(), 
          $options: "i" 
        };
      }
      // Admin → query stays empty (fetch all)
    }

    const reservations = await Reservation.find(query)
      .populate("userId room_Id")
      .sort({ datetime: -1 });

    res.json(reservations);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
};




exports.getUserReservations = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // ✅ Fetch ALL reservations (including Expired/Rejected, no 24h cutoff)
    const reservations = await Reservation.find({
      $or: [
        { userId: req.params.userId },
        { "participants.idNumber": user.id_number }
      ]
    }).sort({ datetime: -1 });

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reservations." });
  }
};


exports.getActiveReservation = async (req, res) => {
  try {
    // Calculate the cutoff time (24 hours ago)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    const reservation = await Reservation.findOne({
      userId: req.params.userId,
      status: { $in: ["Pending", "Approved", "Ongoing"] },
      endDatetime: { $gte: new Date() },
      // Additional filter to exclude recently expired/rejected reservations
      $or: [
        { status: { $nin: ["Rejected", "Expired"] } },
        { 
          status: { $in: ["Rejected", "Expired"] },
          createdAt: { $gte: twentyFourHoursAgo }
        }
      ]
    }).sort({ datetime: 1 });
    
    res.json(reservation || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch active reservation" });
  }
};


/* ------------------------------------------------
   ✅ CREATE RESERVATION
------------------------------------------------ */
exports.createReservation = async (req, res) => {
  try {
    const {
      userId,
      room_Id,
      date,
      time,
      location,
      roomName,
      purpose,
      participants,
      datetime,
      numUsers
    } = req.body;

    if (!userId || !date || !datetime || !location || !roomName || !purpose)
      return res.status(400).json({ message: "Missing required fields." });

    const parsedDatetime = new Date(datetime);
    const endDatetime = new Date(parsedDatetime.getTime() + 60 * 60 * 1000);

    // ✅ RULE: Reservation must be booked at least 1 day in advance
    const now = new Date();
    const minAllowed = new Date();
    minAllowed.setDate(minAllowed.getDate() + 1);
    minAllowed.setHours(0, 0, 0, 0);
    if (parsedDatetime < minAllowed) {
      return res.status(400).json({
        message: "Reservations must be made at least 1 day in advance."
      });
    }

    // ✅ RULE: Group size must be between 4 and 8 (including main user)
    const totalGroupSize = (participants?.length || 0) + 1;
    if (totalGroupSize < 4 || totalGroupSize > 8) {
      return res.status(400).json({
        message: "Group size must be between 4 and 8 users including the main reserver."
      });
    }

    // ✅ Get main user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.verified)
      return res.status(400).json({ message: "Main user account is not verified." });

    // ✅ Check overlapping reservations for room
    const conflictingReservation = await Reservation.findOne({
      roomName,
      location,
      status: { $in: ["Approved", "Ongoing"] },
      datetime: { $lt: endDatetime },
      endDatetime: { $gt: parsedDatetime }
    });
    if (conflictingReservation)
      return res.status(400).json({ message: "This room is already booked for this time." });

    // ✅ Weekly limit
    const startOfWeek = new Date(parsedDatetime);
    const day = startOfWeek.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyReservations = await Reservation.find({
      userId,
      datetime: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $in: ["Pending", "Approved", "Ongoing"] }
    });

    const reservedDays = new Set(weeklyReservations.map(r => new Date(r.datetime).toDateString()));
    if (reservedDays.has(parsedDatetime.toDateString()))
      return res.status(400).json({ message: "You already have a reservation today." });
    if (reservedDays.size >= 2)
      return res.status(400).json({ message: "You already used your 2 reservation days this week." });

    // ✅ Validate participants & collect emails
    const enrichedParticipants = [];
    for (const participant of participants) {
      const participantUser = await User.findOne({ id_number: participant.idNumber });
      if (!participantUser)
        return res.status(400).json({ message: `Participant with ID ${participant.idNumber} not found.` });
      if (!participantUser.verified)
        return res.status(400).json({ message: `Participant ${participantUser.name} is not verified.` });

      const conflicts = await Reservation.find({
        $or: [
          { userId: participantUser._id },
          { "participants.idNumber": participantUser.id_number }
        ],
        datetime: { $lt: endDatetime },
        endDatetime: { $gt: parsedDatetime },
        status: { $in: ["Pending", "Approved", "Ongoing"] }
      });
      if (conflicts.length > 0)
        return res.status(400).json({ message: `Participant ${participantUser.name} has a conflicting reservation.` });

      enrichedParticipants.push({
        idNumber: participantUser.id_number,
        name: participantUser.name,
        course: participantUser.course || "N/A",
        year_level: participantUser.yearLevel || "N/A",
        department: participantUser.department || "N/A"
      });
    }

    // ✅ Create reservation (with expireAt for auto-cancel if no-show)
    const reservation = await Reservation.create({
      userId,
      room_Id,
      date,
      datetime: parsedDatetime,
      endDatetime,
      numUsers: totalGroupSize,
      purpose,
      location,
      roomName,
      participants: enrichedParticipants,
      status: "Pending",
      expireAt: new Date(parsedDatetime.getTime() + 15 * 60 * 1000) // auto-expire after 15 mins
    });

    // ✅ Notify user
    await Notification.create({
      userId,
      reservationId: reservation._id,
      message: `Your reservation for ${roomName} on ${date} is pending approval.`,
      status: "Pending",
      type: "reservation",
      isRead: false,
      dismissed: false
    });

    // ✅ Notify admins from Admins collection
    const admins = await Admin.find();
    const adminNotifs = admins.map(a => ({
      adminId: a._id,
      reservationId: reservation._id,
      message: `📅 New reservation request by ${user.name} for ${roomName} on ${date}.`,
      status: "New",
      type: "reservation",
      isRead: false,
      dismissed: false
    }));
    await Notification.insertMany(adminNotifs);

    // ✅ Emit via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.to(userId.toString()).emit("notification", {
        message: `Your reservation for ${roomName} on ${date} is pending approval.`,
        type: "reservation"
      });

      admins.forEach(a => {
        io.to(a._id.toString()).emit("notification", {
          message: `📅 New reservation request by ${user.name} for ${roomName} on ${date}.`,
          type: "reservation"
        });
      });
    }

    // ✅ Send email to main reserver
    await sendEmail({
      to: user.email,
      subject: "Reservation Pending",
      html: generateReservationEmail({
        status: "Pending",
        toName: user.name,
        reservation,
        formattedDate: date,
        time,
        participants: enrichedParticipants
      })
    });

    // ✅ Send email to participants
    for (const participant of enrichedParticipants) {
      if (participant.idNumber === user.id_number) continue;
      const participantUser = await User.findOne({ id_number: participant.idNumber });
      if (participantUser?.email) {
        await sendEmail({
          to: participantUser.email,
          subject: "You have been added as a participant",
          html: generateReservationEmail({
            status: "Pending",
            toName: participant.name,
            reservation,
            formattedDate: date,
            time,
            participants: enrichedParticipants,
            isParticipant: true
          })
        });
      }
    }

    res.status(201).json(reservation);
  } catch (err) {
    console.error("Reservation creation error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};




/* ------------------------------------------------
   ✅ UPDATE / CANCEL RESERVATION
------------------------------------------------ */
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Approved", "Rejected", "Cancelled", "Ongoing", "Expired"];
    if (!allowedStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status." });

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId");
    if (!reservation) return res.status(404).json({ message: "Reservation not found." });

    // ✅ Create notification in DB
    await Notification.create({
      userId: reservation.userId._id,
      reservationId: reservation._id,
      message: `Your reservation for ${reservation.roomName} has been ${status.toLowerCase()}.`,
      status
    });

    // ✅ Send emails
    try {
      const emailHtml = generateReservationEmail({
        status,
        toName: reservation.userId.name,
        reservation,
        formattedDate: reservation.date,
        time: `${new Date(reservation.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(reservation.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        participants: reservation.participants
      });

      // 📧 Send to main user
      if (reservation.userId.email) {
        await sendEmail({
          to: reservation.userId.email,
          subject: `Reservation ${status}`,
          html: emailHtml
        });
      }

      // 📧 Send to participants, but skip the main user if they are in the list
      for (const participant of reservation.participants) {
        if (participant.idNumber === reservation.userId.id_number) continue; // 🚫 Skip main reserver
        const participantUser = await User.findOne({ id_number: participant.idNumber });
        if (participantUser?.email) {
          await sendEmail({
            to: participantUser.email,
            subject: `Reservation ${status}`,
            html: generateReservationEmail({
              status,
              toName: participant.name,
              reservation,
              formattedDate: reservation.date,
              time: `${new Date(reservation.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(reservation.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              participants: reservation.participants,
              isParticipant: true
            })
          });
        }
      }
    } catch (emailErr) {
      console.warn("⚠️ Failed to send status email:", emailErr.message);
    }

    res.status(200).json(reservation);
  } catch (err) {
    console.error("Error updating reservation status:", err);
    res.status(500).json({ message: "Failed to update reservation." });
  }
};


exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate("userId");
    if (!reservation) return res.status(404).json({ message: "Reservation not found." });

    reservation.status = "Cancelled";
    await reservation.save();

    await Notification.create({
      userId: reservation.userId._id,
      reservationId: reservation._id,
      message: `Your reservation for ${reservation.roomName} was cancelled.`,
      status: "Cancelled"
    });

    // ✅ Send email to main user
    try {
      await sendEmail({
        to: reservation.userId.email,
        subject: "Reservation Cancelled",
        html: generateReservationEmail({
          status: "Cancelled",
          toName: reservation.userId.name,
          reservation,
          formattedDate: reservation.date,
          time: `${new Date(reservation.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          participants: reservation.participants
        })
      });

      // ✅ Send email to participants, but skip main reserver
      for (const participant of reservation.participants) {
        if (participant.idNumber === reservation.userId.id_number) continue; // 🚫 Skip main reserver
        const participantUser = await User.findOne({ id_number: participant.idNumber });
        if (participantUser?.email) {
          await sendEmail({
            to: participantUser.email,
            subject: "Reservation Cancelled",
            html: generateReservationEmail({
              status: "Cancelled",
              toName: participant.name,
              reservation,
              formattedDate: reservation.date,
              time: `${new Date(reservation.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              participants: reservation.participants
            })
          });
        }
      }
    } catch (emailErr) {
      console.warn("⚠️ Failed to send cancellation email:", emailErr.message);
    }

    res.json({ message: "Reservation cancelled successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel reservation." });
  }
};


/* ------------------------------------------------
   ✅ AVAILABILITY (via Service)
------------------------------------------------ */
exports.getAvailability = async (req, res) => {
  const { date, userId } = req.query;
  if (!date || !userId) return res.status(400).json({ message: "Missing date or userId" });

  try {
    const data = await availabilityService.generateAvailability(date, userId);
    res.json(data);
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
};

/* ------------------------------------------------
   ✅ ARCHIVE / RESTORE
------------------------------------------------ */
exports.archiveReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    await ArchivedReservation.create({ ...reservation.toObject(), archivedAt: new Date() });
    await Reservation.findByIdAndDelete(req.params.id);

    res.json({ message: "Reservation archived successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to archive reservation" });
  }
};

exports.getArchivedReservations = async (req, res) => {
  try {
    const archived = await ArchivedReservation.find().populate("userId room_Id");
    res.json(archived);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch archived reservations" });
  }
};

exports.restoreReservation = async (req, res) => {
  try {
    const archived = await ArchivedReservation.findById(req.params.id);
    if (!archived) return res.status(404).json({ message: "Not found in archive" });

    const restoredData = archived.toObject();
    delete restoredData._id;

    if (!restoredData.date && restoredData.datetime) {
      restoredData.date = new Date(restoredData.datetime).toISOString().split("T")[0];
    }

    const restoredReservation = new Reservation(restoredData);
    await restoredReservation.save();
    await ArchivedReservation.findByIdAndDelete(req.params.id);

    res.json({ message: "Reservation restored", restoredReservation });
  } catch (err) {
    res.status(500).json({ message: "Failed to restore reservation" });
  }
};

exports.deleteArchivedReservation = async (req, res) => {
  try {
    const archived = await ArchivedReservation.findById(req.params.id);
    if (!archived) return res.status(404).json({ message: "Archived reservation not found." });

    await ArchivedReservation.findByIdAndDelete(req.params.id);

    res.json({ message: "Archived reservation permanently deleted." });
  } catch (err) {
    console.error("Delete archived reservation error:", err);
    res.status(500).json({ message: "Failed to delete reservation." });
  }
};

exports.generateAvailability = async (date, userId) => {
  try {
    // ✅ Get all active rooms dynamically
    const rooms = await Room.find({ isActive: true }).sort({ floor: 1, room: 1 });

    // ✅ Fetch reservations only for the given date & relevant statuses
    const reservations = await Reservation.find({
      date,
      status: { $in: ["Pending", "Approved"] },
    });

    // ✅ Build availability response
    const availability = rooms.map((room) => {
      const roomReservations = reservations.filter(
        (r) => r.location === room.floor && r.roomName === room.room
      );

      const occupied = roomReservations.map((r) => ({
        start: r.datetime,      // Full DateTime (start)
        end: r.endDatetime,     // Full DateTime (end)
        mine: r.userId.toString() === userId,
        status: r.status,
      }));

      return {
        floor: room.floor,
        room: room.room,
        occupied,
      };
    });

    return availability;
  } catch (error) {
    console.error("Error generating availability:", error);
    throw error;
  }
};

// ✅ Availability route controller
exports.getAvailability = async (req, res) => {
  try {
    const { date, userId } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const availability = await exports.generateAvailability(date, userId);
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch availability", error: error.message });
  }
};

// ✅ Check and mark expired reservations + notify
// ✅ Check and mark expired reservations + notify
exports.checkExpiredReservations = async (req, res) => {
  try {
    console.log("🔄 Running checkExpiredReservations...");
    const now = new Date();

    // Find reservations that should expire (ended or no-show after 15 min)
    const expiringReservations = await Reservation.find({
      status: { $in: ["Pending", "Approved", "Ongoing"] },
      $or: [
        { endDatetime: { $lte: now } }, // already ended
        { datetime: { $lte: new Date(now.getTime() - 15 * 60 * 1000) }, checkedIn: false } // no-show
      ]
    }).populate("userId");

    if (expiringReservations.length === 0) {
      return res.json({ message: "No reservations to expire." });
    }

    // Mark them as expired
    const ids = expiringReservations.map(r => r._id);
    await Reservation.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "Expired" } }
    );

    const io = req.app.get("io");

    // Process each reservation
    for (const reservation of expiringReservations) {
      const reason =
        reservation.endDatetime <= now
          ? "has ended."
          : "was cancelled because no one checked in within 15 minutes.";

      // ✅ DB notification for main user
      await Notification.create({
        userId: reservation.userId._id,
        reservationId: reservation._id,
        message: `Your reservation for ${reservation.roomName} ${reason}`,
        status: "Expired",
        type: "reservation",
        isRead: false,
        dismissed: false,
      });

      // ✅ Real-time socket update for main user
      if (io) {
        io.to(reservation.userId._id.toString()).emit("notification", {
          message: `Your reservation for ${reservation.roomName} ${reason}`,
          type: "reservation",
        });
      }

      // ✅ Email main user
      if (reservation.userId.email) {
        try {
          await sendEmail({
            to: reservation.userId.email,
            subject: "Reservation Expired",
            html: generateReservationEmail({
              status: "Expired",
              toName: reservation.userId.name,
              reservation,
              formattedDate: reservation.date,
              time: `${new Date(reservation.datetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${new Date(reservation.endDatetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
              participants: reservation.participants,
              extraNote: reason,
            }),
          });
        } catch (emailErr) {
          console.warn("⚠️ Failed to send expiration email:", emailErr.message);
        }
      }

      // ✅ Notify participants
      for (const participant of reservation.participants) {
        if (participant.idNumber === reservation.userId.id_number) continue; // skip main
        const participantUser = await User.findOne({ id_number: participant.idNumber });

        if (participantUser?.email) {
          await sendEmail({
            to: participantUser.email,
            subject: "Reservation Expired",
            html: generateReservationEmail({
              status: "Expired",
              toName: participant.name,
              reservation,
              formattedDate: reservation.date,
              time: `${new Date(reservation.datetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${new Date(reservation.endDatetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
              participants: reservation.participants,
              isParticipant: true,
              extraNote: reason,
            }),
          });
        }

        // ✅ Real-time socket for participants
        if (io && participantUser) {
          io.to(participantUser._id.toString()).emit("notification", {
            message: `Reservation for ${reservation.roomName} ${reason}`,
            type: "reservation",
          });
        }
      }
    }

    res.json({ message: `${expiringReservations.length} reservations expired and notified.` });
  } catch (err) {
    console.error("Error checking expired reservations:", err);
    res.status(500).json({ message: "Failed to check expired reservations." });
  }
};


// controllers/reservationController.js
// controllers/reservationController.js
exports.getReservationsByFloor = async (req, res) => {
  try {
    const floor = req.query.floor || req.params.floor; // works with ?floor= or /floor/:floor
    let query = {};
    if (floor) {
      query.floor = floor;
    }

    const reservations = await Reservation.find(query)
      .populate("userId", "name email")
      .sort({ created_at: -1 });

    res.status(200).json(reservations);
  } catch (err) {
    console.error("Error fetching reservations by floor:", err);
    res.status(500).json({ message: "Server error" });
  }
};
