import Review from "../models/review.js";
import User from "../models/user.js";
import Auction from "../models/auction.js";
import mongoose from "mongoose";
import Notification from "../models/notification.js";

export const createReview = async (auctionId, fromUserId, reviewData) => {
  if (!mongoose.Types.ObjectId.isValid(auctionId) || !mongoose.Types.ObjectId.isValid(fromUserId)) {
    throw new Error("Invalid ID format");
  }

  const { toUserId, rating, comment, reviewType } = reviewData;

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (comment && comment.length < 10) {
    throw new Error("Comment must be at least 10 characters");
  }

  // Check if users exist
  const auction = await Auction.findById(auctionId);
  if (!auction) throw new Error("Auction not found");

  const toUser = await User.findById(toUserId);
  if (!toUser) throw new Error("User not found");

  // Check if review already exists
  const existingReview = await Review.findOne({
    auctionId,
    fromUserId,
    toUserId
  });
  if (existingReview) throw new Error("You have already reviewed this user for this auction");

  // Create review
  const review = await Review.create({
    auctionId,
    fromUserId,
    toUserId,
    rating,
    comment,
    reviewType,
    verified: true // Verified since it's tied to completed auction
  });

  // Update user reputation
  await updateUserReputation(toUserId);

  // Create notification
  await Notification.create({
    userId: toUserId,
    type: "review_posted",
    title: `New ${reviewType} review from ${(await User.findById(fromUserId)).name}`,
    message: `You received a ${rating}-star review: "${comment}"`,
    relatedId: review._id,
    actionUrl: `/reviews/${review._id}`
  });

  return review;
};

export const getReviewsByUser = async (userId, page = 1, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const reviews = await Review.find({ toUserId: userId })
    .populate("fromUserId", "name profileImage reputation")
    .populate("auctionId", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ toUserId: userId });

  return {
    reviews,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

export const getReviewStats = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const stats = await Review.aggregate([
    { $match: { toUserId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$reviewType",
        averageRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  return stats;
};

export const updateUserReputation = async (userId) => {
  const buyerReviews = await Review.find({
    toUserId: userId,
    reviewType: "buyer"
  });

  const sellerReviews = await Review.find({
    toUserId: userId,
    reviewType: "seller"
  });

  const buyerRating = buyerReviews.length > 0
    ? buyerReviews.reduce((sum, r) => sum + r.rating, 0) / buyerReviews.length
    : 0;

  const sellerRating = sellerReviews.length > 0
    ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
    : 0;

  const overallRating = (buyerRating + sellerRating) / 2;

  await User.findByIdAndUpdate(userId, {
    "reputation.buyerRating": Math.round(buyerRating * 10) / 10,
    "reputation.sellerRating": Math.round(sellerRating * 10) / 10,
    "reputation.overall": Math.round(overallRating * 10) / 10
  });
};

export const respondToReview = async (reviewId, response) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new Error("Invalid review ID");
  }

  const review = await Review.findByIdAndUpdate(
    reviewId,
    {
      "response.content": response,
      "response.respondedAt": new Date()
    },
    { new: true }
  );

  return review;
};

export const deleteReview = async (reviewId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new Error("Invalid review ID");
  }

  const review = await Review.findById(reviewId);
  if (!review) throw new Error("Review not found");

  if (review.fromUserId.toString() !== userId.toString()) {
    throw new Error("You can only delete your own reviews");
  }

  await Review.findByIdAndDelete(reviewId);

  // Update user reputation
  await updateUserReputation(review.toUserId);

  return { success: true };
};
