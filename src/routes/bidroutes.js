import express from "express";
import { placeBidController, getBidsController } from "../controllers/bidcontroller.js";
import { protect } from "../middlewares/authmiddleware.js";
import { body, param } from "express-validator";

const router = express.Router();

const bidValidation = [
  body("amount")
    .isNumeric().withMessage("Amount must be a number")
    .custom((value) => value > 0).withMessage("Amount must be greater than 0")
];

const auctionIdValidation = [
  param("auctionId").isMongoId().withMessage("Invalid auction ID")
];

router.post("/:auctionId", protect, auctionIdValidation, bidValidation, placeBidController);
router.get("/:auctionId", auctionIdValidation, getBidsController);

export default router;