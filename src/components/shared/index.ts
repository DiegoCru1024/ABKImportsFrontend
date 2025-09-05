/**
 * Central exports for shared components
 * Provides reusable components across the application
 */

// Data display components
export * from './data-display/ImageGallery';
export * from './data-display/StatusBadge';

// Form components
export * from './forms/SearchInput';

// Export categories for organized imports
export const SharedComponents = {
  dataDisplay: {
    ImageGallery: './data-display/ImageGallery',
    StatusBadge: './data-display/StatusBadge',
  },
  forms: {
    SearchInput: './forms/SearchInput',
  },
  modals: {
    // Future modal components would go here
  },
  tables: {
    // Future table components would go here
  },
};