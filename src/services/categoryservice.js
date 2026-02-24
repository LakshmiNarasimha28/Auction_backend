import Category from "../models/category.js";
import Auction from "../models/auction.js";
import mongoose from "mongoose";

export const createCategory = async (data) => {
  // Check if category already exists
  const existingCategory = await Category.findOne({ 
    name: { $regex: new RegExp(`^${data.name}$`, "i") } 
  });
  
  if (existingCategory) {
    throw new Error("Category with this name already exists");
  }

  return await Category.create(data);
};

export const getCategories = async (includeInactive = false) => {
  const query = includeInactive ? {} : { isActive: true };
  
  const categories = await Category.find(query)
    .sort({ name: 1 })
    .select("-__v");

  return categories;
};

export const getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findById(id);
  
  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

export const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({ slug });
  
  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

export const updateCategory = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findById(id);
  
  if (!category) {
    throw new Error("Category not found");
  }

  // Check if new name conflicts with existing category
  if (data.name && data.name !== category.name) {
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${data.name}$`, "i") },
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      throw new Error("Category with this name already exists");
    }
  }

  Object.assign(category, data);
  return await category.save();
};

export const deleteCategory = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  const category = await Category.findById(id);
  
  if (!category) {
    throw new Error("Category not found");
  }

  // Check if category is being used by any auctions
  const auctionCount = await Auction.countDocuments({ category: id });
  
  if (auctionCount > 0) {
    throw new Error(`Cannot delete category. It is being used by ${auctionCount} auction(s)`);
  }

  await category.deleteOne();
};

export const updateCategoryAuctionCount = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return;
  }

  const count = await Auction.countDocuments({ 
    category: categoryId,
    status: "active"
  });

  await Category.findByIdAndUpdate(categoryId, { auctionCount: count });
};