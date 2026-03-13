import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true
    },

    type: {
      type: String,
      enum: [
        "bid_placed",
        "outbid",
        "auction_ending",
        "auction_won",
        "auction_lost",
        "payment_received",
        "payment_pending",
        "message",
        "auction_expired",
        "seller_alert"
      ],
      required: [true, "Notification type is required"]
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [500, "Message cannot exceed 500 characters"]
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // Can be auctionId, bidId, paymentId, etc.
      ref: function() {
        // Polymorphic relationship
        if (this.type.includes("auction")) return "Auction";
        if (this.type.includes("bid")) return "Bid";
        if (this.type.includes("payment")) return "Payment";
        if (this.type === "message") return "Message";
        return "Auction";
      }
    },

    read: {
      type: Boolean,
      default: false,
      index: true
    },

    readAt: Date,

    actionUrl: String, // Frontend URL to navigate to

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true
    }
  },
  { timestamps: true }
);

// Automatically delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for unread notifications
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
