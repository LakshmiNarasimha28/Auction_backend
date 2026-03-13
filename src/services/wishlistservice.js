import Wishlist from "../models/wishlist.js";
import Auction from "../models/auction.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import Notification from "../models/notification.js";

export const addToWishlist = async (userId, auctionId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(auctionId)) {
    throw new Error("Invalid ID format");
  }

  // Check if auction exists
  const auction = await Auction.findById(auctionId);
  if (!auction) throw new Error("Auction not found");

  // Check if already in wishlist
  const existing = await Wishlist.findOne({ userId, auctionId });
  if (existing) throw new Error("Auction already in wishlist");

  const wishlistItem = await Wishlist.create({
    userId,
    auctionId,
    savedPrice: auction.currentHighestBid || auction.startingBid
  });

  return wishlistItem.populate("auctionId");
};

export const removeFromWishlist = async (userId, auctionId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(auctionId)) {
    throw new Error("Invalid ID format");
  }

  const result = await Wishlist.findOneAndDelete({ userId, auctionId });
  if (!result) throw new Error("Item not in wishlist");

  return { success: true };
};

export const getUserWishlist = async (userId, page = 1, limit = 12) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const wishlist = await Wishlist.find({ userId })
    .populate({
      path: "auctionId",
      select: "title description startingBid currentHighestBid endTime status images seller"
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Wishlist.countDocuments({ userId });

  return {
    items: wishlist,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

export const isInWishlist = async (userId, auctionId) => {
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(auctionId)) {
    throw new Error("Invalid ID format");
  }

  const result = await Wishlist.findOne({ userId, auctionId });
  return !!result;
};

export const getWishlistCount = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  return await Wishlist.countDocuments({ userId });
};

export const checkWishlistAuctionsEnding = async () => {
  try {
    // Find auctions ending in next 24 hours
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const now = new Date();

    const endingAuctions = await Auction.find({
      endTime: { $gte: now, $lte: in24Hours },
      status: "active"
    });

    // Find all wishlist entries for these auctions that haven't been notified
    for (const auction of endingAuctions) {
      const wishlistEntries = await Wishlist.find({
        auctionId: auction._id,
        isNotified: false
      });

      for (const entry of wishlistEntries) {
        // Create notification
        await Notification.create({
          userId: entry.userId,
          type: "auction_ending",
          title: "Auction Ending Soon!",
          message: `"${auction.title}" is ending in less than 24 hours`,
          relatedId: auction._id,
          actionUrl: `/auction/${auction._id}`
        });

        // Mark as notified
        entry.isNotified = true;
        await entry.save();
      }
    }
  } catch (error) {
    console.error("Error checking wishlist auctions:", error.message);
  }
};

export const clearExpiredWishlist = async () => {
  try {
    // Remove wishlist items for closed/ended auctions
    const closedAuctions = await Auction.find({ status: "closed" }).select("_id");
    const closedAuctionIds = closedAuctions.map(a => a._id);

    await Wishlist.deleteMany({ auctionId: { $in: closedAuctionIds } });
  } catch (error) {
    console.error("Error clearing expired wishlist:", error.message);
  }
};
