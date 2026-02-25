import razorpay from "../config/razorpay.js";
import Auction from "../models/auction.js";
import Payment from "../models/payment.js";
import crypto from "crypto";

export const createPaymentOrder = async (auctionId, userId) => {
  const auction = await Auction.findById(auctionId);

  if (!auction) throw new Error("Auction not found");

  if (!auction.winner || auction.winner.toString() !== userId.toString()) {
    throw new Error("Only winner can pay");
  }

  if (auction.paymentStatus === "paid") {
    throw new Error("Already paid");
  }

  const options = {
    amount: auction.currentHighestBid * 100,
    currency: "INR",
    receipt: `receipt_${auctionId}`
  };

  const order = await razorpay.orders.create(options);

  return { order, auction };
};

export const verifyPayment = async (data, auction, userId) => {
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
    razorpayOrderId: data.razorpay_order_id,
    razorpayPaymentId: data.razorpay_payment_id,
    status: "completed"
  });

  auction.paymentStatus = "paid";
  await auction.save();

  return payment;
};