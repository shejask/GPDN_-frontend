/**
 * Regular expression for validating email addresses
 * This regex validates common email formats while rejecting invalid ones
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Minimum password length requirement
 */
export const MIN_PASSWORD_LENGTH = 6;

/**
 * HTTP Status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Message types for UI feedback
 */
export const MESSAGE_TYPES = {
  ERROR: "error",
  SUCCESS: "success",
  PENDING: "pending",
  INFO: "info"
};

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again later.",
  ADMIN_APPROVAL_PENDING: "Your account is pending approval. Please wait for admin verification.",
  INVALID_CREDENTIALS: "Invalid email or password. Please try again."
};

/**
 * Common success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful! Redirecting...",
  REGISTRATION_SUCCESS: "Registration successful! Please wait for admin approval."
};

/**
 * Routes for navigation
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/signin",
  REGISTER: "/registration",
  FORUM: "/forum",
  RESET_PASSWORD: "/resetPassword",
  PROFILE: "/settings"
};
