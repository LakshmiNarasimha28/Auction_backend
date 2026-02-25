import { 
  createCategory, 
  getCategories, 
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../services/categoryservice.js";
import { validationResult } from "express-validator";

export const createcategorycontroller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const category = await createCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 400;
    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getcategoriescontroller = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const categories = await getCategories(includeInactive);

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getCategoryByIdController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const category = await getCategoryById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const category = await updateCategory(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 
      : error.message.includes("already exists") ? 409 
      : 400;
    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    await deleteCategory(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 
      : error.message.includes("being used") ? 409 
      : 400;
    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }
};