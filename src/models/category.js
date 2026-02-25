import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"]
    },

    icon: {
      type: String,
      trim: true,
      default: "cube"
    },

    color: {
      type: String,
      default: "#3B82F6",
      validate: {
        validator: function(v) {
          return /^#[0-9A-Fa-f]{6}$/.test(v);
        },
        message: "Color must be a valid hex color code"
      }
    },

    isActive: {
      type: Boolean,
      default: true
    },

    auctionCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes (unique fields already have indexes)
categorySchema.index({ isActive: 1 });
categorySchema.index({ name: "text", description: "text" });

// Pre-save middleware to generate slug
categorySchema.pre("save", function() {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
});

export default mongoose.model("Category", categorySchema);