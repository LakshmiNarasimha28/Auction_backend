import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: [true, "Auction ID is required"]
    },

    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer user ID is required"]
    },

    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewee user ID is required"]
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"]
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      minlength: [10, "Comment must be at least 10 characters"]
    },

    reviewType: {
      type: String,
      enum: ["buyer", "seller"],
      required: [true, "Review type is required"]
    },

    verified: {
      type: Boolean,
      default: false // Only mark as verified if transaction completed
    },

    helpful: {
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 }
    },

    response: {
      content: String,
      respondedAt: Date
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
reviewSchema.index({ toUserId: 1, rating: 1 });
reviewSchema.index({ fromUserId: 1 });
reviewSchema.index({ auctionId: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
