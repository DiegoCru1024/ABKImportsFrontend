/**
 * Hook for managing quotation navigation and view state
 * Handles view switching and maintains navigation history
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { 
  ViewMode, 
  NavigationState, 
  NavigationActions,
  UseQuotationNavigationReturn 
} from '../types';

interface UseQuotationNavigationProps {
  initialView?: ViewMode;
  onViewChange?: (view: ViewMode, quotationId?: string) => void;
}

export const useQuotationNavigation = ({
  initialView = 'list',
  onViewChange,
}: UseQuotationNavigationProps = {}): UseQuotationNavigationReturn => {
  // Use ref to store the callback to avoid dependency issues
  const onViewChangeRef = useRef(onViewChange);
  
  // Update ref when callback changes
  useEffect(() => {
    onViewChangeRef.current = onViewChange;
  }, [onViewChange]);

  // State management
  const [currentView, setCurrentView] = useState<ViewMode>(initialView);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<ViewMode | undefined>();

  // Actions
  const setView = useCallback((view: ViewMode) => {
    setPreviousView(currentView);
    setCurrentView(view);
    onViewChangeRef.current?.(view, selectedQuotationId || undefined);
  }, [currentView, selectedQuotationId]);

  const selectQuotation = useCallback((id: string) => {
    setSelectedQuotationId(id);
  }, []);

  const goBack = useCallback(() => {
    if (previousView) {
      setCurrentView(previousView);
      setPreviousView(undefined);
      onViewChangeRef.current?.(previousView, selectedQuotationId || undefined);
    } else {
      // Default back to list view
      setCurrentView('list');
      onViewChangeRef.current?.('list', selectedQuotationId || undefined);
    }
  }, [previousView, selectedQuotationId]);

  const reset = useCallback(() => {
    setCurrentView(initialView);
    setSelectedQuotationId(null);
    setPreviousView(undefined);
    onViewChangeRef.current?.(initialView);
  }, [initialView]);

  return {
    state: {
      currentView,
      selectedQuotationId,
      previousView,
    },
    actions: {
      setView,
      selectQuotation,
      goBack,
      reset,
    },
  };
};

/**
 * Hook variant that includes breadcrumb management
 */
export const useQuotationNavigationWithBreadcrumbs = ({
  initialView = 'list',
  onViewChange,
}: UseQuotationNavigationProps = {}) => {
  const navigation = useQuotationNavigation({ initialView, onViewChange });
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; view: ViewMode }>>([
    { label: 'Quotations', view: 'list' }
  ]);

  const setViewWithBreadcrumb = useCallback((view: ViewMode, label?: string) => {
    navigation.actions.setView(view);
    
    // Update breadcrumbs
    const viewLabels = {
      list: 'Quotations',
      details: 'Details',
      responses: 'Responses',
    };
    
    const newLabel = label || viewLabels[view];
    
    if (view === 'list') {
      setBreadcrumbs([{ label: 'Quotations', view: 'list' }]);
    } else {
      setBreadcrumbs(prev => {
        const listBreadcrumb = { label: 'Quotations', view: 'list' as ViewMode };
        const currentBreadcrumb = { label: newLabel, view };
        return [listBreadcrumb, currentBreadcrumb];
      });
    }
  }, [navigation.actions]);

  const goBackWithBreadcrumb = useCallback(() => {
    navigation.actions.goBack();
    setBreadcrumbs(prev => prev.slice(0, -1));
  }, [navigation.actions]);

  return {
    ...navigation,
    breadcrumbs,
    actions: {
      ...navigation.actions,
      setView: setViewWithBreadcrumb,
      goBack: goBackWithBreadcrumb,
    },
  };
};