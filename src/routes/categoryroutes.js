import express from "express";
import {
  createcategorycontroller,
  getcategoriescontroller,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController
} from "../controllers/categorycontroller.js";
import { protect } from "../middlewares/authmiddleware.js";
import { authorizeRoles } from "../middlewares/rolemiddleware.js";
import { body, param } from "express-validator";

const router = express.Router();

// Validation middleware
const categoryValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Category name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9\s&-]+$/).withMessage("Name can only contain letters, numbers, spaces, & and -"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Description cannot exceed 200 characters"),
  body("icon")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("Icon name cannot exceed 50 characters"),
  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Color must be a valid hex color code")
];

const updateCategoryValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9\s&-]+$/).withMessage("Name can only contain letters, numbers, spaces, & and -"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Description cannot exceed 200 characters"),
  body("icon")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("Icon name cannot exceed 50 characters"),
  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Color must be a valid hex color code"),
  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be a boolean")
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid category ID")
];

// Public routes
router.get("/", getcategoriescontroller);
router.get("/:id", idValidation, getCategoryByIdController);

// Admin only routes
router.post("/", protect, authorizeRoles("admin"), categoryValidation, createcategorycontroller);
router.put("/:id", protect, authorizeRoles("admin"), idValidation, updateCategoryValidation, updateCategoryController);
router.delete("/:id", protect, authorizeRoles("admin"), idValidation, deleteCategoryController);

export default router;