import express from "express";
import * as activityController from "../controllers/activitycontroller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";

const router = express.Router();

// Routes
router.get("/", authMiddleware, activityController.getUserActivity);

router.get("/type/:type", authMiddleware, activityController.getActivityByType);

router.get("/stats", authMiddleware, activityController.getActivityStats);

router.get("/dashboard-stats", authMiddleware, activityController.getDashboardStats);

router.get("/search", authMiddleware, activityController.searchActivities);

export default router;
