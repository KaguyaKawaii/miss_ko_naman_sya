require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require("axios");
const cron = require("node-cron");
const path = require("path");

// Routes
const newsRoutes = require("./routes/newsRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/auth");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const roomRoutes = require("./routes/roomRoutes");
const reportRoutes = require("./routes/reportRoutes");
const logRoutes = require("./routes/logRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/uploads/profile-pictures", express.static(path.join(__dirname, "uploads", "profile-pictures")));
app.use("/uploads/news", express.static(path.join(__dirname, "uploads", "news")));


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


app.use("/api/logs", logRoutes);


app.set("io", io);

app.use("/news", newsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/reservations", reservationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/rooms", roomRoutes);
app.use("/reports", reportRoutes);


io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join", ({ userId }) => {
    socket.join(userId);
  });

  socket.on("sendMessage", (msg) => {
    io.to(msg.receiver).emit("newMessage", msg);
    io.to(msg.sender).emit("newMessage", msg);
  });

  socket.on("disconnect", () => {});
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

cron.schedule("*/5 * * * *", async () => {
  try {
    const { data } = await axios.get("http://localhost:5000/reservations/check-expired");
    console.log(`✅ Expired reservations checked: ${data.message}`);
  } catch (err) {}
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running with Socket.io on port ${PORT}`));
