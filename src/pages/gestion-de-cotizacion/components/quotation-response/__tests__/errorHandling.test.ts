import { describe, test, expect, jest } from '@jest/globals';
import {
  createErrorObject,
  isRetryableError,
  getRetryDelay,
  withRetry,
  getUserFriendlyMessage,
  getRecoveryStrategy,
  ERROR_TYPES,
  ERROR_MESSAGES,
} from '../utils/errorHandling';

describe('Error Handling Utilities', () => {
  describe('createErrorObject', () => {
    test('should create network error from NetworkError', () => {
      const error = { name: 'NetworkError', message: 'Connection failed' };
      const errorObj = createErrorObject(error);
      
      expect(errorObj.type).toBe('NETWORK');
      expect(errorObj.message).toBe(ERROR_MESSAGES.NETWORK_CONNECTION);
      expect(errorObj.details).toBe(error);
      expect(errorObj.timestamp).toBeDefined();
    });

    test('should create network error from HTTP status', () => {
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found',
        },
      };
      const errorObj = createErrorObject(error);
      
      expect(errorObj.type).toBe('NETWORK');
      expect(errorObj.message).toBe(ERROR_MESSAGES.NOT_FOUND);
    });

    test('should create validation error', () => {
      const error = { name: 'ValidationError', message: 'Invalid input' };
      const errorObj = createErrorObject(error);
      
      expect(errorObj.type).toBe('VALIDATION');
      expect(errorObj.message).toBe('Invalid input');
    });

    test('should create processing error', () => {
      const error = { name: 'ProcessingError', message: 'Data processing failed' };
      const errorObj = createErrorObject(error);
      
      expect(errorObj.type).toBe('PROCESSING');
      expect(errorObj.message).toBe('Data processing failed');
    });

    test('should handle unknown errors', () => {
      const error = new Error('Random error');
      const errorObj = createErrorObject(error);
      
      expect(errorObj.type).toBe('UNKNOWN');
      expect(errorObj.message).toBe('Random error');
    });

    test('should add context to error message', () => {
      const error = new Error('Test error');
      const errorObj = createErrorObject(error, 'Data fetching');
      
      expect(errorObj.message).toBe('Data fetching: Test error');
    });

    test('should include retry function', () => {
      const retryFn = jest.fn();
      const error = new Error('Test error');
      const errorObj = createErrorObject(error, undefined, retryFn);
      
      expect(errorObj.retry).toBe(retryFn);
    });
  });

  describe('isRetryableError', () => {
    test('should mark network errors as retryable except auth and not found', () => {
      const networkError = createErrorObject({ name: 'NetworkError' });
      const authError = createErrorObject({ response: { status: 401 } });
      const notFoundError = createErrorObject({ response: { status: 404 } });
      
      expect(isRetryableError(networkError)).toBe(true);
      expect(isRetryableError(authError)).toBe(false);
      expect(isRetryableError(notFoundError)).toBe(false);
    });

    test('should not retry validation errors', () => {
      const validationError = createErrorObject({ name: 'ValidationError' });
      expect(isRetryableError(validationError)).toBe(false);
    });

    test('should not retry processing errors', () => {
      const processingError = createErrorObject({ name: 'ProcessingError' });
      expect(isRetryableError(processingError)).toBe(false);
    });

    test('should retry unknown errors', () => {
      const unknownError = createErrorObject(new Error('Unknown'));
      expect(isRetryableError(unknownError)).toBe(true);
    });
  });

  describe('getRetryDelay', () => {
    test('should implement exponential backoff', () => {
      expect(getRetryDelay(1)).toBe(1000);   // 1s
      expect(getRetryDelay(2)).toBe(2000);   // 2s
      expect(getRetryDelay(3)).toBe(4000);   // 4s
      expect(getRetryDelay(4)).toBe(8000);   // 8s
    });

    test('should cap at maximum delay', () => {
      expect(getRetryDelay(10)).toBe(30000); // Max 30s
    });
  });

  describe('withRetry', () => {
    test('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await withRetry(operation, 3);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should retry retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const result = await withRetry(operation, 3);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('should not retry non-retryable errors', async () => {
      const operation = jest.fn().mockRejectedValue({ name: 'ValidationError', message: 'Invalid' });
      
      await expect(withRetry(operation, 3)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should fail after max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Persistent error'));
      
      await expect(withRetry(operation, 2)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUserFriendlyMessage', () => {
    test('should provide friendly message for known errors', () => {
      const networkError = createErrorObject({ name: 'NetworkError' });
      const friendlyMessage = getUserFriendlyMessage(networkError);
      
      expect(friendlyMessage).toBe('Please check your internet connection and try again.');
    });

    test('should return original message for unknown errors', () => {
      const customError = createErrorObject(new Error('Custom error message'));
      const friendlyMessage = getUserFriendlyMessage(customError);
      
      expect(friendlyMessage).toBe('Custom error message');
    });

    test('should handle partial message matches', () => {
      const serverError = createErrorObject({ 
        message: 'Server error occurred while processing request' 
      });
      const friendlyMessage = getUserFriendlyMessage(serverError);
      
      expect(friendlyMessage).toBe('We\'re experiencing technical difficulties. Please try again in a few minutes.');
    });
  });

  describe('getRecoveryStrategy', () => {
    test('should suggest retry for network errors', () => {
      const networkError = createErrorObject({ name: 'NetworkError' });
      const strategy = getRecoveryStrategy(networkError);
      
      expect(strategy.canRecover).toBe(true);
      expect(strategy.strategy).toBe('retry');
    });

    test('should suggest fix input for validation errors', () => {
      const validationError = createErrorObject({ name: 'ValidationError' });
      const strategy = getRecoveryStrategy(validationError);
      
      expect(strategy.canRecover).toBe(true);
      expect(strategy.strategy).toBe('fix_input');
    });

    test('should suggest contact support for processing errors', () => {
      const processingError = createErrorObject({ name: 'ProcessingError' });
      const strategy = getRecoveryStrategy(processingError);
      
      expect(strategy.canRecover).toBe(false);
      expect(strategy.strategy).toBe('contact_support');
    });

    test('should suggest refresh for unknown errors', () => {
      const unknownError = createErrorObject(new Error('Unknown'));
      const strategy = getRecoveryStrategy(unknownError);
      
      expect(strategy.canRecover).toBe(true);
      expect(strategy.strategy).toBe('refresh');
      expect(strategy.action).toBeDefined();
    });
  });
});