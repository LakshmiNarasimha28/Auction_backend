import { placeBid, getBidsByAuction } from "../services/bidservice.js";

export const placeBidHandler = async (req, res) => {
  try {
    const { amount } = req.body;
    const { auctionId } = req.params;

    const bid = await placeBid(auctionId, amount, req.user._id);

    res.status(201).json({
      success: true,
      data: bid
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBidsHandler = async (req, res) => {
  try {
    const bids = await getBidsByAuction(req.params.auctionId);

    res.json(bids);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};