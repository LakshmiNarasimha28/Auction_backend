import express from "express";
import {
  placeBidHandler,
  getBidsHandler
} from "../controllers/bid.controller.js";

import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post("/:auctionId", protect, placeBidHandler);
router.get("/:auctionId", getBidsHandler);

export default router;