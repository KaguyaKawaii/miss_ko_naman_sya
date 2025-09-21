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
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("userId room_Id")
      .sort({ datetime: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Calculate the cutoff time (24 hours ago)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const reservations = await Reservation.find({
      $or: [{ userId: req.params.userId }, { "participants.idNumber": user.id_number }],
      // Filter out Rejected/Expired reservations older than 24 hours
      $and: [
        {
          $or: [
            {
              // Show all reservations that are NOT Rejected or Expired
              status: { $nin: ["Rejected", "Expired"] }
            },
            {
              // OR show Rejected/Expired reservations that were created within last 24 hours
              status: { $in: ["Rejected", "Expired"] },
              createdAt: { $gte: twentyFourHoursAgo }
            }
          ]
        }
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

    // ✅ Get main user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

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

    // ✅ Create reservation
    const reservation = await Reservation.create({
      userId,
      room_Id,
      date,
      datetime: parsedDatetime,
      endDatetime,
      numUsers,
      purpose,
      location,
      roomName,
      participants: enrichedParticipants,
      status: "Pending"
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
    const admins = await Admin.find(); // ⬅️ FIX: get from admins collection
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
      // send to the user
      io.to(userId.toString()).emit("notification", {
        message: `Your reservation for ${roomName} on ${date} is pending approval.`,
        type: "reservation"
      });

      // send to each admin individually
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