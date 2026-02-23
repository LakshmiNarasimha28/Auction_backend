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
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Pre-save middleware to hash password if modified
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export default mongoose.model("User", userSchema);