import Auction from "../models/auction.js";
import mongoose from "mongoose";

export const searchAuctions = async (filters = {}) => {
  const {
    query = "",
    category = null,
    minPrice = null,
    maxPrice = null,
    status = "active",
    sortBy = "-createdAt",
    page = 1,
    limit = 12
  } = filters;

  const skip = (page - 1) * limit;
  const searchQuery = {};

  // Text search
  if (query && query.trim().length > 0) {
    searchQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ];
  }

  // Category filter
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    searchQuery.category = new mongoose.Types.ObjectId(category);
  }

  // Price range filter
  if (minPrice !== null || maxPrice !== null) {
    searchQuery.currentHighestBid = {};
    if (minPrice !== null) {
      searchQuery.currentHighestBid.$gte = parseFloat(minPrice);
    }
    if (maxPrice !== null) {
      searchQuery.currentHighestBid.$lte = parseFloat(maxPrice);
    }
  }

  // Status filter
  if (status) {
    searchQuery.status = status;
  }

  const auctions = await Auction.find(searchQuery)
    .populate("seller", "name profileImage reputation")
    .populate("category", "name")
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Auction.countDocuments(searchQuery);

  return {
    auctions,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      pageSize: limit
    }
  };
};

export const getTrendingAuctions = async (days = 7, limit = 12) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const auctions = await Auction.find({
    status: "active",
    createdAt: { $gte: startDate }
  })
    .populate("seller", "name profileImage reputation")
    .populate("category", "name")
    .sort({ totalBids: -1, currentHighestBid: -1 })
    .limit(limit)
    .lean();

  return auctions;
};

export const getEndingSoonAuctions = async (hoursLeft = 24, limit = 12) => {
  const now = new Date();
  const endTime = new Date(Date.now() + hoursLeft * 60 * 60 * 1000);

  const auctions = await Auction.find({
    status: "active",
    endTime: { $gte: now, $lte: endTime }
  })
    .populate("seller", "name profileImage reputation")
    .populate("category", "name")
    .sort({ endTime: 1 })
    .limit(limit)
    .lean();

  return auctions;
};

export const getAuctionsByCategory = async (categoryId, page = 1, limit = 12) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const skip = (page - 1) * limit;

  const auctions = await Auction.find({
    category: new mongoose.Types.ObjectId(categoryId),
    status: "active"
  })
    .populate("seller", "name profileImage reputation")
    .populate("category", "name")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Auction.countDocuments({
    category: new mongoose.Types.ObjectId(categoryId),
    status: "active"
  });

  return {
    auctions,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

export const getAuctionsByUser = async (userId, page = 1, limit = 12) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const auctions = await Auction.find({
    seller: new mongoose.Types.ObjectId(userId)
  })
    .populate("seller", "name profileImage reputation")
    .populate("category", "name")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Auction.countDocuments({
    seller: new mongoose.Types.ObjectId(userId)
  });

  return {
    auctions,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

export const getWinningAuctions = async (userId, page = 1, limit = 12) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const auctions = await Auction.find({
    winner: new mongoose.Types.ObjectId(userId),
    status: "closed"
  })
    .populate("seller", "name profileImage reputation")
    .populate("category", "name")
    .sort("-endTime")
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Auction.countDocuments({
    winner: new mongoose.Types.ObjectId(userId),
    status: "closed"
  });

  return {
    auctions,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

export const getAuctionStats = async () => {
  const stats = await Auction.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        active: [{ $match: { status: "active" } }, { $count: "count" }],
        closed: [{ $match: { status: "closed" } }, { $count: "count" }],
        totalBidsPlaced: [{ $group: { _id: null, total: { $sum: "$totalBids" } } }],
        averagePrice: [{ $group: { _id: null, avg: { $avg: "$currentHighestBid" } } }],
        topCategories: [
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]
      }
    }
  ]);

  return stats[0];
};

export const advancedFilter = async (filters = {}) => {
  const {
    title,
    category,
    minPrice,
    maxPrice,
    minBids,
    maxBids,
    seller,
    status = "active",
    sortBy = "-createdAt",
    page = 1,
    limit = 12
  } = filters;

  const query = {};
  const skip = (page - 1) * limit;

  // Title search
  if (title && title.trim().length > 0) {
    query.title = { $regex: title, $options: "i" };
  }

  // Category filter
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.category = new mongoose.Types.ObjectId(category);
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.currentHighestBid = {};
    if (minPrice !== undefined) {
      query.currentHighestBid.$gte = parseFloat(minPrice);
    }
    if (maxPrice !== undefined) {
      query.currentHighestBid.$lte = parseFloat(maxPrice);
    }
  }

  // Bids range
  if (minBids !== undefined || maxBids !== undefined) {
    query.totalBids = {};
    if (minBids !== undefined) {
      query.totalBids.$gte = parseInt(minBids);
    }
    if (maxBids !== undefined) {
      query.totalBids.$lte = parseInt(maxBids);
    }
  }

  // Seller filter
  if (seller && mongoose.Types.ObjectId.isValid(seller)) {
    query.seller = new mongoose.Types.ObjectId(seller);
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  const auctions = await Auction.find(query)
    .populate("seller", "name profileImage reputation")
    .populate("category", "name")
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Auction.countDocuments(query);

  return {
    auctions,
    filters: query,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      pageSize: limit
    }
  };
};
