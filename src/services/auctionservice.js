import Auction from "../models/auction.js";
import mongoose from "mongoose";

export const createAuction = async (data, userId) => {
  // Validate end time is in the future
  if (new Date(data.endTime) <= new Date()) {
    throw new Error("End time must be in the future");
  }

  // Validate starting price
  if (data.startingPrice <= 0) {
    throw new Error("Starting price must be greater than 0");
  }

  return await Auction.create({
    ...data,
    owner: userId,
    currentHighestBid: data.startingPrice,
    bidders: []
  });
};

export const getAllAuctions = async (filters = {}, options = {}) => {
  const { status, category, owner, search } = filters;
  const { page = 1, limit = 10, sort = "-createdAt" } = options;

  const query = {};

  // Apply filters
  if (status) query.status = status;
  if (category) query.category = category;
  if (owner) query.owner = owner;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (page - 1) * limit;

  const [auctions, total] = await Promise.all([
    Auction.find(query)
      .populate("owner", "name email")
      .populate("currentHighestBidder", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Auction.countDocuments(query)
  ]);

  return {
    auctions,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    }
  };
};

export const getAuctionById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid auction ID");
  }

  const auction = await Auction.findById(id)
    .populate("owner", "name email")
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

  await auction.deleteOne();
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
  return await auction.save();
};