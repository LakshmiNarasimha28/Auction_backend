import razorpay from "../config/razorpay.js";
import Auction from "../models/auction.js";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import crypto from "crypto";
import mongoose from "mongoose";
import {
  sendPaymentSuccessEmail,
  sendPaymentReceivedEmail,
  sendDirectPaymentPendingEmail
} from "./emailservice.js";

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

  const auction = await Auction.findById(data.auctionId).populate("owner");

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

  // Fetch buyer and seller details
  const buyer = await User.findById(userId);
  const seller = auction.owner;

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

  // Send email notifications (non-blocking)
  try {
    // Send success email to buyer
    await sendPaymentSuccessEmail(
      buyer.email,
      buyer.name,
      auction.title,
      auction.currentHighestBid
    );

    // Send received email to seller
    await sendPaymentReceivedEmail(
      seller.email,
      seller.name,
      auction.title,
      buyer.name,
      auction.currentHighestBid
    );
  } catch (emailError) {
    console.error("Error sending payment notification emails:", emailError);
    // Continue - don't fail the payment if email fails
  }

  return payment;
};

// CREATE DIRECT PAYMENT
export const createDirectPayment = async (auctionId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(auctionId)) {
    throw new Error("Invalid auction ID");
  }

  const auction = await Auction.findById(auctionId).populate("owner");

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

  // Send email notifications (non-blocking)
  try {
    const buyer = await User.findById(userId);
    const seller = auction.owner;

    // Notify seller about pending direct payment
    await sendDirectPaymentPendingEmail(
      seller.email,
      seller.name,
      auction.title,
      buyer.name,
      auction.currentHighestBid
    );
  } catch (emailError) {
    console.error("Error sending direct payment notification email:", emailError);
    // Continue - don't fail the payment creation if email fails
  }

  return payment;
};

// SELLER CONFIRMS DIRECT PAYMENT
export const confirmDirectPayment = async (paymentId, sellerId) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new Error("Invalid payment ID");
  }

  const payment = await Payment.findById(paymentId).populate("auction").populate("buyer");

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

  // Send confirmation emails (non-blocking)
  try {
    const buyer = payment.buyer;
    const seller = await User.findById(sellerId);

    // Send success email to buyer
    await sendPaymentSuccessEmail(
      buyer.email,
      buyer.name,
      auction.title,
      payment.amount
    );

    // Send received email to seller (confirmation)
    await sendPaymentReceivedEmail(
      seller.email,
      seller.name,
      auction.title,
      buyer.name,
      payment.amount
    );
  } catch (emailError) {
    console.error("Error sending payment confirmation emails:", emailError);
    // Continue - don't fail the confirmation if email fails
  }

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