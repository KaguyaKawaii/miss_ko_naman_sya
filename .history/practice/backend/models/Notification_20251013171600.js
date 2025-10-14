const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Target user (optional - for user-specific notifications)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notification content
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Status (for reservation-related notifications) - UPDATED ENUM
    status: {
      type: String,
      enum: [
        "Pending", 
        "Approved", 
        "Rejected", 
        "Cancelled", 
        "Ongoing", 
        "Expired", 
        "Completed", 
        "System",
        "New",        // ADDED
        "Verified",   // ADDED
        "Unverified"  // ADDED
      ],
      default: "Pending",
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "reservation",
        "report", 
        "system",
        "announcement",
        "reminder",
        "extension",
        "maintenance"
      ],
      default: "reservation",
    },

    // Associated reservation (if any)
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },

    // Associated report (if any)
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },

    // Target audience role
    targetRole: {
      type: String,
      enum: ["user", "staff", "admin", "all"],
      default: "user",
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },

    // Dismissed status (for temporary notifications)
    dismissed: {
      type: Boolean,
      default: false,
    },

    // Additional context fields for dynamic message generation
    adminName: {
      type: String,
      trim: true,
    },
    issue: {
      type: String,
      trim: true,
    },
    roomName: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      trim: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    newEndTime: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    idNumber: {
      type: String,
      trim: true,
    },
    staffName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for better query performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ targetRole: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ reservationId: 1 });
notificationSchema.index({ type: 1 });

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function (userId, role = "user") {
  try {
    const query = {
      $or: [
        { userId: userId },
        { targetRole: role },
        { targetRole: "all" }
      ],
      isRead: false,
      dismissed: false
    };

    // For admin, show notifications without specific userId or with admin target
    if (role === "admin") {
      query.$or = [
        { userId: null },
        { targetRole: "admin" },
        { targetRole: "all" }
      ];
    }

    return await this.countDocuments(query);
  } catch (error) {
    console.error("Get unread count error:", error);
    throw error;
  }
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function () {
  try {
    this.isRead = true;
    await this.save();
    return this;
  } catch (error) {
    console.error("Mark as read error:", error);
    throw error;
  }
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function (userId, role = "user") {
  try {
    const query = {
      $or: [
        { userId: userId },
        { targetRole: role },
        { targetRole: "all" }
      ],
      isRead: false
    };

    // For admin, show notifications without specific userId or with admin target
    if (role === "admin") {
      query.$or = [
        { userId: null },
        { targetRole: "admin" },
        { targetRole: "all" }
      ];
    }

    const result = await this.updateMany(query, { $set: { isRead: true } });
    return result.modifiedCount;
  } catch (error) {
    console.error("Mark all as read error:", error);
    throw error;
  }
};

// Helper function to normalize status casing
const normalizeStatus = (status) => {
  if (!status || typeof status !== 'string') return 'Pending';
  
  const statusMap = {
    'pending': 'Pending',
    'approved': 'Approved', 
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
    'ongoing': 'Ongoing',
    'expired': 'Expired',
    'completed': 'Completed',
    'system': 'System',
    'new': 'New',
    'verified': 'Verified',
    'unverified': 'Unverified'
  };
  
  return statusMap[status.toLowerCase()] || 'Pending';
};

// Pre-save middleware to ensure consistent data
notificationSchema.pre("save", function (next) {
  // Normalize status to have proper casing
  this.status = normalizeStatus(this.status);
  
  // Auto-generate message if not provided
  if (!this.message) {
    this.message = this.generateReservationMessage();
  }
  
  next();
});

// Method to generate dynamic message based on context
notificationSchema.methods.generateReservationMessage = function () {
  switch (this.status) {
    case "Approved":
      return `Your reservation for ${this.roomName} on ${this.date} has been approved.`;
    case "Rejected":
      return `Your reservation for ${this.roomName} on ${this.date} has been rejected.`;
    case "Pending":
      return `Your reservation for ${this.roomName} on ${this.date} is pending approval.`;
    case "Cancelled":
      return `Your reservation for ${this.roomName} on ${this.date} has been cancelled.`;
    case "Ongoing":
      return `Your reservation for ${this.roomName} is now ongoing.`;
    case "Expired":
      return `Your reservation for ${this.roomName} on ${this.date} has expired.`;
    case "New":
      return `New reservation request for ${this.roomName} on ${this.date}.`;
    case "Verified":
      return `Your account has been verified.`;
    case "Unverified":
      return `Your account verification is pending.`;
    default:
      return `Update regarding your reservation for ${this.roomName}.`;
  }
};

module.exports = mongoose.model("Notification", notificationSchema);