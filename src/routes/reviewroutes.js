import express from "express";
import * as reviewController from "../controllers/reviewcontroller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";
import { body } from "express-validator";

const router = express.Router();

// Validation middleware
const validateReview = [
  body("toUserId").isMongoId().withMessage("Invalid user ID"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Comment must be between 10 and 500 characters"),
  body("reviewType")
    .isIn(["buyer", "seller"])
    .withMessage("Review type must be 'buyer' or 'seller'")
];

// Routes
router.post(
  "/:auctionId",
  authMiddleware,
  validateReview,
  reviewController.submitReview
);

// More specific route MUST come before general route
router.get("/:userId/stats", reviewController.getReviewStats);

router.get("/:userId", reviewController.getUserReviews);

router.patch(
  "/:reviewId/respond",
  authMiddleware,
  [body("response").notEmpty().withMessage("Response is required")],
  reviewController.respondToReview
);

router.delete("/:reviewId", authMiddleware, reviewController.deleteReview);

export default router;
