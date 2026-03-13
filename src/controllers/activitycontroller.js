import * as activityService from "../services/activityservice.js";

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await activityService.getUserActivity(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getActivityByType = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await activityService.getUserActivityByType(
      userId,
      type,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getActivityStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const stats = await activityService.getActivityStats(userId, parseInt(days));

    return res.status(200).json({
      success: true,
      stats,
      timeframe: `Last ${days} days`
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const stats = await activityService.getDashboardStats(userId, parseInt(days));

    return res.status(200).json({
      success: true,
      ...stats
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const searchActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;
    const { page = 1, limit = 20 } = req.query;

    if (!search || search.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search term is required"
      });
    }

    const result = await activityService.searchActivities(
      userId,
      search,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
