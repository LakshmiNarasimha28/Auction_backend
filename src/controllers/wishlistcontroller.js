import * as wishlistService from "../services/wishlistservice.js";

export const addToWishlist = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;

    const item = await wishlistService.addToWishlist(userId, auctionId);

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
      item
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;

    await wishlistService.removeFromWishlist(userId, auctionId);

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    const result = await wishlistService.getUserWishlist(
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

export const checkInWishlist = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user.id;

    const inWishlist = await wishlistService.isInWishlist(userId, auctionId);

    return res.status(200).json({
      success: true,
      inWishlist
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await wishlistService.getWishlistCount(userId);

    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
