const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

exports.getRecipients = async (userId) => {
  const sentToMe = await Message.find({ receiver: userId }).distinct("sender");
  const iSentTo = await Message.find({ sender: userId }).distinct("receiver");
  const rawIds = [...new Set([...sentToMe, ...iSentTo])].filter((id) => id !== userId);

  const realIds = rawIds.filter((id) => mongoose.isValidObjectId(id));
  const literals = rawIds.filter((id) => !mongoose.isValidObjectId(id));

  const users = await User.find({ _id: { $in: realIds } }, "_id name").lean();

  const latestMessages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: userId, receiver: { $in: rawIds } },
          { sender: { $in: rawIds }, receiver: userId },
        ],
      },
    },
    {
      $group: {
        _id: {
          other: { $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"] },
        },
        latestMessageAt: { $max: "$createdAt" },
      },
    },
  ]);

  const latestMap = {};
  latestMessages.forEach((item) => {
    latestMap[item._id.other] = item.latestMessageAt;
  });

  return [
    ...users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      latestMessageAt: latestMap[u._id.toString()] || new Date(0),
    })),
    ...literals.map((str) => ({
      _id: str,
      name: str,
      latestMessageAt: latestMap[str] || new Date(0),
    })),
  ];
};

exports.getConversation = async (userId, recipientId) => {
  const msgs = await Message.find({
    $or: [
      { sender: userId, receiver: recipientId },
      { sender: recipientId, receiver: userId },
    ],
  }).sort({ createdAt: 1 });

  const ids = [...new Set(
    msgs.flatMap((m) => [m.sender, m.receiver])
      .filter((id) => mongoose.isValidObjectId(id))
      .filter((id) => id !== "admin")
  )];

  const nameMap = Object.fromEntries(
    (await User.find({ _id: { $in: ids } }, "_id name").lean())
      .map((u) => [u._id.toString(), u.name])
  );

  return msgs.map((m) => ({
    ...m.toObject(),
    senderName: m.sender === "admin" ? "Admin" : (nameMap[m.sender] || m.sender),
  }));
};

exports.sendMessage = async (sender, receiver, content) => {
  const newMessage = await new Message({
    sender,
    receiver,
    content,
    createdAt: new Date(),
  }).save();

  let senderName = "Admin";
  if (sender !== "admin") {
    if (mongoose.isValidObjectId(sender)) {
      const user = await User.findById(sender).lean();
      senderName = user ? user.name : sender;
    } else {
      senderName = sender;
    }
  }

  return { ...newMessage.toObject(), senderName };
};

exports.archiveMessage = (id) => Message.findByIdAndUpdate(id, { archived: true }, { new: true });
exports.restoreMessage = (id) => Message.findByIdAndUpdate(id, { archived: false }, { new: true });
exports.getArchivedMessages = () => Message.find({ archived: true }).populate("user_Id");
