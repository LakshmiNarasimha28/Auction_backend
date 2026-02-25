import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    images: [{
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/i.test(v);
        },
        message: "Invalid image URL"
      }
    }],

    startingPrice: {
      type: Number,
      required: [true, "Starting price is required"],
      min: [0, "Starting price cannot be negative"]
    },

    currentHighestBid: {
      type: Number,
      default: 0,
      min: 0
    },

    currentHighestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    bidders: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      amount: {
        type: Number,
        min: 0
      },
      bidTime: {
        type: Date,
        default: Date.now
      }
    }],

    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function(v) {
          return v > new Date();
        },
        message: "End time must be in the future"
      }
    },

    status: {
      type: String,
      enum: ["active", "closed", "cancelled"],
      default: "active"
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid","failed"],
      default: "pending"
    },

    video: String,

    condition: {
      type: String,
      enum: ["new", "used", "refurbished"]
    },

    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"]
    },

    specifications: {
      type: String,
      trim: true,
      maxlength: [2000, "Specifications cannot exceed 2000 characters"]
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ owner: 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ createdAt: -1 });
auctionSchema.index({ title: "text", description: "text" }); // Text index for search

// Virtual for checking if auction is expired
auctionSchema.virtual("isExpired").get(function() {
  return this.endTime < new Date();
});

// Virtual for total bids count
auctionSchema.virtual("totalBids").get(function() {
  return this.bidders?.length || 0;
});

// Pre-save middleware to auto-close expired auctions
auctionSchema.pre("save", function() {
  if (this.endTime < new Date() && this.status === "active") {
    this.status = "closed";
  }
});

export default mongoose.model("Auction", auctionSchema);