import Activity from "../models/activity.js";
import mongoose from "mongoose";

export const logActivity = async (activityData, ipAddress, userAgent) => {
  const {
    userId,
    type,
    description,
    relatedId = null,
    relatedModel = "Auction",
    status = "success",
    metadata = {}
  } = activityData;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const activity = await Activity.create({
    userId,
    type,
    description,
    relatedId,
    relatedModel,
    ipAddress,
    userAgent,
    status,
    metadata
  });

  return activity;
};

export const getUserActivity = async (userId, page = 1, limit = 20) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const activities = await Activity.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Activity.countDocuments({ userId });

  return {
    activities,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

export const getUserActivityByType = async (userId, type, page = 1, limit = 20) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const activities = await Activity.find({ userId, type })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Activity.countDocuments({ userId, type });

  return {
    activities,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

export const getActivityStats = async (userId, days = 30) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await Activity.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return stats;
};

export const getRelatedActivities = async (relatedId, relatedModel) => {
  if (!mongoose.Types.ObjectId.isValid(relatedId)) {
    throw new Error("Invalid related ID");
  }

  const activities = await Activity.find({
    relatedId,
    relatedModel
  })
    .sort({ createdAt: -1 })
    .lean();

  return activities;
};

export const getDashboardStats = async (userId, days = 30) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Total activities
  const totalActivities = await Activity.countDocuments({
    userId,
    createdAt: { $gte: startDate }
  });

  // Activity by type
  const activitiesByType = await Activity.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    }
  ]);

  // Failed activities
  const failedActivities = await Activity.countDocuments({
    userId,
    status: "failed",
    createdAt: { $gte: startDate }
  });

  // Login activity
  const loginCount = await Activity.countDocuments({
    userId,
    type: "login",
    createdAt: { $gte: startDate }
  });

  return {
    totalActivities,
    activitiesByType,
    failedActivities,
    loginCount,
    timeframe: `Last ${days} days`
  };
};

export const searchActivities = async (userId, searchTerm, page = 1, limit = 20) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;

  const activities = await Activity.find({
    userId,
    $or: [
      { description: { $regex: searchTerm, $options: "i" } },
      { type: { $regex: searchTerm, $options: "i" } }
    ]
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Activity.countDocuments({
    userId,
    $or: [
      { description: { $regex: searchTerm, $options: "i" } },
      { type: { $regex: searchTerm, $options: "i" } }
    ]
  });

  return {
    activities,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  };
};

export const deleteOldActivities = async (daysOld = 90) => {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

  const result = await Activity.deleteMany({
    createdAt: { $lt: cutoffDate }
  });

  return result;
};
