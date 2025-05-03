/**
 * Application Constants
 *
 * This file contains constants used throughout the application.
 */

// Authentication constants
export const JWT_EXPIRY = "24h"
export const REFRESH_TOKEN_EXPIRY = "7d"
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  DOCTOR: "doctor",
  RESEARCHER: "researcher",
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    SIGNUP: "/api/auth/signup",
    REFRESH: "/api/auth/refresh-session",
    VERIFY_OTP: "/api/auth/verify-otp",
    RESET_PASSWORD: "/api/auth/reset-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
  },
  USER: {
    PROFILE: "/api/user/profile",
    CHANGE_PASSWORD: "/api/user/change-password",
    PREDICTIONS: "/api/user/predictions",
    HEALTH_METRICS: "/api/user/health-metrics",
    RECENT_ACTIVITY: "/api/user/recent-activity",
  },
  ADMIN: {
    USERS: "/api/admin/users",
    PREDICTIONS: "/api/admin/predictions",
    SYSTEM_STATUS: "/api/admin/system-status",
  },
  PREDICT: "/api/predict",
}

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    PREDICTIONS: "/admin/predictions",
    PROFILE: "/admin/profile",
    EMAIL_SETTINGS: "/admin/email-settings",
    SYSTEM_STATUS: "/admin/system-status",
  },
  USER: {
    DASHBOARD: "/dashboard",
    PROFILE: "/profile",
    PREDICT: "/predict",
    HISTORY: "/history",
    SETTINGS: "/settings",
  },
}

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_REGEX: /^\+?[0-9]{10,15}$/,
}

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "An unexpected error occurred. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again",
  AUTH: {
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_EXISTS: "An account with this email already exists",
    WEAK_PASSWORD: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
    INVALID_TOKEN: "Invalid or expired token",
    SESSION_EXPIRED: "Your session has expired. Please log in again.",
  },
}

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  PASSWORD_RESET: "Password reset successfully",
  VERIFICATION_SENT: "Verification code sent successfully",
}

// System settings
export const SYSTEM_SETTINGS = {
  MAINTENANCE_MODE: false,
  DEFAULT_PAGINATION_LIMIT: 10,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB in bytes
}

// Feature flags
export const FEATURES = {
  EMAIL_VERIFICATION: true,
  SMS_VERIFICATION: true,
  SOCIAL_LOGIN: true,
  PDF_EXPORT: true,
  EMAIL_SHARING: true,
}

// Health metrics thresholds
export const HEALTH_THRESHOLDS = {
  BLOOD_PRESSURE: {
    NORMAL: { systolic: 120, diastolic: 80 },
    ELEVATED: { systolic: 130, diastolic: 80 },
    HIGH: { systolic: 140, diastolic: 90 },
  },
  CHOLESTEROL: {
    NORMAL: 200,
    BORDERLINE: 240,
    HIGH: 240,
  },
  BLOOD_SUGAR: {
    FASTING_NORMAL: 100,
    FASTING_PREDIABETIC: 126,
    RANDOM_NORMAL: 140,
    RANDOM_PREDIABETIC: 200,
  },
}
