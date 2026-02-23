import express from "express";
import { register, login } from "../controllers/authcontroller.js";
import { body } from "express-validator";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars")
  ],
  register
);
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "User profile",
    data: req.user
  });
});
router.post("/login", login);

export default router;