import type { ResponseError } from "./interfaces";

/**
 * Enhanced error handling utilities for quotation response components
 */

// Error types mapping
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION', 
  PROCESSING: 'PROCESSING',
  UNKNOWN: 'UNKNOWN',
} as const;

// Common error messages
export const ERROR_MESSAGES = {
  NETWORK_CONNECTION: 'Network connection failed. Please check your internet connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  VALIDATION_FAILED: 'Data validation failed. Please check your input.',
  PROCESSING_ERROR: 'Error processing response data.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  QUOTA_EXCEEDED: 'API quota exceeded. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

/**
 * Creates a standardized error object from various error sources
 */
export const createErrorObject = (
  error: any,
  context?: string,
  retryFn?: () => void
): ResponseError => {
  let errorType: ResponseError['type'] = 'UNKNOWN';
  let message = ERROR_MESSAGES.UNKNOWN_ERROR;
  
  // Network errors
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    errorType = 'NETWORK';
    message = ERROR_MESSAGES.NETWORK_CONNECTION;
  }
  // Timeout errors
  else if (error?.name === 'TimeoutError' || error?.code === 'TIMEOUT') {
    errorType = 'NETWORK';
    message = ERROR_MESSAGES.TIMEOUT;
  }
  // HTTP status errors
  else if (error?.response?.status) {
    errorType = 'NETWORK';
    const status = error.response.status;
    
    switch (status) {
      case 401:
        message = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 404:
        message = ERROR_MESSAGES.NOT_FOUND;
        break;
      case 429:
        message = ERROR_MESSAGES.QUOTA_EXCEEDED;
        break;
      case 500:
      case 502:
      case 503:
        message = ERROR_MESSAGES.SERVER_ERROR;
        break;
      default:
        message = `HTTP ${status}: ${error.response.statusText || 'Unknown error'}`;
    }
  }
  // Validation errors
  else if (error?.name === 'ValidationError' || error?.type === 'validation') {
    errorType = 'VALIDATION';
    message = error.message || ERROR_MESSAGES.VALIDATION_FAILED;
  }
  // Processing errors
  else if (error?.name === 'ProcessingError' || error?.type === 'processing') {
    errorType = 'PROCESSING';
    message = error.message || ERROR_MESSAGES.PROCESSING_ERROR;
  }
  // Generic errors with custom messages
  else if (error?.message) {
    message = error.message;
  }

  // Add context if provided
  if (context) {
    message = `${context}: ${message}`;
  }

  return {
    type: errorType,
    message,
    details: error,
    timestamp: new Date().toISOString(),
    retry: retryFn,
  };
};

/**
 * Error boundary utility for React components
 */
export class ResponseErrorBoundary extends Error {
  public readonly errorInfo: ResponseError;

  constructor(error: any, context?: string, retryFn?: () => void) {
    super();
    this.name = 'ResponseErrorBoundary';
    this.errorInfo = createErrorObject(error, context, retryFn);
    this.message = this.errorInfo.message;
  }
}

/**
 * Checks if an error is retryable
 */
export const isRetryableError = (error: ResponseError): boolean => {
  if (error.type === 'NETWORK') {
    // Retry network errors except for auth and not found
    return !error.message.includes('401') && !error.message.includes('404');
  }
  
  if (error.type === 'PROCESSING') {
    // Don't retry processing errors as they usually indicate code issues
    return false;
  }
  
  if (error.type === 'VALIDATION') {
    // Don't retry validation errors
    return false;
  }
  
  // Retry unknown errors
  return error.type === 'UNKNOWN';
};

/**
 * Gets retry delay in milliseconds based on attempt number
 */
export const getRetryDelay = (attemptNumber: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  return Math.min(1000 * Math.pow(2, attemptNumber - 1), 30000);
};

/**
 * Auto-retry utility for async operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  context?: string
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      const errorObj = createErrorObject(error, context);
      
      // Don't retry if error is not retryable
      if (!isRetryableError(errorObj)) {
        throw new ResponseErrorBoundary(error, context);
      }
      
      // Don't wait on the last attempt
      if (attempt < maxAttempts) {
        const delay = getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All attempts failed
  throw new ResponseErrorBoundary(
    lastError, 
    `${context} (failed after ${maxAttempts} attempts)`
  );
};

/**
 * Error logging utility
 */
export const logError = (error: ResponseError, component?: string): void => {
  const logData = {
    timestamp: error.timestamp,
    type: error.type,
    message: error.message,
    component,
    details: error.details,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${component || 'QuotationResponse'}] Error:`, logData);
  }
  
  // Here you could also send to external logging service
  // e.g., Sentry, LogRocket, etc.
};

/**
 * Error recovery strategies
 */
export const getRecoveryStrategy = (error: ResponseError): {
  canRecover: boolean;
  strategy: string;
  action?: () => void;
} => {
  switch (error.type) {
    case 'NETWORK':
      return {
        canRecover: true,
        strategy: 'retry',
        action: error.retry,
      };
      
    case 'VALIDATION':
      return {
        canRecover: true,
        strategy: 'fix_input',
      };
      
    case 'PROCESSING':
      return {
        canRecover: false,
        strategy: 'contact_support',
      };
      
    default:
      return {
        canRecover: true,
        strategy: 'refresh',
        action: () => window.location.reload(),
      };
  }
};

/**
 * User-friendly error messages for display
 */
export const getUserFriendlyMessage = (error: ResponseError): string => {
  const baseMessage = error.message;
  
  // Simplify technical messages for users
  const friendlyMappings = {
    'Network connection failed': 'Please check your internet connection and try again.',
    'Request timed out': 'The request is taking longer than expected. Please try again.',
    'Server error occurred': 'We\'re experiencing technical difficulties. Please try again in a few minutes.',
    'Data validation failed': 'Please check your input and try again.',
    'Error processing response': 'We couldn\'t process your request. Please try again.',
    'You are not authorized': 'You don\'t have permission to perform this action.',
    'The requested resource was not found': 'The requested information could not be found.',
    'API quota exceeded': 'Too many requests. Please wait a moment before trying again.',
  };
  
  // Check for exact matches first
  if (friendlyMappings[baseMessage as keyof typeof friendlyMappings]) {
    return friendlyMappings[baseMessage as keyof typeof friendlyMappings];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(friendlyMappings)) {
    if (baseMessage.includes(key)) {
      return value;
    }
  }
  
  // Return original message if no friendly version found
  return baseMessage;
};