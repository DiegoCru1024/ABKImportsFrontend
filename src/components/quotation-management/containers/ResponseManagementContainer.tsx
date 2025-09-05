/**
 * Container for managing quotation responses
 * Handles response CRUD operations and state management
 */

import React, { useState, useEffect } from 'react';
import { useResponseManagement } from '../hooks';
import { validateQuotationResponse } from '../utils';
import type { 
  QuotationCreateUpdateResponseDTO,
  ResponseFormValidation
} from '../types';

export interface ResponseManagementContainerProps {
  quotationId: string;
  mode: 'admin' | 'user';
  readonly?: boolean;
  onResponseSubmit?: (response: QuotationCreateUpdateResponseDTO) => void;
  onResponseSelect?: (responseId: string) => void;
  onValidationChange?: (validation: ResponseFormValidation) => void;
}



export const useResponseManagementContainer = ({
  quotationId,
  mode,
  readonly = false,
  onResponseSubmit,
  onResponseSelect,
  onValidationChange,
}: ResponseManagementContainerProps) => {
  // Response management state
  const {
    state: responseState,
    actions: responseActions,
  } = useResponseManagement({
    quotationId,
    onSuccess: () => {
      // Handle successful response operations
      console.log('Response operation successful');
    },
    onError: (error) => {
      console.error('Response operation failed:', error);
    },
  });

  // Form state for response editing
  const [formData, setFormData] = useState<QuotationCreateUpdateResponseDTO | null>(null);
  const [validationState, setValidationState] = useState<ResponseFormValidation>({
    isValid: true,
    errors: {},
    requiredFields: [],
  });

  // Auto-validate form when data changes
  useEffect(() => {
    if (formData) {
      const validation = validateQuotationResponse(formData);
      setValidationState(validation);
      onValidationChange?.(validation);
    }
  }, [formData, onValidationChange]);

  // Handle response selection
  const handleResponseSelect = (responseId: string) => {
    responseActions.activateResponse(responseId);
    onResponseSelect?.(responseId);
  };

  // Handle form data updates
  const handleFormDataUpdate = (updates: Partial<QuotationCreateUpdateResponseDTO>) => {
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  };

  // Handle quotation info updates
  const handleQuotationInfoUpdate = (
    updates: Partial<QuotationCreateUpdateResponseDTO['quotationInfo']>
  ) => {
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        quotationInfo: { ...prev.quotationInfo, ...updates }
      };
    });
  };

  // Handle calculations updates
  const handleCalculationsUpdate = (
    updates: Partial<QuotationCreateUpdateResponseDTO['calculations']>
  ) => {
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        calculations: { ...prev.calculations, ...updates }
      };
    });
  };

  // Handle products updates
  const handleProductsUpdate = (
    products: QuotationCreateUpdateResponseDTO['products']
  ) => {
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, products };
    });
  };

  // Handle response submission
  const handleSubmitResponse = () => {
    if (!formData || !validationState.isValid) {
      console.warn('Cannot submit invalid form data');
      return;
    }

    responseActions.updateResponse(formData);
    onResponseSubmit?.(formData);
  };

  // Handle edit mode toggle
  const handleToggleEditMode = () => {
    if (!readonly) {
      responseActions.toggleEditMode();
    }
  };

  // Initialize form data for new response
  const initializeNewResponse = () => {
    // This would create a new empty response template
    const newResponseData: QuotationCreateUpdateResponseDTO = {
      quotationInfo: {
        quotationId,
        status: 'pending',
        correlative: '',
        date: new Date().toISOString(),
        serviceType: '',
        cargoType: '',
        courier: '',
        incoterm: '',
        isFirstPurchase: false,
        regime: '',
        originCountry: '',
        destinationCountry: '',
        customs: '',
        originPort: '',
        destinationPort: '',
        serviceTypeDetail: '',
        transitTime: 0,
        naviera: '',
        proformaValidity: '',
        id_asesor: '',
      },
      calculations: {
        serviceCalculations: {
          serviceFields: {
            servicioConsolidado: 0,
            separacionCarga: 0,
            inspeccionProductos: 0,
          },
          subtotalServices: 0,
          igvServices: 0,
          totalServices: 0,
          fiscalObligations: {
            adValorem: 0,
            totalDerechosDolares: 0,
          },
          importExpenses: {
            servicioConsolidadoFinal: 0,
            separacionCargaFinal: 0,
            inspeccionProductosFinal: 0,
            servicioConsolidadoMaritimoFinal: 0,
            gestionCertificadoFinal: 0,
            servicioInspeccionFinal: 0,
            transporteLocalFinal: 0,
            desaduanajeFleteSaguro: 0,
            finalValues: {
              servicioConsolidado: 0,
              gestionCertificado: 0,
              servicioInspeccion: 0,
              transporteLocal: 0,
              separacionCarga: 0,
              inspeccionProductos: 0,
              desaduanajeFleteSaguro: 0,
              transporteLocalChina: 0,
              transporteLocalCliente: 0,
            },
            totalGastosImportacion: 0,
          },
          totals: {
            inversionTotal: 0,
          },
        },
        exemptions: {
          servicioConsolidadoAereo: false,
          servicioConsolidadoMaritimo: false,
          separacionCarga: false,
          inspeccionProductos: false,
          obligacionesFiscales: false,
          desaduanajeFleteSaguro: false,
          transporteLocalChina: false,
          transporteLocalCliente: false,
          gestionCertificado: false,
          servicioInspeccion: false,
          transporteLocal: false,
          totalDerechos: false,
        },
        dynamicValues: {
          comercialValue: 0,
          flete: 0,
          cajas: 0,
          desaduanaje: 0,
          kg: 0,
          ton: 0,
          kv: 0,
          fob: 0,
          seguro: 0,
          tipoCambio: 3.8, // Default exchange rate
          nroBultos: 0,
          volumenCBM: 0,
          calculoFlete: 0,
          servicioConsolidado: 0,
          separacionCarga: 0,
          inspeccionProductos: 0,
          gestionCertificado: 0,
          inspeccionProducto: 0,
          inspeccionFabrica: 0,
          transporteLocal: 0,
          otrosServicios: 0,
          adValoremRate: 6,
          antidumpingGobierno: 0,
          antidumpingCantidad: 0,
          iscRate: 0,
          igvRate: 18,
          ipmRate: 2,
          percepcionRate: 3.5,
          transporteLocalChinaEnvio: 0,
          transporteLocalClienteEnvio: 0,
          cif: 0,
          shouldExemptTaxes: false,
        },
      },
      products: [],
    };

    setFormData(newResponseData);
  };

  return {
    // State
    responseState,
    formData,
    validationState,
    
    // Configuration
    mode,
    readonly,
    quotationId,
    
    // Actions
    handleResponseSelect,
    handleFormDataUpdate,
    handleQuotationInfoUpdate,
    handleCalculationsUpdate,
    handleProductsUpdate,
    handleSubmitResponse,
    handleToggleEditMode,
    initializeNewResponse,
    
    // Response actions
    ...responseActions,
    
    // Utilities
    canEdit: !readonly && mode === 'admin',
    canSubmit: !readonly && mode === 'admin' && validationState.isValid,
    hasActiveResponse: !!responseState.activeResponseId,
  };
};

// Legacy export for backward compatibility
export const ResponseManagementContainer = useResponseManagementContainer;