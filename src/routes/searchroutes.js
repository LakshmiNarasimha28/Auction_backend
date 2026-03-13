import express from "express";
import * as searchController from "../controllers/searchcontroller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";

const router = express.Router();

// Search and filter endpoints
router.get("/", searchController.searchAuctions);

router.get("/trending", searchController.getTrendingAuctions);

router.get("/ending-soon", searchController.getEndingSoonAuctions);

router.get("/category/:categoryId", searchController.getAuctionsByCategory);

router.get("/seller/:userId", searchController.getAuctionsByUser);

router.get("/winning", authMiddleware, searchController.getWinningAuctions);

router.get("/stats", searchController.getAuctionStats);

router.get("/advanced", searchController.advancedFilter);

export default router;
