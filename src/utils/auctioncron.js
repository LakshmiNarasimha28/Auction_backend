import cron from "node-cron";
import Auction from "../models/auction.js";

const startAuctionCron = () => {
  // runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const expiredAuctions = await Auction.updateMany(
        {
          endTime: { $lt: now },
          status: "active"
        },
        { status: "closed" }
      );

      if (expiredAuctions.modifiedCount > 0) {
        console.log(`${expiredAuctions.modifiedCount} auctions closed automatically`);
      }

    } catch (error) {
      console.error("Cron error:", error.message);
    }
  });
};

export default startAuctionCron;