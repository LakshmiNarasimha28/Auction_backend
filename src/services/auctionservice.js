import Auction from "../models/auction.js";
import Category from "../models/category.js";
import { updateCategoryAuctionCount } from "./categoryservice.js";
import mongoose from "mongoose";
import Bid from "../models/bid.js";

export const createAuction = async (data, userId) => {
  // Validate category exists and is active
  if (data.category) {
    const category = await Category.findById(data.category);
    if (!category) {
      throw new Error("Category not found");
    }
    if (!category.isActive) {
      throw new Error("Selected category is not active");
    }
  }

  // Validate end time is in the future
  if (new Date(data.endTime) <= new Date()) {
    throw new Error("End time must be in the future");
  }

  // Validate starting price
  if (data.startingPrice <= 0) {
    throw new Error("Starting price must be greater than 0");
  }

  const auction = await Auction.create({
    ...data,
    owner: userId,
    currentHighestBid: data.startingPrice,
    bidders: []
  });

  // Update category auction count
  if (auction.category) {
    await updateCategoryAuctionCount(auction.category);
  }

  return auction;
};

export const getAllAuctions = async (
  page = 1,
  limit = 10,
  status,
  search,
  category
) => {
  page = parseInt(page);
  limit = parseInt(limit);
  
  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;

  // Execute queries in parallel for better performance
  const [auctions, total] = await Promise.all([
    Auction.find(query)
      .skip(skip)
      .limit(limit)
      .populate("owner", "name email")
      .populate("category", "name slug icon color")
      .sort({ createdAt: -1 }),
    Auction.countDocuments(query)
  ]);

  return {
    auctions,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
};

export const getAuctionById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid auction ID");
  }

  const auction = await Auction.findById(id)
    .populate("owner", "name email")
    .populate("category", "name slug description icon color")
    .populate("currentHighestBidder", "name")
    .populate("bidders.user", "name");

  if (!auction) throw new Error("Auction not found");

  return auction;
};

export const updateAuction = async (id, data, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid auction ID");
  }

  const auction = await Auction.findById(id);

  if (!auction) throw new Error("Auction not found");

  if (auction.owner.toString() !== userId.toString()) {
    throw new Error("Not authorized to update this auction");
  }

  // Prevent updating closed or cancelled auctions
  if (auction.status !== "active") {
    throw new Error("Cannot update a closed or cancelled auction");
  }

  // Prevent updating if there are bids
  if (auction.bidders && auction.bidders.length > 0) {
    throw new Error("Cannot update auction with existing bids");
  }

  // Validate end time if being updated
  if (data.endTime && new Date(data.endTime) <= new Date()) {
    throw new Error("End time must be in the future");
  }

  // Prevent changing sensitive fields
  delete data.owner;
  delete data.bidders;
  delete data.currentHighestBid;
  delete data.currentHighestBidder;

  Object.assign(auction, data);
  return await auction.save();
};

export const deleteAuction = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid auction ID");
  }

  const auction = await Auction.findById(id);

  if (!auction) throw new Error("Auction not found");

  if (auction.owner.toString() !== userId.toString()) {
    throw new Error("Not authorized to delete this auction");
  }

  // Prevent deletion if there are bids
  if (auction.bidders && auction.bidders.length > 0) {
    throw new Error("Cannot delete auction with existing bids. Cancel it instead.");
  }

  const categoryId = auction.category;
  await auction.deleteOne();

  // Update category auction count
  if (categoryId) {
    await updateCategoryAuctionCount(categoryId);
  }
};

export const cancelAuction = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid auction ID");
  }

  const auction = await Auction.findById(id);

  if (!auction) throw new Error("Auction not found");

  if (auction.owner.toString() !== userId.toString()) {
    throw new Error("Not authorized to cancel this auction");
  }

  if (auction.status !== "active") {
    throw new Error("Auction is already closed or cancelled");
  }

  auction.status = "cancelled";
  await auction.save();

  // Update category auction count
  if (auction.category) {
    await updateCategoryAuctionCount(auction.category);
  }

  return auction;
};

export const closeExpiredAuctions = async () => {
  const now = new Date();
  await Auction.updateMany(
    { endTime: { $lte: now }, status: "active" },
    { status: "closed" }
  );
};

export const closeAuction = async (id) => {
  const auction = await Auction.findById(id);

  if (!auction) throw new Error("Auction not found");

  const highestBid = await Bid.findOne({ auction: id })
    .sort({ amount: -1 });

  if (highestBid) {
    auction.winner = highestBid.bidder;
  }

  auction.status = "closed";
  auction.isCompleted = true;

  return await auction.save();
};