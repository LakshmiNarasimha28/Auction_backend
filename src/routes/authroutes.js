import express from "express";
import { register, login, logout, getProfile } from "../controllers/authcontroller.js";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

// Routes without validation for testing
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);

export default router;