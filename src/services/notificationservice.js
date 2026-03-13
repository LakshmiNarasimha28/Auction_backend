import Notification from "../models/notification.js";
import mongoose from "mongoose";

export const createNotification = async (notificationData) => {
  const {
    userId,
    type,
    title,
    message,
    relatedId = null,
    actionUrl = null,
    expiresAt = null
  } = notificationData;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    relatedId,
    actionUrl,
    expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  return notification;
};

export const getUserNotifications = async (userId, page = 1, limit = 20) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments({ userId });

  return {
    notifications,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

export const getUnreadNotifications = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const unread = await Notification.find({ userId, read: false })
    .sort({ createdAt: -1 })
    .lean();

  return unread;
};

export const getUnreadCount = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  return await Notification.countDocuments({ userId, read: false });
};

export const markAsRead = async (notificationId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new Error("Invalid notification ID");
  }

  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    {
      read: true,
      readAt: new Date()
    },
    { new: true }
  );

  return notification;
};

export const markAllAsRead = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const result = await Notification.updateMany(
    { userId, read: false },
    {
      read: true,
      readAt: new Date()
    }
  );

  return result;
};

export const deleteNotification = async (notificationId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new Error("Invalid notification ID");
  }

  const result = await Notification.findByIdAndDelete(notificationId);
  if (!result) throw new Error("Notification not found");

  return { success: true };
};

export const deleteAllNotifications = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const result = await Notification.deleteMany({ userId });
  return result;
};

export const deleteNotificationsByType = async (userId, type) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const result = await Notification.deleteMany({ userId, type });
  return result;
};

export const getNotificationsByType = async (userId, type, page = 1, limit = 20) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId, type })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments({ userId, type });

  return {
    notifications,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

// Broadcast notification to multiple users
export const broadcastNotification = async (userIds, notificationData) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("Invalid user IDs array");
  }

  const notifications = userIds.map(userId => ({
    ...notificationData,
    userId
  }));

  const result = await Notification.insertMany(notifications);
  return result;
};
