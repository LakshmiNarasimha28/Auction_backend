import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authroutes.js";
import auctionRoutes from "./routes/auctionroutes.js";
import cookieParser from "cookie-parser";
import bidroutes from "./routes/bidroutes.js";
import categoryroutes from "./routes/categoryroutes.js";
import paymentRoutes from "./routes/paymentroutes.js";
import chatRoutes from "./routes/chatroutes.js";
import reviewRoutes from "./routes/reviewroutes.js";
import wishlistRoutes from "./routes/wishlistroutes.js";
import notificationRoutes from "./routes/notificationroutes.js";
import activityRoutes from "./routes/activityroutes.js";
import searchRoutes from "./routes/searchroutes.js";

const app = express();

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400 // 24 hours
}));
app.use(helmet());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});
app.use(limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Root route - API information
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auction Platform API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        profile: "GET /api/auth/profile"
      },
      auctions: {
        list: "GET /api/auctions",
        create: "POST /api/auctions",
        getOne: "GET /api/auctions/:id",
        update: "PUT /api/auctions/:id",
        delete: "DELETE /api/auctions/:id"
      },
      bids: {
        list: "GET /api/bids/:auctionId",
        create: "POST /api/bids",
        accept: "POST /api/bids/:id/accept"
      },
      payments: {
        createOrder: "POST /api/payments/create-order",
        verify: "POST /api/payments/verify"
      },
      chats: {
        conversations: "GET /api/chats",
        messages: "GET /api/chats/:conversationId",
        create: "POST /api/chats",
        sendMessage: "POST /api/chats/:conversationId/messages"
      },
      categories: {
        list: "GET /api/categories",
        create: "POST /api/categories"
      }
    },
    status: "✅ Running",
    documentation: "See API-REFERENCE.md for detailed documentation"
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidroutes);
app.use("/api/categories", categoryroutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/search", searchRoutes);

// 404 handler - must be before error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global error handling middleware - MUST be last
app.use((err, req, res, next) => {
  // Log error details for debugging (in development)
  if (process.env.NODE_ENV !== "production") {
    console.error("Error caught:", err);
    console.error("Error message:", err.message);
  } else {
    // In production, log without sensitive details
    console.error("Error:", err.message);
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : (err.message || "Internal server error"),
    // Don't expose error details or stack traces in production
    ...(process.env.NODE_ENV !== "production" && { details: err.message })
  });
});

export default app;

