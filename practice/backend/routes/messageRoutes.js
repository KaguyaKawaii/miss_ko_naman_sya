const express = require("express");
const router  = express.Router();
const mongoose = require("mongoose");

const Message = require("../models/Message");
const User    = require("../models/User");

/* ─────────────────────────────────────────────
   1. Recipients list — returns [{ _id, name, latestMessageAt }]
────────────────────────────────────────────── */
router.get("/recipients/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const sentToMe = await Message.find({ receiver: userId }).distinct("sender");
    const iSentTo  = await Message.find({ sender:   userId }).distinct("receiver");
    const rawIds   = [...new Set([...sentToMe, ...iSentTo])].filter(id => id !== userId);

    const realIds   = rawIds.filter(id => mongoose.isValidObjectId(id));
    const literals  = rawIds.filter(id => !mongoose.isValidObjectId(id));

    const users = await User.find({ _id: { $in: realIds } }, "_id name").lean();

    const latestMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId,     receiver: { $in: rawIds } },
            { sender: { $in: rawIds }, receiver: userId },
          ],
        },
      },
      {
        $group: {
          _id: {
            other: {
              $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
            },
          },
          latestMessageAt: { $max: "$createdAt" },
        },
      },
    ]);

    const latestMap = {};
    latestMessages.forEach(item => {
      latestMap[item._id.other] = item.latestMessageAt;
    });

    const list = [
      ...users.map(u => ({
        _id:  u._id.toString(),
        name: u.name,
        latestMessageAt: latestMap[u._id.toString()] || new Date(0),
      })),
      ...literals.map(str => ({
        _id: str,
        name: str,
        latestMessageAt: latestMap[str] || new Date(0),
      })),
    ];

    res.json(list);
  } catch (err) {
    console.error("Failed to fetch recipients:", err);
    res.status(500).json({ message: "Failed to fetch recipients." });
  }
});

/* ─────────────────────────────────────────────
   2. Conversation — returns messages with senderName
────────────────────────────────────────────── */
router.get("/conversation/:userId/:recipientId", async (req, res) => {
  const { userId, recipientId } = req.params;

  try {
    const msgs = await Message.find({
      $or: [
        { sender: userId,      receiver: recipientId },
        { sender: recipientId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    const ids = [...new Set(
      msgs.flatMap(m => [m.sender, m.receiver])
          .filter(id => mongoose.isValidObjectId(id))
          .filter(id => id !== "admin")
    )];

    const nameMap = Object.fromEntries(
      (await User.find({ _id: { $in: ids } }, "_id name").lean())
        .map(u => [u._id.toString(), u.name])
    );

    const withNames = msgs.map(m => ({
      ...m.toObject(),
      senderName: m.sender === "admin"
        ? "Admin"
        : (nameMap[m.sender] || m.sender),
    }));

    res.json(withNames);
  } catch (err) {
    console.error("Failed to fetch conversation:", err);
    res.status(500).json({ message: "Failed to fetch conversation." });
  }
});

/* ─────────────────────────────────────────────
   3. Send a new message + broadcast via Socket.IO
────────────────────────────────────────────── */
router.post("/", async (req, res) => {
  const { sender, receiver, content } = req.body;

  try {
    const newMessage = await new Message({
      sender,
      receiver,
      content,
      createdAt: new Date(),
    }).save();

    // Get io instance from app (set in server.js)
    const io = req.app.get("io");

    // Resolve senderName once
    let senderName = "Admin";
    if (sender !== "admin") {
      if (mongoose.isValidObjectId(sender)) {
        const user = await User.findById(sender).lean();
        senderName = user ? user.name : sender;
      } else {
        senderName = sender; // literal floor name
      }
    }

    const emitPayload = {
      ...newMessage.toObject(),
      senderName,
    };

    /*  🔑 Only ONE emit call — Socket.IO de‑duplicates sockets
        that are in both rooms (`sender` and `receiver`)
        so each client will receive the event exactly once.          */
    io.to([sender, receiver]).emit("newMessage", emitPayload);

    res.status(201).json({ message: "Message sent." });
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
});

module.exports = router;
