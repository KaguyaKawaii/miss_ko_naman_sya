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
const authRoutes = require("./routes/authRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const roomRoutes = require("./routes/roomRoutes");
const reportRoutes = require("./routes/reportRoutes");
const logRoutes = require("./routes/logRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const systemRoutes = require("./routes/system");
const backupRoutes = require("./routes/backupRoutes");
const announcementRoutes = require('./routes/announcement');

const app = express();
const server = http.createServer(app);

// ✅ FIXED: Proper CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

app.use(express.json());

// Static file serving
app.use(
  "/uploads/profile-pictures",
  express.static(path.join(__dirname, "uploads", "profile-pictures"))
);
app.use("/uploads/news", express.static(path.join(__dirname, "uploads", "news")));

// Serve backup files statically
app.use("/backups", express.static(path.join(__dirname, "backups")));

// ✅ FIXED: Socket.IO configuration - ALLOW BOTH TRANSPORTS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  // ✅ FIX: Allow both transports (polling + websocket)
  transports: ["polling", "websocket"]
});

// ✅ FIXED: Improved Socket.IO events for real-time messaging
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // FIXED: Handle general join event (used by both frontend components)
  socket.on("join", (data) => {
    if (data.userId) {
      socket.join(data.userId);
      console.log(`👤 User ${data.userId} joined room: ${data.userId}`);
    }
    
    // Also join floor rooms if floor is provided
    if (data.floor) {
      socket.join(data.floor);
      console.log(`🏢 User joined floor room: ${data.floor}`);
    }
  });

  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined room: user-${userId}`);
  });

  socket.on("join-admin-room", () => {
    socket.join("admin-room");
    console.log(`👨‍💼 Admin joined admin room: ${socket.id}`);
  });

  // FIXED: Improved message handling for all scenarios
  socket.on("sendMessage", (msg) => {
    console.log("📨 Message received:", msg);
    
    // Send to sender
    io.to(msg.sender).emit("newMessage", msg);
    
    // Send to receiver
    if (msg.receiver) {
      io.to(msg.receiver).emit("newMessage", msg);
    }
    
    // Send to floor if it's a floor message
    if (msg.floor) {
      io.to(msg.floor).emit("newMessage", msg);
      console.log(`📢 Message broadcast to floor: ${msg.floor}`);
    }
    
    // Send to admin if it's an admin message
    if (msg.receiver === "admin" || msg.sender === "admin") {
      io.to("admin-room").emit("newMessage", msg);
    }
    
    // FIXED: Emit unread count updates
    if (msg.receiver && msg.sender !== msg.receiver) {
      io.to(msg.receiver).emit("unreadCountUpdate", {
        userId: msg.receiver,
        count: 1 // This should be calculated from DB in production
      });
    }
  });

  // FIXED: Handle unread count updates
  socket.on("updateUnreadCount", (data) => {
    if (data.userId) {
      io.to(data.userId).emit("unreadCountUpdate", data);
    }
  });

  // FIXED: Handle conversation-specific unread updates
  socket.on("updateConversationUnread", (data) => {
    if (data.staffId) {
      io.to(data.staffId).emit("conversationUnreadUpdate", data);
    }
    if (data.userId) {
      io.to(data.userId).emit("conversationUnreadUpdate", data);
    }
  });

  socket.on("notification-read", (data) => {
    socket.to(`user-${data.userId}`).emit("notifications-read");
  });

  socket.on("all-notifications-read", (data) => {
    socket.to(`user-${data.userId}`).emit("notifications-read");
  });

  // FIXED: Handle refresh unread counts
  socket.on("refreshUnreadCounts", (data) => {
    if (data.userId) {
      io.to(data.userId).emit("refresh-unread-counts", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Make io accessible to routes
app.set("io", io);

// Route mounting
app.use("/api/logs", logRoutes);
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
app.use("/api", availabilityRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/announcements", announcementRoutes);
app.use("/api/admin/system", backupRoutes);

// Database connection + Start Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // CRON job to check expired reservations
    cron.schedule("*/5 * * * *", async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/reservations/check-expired"
        );
        console.log(`✅ Expired reservations checked: ${data.message}`);
      } catch (err) {
        console.error("❌ CRON job error:", err.message);
      }
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ CORS configured for all methods (GET, POST, PUT, DELETE, PATCH)`);
      console.log(`✅ Socket.IO with polling + websocket transports`);
      console.log(`✅ Real-time messaging enabled with improved room handling`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });