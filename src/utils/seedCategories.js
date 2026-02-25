import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category.js";

dotenv.config();

const categories = [
  {
    name: "Electronics",
    description: "Electronic devices, gadgets, and technology",
    icon: "💻",
    color: "#3B82F6"
  },
  {
    name: "Fashion",
    description: "Clothing, accessories, and fashion items",
    icon: "👗",
    color: "#EC4899"
  },
  {
    name: "Home & Garden",
    description: "Home decor, furniture, and garden items",
    icon: "🏡",
    color: "#10B981"
  },
  {
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    icon: "⚽",
    color: "#F59E0B"
  },
  {
    name: "Art & Collectibles",
    description: "Artwork, antiques, and collectible items",
    icon: "🎨",
    color: "#8B5CF6"
  },
  {
    name: "Books & Media",
    description: "Books, music, movies, and games",
    icon: "📚",
    color: "#EF4444"
  },
  {
    name: "Automotive",
    description: "Cars, motorcycles, and automotive parts",
    icon: "🚗",
    color: "#6366F1"
  },
  {
    name: "Other",
    description: "Miscellaneous items and other categories",
    icon: "📦",
    color: "#64748B"
  }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    // Insert new categories one by one to trigger pre-save hooks
    const createdCategories = [];
    for (const categoryData of categories) {
      const category = await Category.create(categoryData);
      createdCategories.push(category);
    }
    
    console.log(`✓ Created ${createdCategories.length} categories:`);
    createdCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
