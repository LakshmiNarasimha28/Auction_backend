import {
  createPaymentOrder,
  verifyPayment,
  createDirectPayment,
  confirmDirectPayment,
  getPaymentByAuction
} from "../services/paymentservice.js";
import { validationResult } from "express-validator";

export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { order } = await createPaymentOrder(req.params.auctionId, req.user._id);

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const verify = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const payment = await verifyPayment(req.body, req.user._id);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// CREATE DIRECT PAYMENT
export const createDirectPaymentcontroller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const payment = await createDirectPayment(
      req.params.auctionId,
      req.user._id
    );

    res.status(201).json({
      success: true,
      data: payment
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// CONFIRM DIRECT PAYMENT
export const confirmDirectPaymentcontroller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const payment = await confirmDirectPayment(
      req.params.paymentId,
      req.user._id
    );

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET PAYMENT DETAILS
export const getPaymentDetailscontroller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const payment = await getPaymentByAuction(req.params.auctionId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};