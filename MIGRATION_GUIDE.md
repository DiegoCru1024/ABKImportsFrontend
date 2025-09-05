# Migration Guide: Gestión de Cotización Refactoring

## Overview

This document provides a comprehensive guide for migrating from the legacy `gestion-de-cotizacion-view.tsx` to the new modular architecture.

## Key Changes

### 1. **Architecture Transformation**

**Before (Legacy):**
```
src/pages/gestion-de-cotizacion/
├── gestion-de-cotizacion-view.tsx (844 lines - monolithic)
├── components/
│   └── deeply nested structure
└── utils/
    └── scattered utilities
```

**After (Refactored):**
```
src/components/
├── quotation-management/           # Business module
│   ├── containers/                 # Smart components
│   ├── components/                 # Presentation components
│   ├── hooks/                      # Business logic hooks
│   ├── types/                      # Type definitions
│   └── utils/                      # Pure utilities
└── shared/                         # Reusable components
    ├── data-display/
    ├── forms/
    └── modals/
```

### 2. **Component Migration Map**

| Legacy | New Architecture | Notes |
|--------|------------------|--------|
| Monolithic view file | `QuotationListContainer` + presentation components | Separated concerns |
| Inline product display | `ProductAccordion` | Reusable component |
| Inline status badges | `StatusBadge` | Shared component |
| Inline search | `SearchInput` + `QuotationFilters` | Composed components |
| Mixed state logic | Custom hooks (`useQuotationFilters`, `useQuotationNavigation`) | Extracted logic |

## Migration Steps

### Step 1: Import New Components

```typescript
// Replace legacy imports
import GestionDeCotizacionesView from './components/views/gestion-de-cotizacion-view';

// With new modular imports
import { 
  QuotationListContainer,
  QuotationCard,
  QuotationFilters,
  ProductAccordion,
  ResponseTable 
} from '@/components/quotation-management';

import { 
  useQuotationFilters,
  useQuotationNavigation,
  useResponseManagement 
} from '@/components/quotation-management/hooks';

import { StatusBadge, SearchInput } from '@/components/shared';
```

### Step 2: Replace Legacy State Management

**Before:**
```typescript
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");

// Manual debouncing logic...
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

**After:**
```typescript
const { filters, actions } = useQuotationFilters({
  onFiltersChange: (newFilters) => {
    // Handle filter changes
  },
});
```

### Step 3: Replace Legacy Component Logic

**Before:**
```typescript
// 200+ lines of component rendering logic
const renderQuotationCard = (quotation) => {
  // Complex inline JSX with mixed concerns
};
```

**After:**
```typescript
<QuotationCard
  quotation={quotation}
  onViewDetails={handleViewDetails}
  onViewResponses={handleViewResponses}
  showActions={true}
/>
```

### Step 4: Use Container Components

**Before:**
```typescript
// Direct API calls and state management in component
const { data, isLoading, error } = useGetQuotationsListWithPagination(
  debouncedSearchTerm,
  pageNumber,
  pageSize,
  filter
);
```

**After:**
```typescript
const quotationContainer = QuotationListContainer({
  onQuotationSelect: handleQuotationSelect,
  onViewMode: handleViewModeChange,
  enableFiltering: true,
  enableSorting: true,
});
```

## Breaking Changes

### 1. **Component Props Changes**

**Legacy QuotationCard (inline):**
```typescript
// Props were passed individually
<div onClick={() => handleViewDetails(quotation.quotationId)}>
  {/* Inline rendering */}
</div>
```

**New QuotationCard:**
```typescript
interface QuotationCardProps {
  quotation: QuotationData;        // Normalized data structure
  onViewDetails: (id: string) => void;
  onViewResponses: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}
```

### 2. **Data Structure Changes**

**Legacy:**
```typescript
QuotationsByUserResponseInterfaceContent {
  quotationId: string;
  service_type: string;
  // ... legacy structure
}
```

**New:**
```typescript
QuotationData {
  id: string;                      // Normalized from quotationId
  serviceType: ServiceType;        // Typed enum
  status: QuotationStatus;         // Typed enum
  // ... normalized structure
}
```

### 3. **Hook Returns Changes**

**Legacy:**
```typescript
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
```

**New:**
```typescript
const { 
  filters: { searchTerm, statusFilter },
  actions: { setSearchTerm, setStatusFilter, clearFilters }
} = useQuotationFilters();
```

## Utilities Migration

### Legacy Utils Usage:
```typescript
import { calculateProductTotals } from './utils/calculations';
```

### New Utils Usage:
```typescript
import { 
  calculateVariantTotals,
  safeCalculate,
  formatCurrency 
} from '@/components/quotation-management/utils';
```

## Testing Migration

### Legacy Testing (if any):
```typescript
// Basic component tests
```

### New Comprehensive Testing:
```typescript
// Unit tests for utilities
import { formatQuotationStatus } from '../utils/quotation.utils';

// Hook tests
import { useQuotationFilters } from '../hooks';
import { renderHook } from '@testing-library/react';

// Component tests
import { QuotationCard } from '../components';
import { render, screen } from '@testing-library/react';
```

## Performance Improvements

### 1. **Lazy Loading**
```typescript
// Components can now be lazy loaded
const QuotationFilters = lazy(() => import('./components/QuotationFilters'));
```

### 2. **Memoization**
```typescript
// Built-in memoization in hooks
const processedQuotations = useMemo(() => {
  return filterAndSearchQuotations(quotations, filters);
}, [quotations, filters]);
```

### 3. **Code Splitting**
```typescript
// Module can be split by feature
import('./components/quotation-management').then(module => {
  // Load module when needed
});
```

## Backward Compatibility

### Maintaining Legacy Support:
1. Keep legacy components during transition period
2. Use adapter pattern for data transformation
3. Gradual migration approach

### Data Adapters:
```typescript
import { normalizeQuotationData } from './utils/quotation.utils';

// Convert legacy API response to new format
const adaptedData = legacyData.map(normalizeQuotationData);
```

## Best Practices

### 1. **Component Composition**
```typescript
// Compose features from smaller components
<QuotationManagementPage>
  <QuotationFilters {...filterProps} />
  <QuotationList>
    {quotations.map(quotation => (
      <QuotationCard key={quotation.id} quotation={quotation} />
    ))}
  </QuotationList>
</QuotationManagementPage>
```

### 2. **Hook Composition**
```typescript
// Combine multiple hooks for complex logic
const useQuotationManagement = () => {
  const filters = useQuotationFilters();
  const navigation = useQuotationNavigation();
  const responses = useResponseManagement();
  
  return { filters, navigation, responses };
};
```

### 3. **Type Safety**
```typescript
// Leverage comprehensive type definitions
import type { 
  QuotationData, 
  QuotationFilters, 
  ResponseState 
} from '@/components/quotation-management/types';
```

## Troubleshooting

### Common Migration Issues:

1. **Import Path Changes**
   - Update import paths to use new modular structure
   - Use absolute imports for better maintainability

2. **Type Mismatches**
   - Use provided data adapters for legacy API responses
   - Update component props to match new interfaces

3. **State Management**
   - Replace manual state logic with provided hooks
   - Use container components for complex state orchestration

4. **Styling Conflicts**
   - New components use Tailwind classes consistently
   - Remove legacy custom styles that conflict

## Rollback Plan

If issues arise during migration:

1. **Component Level**: Revert to legacy component while keeping new utilities
2. **Module Level**: Use legacy module with new shared components
3. **Full Rollback**: Keep legacy implementation alongside new one

## Next Steps

1. **Phase 1**: Replace utilities and hooks
2. **Phase 2**: Migrate presentation components
3. **Phase 3**: Implement container components
4. **Phase 4**: Full page component migration
5. **Phase 5**: Remove legacy code

## Support

For migration issues or questions:
- Check type definitions in `src/components/quotation-management/types/`
- Review test files for usage examples
- Consult component documentation in respective directories