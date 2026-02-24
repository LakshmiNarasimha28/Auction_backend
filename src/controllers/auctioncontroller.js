import { 
  createAuction, 
  getAllAuctions, 
  getAuctionById, 
  updateAuction, 
  deleteAuction,
  cancelAuction,
  closeAuction,
  closeExpiredAuctions
} from "../services/auctionservice.js";
import { validationResult } from "express-validator";

export const createAuctionController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const auction = await createAuction(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: "Auction created successfully",
      data: auction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAuctionsController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { page, limit, status, search } = req.query;

    const auctions = await getAllAuctions(page, limit, status, search);

    res.status(200).json({
      success: true,
      message: "Auctions retrieved successfully",
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAuctionByIdController = async (req, res) => {
  try {
    const auction = await getAuctionById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Auction retrieved successfully",
      data: auction
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export const updateAuctionController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const auction = await updateAuction(req.params.id, req.body, req.user._id);
    res.status(200).json({
      success: true,
      message: "Auction updated successfully",
      data: auction
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 
      : error.message.includes("Not authorized") ? 403 
      : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteAuctionController = async (req, res) => {
  try {
    await deleteAuction(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: "Auction deleted successfully"
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 
      : error.message.includes("Not authorized") ? 403 
      : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelAuctionController = async (req, res) => {
  try {
    const auction = await cancelAuction(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: "Auction cancelled successfully",
      data: auction
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 
      : error.message.includes("Not authorized") ? 403 
      : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export const closeAuctionController = async (req, res) => {
  try {
    const auction = await closeAuction(req.params.id);
    res.status(200).json({
      success: true,
      message: "Auction closed successfully",
      data: auction
    });
  }catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export const closeExpiredAuctionsController = async (req, res) => {
  try {
    await closeExpiredAuctions();
    res.status(200).json({
      success: true,
      message: "Expired auctions closed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};