import cron from "node-cron";
import Auction from "../models/auction.js";
import Bid from "../models/bid.js";

const startAuctionCron = () => {
  cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const expiredAuctions = await Auction.find({
      endTime: { $lt: now },
      status: "active"
    });

    for (const auction of expiredAuctions) {

      const highestBid = await Bid.findOne({ auction: auction._id })
        .sort({ amount: -1 });

      if (highestBid) {
        auction.winner = highestBid.bidder;
      }

      auction.status = "closed";
      auction.isCompleted = true;

      await auction.save();
    }

  } catch (error) {
    console.error("Cron error:", error.message);
  }
});
};

export default startAuctionCron;
