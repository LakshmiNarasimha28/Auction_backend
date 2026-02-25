import razorpay from "../config/razorpay.js";
import Auction from "../models/auction.js";
import Payment from "../models/payment.js";
import crypto from "crypto";
import mongoose from "mongoose";

export const createPaymentOrder = async (auctionId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    throw new Error("Invalid auction ID");
  }

  const auction = await Auction.findById(auctionId);

  if (!auction) throw new Error("Auction not found");

  if (!auction.winner || auction.winner.toString() !== userId.toString()) {
    throw new Error("Only winner can pay");
  }

  if (auction.paymentStatus === "paid") {
    throw new Error("Already paid");
  }

  if (auction.status !== "closed") {
    throw new Error("Auction must be closed before payment");
  }

  const options = {
    amount: auction.currentHighestBid * 100,
    currency: "INR",
    receipt: `receipt_${auctionId}`
  };

  const order = await razorpay.orders.create(options);

  return { order, auction };
};

export const verifyPayment = async (data, userId) => {
  if (!mongoose.Types.ObjectId.isValid(data.auctionId)) {
    throw new Error("Invalid auction ID");
  }

  const auction = await Auction.findById(data.auctionId);

  if (!auction) throw new Error("Auction not found");

  if (!auction.winner || auction.winner.toString() !== userId.toString()) {
    throw new Error("Only winner can pay");
  }

  if (auction.paymentStatus === "paid") {
    throw new Error("Already paid");
  }

  const body = data.razorpay_order_id + "|" + data.razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== data.razorpay_signature) {
    throw new Error("Payment verification failed");
  }

  const payment = await Payment.create({
    auction: auction._id,
    buyer: userId,
    seller: auction.owner,
    amount: auction.currentHighestBid,
    paymentMethod: "online",
    razorpayOrderId: data.razorpay_order_id,
    razorpayPaymentId: data.razorpay_payment_id,
    status: "completed"
  });

  auction.paymentStatus = "paid";
  await auction.save();

  return payment;
};

// CREATE DIRECT PAYMENT
export const createDirectPayment = async (auctionId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    throw new Error("Invalid auction ID");
  }

  const auction = await Auction.findById(auctionId);

  if (!auction) throw new Error("Auction not found");

  if (!auction.winner || auction.winner.toString() !== userId.toString()) {
    throw new Error("Only winner can choose payment");
  }

  if (auction.paymentStatus === "paid") {
    throw new Error("Payment already completed");
  }

  if (auction.status !== "closed") {
    throw new Error("Auction must be closed before payment");
  }

  const payment = await Payment.create({
    auction: auction._id,
    buyer: userId,
    seller: auction.owner,
    amount: auction.currentHighestBid,
    paymentMethod: "direct",
    status: "pending"
  });

  return payment;
};

// SELLER CONFIRMS DIRECT PAYMENT
export const confirmDirectPayment = async (paymentId, sellerId) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new Error("Invalid payment ID");
  }

  const payment = await Payment.findById(paymentId);

  if (!payment) throw new Error("Payment not found");

  if (payment.seller.toString() !== sellerId.toString()) {
    throw new Error("Only seller can confirm payment");
  }

  if (payment.status === "completed") {
    throw new Error("Payment already confirmed");
  }

  payment.status = "completed";
  payment.confirmationStatus = "confirmed";

  await payment.save();

  const auction = await Auction.findById(payment.auction);
  auction.paymentStatus = "paid";
  await auction.save();

  return payment;
};

export const getPaymentByAuction = async (auctionId) => {
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    throw new Error("Invalid auction ID");
  }

  return await Payment.findOne({ auction: auctionId })
    .populate("buyer", "name email")
    .populate("seller", "name email");
};