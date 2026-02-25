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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidroutes);
app.use("/api/categories", categoryroutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chats", chatRoutes);

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

