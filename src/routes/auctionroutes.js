import { 
  createAuctionController, 
  getAuctionByIdController, 
  getAuctionsController, 
  updateAuctionController, 
  deleteAuctionController,
  cancelAuctionController 
} from "../controllers/auctioncontroller.js";
import express from "express";
import { protect } from "../middlewares/authmiddleware.js";
import { body, param } from "express-validator";

const router = express.Router();

// Validation middleware
const auctionValidation = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("category")
    .optional()
    .isIn(["Electronics", "Fashion", "Home", "Sports", "Art", "Collectibles", "Other"])
    .withMessage("Invalid category"),
  body("images")
    .optional()
    .isArray().withMessage("Images must be an array")
    .custom((images) => {
      if (images.length > 5) {
        throw new Error("Maximum 5 images allowed");
      }
      return true;
    }),
  body("startingPrice")
    .notEmpty().withMessage("Starting price is required")
    .isFloat({ min: 0 }).withMessage("Starting price must be a positive number"),
  body("endTime")
    .notEmpty().withMessage("End time is required")
    .isISO8601().withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("End time must be in the future");
      }
      return true;
    })
];

const updateAuctionValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("category")
    .optional()
    .isIn(["Electronics", "Fashion", "Home", "Sports", "Art", "Collectibles", "Other"])
    .withMessage("Invalid category"),
  body("images")
    .optional()
    .isArray().withMessage("Images must be an array")
    .custom((images) => {
      if (images.length > 5) {
        throw new Error("Maximum 5 images allowed");
      }
      return true;
    }),
  body("startingPrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("Starting price must be a positive number"),
  body("endTime")
    .optional()
    .isISO8601().withMessage("Invalid date format")
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid auction ID")
];

// Routes
router.post("/", protect, auctionValidation, createAuctionController);
router.get("/", getAuctionsController);
router.get("/:id", idValidation, getAuctionByIdController);
router.put("/:id", protect, idValidation, updateAuctionValidation, updateAuctionController);
router.patch("/:id/cancel", protect, idValidation, cancelAuctionController);
router.delete("/:id", protect, idValidation, deleteAuctionController);

export default router;