/**
 * API response handling utilities
 * Provides structured error handling and response processing
 */

import { AxiosError } from 'axios';

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    timestamp: string;
    responseTime?: number;
    requestId?: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
  statusCode?: number;
  retryable?: boolean;
  retryAfter?: number;
}

export interface QuotaInfo {
  dailyQuotaUsed?: string;
  rateLimitRemaining?: string;
  rateLimitReset?: string;
  quotaLimit?: string;
  requestsRemaining?: string;
}

/**
 * Error codes for different types of API failures
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  API_ACCESS_DENIED: 'API_ACCESS_DENIED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Rate Limiting & Quotas
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  CONCURRENT_LIMIT_EXCEEDED: 'CONCURRENT_LIMIT_EXCEEDED',
  
  // Request Issues
  INVALID_REQUEST: 'INVALID_REQUEST',
  MALFORMED_QUERY: 'MALFORMED_QUERY',
  QUERY_TOO_LONG: 'QUERY_TOO_LONG',
  
  // Network & Infrastructure
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

/**
 * Checks if an error is an Axios error
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError)?.isAxiosError === true;
};

/**
 * Extracts quota information from response headers
 */
export const extractQuotaInfo = (headers: Record<string, unknown>): QuotaInfo => {
  return {
    dailyQuotaUsed: headers['x-daily-quota-used'] as string,
    rateLimitRemaining: headers['x-ratelimit-remaining'] as string,
    rateLimitReset: headers['x-ratelimit-reset'] as string,
    quotaLimit: headers['x-quota-limit'] as string,
    requestsRemaining: headers['x-requests-remaining'] as string,
  };
};

/**
 * Checks if quota usage is approaching limits
 */
export const checkQuotaWarnings = (quotaInfo: QuotaInfo): string[] => {
  const warnings: string[] = [];
  
  if (quotaInfo.dailyQuotaUsed) {
    const quotaUsed = parseInt(quotaInfo.dailyQuotaUsed);
    if (quotaUsed > 90) {
      warnings.push('Critical: Daily quota usage above 90%');
    } else if (quotaUsed > 80) {
      warnings.push('Warning: Daily quota usage above 80%');
    }
  }
  
  if (quotaInfo.requestsRemaining) {
    const remaining = parseInt(quotaInfo.requestsRemaining);
    if (remaining < 10) {
      warnings.push('Warning: Less than 10 requests remaining');
    }
  }
  
  return warnings;
};

/**
 * Categorizes errors based on status codes and error types
 */
export const categorizeError = (error: AxiosError): APIError => {
  const status = error.response?.status;
  const errorData = error.response?.data;
  
  // Authentication and authorization errors (403)
  if (status === 403) {
    return {
      code: ERROR_CODES.API_ACCESS_DENIED,
      message: 'API access denied. Please check your API key and permissions.',
      statusCode: status,
      retryable: false,
      details: {
        possibleCauses: [
          'API key is invalid or missing',
          'Custom Search Engine ID is invalid',
          'API key lacks Custom Search API permissions',
          'Daily quota exceeded',
          'Billing not enabled on Google Cloud project'
        ]
      }
    };
  }
  
  // Rate limiting errors (429)
  if (status === 429) {
    const retryAfter = error.response?.headers?.['retry-after'];
    return {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: 'Rate limit exceeded. Please wait before making another request.',
      statusCode: status,
      retryable: true,
      retryAfter: retryAfter ? parseInt(retryAfter) * 1000 : 60000, // Convert to milliseconds
      details: errorData
    };
  }
  
  // Bad request errors (400)
  if (status === 400) {
    return {
      code: ERROR_CODES.INVALID_REQUEST,
      message: 'Invalid search request. Please check your search parameters.',
      statusCode: status,
      retryable: false,
      details: errorData
    };
  }
  
  // Server errors (5xx)
  if (status && status >= 500) {
    return {
      code: ERROR_CODES.SERVICE_UNAVAILABLE,
      message: 'Search service is temporarily unavailable. Please try again later.',
      statusCode: status,
      retryable: true,
      retryAfter: 30000 // 30 seconds
    };
  }
  
  // Network errors
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: 'Network connection failed. Please check your internet connection.',
      retryable: true,
      retryAfter: 5000, // 5 seconds
      details: { errorCode: error.code }
    };
  }
  
  // Timeout errors
  if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
    return {
      code: ERROR_CODES.TIMEOUT_ERROR,
      message: 'Request timed out. Please try again.',
      retryable: true,
      retryAfter: 10000, // 10 seconds
      details: { timeout: '30000ms' }
    };
  }
  
  // Generic error
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: error.message || 'An unknown error occurred',
    statusCode: status,
    retryable: false,
    details: errorData
  };
};

/**
 * Logs API errors with structured information
 */
export const logAPIError = (error: APIError, context?: Record<string, unknown>): void => {
  const logLevel = error.statusCode && error.statusCode >= 500 ? 'error' : 'warn';
  
  console[logLevel]('API Error:', {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    retryable: error.retryable,
    retryAfter: error.retryAfter,
    timestamp: new Date().toISOString(),
    context,
    details: error.details
  });
};

/**
 * Logs successful API calls with performance metrics
 */
export const logAPISuccess = (
  responseTime: number,
  quotaInfo: QuotaInfo,
  context?: Record<string, unknown>
): void => {
  const warnings = checkQuotaWarnings(quotaInfo);
  
  console.log('API Success:', {
    responseTime: `${responseTime}ms`,
    timestamp: new Date().toISOString(),
    quotaInfo,
    warnings: warnings.length > 0 ? warnings : undefined,
    context
  });
  
  // Log warnings separately if they exist
  if (warnings.length > 0) {
    console.warn('Quota Warnings:', warnings);
  }
};

/**
 * Creates a success response
 */
export const createSuccessResponse = <T>(
  data: T,
  responseTime?: number,
  requestId?: string
): APIResponse<T> => {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      responseTime,
      requestId
    }
  };
};

/**
 * Creates an error response
 */
export const createErrorResponse = (
  error: APIError,
  requestId?: string
): APIResponse<never> => {
  return {
    success: false,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId
    }
  };
};

/**
 * Handles and processes API errors
 */
export const handleAPIError = (
  error: unknown,
  context?: Record<string, unknown>
): APIResponse<never> => {
  let apiError: APIError;
  
  if (isAxiosError(error)) {
    apiError = categorizeError(error);
  } else if (error instanceof Error) {
    apiError = {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message,
      retryable: false
    };
  } else {
    apiError = {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: 'An unknown error occurred',
      retryable: false,
      details: error
    };
  }
  
  logAPIError(apiError, context);
  return createErrorResponse(apiError);
};
