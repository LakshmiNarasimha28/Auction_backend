// Auction categories
export const AUCTION_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home",
  "Sports",
  "Art",
  "Collectibles",
  "Other"
];

// Auction status
export const AUCTION_STATUS = {
  ACTIVE: "active",
  CLOSED: "closed",
  CANCELLED: "cancelled"
};

// User roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin"
};

// Account status
export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  INACTIVE: "inactive"
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

// Validation limits
export const VALIDATION_LIMITS = {
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 1000,
  NAME_MIN: 2,
  NAME_MAX: 50,
  PASSWORD_MIN: 6,
  MAX_IMAGES: 5
};

// Token expiry
export const TOKEN_EXPIRY = "24h";

// Rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
};
