import "dotenv/config";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import startAuctionCron from "./src/utils/auctioncron.js";
import { Server } from "socket.io";
import { saveMessage } from "./src/services/chatservice.js";

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

const httpServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("sendMessage", async (data) => {
    const message = await saveMessage(
      data.conversationId,
      data.sender,
      data.text
    );

    io.to(data.conversationId).emit("receiveMessage", message);
  });

  socket.on("typing", (conversationId) => {
    socket.to(conversationId).emit("userTyping");
  });

  socket.on("stopTyping", (conversationId) => {
    socket.to(conversationId).emit("userStopTyping");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});