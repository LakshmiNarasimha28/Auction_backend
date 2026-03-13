import express from "express";
import * as notificationController from "../controllers/notificationcontroller.js";
import { authMiddleware } from "../middlewares/authmiddleware.js";

const router = express.Router();

// Routes
router.get("/", authMiddleware, notificationController.getNotifications);

router.get("/unread-list", authMiddleware, notificationController.getUnreadNotifications);

router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);

router.get("/type/:type", authMiddleware, notificationController.getNotificationsByType);

router.patch("/:notificationId/read", authMiddleware, notificationController.markAsRead);

router.patch("/mark-all/read", authMiddleware, notificationController.markAllAsRead);

router.delete("/:notificationId", authMiddleware, notificationController.deleteNotification);

router.delete("/", authMiddleware, notificationController.deleteAllNotifications);

export default router;
