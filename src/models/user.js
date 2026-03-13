import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false // Don't include password in queries by default
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    accountStatus: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active"
    },

    lastLogin: {
      type: Date
    },

    profileImage: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/.+/i.test(v);
        },
        message: "Invalid image URL"
      }
    },

    // Reputation fields
    reputation: {
      overall: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      buyerRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      sellerRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      }
    },

    statistics: {
      totalAuctionsCreated: { type: Number, default: 0 },
      totalAuctionsWon: { type: Number, default: 0 },
      totalBidsPlaced: { type: Number, default: 0 },
      completedTransactions: { type: Number, default: 0 },
      totalAmountSpent: { type: Number, default: 0 },
      totalAmountEarned: { type: Number, default: 0 }
    },

    verification: {
      emailVerified: {
        type: Boolean,
        default: false
      },
      phoneVerified: {
        type: Boolean,
        default: false
      },
      identityVerified: {
        type: Boolean,
        default: false
      },
      verificationToken: String,
      verificationExpires: Date
    },

    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      bidReminders: { type: Boolean, default: true },
      auctionEndings: { type: Boolean, default: true }
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        return ret;
      }
    },
    toObject: {
      transform: function(doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });
// email index is automatically created by unique: true constraint

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Pre-save middleware to hash password if modified
userSchema.pre("save", async function() {
  // If password is not modified, skip hashing
  if (!this.isModified("password")) {
    return;
  }

  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);
});

export default mongoose.model("User", userSchema);