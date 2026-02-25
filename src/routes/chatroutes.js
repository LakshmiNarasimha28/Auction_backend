import express from "express";
import {
  createConversationcontroller,
  getUserConversationscontroller,
  getMessagescontroller
} from "../controllers/chatcontroller.js";
import { getUnreadCount, blockMessage } from "../services/chatservice.js";
import { protect } from "../middlewares/authmiddleware.js";
import { authorizeRoles } from "../middlewares/rolemiddleware.js";
import { body, param } from "express-validator";

const router = express.Router();
const conversationValidation = [
  body("participants")
    .isArray({ min: 2 }).withMessage("Participants must be an array with at least 2 users"),
  body("participants.*")
    .isMongoId().withMessage("Invalid participant id"),
  body("auction")
    .optional()
    .isMongoId().withMessage("Invalid auction id")
];

const conversationIdValidation = [
  param("conversationId").isMongoId().withMessage("Invalid conversation ID")
];

const messageIdValidation = [
  param("messageId").isMongoId().withMessage("Invalid message ID")
];

router.post("/chat", protect, conversationValidation, createConversationcontroller);
router.get("/chat", protect, getUserConversationscontroller);
router.get("/messages/:conversationId", protect, conversationIdValidation, getMessagescontroller);
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch("/block/:messageId", protect, authorizeRoles("admin"), messageIdValidation, async (req, res) => {
  try {
    const message = await blockMessage(req.params.messageId);
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;