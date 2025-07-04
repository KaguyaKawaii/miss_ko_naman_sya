const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const Notification = require("../models/Notification");
const User = require("../models/User");
const sendEmail = require("../mailer");
const Room = require("../models/Room");


// Get any reservation for today involving the user
router.get("/reservations/user-has-any/:userId", async (req, res) => {
  const { userId } = req.params;
  const now = new Date();

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json(null);

    const reservation = await Reservation.findOne({
      $or: [
        { userId: user._id }, // Match by _id for main reserver
        { "participants.idNumber": user.id_number } // Match by ID number for participant
      ],
      endDatetime: { $gte: now },
      status: { $in: ["Pending", "Approved", "Ongoing"] }
    }).lean();

    return res.status(200).json(reservation || null);
  } catch (err) {
    console.error("Error checking user reservation:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// PATCH — Cancel reservation (for users)
router.patch("/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id).populate("userId");
    if (!reservation) {
      console.log("Reservation not found for id:", id);
      return res.status(404).json({ message: "Reservation not found." });
    }

    console.log("Cancelling reservation with status:", reservation.status);

    if (["Cancelled", "Expired"].includes(reservation.status)) {
      return res.status(400).json({ message: "Reservation is already cancelled or expired." });
    }

    reservation.status = "Cancelled";
    await reservation.save();

    const formattedDate = new Date(reservation.date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Notify reserver
    if (reservation.userId) {
      await Notification.create({
        userId: reservation.userId._id,
        reservationId: reservation._id,
        message: `Your reservation for ${reservation.roomName} on ${formattedDate} has been cancelled.`,
        status: "Cancelled",
      });

      if (reservation.userId.email && reservation.userId.email.trim() !== "") {
        try {
          await sendEmail({
            to: reservation.userId.email,
            subject: "Room Reservation Cancelled",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fafafa;">
                <h2 style="color: #cc0000;">Room Reservation Cancelled</h2>
                <p>Hi <strong>${reservation.userId.name}</strong>,</p>
                <p>Your reservation for:</p>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Room:</strong> ${reservation.roomName}</li>
                  <li><strong>Date:</strong> ${formattedDate}</li>
                </ul>
                <p>has been <strong style="color: #cc0000;">cancelled</strong>.</p>
                <p>If you have any concerns, please contact the <strong>LRC Team</strong>.</p>
                <p style="margin-top: 30px;">Thank you,<br><strong>LRC Reservation System</strong></p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to email reserver:", emailErr.message);
        }
      } else {
        console.warn(`⚠️ No email found for reserver ${reservation.userId.name}`);
      }
    }

    // Notify participants
    for (const participant of reservation.participants) {
      const participantUser = await User.findOne({ id_number: participant.idNumber });
      if (participantUser) {
        // Create notification
        await Notification.create({
          userId: participantUser._id,
          reservationId: reservation._id,
          message: `The reservation for ${reservation.roomName} on ${formattedDate} you were part of has been cancelled.`,
          status: "Cancelled",
        });

        // Send email
        if (participantUser.email && participantUser.email.trim() !== "") {
          try {
            await sendEmail({
              to: participantUser.email,
              subject: "Room Reservation Cancelled",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fafafa;">
                  <h2 style="color: #cc0000;">Room Reservation Cancelled</h2>
                  <p>Hi <strong>${participantUser.name}</strong>,</p>
                  <p>The reservation you were a participant in has been <strong style="color: #cc0000;">cancelled</strong>. Details:</p>
                  <ul>
                    <li><strong>Room:</strong> ${reservation.roomName}</li>
                    <li><strong>Date:</strong> ${formattedDate}</li>
                    <li><strong>Location:</strong> ${reservation.location}</li>
                    <li><strong>Purpose:</strong> ${reservation.purpose}</li>
                  </ul>
                  <p>Please contact the <strong>LRC Team</strong> for any concerns.</p>
                  <p style="margin-top: 30px;">Thank you,<br><strong>LRC Reservation System</strong></p>
                </div>
              `,
            });
          } catch (emailErr) {
            console.error(`Failed to email participant ${participantUser.name}:`, emailErr.message);
          }
        } else {
          console.warn(`⚠️ No email found for participant ${participantUser.name}`);
        }
      }
    }

    console.log("Reservation cancelled successfully.");
    res.status(200).json({ message: "Reservation cancelled successfully.", reservation });

  } catch (err) {
    console.error("Cancel reservation error:", err.message, err.stack);
    res.status(500).json({ message: "Failed to cancel reservation.", error: err.message });
  }
});





router.get("/participant-active/:userId", async (req, res) => {
  const { userId } = req.params;

const activeRes = await Reservation.findOne({
  participants: userId,
  status: { $in: ["Approved", "Pending"] },
  endDatetime: { $gte: new Date() },
});

  if (activeRes) return res.json(activeRes);
  res.json(null);
});


// POST /reservations/participants/conflict
router.post("/participants/conflict", async (req, res) => {
  try {
    const { participantIds } = req.body;
    const now = new Date();

    for (const idNumber of participantIds) {
      const user = await User.findOne({ id_number: idNumber });
      if (!user) continue;

      const active = await Reservation.findOne({
        status: { $in: ["Approved", "Ongoing"] },
        $or: [{ userId: user._id }, { "participants.userId": user._id }],
        endDatetime: { $gte: now },
      });

      if (active) {
        return res.json({
          hasConflict: true,
          message: `${user.name} already has an active reservation until ${new Date(active.endDatetime).toLocaleString("en-PH")}`,
        });
      }
    }

    return res.json({ hasConflict: false });
  } catch (err) {
    console.error("Participant conflict check failed:", err);
    res.status(500).json({ message: "Conflict check error." });
  }
});


const getStatusColor = (status) => {
  switch (status) {
    case "Approved":
      return "#28a745"; // green
    case "Rejected":
      return "#CC0000"; // red
    case "Cancelled":
      return "#6c757d"; // gray
    case "Ongoing":
      return "#007bff"; // blue
    default:
      return "#333333";
  }
};

const generateReservationEmail = ({ status, toName, reservation, formattedDate, time, participants }) => {
  const headerColor = getStatusColor(status);
  const participantsList = participants.map(p => `<li>${p.name}</li>`).join("");

  // Custom footer message based on status
  let footerMessage = "";

  if (status === "Approved" || status === "Ongoing") {
    footerMessage = `
      <p style="font-size: 15px; color: #333;">
        <strong>Reminder:</strong> Please arrive at least <strong>15 minutes before your reserved time</strong>. 
        If no one arrives within <strong>15 minutes after your scheduled time</strong>, the reservation will be <strong style="color: #CC0000;">automatically cancelled</strong> by the system.
      </p>
    `;
  } else if (status === "Rejected") {
    footerMessage = `
      <p style="font-size: 15px; color: #333;">
        Your room reservation request has been <strong style="color: ${headerColor};">Rejected</strong>. 
        Please contact the reservation officer or admin for further details if needed.
      </p>
    `;
  } else if (status === "Cancelled") {
    footerMessage = `
      <p style="font-size: 15px; color: #333;">
        Your room reservation has been <strong style="color: ${headerColor};">Cancelled</strong>. 
        You may submit a new reservation request if needed.
      </p>
    `;
  }

  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="background: ${headerColor}; color: #ffffff; padding: 20px 30px;">
        <h2 style="margin: 0;">Reservation ${status}</h2>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px;">Hi <strong>${toName}</strong>,</p>
        <p>Your reservation for <strong>${reservation.roomName}</strong> on the <strong>${reservation.location}</strong> has been <strong style="color: ${headerColor};">${status}</strong>. Here are the details:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #eee;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>Time:</strong></td>
            <td style="padding: 8px; border: 1px solid #eee;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>Location:</strong></td>
            <td style="padding: 8px; border: 1px solid #eee;">${reservation.location}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>Room:</strong></td>
            <td style="padding: 8px; border: 1px solid #eee;">${reservation.roomName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #eee;"><strong>Purpose:</strong></td>
            <td style="padding: 8px; border: 1px solid #eee;">${reservation.purpose}</td>
          </tr>
        </table>

        <h4>Participants:</h4>
        <ul style="padding-left: 20px; margin-bottom: 20px;">
          ${participantsList}
        </ul>

        ${footerMessage}

        <p style="margin-top: 30px; font-size: 13px; color: #999;">This is an automated message from the Room Reservation System.</p>
      </div>
    </div>
  </div>
  `;
};


// GET all reservations (admin)
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("userId")
      .sort({ datetime: -1 });
    res.status(200).json(reservations);
  } catch (err) {
    console.error("Error fetching all reservations:", err);
    res.status(500).json({ message: "Failed to fetch reservations." });
  }
});

// GET reservations where user is either the reserver or a participant
router.get("/user-participating/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const reservations = await Reservation.find({
      $or: [
        { userId: userId },
        { "participants.idNumber": user.id_number }
      ]
    }).sort({ datetime: -1 });

    res.status(200).json(reservations);
  } catch (err) {
    console.error("Error fetching participant reservations:", err);
    res.status(500).json({ message: "Failed to fetch reservations." });
  }
});


// GET — Check if a user exists and is verified by ID Number
router.get("/check-participant", async (req, res) => {
  try {
    const { idNumber } = req.query;
    if (!idNumber) return res.status(400).json({ message: "ID Number is required." });

    const user = await User.findOne({ id_number: idNumber });
    if (!user) return res.json({ exists: false });

    return res.json({
      exists: true,
      verified: user.verified,
      name: user.name,
      course: user.course,
      yearLevel: user.yearLevel,
      department: user.department,
      role: user.role
    });
  } catch (err) {
    console.error("Check participant error:", err);
    res.status(500).json({ message: "Failed to check participant." });
  }
});


// In reservationRoutes.js - complete POST endpoint
router.post("/", async (req, res) => {
  try {
    const {
  userId,
  room_Id, // ✅ FIXED — ADD THIS
  date,
  time,
  numUsers,
  purpose,
  location,
  roomName,
  participants,
  datetime, // if still using it
} = req.body;


if (!userId || !date || !datetime || !location || !roomName || !purpose) {
  return res.status(400).json({ message: "Missing required fields." });
}

const parsedDatetime = new Date(datetime);
if (isNaN(parsedDatetime.getTime())) {
  return res.status(400).json({ message: "Invalid datetime format." });
}

// ✅ FIXED: Use parsedDatetime instead of datetime string
const endDatetime = new Date(parsedDatetime.getTime() + 2 * 60 * 60 * 1000);


    // Calculate end time (2 hours duration)
    
    const now = new Date();
    const dayStart = new Date(`${date}T00:00:00`);
    const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    // 1️⃣ Check room availability
    const conflictingReservation = await Reservation.findOne({
  roomName,
  location,
  status: { $in: ["Approved", "Ongoing"] },
  $or: [
    { datetime: { $lt: endDatetime }, endDatetime: { $gt: parsedDatetime } },
  ],
});


    if (conflictingReservation) {
      return res.status(400).json({ 
        message: `This room is already booked from ${new Date(conflictingReservation.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to ${new Date(conflictingReservation.endDatetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      });
    }

    // 2️⃣ Check active reservation for this user
    const activeReservation = await Reservation.findOne({
      userId,
      status: { $in: ["Pending", "Approved", "Ongoing"] },
      endDatetime: { $gt: now },
    });
    if (activeReservation) {
      return res.status(400).json({ message: "You already have an active reservation." });
    }

    // 3️⃣ Check same-day reservation for this user
    const sameDayReservation = await Reservation.findOne({
      userId,
      datetime: { $gte: dayStart, $lt: nextDay },
    });
    if (sameDayReservation) {
      return res.status(400).json({ message: "You already made a reservation for this day." });
    }

    // 4️⃣ Validate participants
    const enrichedParticipants = [];
    for (const participant of participants) {
      const user = await User.findOne({ id_number: participant.idNumber });
      if (!user) {
        return res.status(400).json({ message: `Participant with ID ${participant.idNumber} not found.` });
      }

      if (!user.verified) {
        return res.status(400).json({ message: `Participant ${user.name} is not verified.` });
      }

      if (user.name !== participant.name) {
        return res.status(400).json({
          message: `Name mismatch for ID ${participant.idNumber}. Expected: ${user.name}`
        });
      }

      // Check participant's active reservations
      const hasActiveRes = await Reservation.findOne({
        status: { $in: ["Pending", "Approved", "Ongoing"] },
        $or: [
          { userId: user._id },
          { "participants.idNumber": user.id_number },
        ],
        endDatetime: { $gte: now },
      });

      if (hasActiveRes) {
        return res.status(400).json({
          message: `Participant ${user.name} already has an active reservation.`,
        });
      }

      enrichedParticipants.push({
        idNumber: user.id_number,
        name: user.name,
        course: user.course || "N/A",
        year_level: user.yearLevel || "N/A",
        department: user.department || "N/A",
      });
    }

    // ✅ Create the reservation
    const reservation = await Reservation.create({
  userId,
  room_Id, // ✅ CRITICAL LINE
  date,
  datetime: parsedDatetime,
  endDatetime,
  numUsers,
  purpose,
  location,
  roomName,
  participants: enrichedParticipants,
  status: "Pending",
});


    const formattedDate = new Date(reservation.date).toLocaleDateString("en-PH", {
      year: "numeric", month: "long", day: "numeric"
    });

    // ✅ Notify reserver
    await Notification.create({
      userId,
      reservationId: reservation._id,
      message: `Your reservation for ${reservation.roomName} on ${formattedDate} is now pending approval.`,
      status: "Pending",
    });

    // ✅ Notify and email participants
    for (const participant of participants) {
      const user = await User.findOne({ id_number: participant.idNumber });

      if (user) {
        await Notification.create({
          userId: user._id,
          reservationId: reservation._id,
          message: `You have been added to a reservation for ${reservation.roomName} on ${formattedDate}.`,
          status: "Pending",
        });

        if (user.email && user.email.trim() !== "") {
          const otherParticipantsHTML = participants
            .filter((p) => p.idNumber !== user.id_number)
            .map((p) => `<li>${p.name}</li>`)
            .join("");

          await sendEmail({
            to: user.email,
            subject: "Room Reservation Notification",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #CC0000;">Room Reservation Notification</h2>
                <p>Hi <strong>${user.name}</strong>,</p>
                <p>You have been added as a participant in a room reservation. Here are the details:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">    
                  <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${formattedDate}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${time}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Location:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${location}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Room:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${roomName}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Purpose:</strong></td><td style="padding: 8px; border: 1px solid #eee;">${purpose}</td></tr>
                </table>
                <h4>Participants:</h4>
                <ul style="padding-left: 20px;">
                  <li><strong>${user.name}</strong></li>
                  ${otherParticipantsHTML || "<li>No other participants</li>"}
                </ul>
                <p style="margin-top: 20px;">Please log in to your dashboard for full reservation details and updates.</p>
                <p style="margin-top: 30px; font-size: 13px; color: #666;">This is an automated notification from the Room Reservation System.</p>
              </div>
            `,
          });
        }
      }
    }

    res.status(201).json(reservation);

  } catch (err) {
    console.error("Reservation creation error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// GET user's reservations
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Reservation.find({ userId }).sort({ datetime: -1 });
    res.status(200).json(reservations);
  } catch (err) {
    console.error("User reservations fetch error:", err);
    res.status(500).json({ message: "Failed to fetch reservations." });
  }
});

// GET latest reservation for a user
router.get("/latest/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const latestReservation = await Reservation.findOne({ userId })
      .sort({ datetime: -1 })
      .populate("userId");

    res.status(200).json(latestReservation);
  } catch (err) {
    console.error("Fetch latest reservation error:", err);
    res.status(500).json({ message: "Failed to fetch latest reservation." });
  }
});


// GET active reservation (if user is owner or participant)
router.get("/active/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Check for ANY reservation today (Pending, Approved, Ongoing)
    const activeReservation = await Reservation.findOne({
      $or: [
        { userId },
        { "participants.userId": userId }
      ],
      datetime: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ["Pending", "Approved", "Ongoing"] }
    });

    res.status(200).json(activeReservation || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — Check if user can reserve (no active or pending reservation today)
router.get("/can-reserve/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const existingReservation = await Reservation.findOne({
  $or: [
    { userId },
    { "participants.userId": userId }
  ],
  datetime: { $gte: startOfToday, $lte: endOfToday },
  status: { $in: ["Pending", "Approved", "Ongoing", "Rejected"] }
});


    if (existingReservation) {
      return res.status(200).json({ canReserve: false, existingReservation });
    }

    res.status(200).json({ canReserve: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT — Update status + notification
// PUT — Update status + notifications for reserver and participants
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Approved", "Rejected", "Cancelled", "Ongoing", "Expired"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const reservation = await Reservation.findByIdAndUpdate(id, { status }, { new: true }).populate("userId");
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const formattedDate = new Date(reservation.date).toLocaleDateString("en-PH", {
      year: "numeric", month: "long", day: "numeric"
    });

    const messages = {
      Approved: `Your reservation for ${reservation.roomName} on ${formattedDate} has been approved.`,
      Rejected: `Your reservation for ${reservation.roomName} on ${formattedDate} has been rejected.`,
      Cancelled: `Your reservation for ${reservation.roomName} on ${formattedDate} has been cancelled.`,
      Ongoing: `Your reservation for ${reservation.roomName} on ${formattedDate} is now ongoing.`,
      Expired: `Your reservation for ${reservation.roomName} on ${formattedDate} has expired.`,
    };

    // Notify reserver
    await Notification.create({
      userId: reservation.userId._id,
      reservationId: reservation._id,
      message: messages[status],
      status: status,
    });

    // Notify participants
    for (const participant of reservation.participants) {
      const participantUser = await User.findOne({ id_number: participant.idNumber });
      if (participantUser) {
        await Notification.create({
          userId: participantUser._id,
          reservationId: reservation._id,
          message: `The reservation for ${reservation.roomName} on ${formattedDate} you are part of has been ${status.toLowerCase()}.`,
          status: status,
        });
      }
    }

    // Send email to reserver
    if (reservation.userId.email && reservation.userId.email.trim() !== "") {
      const participantsList = reservation.participants.map(p => ({ name: p.name }));

      const emailHtml = generateReservationEmail({
        status,
        toName: reservation.userId.name,
        reservation,
        formattedDate,
        time: new Date(reservation.datetime).toLocaleTimeString("en-PH", { hour: '2-digit', minute: '2-digit' }),
        participants: participantsList
      });

      await sendEmail({
        to: reservation.userId.email,
        subject: `Your reservation has been ${status}`,
        html: emailHtml
      });
    }

    res.status(200).json(reservation);

  } catch (err) {
    console.error("Update reservation error:", err);
    res.status(500).json({ message: "Failed to update reservation." });
  }
});


// DELETE — Remove reservation
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Reservation.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Reservation not found." });
    }
    res.status(200).json({ message: "Reservation deleted successfully." });
  } catch (err) {
    console.error("Delete reservation error:", err);
    res.status(500).json({ message: "Failed to delete reservation." });
  }
});

// Check for upcoming reservations (15 minutes before start)
router.get("/check-upcoming", async (req, res) => {
  try {
    const now = new Date();
    const notificationTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    const upcomingReservations = await Reservation.find({
      datetime: { 
        $gte: now,
        $lte: notificationTime
      },
      status: "Approved",
      notificationSent: { $ne: true } // Only if notification hasn't been sent
    }).populate("userId");

    const updates = upcomingReservations.map(async (reservation) => {
      // Mark as notification sent
      reservation.notificationSent = true;
      await reservation.save();

      const formattedTime = new Date(reservation.datetime).toLocaleTimeString("en-PH", {
        hour: '2-digit', 
        minute: '2-digit'
      });

      // Send notification to reserver
      await Notification.create({
        userId: reservation.userId._id,
        reservationId: reservation._id,
        message: `Your reservation for ${reservation.roomName} starts at ${formattedTime} (in 15 minutes).`,
        status: "Reminder",
      });

      // Email to reserver
      if (reservation.userId.email) {
        await sendEmail({
          to: reservation.userId.email,
          subject: `Upcoming Reservation - Starts at ${formattedTime}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #007bff;">Upcoming Reservation Reminder</h2>
              <p>Hi ${reservation.userId.name},</p>
              <p>Your reservation for <strong>${reservation.roomName}</strong> will start in <strong>15 minutes</strong> (at ${formattedTime}).</p>
              <p>Please arrive on time to avoid cancellation.</p>
              <p style="margin-top: 20px;"><strong>Details:</strong></p>
              <ul>
                <li>Room: ${reservation.roomName}</li>
                <li>Time: ${formattedTime}</li>
                <li>Location: ${reservation.location}</li>
              </ul>
              <p style="margin-top: 30px; color: #666;">This is an automated reminder.</p>
            </div>
          `
        });
      }

      // Notify participants
      for (const participant of reservation.participants) {
        const user = await User.findOne({ id_number: participant.idNumber });
        if (user) {
          await Notification.create({
            userId: user._id,
            reservationId: reservation._id,
            message: `The reservation you're participating in starts at ${formattedTime} (in 15 minutes).`,
            status: "Reminder",
          });
        }
      }
    });

    await Promise.all(updates);
    res.json({ message: `${upcomingReservations.length} upcoming reservation(s) notified.` });
  } catch (err) {
    console.error("Upcoming reservation check error:", err);
    res.status(500).json({ error: "Failed to check upcoming reservations." });
  }
});

// GET — Auto-expire reservations that haven't been claimed by start time
router.get("/check-expired", async (req, res) => {
  try {
    const now = new Date();
    const expiredReservations = await Reservation.find({
      datetime: { $lte: now }, // Past start time
      status: { $in: ["Approved", "Pending"] } // Both approved and pending
    });

    const updates = expiredReservations.map(async (reservation) => {
      reservation.status = "Expired";
      await reservation.save();

      const formattedTime = new Date(reservation.datetime).toLocaleTimeString("en-PH", {
        hour: '2-digit', 
        minute: '2-digit'
      });

      // Notify reserver
      await Notification.create({
        userId: reservation.userId,
        reservationId: reservation._id,
        message: `Your reservation for ${reservation.roomName} at ${formattedTime} has expired because no one arrived on time.`,
        status: "Expired",
      });

      // Email to reserver
      if (reservation.userId.email) {
        await sendEmail({
          to: reservation.userId.email,
          subject: `Reservation Expired - ${reservation.roomName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #cc0000;">Reservation Expired</h2>
              <p>Hi ${reservation.userId.name},</p>
              <p>Your reservation for <strong>${reservation.roomName}</strong> at <strong>${formattedTime}</strong> has been <strong style="color: #cc0000;">automatically expired</strong> because no one arrived at the scheduled time.</p>
              <p>You may submit a new reservation request if needed.</p>
              <p style="margin-top: 30px; color: #666;">This is an automated notification.</p>
            </div>
          `
        });
      }

      // Notify participants
      for (const participant of reservation.participants) {
        const user = await User.findOne({ id_number: participant.idNumber });
        if (user) {
          await Notification.create({
            userId: user._id,
            reservationId: reservation._id,
            message: `The reservation you were participating in at ${formattedTime} has expired due to no arrival.`,
            status: "Expired",
          });
        }
      }
    });

    await Promise.all(updates);
    res.json({ message: `${expiredReservations.length} reservation(s) expired.` });
  } catch (err) {
    console.error("Expiry check error:", err);
    res.status(500).json({ error: "Failed to check expired reservations." });
  }
});

// GET — Auto-cancel no-show reservations
router.get("/check-no-show", async (req, res) => {
  try {
    const now = new Date();
    const gracePeriod = new Date(now.getTime() - 15 * 60 * 1000);

    const noShows = await Reservation.find({
      status: "Approved",
      datetime: { $lte: gracePeriod },
    });

    const updates = noShows.map(async (reservation) => {
      reservation.status = "Cancelled";
      await reservation.save();

      const formattedDate = new Date(reservation.date).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      await Notification.create({
        userId: reservation.userId,
        reservationId: reservation._id,
        message: `Your reservation for ${reservation.roomName} on ${formattedDate} was automatically cancelled because no one arrived within 15 minutes.`,
        status: "Cancelled",
      });
    });

    await Promise.all(updates);

    res.status(200).json({ message: `${noShows.length} reservation(s) auto-cancelled for no-show.` });
  } catch (err) {
    console.error("Auto-cancel no-shows error:", err);
    res.status(500).json({ message: "Failed to check no-shows." });
  }
});


// GET /reservations/availability?date=2025-04-05&floor=Ground%20Floor



const moment = require("moment-timezone");

router.get("/availability", async (req, res) => {
  const { date, floor } = req.query;
  if (!date) return res.status(400).json({ error: "Date is required" });

  try {
    // Convert query date to Manila time range
    const manilaStart = moment.tz(date, "Asia/Manila").startOf("day");
    const manilaEnd = moment.tz(date, "Asia/Manila").endOf("day");

    // Convert to UTC for database query
    const startUTC = manilaStart.utc().toDate();
    const endUTC = manilaEnd.utc().toDate();

    // Build room query
    const roomQuery = { isActive: true };
    if (floor) roomQuery.floor = floor;

    // Get all active rooms
    const rooms = await Room.find(roomQuery);

    // Find reservations that overlap with the date
    const reservations = await Reservation.find({
      status: { $in: ["Approved", "Ongoing"] },
      $or: [
        { datetime: { $gte: startUTC, $lt: endUTC } },
        { endDatetime: { $gt: startUTC, $lte: endUTC } },
        { datetime: { $lte: startUTC }, endDatetime: { $gte: endUTC } }
      ]
    });

    // Format response
    const result = rooms.map((room) => {
      const roomReservations = reservations.filter(
        (r) => r.room_Id?.toString() === room._id.toString()
      );

      const occupied = roomReservations.map((r) => {
        // Convert back to Manila time for display
        const startManila = moment.utc(r.datetime).tz("Asia/Manila").format();
        const endManila = moment.utc(r.endDatetime).tz("Asia/Manila").format();

        return {
          start: startManila,
          end: endManila,
          status: r.status,
          purpose: r.purpose,
          groupName: r.participants[0]?.name || "Unknown"
        };
      });

      return {
        _id: room._id,
        floor: room.floor,
        room: room.room,
        capacity: room.capacity,
        occupied,
        available: occupied.length === 0
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Availability check error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});





// PATCH /reservations/:id/status
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    reservation.status = status;

    if (status === "Approved") {
      // recalculate UTC values for accuracy
      const startManila = moment.tz(reservation.datetime, "Asia/Manila");
      const endManila = startManila.clone().add(1, "hour");

      reservation.datetimeUTC = startManila.utc().toDate();
      reservation.endDatetimeUTC = endManila.utc().toDate();
    }

    await reservation.save();

    req.app.get("io")?.emit("reservationUpdate", reservation);
    res.json({ success: true, reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status." });
  }
});



module.exports = router;
