import express from "express";
import { createOrder, verify } from "../controllers/paymentcontroller.js";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.post("/:auctionId/order", protect, createOrder);
router.post("/verify", protect, verify);

export default router;