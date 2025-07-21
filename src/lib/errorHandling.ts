/**
 * Error handling utilities
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  originalError?: Error;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export class JobSearchError extends Error {
  public code?: string;
  public severity: ErrorSeverity;
  public context?: Record<string, unknown>;

  constructor(
    message: string, 
    code?: string, 
    severity: ErrorSeverity = 'medium',
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'JobSearchError';
    this.code = code;
    this.severity = severity;
    this.context = context;
  }
}

/**
 * Creates a standardized error object
 */
export const createAppError = (
  message: string,
  originalError?: Error,
  code?: string,
  severity: ErrorSeverity = 'medium',
  context?: Record<string, unknown>
): AppError => {
  return {
    message,
    code,
    severity,
    originalError,
    timestamp: new Date(),
    context
  };
};

/**
 * Handles API errors and converts them to user-friendly messages
 */
export const handleAPIError = (error: unknown, context?: Record<string, unknown>): AppError => {
  if (error instanceof JobSearchError) {
    return createAppError(error.message, error, error.code, error.severity, {
      ...context,
      ...error.context
    });
  }

  if (error instanceof Error) {
    // Handle network errors
    if (error.name === 'AbortError') {
      return createAppError(
        'Search was cancelled',
        error,
        'SEARCH_CANCELLED',
        'low',
        context
      );
    }

    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return createAppError(
        'Unable to connect to search service. Please check your internet connection.',
        error,
        'NETWORK_ERROR',
        'high',
        context
      );
    }

    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return createAppError(
        'Search request timed out. Please try again.',
        error,
        'TIMEOUT_ERROR',
        'medium',
        context
      );
    }

    // Generic error handling
    return createAppError(
      error.message || 'An unexpected error occurred',
      error,
      'UNKNOWN_ERROR',
      'medium',
      context
    );
  }

  // Handle non-Error objects
  return createAppError(
    'An unknown error occurred',
    undefined,
    'UNKNOWN_ERROR',
    'medium',
    { originalError: error, ...context }
  );
};

/**
 * Logs errors to console with structured information
 */
export const logError = (error: AppError): void => {
  const logLevel = error.severity === 'critical' ? 'error' : 
                   error.severity === 'high' ? 'error' :
                   error.severity === 'medium' ? 'warn' : 'info';

  console[logLevel]('Application Error:', {
    message: error.message,
    code: error.code,
    severity: error.severity,
    timestamp: error.timestamp.toISOString(),
    context: error.context,
    stack: error.originalError?.stack
  });
};

/**
 * Handles and logs errors, returning user-friendly error messages
 */
export const handleAndLogError = (
  error: unknown, 
  context?: Record<string, unknown>
): string => {
  const appError = handleAPIError(error, context);
  logError(appError);
  return appError.message;
};

/**
 * Retry mechanism for failed operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError!;
};
