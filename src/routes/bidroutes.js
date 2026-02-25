import express from "express";
import { placeBidController, getBidsController} from "../controllers/bidcontroller.js";
import { protect } from "../middlewares/authmiddleware.js";
import { body } from "express-validator";

const router = express.Router();

const bidValidation = [
  body("amount").isNumeric().withMessage("Amount must be a number")
];

router.post("/:auctionId", protect, bidValidation, placeBidController);
router.get("/:auctionId", getBidsController);

export default router;