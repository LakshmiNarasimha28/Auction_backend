import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true
    },

    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: [true, "Auction ID is required"]
    },

    savedPrice: {
      type: Number,
      default: 0 // Store the price at time of adding to wishlist
    },

    isNotified: {
      type: Boolean,
      default: false // For auction ending soon notifications
    },

    notes: {
      type: String,
      maxlength: [200, "Notes cannot exceed 200 characters"]
    }
  },
  { timestamps: true }
);

// Ensure one wishlist entry per user-auction combination
wishlistSchema.index({ userId: 1, auctionId: 1 }, { unique: true });

// Index for getting user's wishlist
wishlistSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Wishlist", wishlistSchema);
