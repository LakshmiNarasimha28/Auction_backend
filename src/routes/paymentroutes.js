import express from "express";
import {
	createOrder,
	verify,
	createDirectPaymentcontroller,
	confirmDirectPaymentcontroller,
	getPaymentDetailscontroller
} from "../controllers/paymentcontroller.js";
import { protect } from "../middlewares/authmiddleware.js";
import { body, param } from "express-validator";

const router = express.Router();

const auctionIdValidation = [
	param("auctionId").isMongoId().withMessage("Invalid auction ID")
];

const paymentIdValidation = [
	param("paymentId").isMongoId().withMessage("Invalid payment ID")
];

const verifyValidation = [
	body("auctionId").isMongoId().withMessage("Invalid auction ID"),
	body("razorpay_order_id").notEmpty().withMessage("Missing order id"),
	body("razorpay_payment_id").notEmpty().withMessage("Missing payment id"),
	body("razorpay_signature").notEmpty().withMessage("Missing signature")
];

router.post("/:auctionId/order", protect, auctionIdValidation, createOrder);
router.post("/verify", protect, verifyValidation, verify);
router.post("/:auctionId/direct", protect, auctionIdValidation, createDirectPaymentcontroller);
router.patch("/:paymentId/confirm", protect, paymentIdValidation, confirmDirectPaymentcontroller);
router.get("/:auctionId", protect, auctionIdValidation, getPaymentDetailscontroller);

export default router;