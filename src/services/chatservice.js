import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

export const createConversation = async (participants, auction) => {
  return await Conversation.create({ participants, auction });
};

export const getUserConversations = async (userId) => {
  return await Conversation.find({ participants: userId })
    .populate("participants", "name email")
    .populate("auction", "title");
};

export const saveMessage = async (conversationId, sender, text) => {
  return await Message.create({
    conversation: conversationId,
    sender,
    text
  });
};

export const getMessages = async (conversationId) => {
  return await Message.find({ conversation: conversationId })
    .populate("sender", "name")
    .sort({ createdAt: 1 });
};

// Get count of unread messages for a user
export const getUnreadCount = async (userId) => {
  return await Message.countDocuments({
    isRead: false,
    sender: { $ne: userId }
  });
};

// Admin function to block a message
export const blockMessage = async (messageId) => {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  message.isBlocked = true;
  await message.save();
  return message;
};