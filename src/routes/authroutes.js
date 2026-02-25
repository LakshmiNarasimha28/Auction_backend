import express from "express";
import { register, login, logout, getProfile } from "../controllers/authcontroller.js";
import { protect } from "../middlewares/authmiddleware.js";
import { body } from "express-validator";

const router = express.Router();

// Validation middleware
const registerValidation = [
	body("name")
		.trim()
		.notEmpty().withMessage("Name is required")
		.isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
	body("email")
		.trim()
		.notEmpty().withMessage("Email is required")
		.isEmail().withMessage("Valid email required")
		.normalizeEmail(),
	body("password")
		.notEmpty().withMessage("Password is required")
		.isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
		.matches(/\d/).withMessage("Password must contain at least one number")
];

const loginValidation = [
	body("email")
		.trim()
		.notEmpty().withMessage("Email is required")
		.isEmail().withMessage("Valid email required")
		.normalizeEmail(),
	body("password")
		.notEmpty().withMessage("Password is required")
];

// Routes
router.post("/signup", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);

export default router;