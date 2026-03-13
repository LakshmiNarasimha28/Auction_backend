import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
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
        "login",
        "logout",
        "auction_created",
        "auction_updated",
        "auction_deleted",
        "bid_placed",
        "bid_accepted",
        "payment_initiated",
        "payment_completed",
        "message_sent",
        "profile_updated",
        "password_changed",
        "review_posted",
        "auction_won",
        "auction_lost"
      ],
      required: [true, "Activity type is required"],
      index: true
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"]
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // Can be auctionId, bidId, paymentId, etc.
      index: true
    },

    relatedModel: {
      type: String,
      enum: ["Auction", "Bid", "Payment", "Message", "User", "Review"],
      default: "Auction"
    },

    ipAddress: {
      type: String,
      required: true
    },

    userAgent: {
      type: String
    },

    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "success"
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// TTL Index: Keep activity logs for 90 days
activitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

// Indexes for efficient queries
activitySchema.index({ userId: 1, type: 1, createdAt: -1 });
activitySchema.index({ relatedId: 1 });

export default mongoose.model("Activity", activitySchema);
