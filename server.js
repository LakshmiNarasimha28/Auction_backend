import "dotenv/config";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import startAuctionCron from "./src/utils/auctioncron.js";
import { Server } from "socket.io";
import { saveMessage } from "./src/services/chatservice.js";

// Connect to database
connectDB().catch((error) => {
  const errorMsg = process.env.NODE_ENV === "production" 
    ? "Database connection failed" 
    : `Database connection failed: ${error.message}`;
  console.error(errorMsg);
  process.exit(1);
});

// Start auction cron job
try {
  startAuctionCron();
} catch (error) {
  const errorMsg = process.env.NODE_ENV === "production" 
    ? "Failed to start auction cron job" 
    : `Failed to start auction cron: ${error.message}`;
  console.error(errorMsg);
}

const PORT = process.env.PORT || 5000;

const httpServer = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`Server running on port ${PORT}`);
  }
});
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

io.on("connection", (socket) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("User connected:", socket.id);
  }

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
    if (process.env.NODE_ENV !== "production") {
      console.log("User disconnected");
    }
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  if (process.env.NODE_ENV === "production") {
    console.error("Unhandled rejection detected - shutting down");
  } else {
    console.error("Unhandled rejection:", err);
  }
  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  if (process.env.NODE_ENV === "production") {
    console.error("Uncaught exception detected - shutting down");
  } else {
    console.error("Uncaught exception:", err);
  }
  process.exit(1);
});