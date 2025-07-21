/**
 * Application constants and configuration
 */

// Search Configuration
export const SEARCH_CONFIG = {
  RATE_LIMIT_MS: 2000, // 2 seconds between searches
  DEFAULT_MAX_RESULTS: 10,
  REQUEST_TIMEOUT_MS: 30000,
} as const;

// Job Search Quick Filters
export const QUICK_FILTERS = {
  LINKEDIN_ONLY: { sites: ['linkedin.com'] },
  INDEED_ONLY: { sites: ['indeed.com'] },
  TECH_SITES: { sites: ['dice.com', 'stackoverflow.com/jobs'] },
  REMOTE_SITES: { sites: ['remote.co', 'weworkremotely.com'] },
  ALL_SITES: { sites: [] },
} as const;

// Job Types
export const JOB_TYPES = [
  { value: 'full-time' as const, label: 'Full Time' },
  { value: 'part-time' as const, label: 'Part Time' },
  { value: 'contract' as const, label: 'Contract' },
  { value: 'internship' as const, label: 'Internship' }
] as const;

// Experience Levels
export const EXPERIENCE_LEVELS = [
  { value: '' as const, label: 'Any Level' },
  { value: 'entry' as const, label: 'Entry Level' },
  { value: 'mid' as const, label: 'Mid Level' },
  { value: 'senior' as const, label: 'Senior Level' }
] as const;

// UI Constants
export const UI_CONFIG = {
  RESULTS_PER_PAGE: 10,
  MAX_TITLE_LENGTH: 80,
  MAX_SNIPPET_LENGTH: 200,
  ANIMATION_DURATION_MS: 300,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  SAVED_JOBS: 'savedJobs',
  LAST_JOB_SEARCH_URL: 'lastJobSearchUrl',
  USER_PREFERENCES: 'userPreferences',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  EMPTY_QUERY: 'Please enter a search term',
  RATE_LIMITED: 'Please wait a moment before searching again',
  NETWORK_ERROR: 'Unable to connect to search service. Please check your internet connection.',
  API_ERROR: 'Search service temporarily unavailable. Please try again later.',
  SAVE_JOB_ERROR: 'Failed to save job. Please try again.',
  LOAD_SEARCHES_ERROR: 'Failed to load saved searches.',
  DELETE_SEARCH_ERROR: 'Failed to delete search.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  JOB_SAVED: 'Job saved successfully!',
  SEARCH_SAVED: 'Search saved successfully!',
  SEARCH_LOADED: 'Search loaded successfully!',
  SEARCH_DELETED: 'Search deleted successfully!',
} as const;
