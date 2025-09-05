/**
 * Hook for managing quotation response operations
 * Handles CRUD operations with proper error handling
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { 
  ResponseState,
  ResponseActions,
  UseResponseManagementReturn,
  QuotationCreateUpdateResponseDTO,
  ContentQuotationResponseDTO 
} from '../types';

// Import existing hooks for API operations

import { useCreateQuatitationResponse, useGetQuatitationResponse} from '@/hooks/use-quatitation-response';

interface UseResponseManagementProps {
  quotationId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useResponseManagement = ({
  quotationId,
  onSuccess,
  onError,
}: UseResponseManagementProps): UseResponseManagementReturn => {
  // Local state
  const [activeResponseId, setActiveResponseId] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);

  // API hooks
  const {
    data: responses,
    isLoading,
    error,
    refetch,
  } = useGetQuatitationResponse(quotationId);

  const updateResponseMutation = useCreateQuatitationResponse();


  // Actions
  const activateResponse = useCallback((responseId: string) => {
    setActiveResponseId(responseId);
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);

  const updateResponse = useCallback((data: QuotationCreateUpdateResponseDTO) => {
    updateResponseMutation.mutate({ data, quotationId }, {
      onSuccess: () => {
        toast.success("Response updated successfully");
        setEditMode(false);
        onSuccess?.();
        refetch();
      },
      onError: (error: Error) => {
        toast.error(`Failed to update response: ${error.message}`);
        onError?.(error);
      },
    });
  }, [updateResponseMutation, quotationId, onSuccess, onError, refetch]);

  const resetState = useCallback(() => {
    setActiveResponseId("");
    setEditMode(false);
  }, []);

  // Transform responses data to match expected format
  const transformedResponses = responses || [];

  return {
    state: {
      responses: transformedResponses,
      activeResponseId,
      editMode,
      isLoading,
      error: error?.message || null,
    },
    actions: {
      activateResponse,
      toggleEditMode,
      refetch,
      updateResponse,
    },
  };
};

/**
 * Hook variant for read-only response viewing
 */
export const useResponseViewer = (quotationId: string) => {
  const {
    data: responses,
    isLoading,
    error,
    refetch,
  } = useGetQuatitationResponse(quotationId);

  const [selectedResponseId, setSelectedResponseId] = useState<string>("");

  const selectResponse = useCallback((responseId: string) => {
    setSelectedResponseId(responseId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedResponseId("");
  }, []);

  const selectedResponse = responses?.find(
    (response: any) => response.id_quotation_response === selectedResponseId
  );

  return {
    responses: responses || [],
    selectedResponse,
    selectedResponseId,
    isLoading,
    error: error?.message || null,
    actions: {
      selectResponse,
      clearSelection,
      refetch,
    },
  };
};

/**
 * Hook for managing response form state
 */
export const useResponseForm = (initialData?: QuotationCreateUpdateResponseDTO) => {
  const [formData, setFormData] = useState<QuotationCreateUpdateResponseDTO | null>(
    initialData || null
  );
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const updateFormData = useCallback((
    updates: Partial<QuotationCreateUpdateResponseDTO>
  ) => {
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
    setIsDirty(true);
  }, []);

  const updateQuotationInfo = useCallback((
    updates: Partial<QuotationCreateUpdateResponseDTO['quotationInfo']>
  ) => {
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        quotationInfo: { ...prev.quotationInfo, ...updates }
      };
    });
    setIsDirty(true);
  }, []);

  const updateCalculations = useCallback((
    updates: Partial<QuotationCreateUpdateResponseDTO['calculations']>
  ) => {
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        calculations: { ...prev.calculations, ...updates }
      };
    });
    setIsDirty(true);
  }, []);

  const updateProducts = useCallback((
    products: QuotationCreateUpdateResponseDTO['products']
  ) => {
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, products };
    });
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData || null);
    setIsDirty(false);
    setValidationErrors({});
  }, [initialData]);

  const setErrors = useCallback((errors: Record<string, string>) => {
    setValidationErrors(errors);
  }, []);

  const clearErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    formData,
    isDirty,
    validationErrors,
    actions: {
      updateFormData,
      updateQuotationInfo,
      updateCalculations,
      updateProducts,
      resetForm,
      setErrors,
      clearErrors,
    },
  };
};