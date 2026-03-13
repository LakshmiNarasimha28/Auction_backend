import * as searchService from "../services/searchservice.js";

export const searchAuctions = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, status, sort, page = 1, limit = 12 } = req.query;

    const filters = {
      query: q || "",
      category,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      status: status || "active",
      sortBy: sort || "-createdAt",
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await searchService.searchAuctions(filters);

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

export const getTrendingAuctions = async (req, res) => {
  try {
    const { days = 7, limit = 12 } = req.query;

    const auctions = await searchService.getTrendingAuctions(parseInt(days), parseInt(limit));

    return res.status(200).json({
      success: true,
      auctions
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getEndingSoonAuctions = async (req, res) => {
  try {
    const { hours = 24, limit = 12 } = req.query;

    const auctions = await searchService.getEndingSoonAuctions(parseInt(hours), parseInt(limit));

    return res.status(200).json({
      success: true,
      auctions
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAuctionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const result = await searchService.getAuctionsByCategory(
      categoryId,
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

export const getAuctionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const result = await searchService.getAuctionsByUser(
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

export const getWinningAuctions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    const result = await searchService.getWinningAuctions(
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

export const getAuctionStats = async (req, res) => {
  try {
    const stats = await searchService.getAuctionStats();

    return res.status(200).json({
      success: true,
      stats: stats[0] || {}
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const advancedFilter = async (req, res) => {
  try {
    const { title, category, minPrice, maxPrice, minBids, maxBids, seller, status, sort, page = 1, limit = 12 } = req.query;

    const filters = {
      title,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minBids: minBids ? parseInt(minBids) : undefined,
      maxBids: maxBids ? parseInt(maxBids) : undefined,
      seller,
      status,
      sortBy: sort || "-createdAt",
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await searchService.advancedFilter(filters);

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
