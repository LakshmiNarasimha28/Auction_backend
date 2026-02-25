import { placeBid, getBidsByAuction } from "../services/bidservices.js";
import { validationResult } from "express-validator";

export const placeBidController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { amount } = req.body;
    const { auctionId } = req.params;

    const bid = await placeBid(auctionId, amount, req.user._id);

    res.status(201).json({
      success: true,
      message: "Bid placed successfully",
      data: bid
    });

  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 
      : error.message.includes("expired") ? 400 
      : 400;
    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getBidsController = async (req, res) => {
  try {
    const bids = await getBidsByAuction(req.params.auctionId);

    res.status(200).json({
      success: true,
      message: "Bids retrieved successfully",
      data: bids
    });

  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};