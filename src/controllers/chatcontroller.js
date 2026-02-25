import {
  createConversation,
  getUserConversations,
  getMessages
} from "../services/chatservice.js";
import { validationResult } from "express-validator";

export const createConversationcontroller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { participants, auction } = req.body;

    const conversation = await createConversation(participants, auction);

    res.status(201).json({
      success: true,
      data: conversation
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserConversationscontroller = async (req, res) => {
  try {
    const conversations = await getUserConversations(req.user._id);

    res.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMessagescontroller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const messages = await getMessages(req.params.conversationId);

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};