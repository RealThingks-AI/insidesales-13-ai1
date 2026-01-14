/**
 * Centralized application constants
 */

// Pagination
export const ITEMS_PER_PAGE = 25;
export const MAX_ITEMS_PER_PAGE = 100;

// Cache timing (in milliseconds)
export const CACHE_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const CACHE_GC_TIME = 30 * 60 * 1000; // 30 minutes
export const SHORT_CACHE_TIME = 60 * 1000; // 1 minute

// Debounce delays (in milliseconds)
export const SEARCH_DEBOUNCE_MS = 300;
export const INPUT_DEBOUNCE_MS = 150;
export const SAVE_DEBOUNCE_MS = 500;

// Timeouts
export const API_TIMEOUT_MS = 15000;
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// UI delays
export const SKELETON_MIN_DISPLAY_MS = 500;
export const TOAST_DURATION_MS = 5000;
export const ANIMATION_DURATION_MS = 300;

// File uploads
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_FILE_TYPES = {
  csv: ['text/csv', 'application/vnd.ms-excel'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Date formats
export const DATE_FORMAT = {
  display: 'MMM d, yyyy',
  displayWithTime: 'MMM d, yyyy h:mm a',
  input: 'yyyy-MM-dd',
  time: 'h:mm a',
  full: 'EEEE, MMMM d, yyyy',
  short: 'MM/dd/yyyy',
};

// Build info (injected at build time)
export const BUILD_VERSION = import.meta.env.VITE_BUILD_VERSION || 'dev';
export const BUILD_TIMESTAMP = import.meta.env.VITE_BUILD_TIMESTAMP || new Date().toISOString();

// Feature flags
export const FEATURES = {
  enableRealtime: true,
  enableNotifications: true,
  enableBulkOperations: true,
  maxBulkSelectItems: 100,
};

// Status colors (semantic)
export const STATUS_COLORS = {
  success: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  warning: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
  error: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  info: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  neutral: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800',
};
