import cron from "node-cron";
import Auction from "../models/auction.js";
import Bid from "../models/bid.js";
import User from "../models/user.js";
import {
  sendAuctionWinnerEmail,
  sendAuctionClosedEmail
} from "../services/emailservice.js";

const startAuctionCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const expiredAuctions = await Auction.find({
        endTime: { $lt: now },
        status: "active"
      }).populate("owner");

      for (const auction of expiredAuctions) {
        const highestBid = await Bid.findOne({ auction: auction._id })
          .sort({ amount: -1 })
          .populate("bidder");

        if (highestBid) {
          auction.winner = highestBid.bidder._id;

          // Send email to winner
          try {
            const winner = highestBid.bidder;
            await sendAuctionWinnerEmail(
              winner.email,
              winner.name,
              auction.title,
              highestBid.amount
            );
          } catch (emailError) {
            console.error("Error sending winner email:", emailError);
          }
        }

        // Send email to seller
        try {
          const winnerName = highestBid
            ? highestBid.bidder.name
            : "No bidders";
          const winningBid = highestBid ? highestBid.amount : 0;

          await sendAuctionClosedEmail(
            auction.owner.email,
            auction.owner.name,
            auction.title,
            winnerName,
            winningBid
          );
        } catch (emailError) {
          console.error("Error sending auction closed email:", emailError);
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
