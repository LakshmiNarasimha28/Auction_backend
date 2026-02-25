import { createPaymentOrder, verifyPayment } from "../services/payment.service.js";
import Auction from "../models/auction.js";

export const createOrder = async (req, res) => {
  try {
    const { order } = await createPaymentOrder(
      req.params.auctionId,
      req.user._id
    );

    res.json(order);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const auction = await Auction.findById(req.body.auctionId);

    const payment = await verifyPayment(req.body, auction, req.user._id);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};