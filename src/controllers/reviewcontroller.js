import * as reviewService from "../services/reviewservice.js";
import { validationResult } from "express-validator";

export const submitReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { auctionId } = req.params;
    const userId = req.user.id;
    const { toUserId, rating, comment, reviewType } = req.body;

    const review = await reviewService.createReview(auctionId, userId, {
      toUserId,
      rating,
      comment,
      reviewType
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await reviewService.getReviewsByUser(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getReviewStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await reviewService.getReviewStats(userId);

    // Calculate overall stats
    const overallAverageRating = stats.length > 0
      ? (stats.reduce((sum, s) => sum + (s.averageRating || 0), 0) / stats.length)
      : 0;

    const totalReviews = stats.reduce((sum, s) => sum + s.count, 0);

    return res.status(200).json({
      success: true,
      stats: {
        overall: Math.round(overallAverageRating * 10) / 10,
        totalReviews,
        byType: stats
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Response message is required"
      });
    }

    const review = await reviewService.respondToReview(reviewId, response);

    return res.status(200).json({
      success: true,
      message: "Response added successfully",
      review
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    await reviewService.deleteReview(reviewId, userId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
