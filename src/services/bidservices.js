import Bid from "../models/bid.js";
import Auction from "../models/auction.js";

export const placeBid = async (auctionId, amount, userId) => {
  const auction = await Auction.findById(auctionId);

  if (!auction) throw new Error("Auction not found");

  if (auction.status === "closed") {
    throw new Error("Auction is closed");
  }

  if (new Date() > auction.endTime) {
    auction.status = "closed";
    await auction.save();
    throw new Error("Auction expired");
  }

  if (amount <= auction.currentHighestBid) {
    throw new Error("Bid must be higher than current highest bid");
  }

  const bid = await Bid.create({
    amount,
    bidder: userId,
    auction: auctionId
  });

  // Update auction with new bid information
  auction.currentHighestBid = amount;
  auction.currentHighestBidder = userId;
  auction.bidders.push({
    user: userId,
    amount: amount,
    bidTime: new Date()
  });
  await auction.save();

  return bid;
};

export const getBidsByAuction = async (auctionId) => {
  return await Bid.find({ auction: auctionId })
    .populate("bidder", "name email")
    .sort({ createdAt: -1 });
};