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

    // Extract uploaded file URLs from Cloudinary
    const imageUrls = [];
    let videoUrl = null;

    if (req.uploadedFiles) {
      req.uploadedFiles.forEach((file) => {
        if (file.type === "image") {
          imageUrls.push(file.url);
        } else if (file.type === "video") {
          videoUrl = file.url;
        }
      });
    }

    const auction = await createAuction({
      ...req.body,
      images: imageUrls,
      video: videoUrl
    }, req.user._id);
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

    const { page, limit, status, search, category } = req.query;

    const result = await getAllAuctions(page, limit, status, search, category);

    res.status(200).json({
      success: true,
      message: "Auctions retrieved successfully",
      data: result.auctions,
      pagination: result.pagination
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

    // Handle uploaded files
    const updateData = { ...req.body };
    
    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      const imageUrls = [];
      let videoUrl = null;

      req.uploadedFiles.forEach((file) => {
        if (file.type === "image") {
          imageUrls.push(file.url);
        } else if (file.type === "video") {
          videoUrl = file.url;
        }
      });

      if (imageUrls.length > 0) {
        updateData.images = imageUrls;
      }
      if (videoUrl) {
        updateData.video = videoUrl;
      }
    }

    const auction = await updateAuction(req.params.id, updateData, req.user._id);
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