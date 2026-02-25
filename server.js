import "dotenv/config";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import startAuctionCron from "./src/utils/auctioncron.js";

// Connect to database
connectDB().catch((error) => {
  console.error("Database connection failed:", error.message);
  process.exit(1);
});

// Start auction cron job
try {
  startAuctionCron();
} catch (error) {
  console.error("Failed to start auction cron:", error.message);
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});