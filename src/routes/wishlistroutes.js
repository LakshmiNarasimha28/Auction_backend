import express from "express";
import * as wishlistController from "../controllers/wishlistcontroller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";

const router = express.Router();

// Routes
router.post("/:auctionId", authMiddleware, wishlistController.addToWishlist);

router.delete("/:auctionId", authMiddleware, wishlistController.removeFromWishlist);

router.get("/", authMiddleware, wishlistController.getUserWishlist);

router.get("/check/:auctionId", authMiddleware, wishlistController.checkInWishlist);

router.get("/count", authMiddleware, wishlistController.getWishlistCount);

export default router;
