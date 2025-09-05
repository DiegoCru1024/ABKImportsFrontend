/**
 * Enhanced loading state utilities for quotation response components
 */

import React from "react";

// Loading state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStateManager {
  state: LoadingState;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  progress?: number;
  message?: string;
}

/**
 * Creates a loading state manager object
 */
export const createLoadingState = (
  state: LoadingState = 'idle',
  progress?: number,
  message?: string
): LoadingStateManager => ({
  state,
  isLoading: state === 'loading',
  isSuccess: state === 'success',
  isError: state === 'error',
  isIdle: state === 'idle',
  progress,
  message,
});

/**
 * Loading state transitions
 */
export const loadingTransitions = {
  start: (message?: string, progress?: number) => 
    createLoadingState('loading', progress, message),
  
  success: (message?: string) => 
    createLoadingState('success', 100, message),
  
  error: (message?: string) => 
    createLoadingState('error', undefined, message),
  
  idle: () => 
    createLoadingState('idle'),
  
  updateProgress: (current: LoadingStateManager, progress: number, message?: string) =>
    createLoadingState('loading', progress, message || current.message),
};

/**
 * Loading message templates
 */
export const LOADING_MESSAGES = {
  // Data fetching
  FETCHING_RESPONSES: 'Loading quotation responses...',
  FETCHING_QUOTATION: 'Loading quotation details...',
  PROCESSING_RESPONSES: 'Processing response data...',
  
  // Data operations
  SAVING_RESPONSE: 'Saving response...',
  UPDATING_PRODUCT: 'Updating product information...',
  DELETING_RESPONSE: 'Deleting response...',
  
  // File operations
  UPLOADING_FILE: 'Uploading file...',
  DOWNLOADING_FILE: 'Downloading file...',
  PROCESSING_IMAGES: 'Processing images...',
  
  // Calculations
  CALCULATING_COSTS: 'Calculating costs...',
  GENERATING_REPORT: 'Generating report...',
  VALIDATING_DATA: 'Validating data...',
  
  // Success messages
  RESPONSE_SAVED: 'Response saved successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  
  // Error fallbacks
  OPERATION_FAILED: 'Operation failed. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

/**
 * Progressive loading states for multi-step operations
 */
export class ProgressiveLoader {
  private steps: string[];
  private currentStep: number = 0;
  private listeners: ((state: LoadingStateManager) => void)[] = [];

  constructor(steps: string[]) {
    this.steps = steps;
  }

  // Add listener for state changes
  onStateChange(listener: (state: LoadingStateManager) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notify(state: LoadingStateManager) {
    this.listeners.forEach(listener => listener(state));
  }

  // Start the loading process
  start() {
    this.currentStep = 0;
    this.notify(loadingTransitions.start(this.steps[0], 0));
  }

  // Move to next step
  nextStep(customMessage?: string) {
    this.currentStep++;
    const progress = (this.currentStep / this.steps.length) * 100;
    const message = customMessage || this.steps[this.currentStep] || 'Completing...';
    
    if (this.currentStep >= this.steps.length) {
      this.notify(loadingTransitions.success('Operation completed successfully!'));
    } else {
      this.notify(loadingTransitions.updateProgress(
        createLoadingState('loading'), 
        progress, 
        message
      ));
    }
  }

  // Mark as completed
  complete(successMessage?: string) {
    this.notify(loadingTransitions.success(successMessage || 'Operation completed!'));
  }

  // Mark as failed
  fail(errorMessage?: string) {
    this.notify(loadingTransitions.error(errorMessage || 'Operation failed'));
  }

  // Reset to idle
  reset() {
    this.currentStep = 0;
    this.notify(loadingTransitions.idle());
  }
}

/**
 * Debounced loading state for rapid state changes
 */
export class DebouncedLoadingState {
  private timeout: NodeJS.Timeout | null = null;
  private delay: number;
  private callback: (state: LoadingStateManager) => void;

  constructor(callback: (state: LoadingStateManager) => void, delay: number = 300) {
    this.callback = callback;
    this.delay = delay;
  }

  // Set loading state with debounce
  setLoading(message?: string, progress?: number) {
    this.clearTimeout();
    this.timeout = setTimeout(() => {
      this.callback(loadingTransitions.start(message, progress));
    }, this.delay);
  }

  // Set immediate state (no debounce)
  setImmediate(state: LoadingStateManager) {
    this.clearTimeout();
    this.callback(state);
  }

  // Clear pending timeouts
  private clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  // Cleanup
  destroy() {
    this.clearTimeout();
  }
}

/**
 * Loading state hooks for React components
 */
export const createLoadingHook = () => {
  const [loadingState, setLoadingState] = React.useState<LoadingStateManager>(
    createLoadingState('idle')
  );

  const actions = React.useMemo(() => ({
    startLoading: (message?: string, progress?: number) => {
      setLoadingState(loadingTransitions.start(message, progress));
    },
    
    setSuccess: (message?: string) => {
      setLoadingState(loadingTransitions.success(message));
    },
    
    setError: (message?: string) => {
      setLoadingState(loadingTransitions.error(message));
    },
    
    setIdle: () => {
      setLoadingState(loadingTransitions.idle());
    },
    
    updateProgress: (progress: number, message?: string) => {
      setLoadingState(current => 
        loadingTransitions.updateProgress(current, progress, message)
      );
    },
  }), []);

  return [loadingState, actions] as const;
};

/**
 * Minimum loading time utility (prevents flash of loading states)
 */
export const withMinimumLoadingTime = async <T>(
  operation: () => Promise<T>,
  minimumMs: number = 500
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const elapsed = Date.now() - startTime;
    
    if (elapsed < minimumMs) {
      await new Promise(resolve => setTimeout(resolve, minimumMs - elapsed));
    }
    
    return result;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    
    if (elapsed < minimumMs) {
      await new Promise(resolve => setTimeout(resolve, minimumMs - elapsed));
    }
    
    throw error;
  }
};

/**
 * Skeleton data generators for loading states
 */
export const generateSkeletonData = {
  responses: (count: number = 3) => Array.from({ length: count }, (_, i) => ({
    id: `skeleton-${i}`,
    serviceType: '...',
    products: [],
    isLoading: true,
  })),
  
  products: (count: number = 5) => Array.from({ length: count }, (_, i) => ({
    id: `skeleton-product-${i}`,
    name: '...',
    quantity: 0,
    price: 0,
    isLoading: true,
  })),
  
  tableRows: (rows: number = 5, columns: number = 4) => 
    Array.from({ length: rows }, (_, i) => 
      Array.from({ length: columns }, (_, j) => `skeleton-${i}-${j}`)
    ),
};

/**
 * Loading state persistence (for maintaining state across component unmounts)
 */
export class LoadingStateCache {
  private cache = new Map<string, LoadingStateManager>();
  private maxAge = 5 * 60 * 1000; // 5 minutes

  // Store loading state
  set(key: string, state: LoadingStateManager) {
    this.cache.set(key, {
      ...state,
      timestamp: Date.now(),
    } as LoadingStateManager & { timestamp: number });
  }

  // Retrieve loading state
  get(key: string): LoadingStateManager | null {
    const cached = this.cache.get(key) as (LoadingStateManager & { timestamp: number }) | undefined;
    
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return cached;
  }

  // Clear specific cache entry
  clear(key: string) {
    this.cache.delete(key);
  }

  // Clear all cache
  clearAll() {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - (value as any).timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

// Global loading state cache instance
export const globalLoadingCache = new LoadingStateCache();

// Clean up cache periodically
if (typeof window !== 'undefined') {
  setInterval(() => globalLoadingCache.cleanup(), 60000); // Clean every minute
}