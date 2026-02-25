import mongoose from "mongoose";

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The id to validate
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Sanitizes user input by removing sensitive fields
 * @param {Object} user - User object
 * @returns {Object} - Sanitized user object
 */
export const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

/**
 * Generates pagination info
 * @param {number} total - Total count of documents
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} - Pagination metadata
 */
export const getPaginationInfo = (total, page, limit) => {
  return {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    limit: parseInt(limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1
  };
};

/**
 * Formats error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted error
 */
export const formatError = (message, statusCode = 500) => {
  return {
    success: false,
    message,
    statusCode
  };
};

/**
 * Formats success response
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @returns {Object} - Formatted response
 */
export const formatSuccess = (message, data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return response;
};
