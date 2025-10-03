import { useState, useEffect } from "react";
import { useGetQuotationById } from "@/hooks/use-quation";
import { useCreateQuatitationResponse } from "@/hooks/use-quatitation-response";
import { obtenerUser } from "@/lib/functions";
import { formatDate } from "@/lib/format-time";
import type { DynamicValuesInterface } from "@/api/interface/quotation-response/dto/complete/objects/dynamic-values";

interface UseQuotationResponseProps {
  selectedQuotationId: string;
}

export function useQuotationResponse({ selectedQuotationId }: UseQuotationResponseProps) {
  // API Hooks
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  const createQuotationResponseMutation = useCreateQuatitationResponse();

  // Basic states
  const [quotationDate, setQuotationDate] = useState<string>("");
  const [isSendingModalOpen, setIsSendingModalOpen] = useState<boolean>(false);
  const [id_asesor, setId_asesor] = useState<string | null>(null);
  const [nombre_asesor, setNombre_asesor] = useState<string | null>(null);

  // Service configuration states
  const [selectedServiceLogistic, setSelectedServiceLogistic] = useState<string>("Pendiente");
  const [selectedTypeLoad, setSelectedTypeLoad] = useState<string>("mixto");
  const [selectedCourier, setSelectedCourier] = useState<string>("ups");
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>("DDP");

  // Maritime service specific states
  const [selectedRegimen, setSelectedRegimen] = useState<string>("");
  const [selectedPaisOrigen, setSelectedPaisOrigen] = useState<string>("");
  const [selectedPaisDestino, setSelectedPaisDestino] = useState<string>("");
  const [selectedAduana, setSelectedAduana] = useState<string>("");
  const [selectedPuertoSalida, setSelectedPuertoSalida] = useState<string>("");
  const [selectedPuertoDestino, setSelectedPuertoDestino] = useState<string>("");
  const [selectedTipoServicio, setSelectedTipoServicio] = useState<string>("");
  const [selectedProformaVigencia, setSelectedProformaVigencia] = useState<string>("5");
  const [tiempoTransito, setTiempoTransito] = useState<number>(0);
  const [naviera, setNaviera] = useState<string>("");

  // Dynamic values state
  const [dynamicValues, setDynamicValues] = useState<DynamicValuesInterface>({
    comercialValue: 0.0,
    flete: 0.0,
    cajas: 0.0,
    desaduanaje: 0.0,
    kg: 0.0,
    ton: 0.0,
    kv: 0.0,
    fob: 0.0,
    seguro: 0.0,
    tipoCambio: 3.7,
    nroBultos: 0.0,
    volumenCBM: 0.0,
    calculoFlete: 0.0,
    servicioConsolidado: 0.0,
    separacionCarga: 0.0,
    inspeccionProductos: 0.0,
    gestionCertificado: 0.0,
    inspeccionProducto: 0.0,
    inspeccionFabrica: 0.0,
    transporteLocal: 0.0,
    otrosServicios: 0.0,
    adValoremRate: 4.0,
    antidumpingGobierno: 0.0,
    antidumpingCantidad: 0.0,
    iscRate: 0.0,
    igvRate: 16.0,
    ipmRate: 2.0,
    percepcionRate: 5.0,
    transporteLocalChinaEnvio: 0.0,
    transporteLocalClienteEnvio: 0.0,
  });

  // Business logic states
  const [isFirstPurchase, setIsFirstPurchase] = useState<boolean>(false);

  // Exemption state
  const [exemptionState, setExemptionState] = useState<ExemptionState>({
    servicioConsolidadoAereo: false,
    separacionCarga: false,
    inspeccionProductos: false,
    obligacionesFiscales: false,
    desaduanajeFleteSaguro: false,
    transporteLocalChina: false,
    transporteLocalCliente: false,
    servicioConsolidadoMaritimo: false,
    gestionCertificado: false,
    servicioInspeccion: false,
    transporteLocal: false,
    totalDerechos: false,
  });

  // Product states
  const [productQuotationState, setProductQuotationState] = useState<Record<string, boolean>>({});
  const [variantQuotationState, setVariantQuotationState] = useState<Record<string, Record<string, boolean>>>({});

  // Initialize user data
  useEffect(() => {
    const user = obtenerUser();
    if (user) {
      setId_asesor(user?.id_usuario);
      setNombre_asesor(user?.name);
    }
  }, []);

  // Initialize quotation date
  useEffect(() => {
    const today = new Date();
    setQuotationDate(formatDate(today.toISOString()));
  }, []);

  // Initialize quotation states when data is loaded
  useEffect(() => {
    if (quotationDetail?.products) {
      const initialProductQuotationState: Record<string, boolean> = {};
      const initialVariantQuotationState: Record<string, Record<string, boolean>> = {};

      quotationDetail.products.forEach((product: any) => {
        initialProductQuotationState[product.productId] = true;
        
        if (product.variants && product.variants.length > 0) {
          initialVariantQuotationState[product.productId] = {};
          product.variants.forEach((variant: any) => {
            initialVariantQuotationState[product.productId][variant.variantId] = true;
          });
        }
      });

      setProductQuotationState(initialProductQuotationState);
      setVariantQuotationState(initialVariantQuotationState);
    }
  }, [quotationDetail]);

  // Business logic functions
  const isMaritimeService = (serviceType: string): boolean => {
    return (
      serviceType === "Consolidado Maritimo" ||
      serviceType === "Consolidado Grupal Maritimo"
    );
  };

  const updateDynamicValue = (key: keyof DynamicValues, value: number) => {
    setDynamicValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleKgChange = (value: number) => {
    updateDynamicValue("kg", value);
    updateDynamicValue("ton", value / 1000);
  };

  const handleExemptionChange = (field: keyof ExemptionState  , checked: boolean) => {
    setExemptionState((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleProductQuotationChange = (productId: string, checked: boolean) => {
    setProductQuotationState((prev) => ({
      ...prev,
      [productId]: checked,
    }));
  };

  const handleVariantQuotationChange = (productId: string, variantId: string, checked: boolean) => {
    setVariantQuotationState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantId]: checked,
      },
    }));
  };

  // Calculate dynamic values
  const calculateMaritimeFlete = () => {
    if (isMaritimeService(selectedServiceLogistic)) {
      const maxValue = Math.max(dynamicValues.ton, dynamicValues.volumenCBM);
      return maxValue * dynamicValues.calculoFlete;
    }
    return dynamicValues.flete;
  };

  const maritimeFlete = calculateMaritimeFlete();
  const cif = dynamicValues.fob + maritimeFlete + dynamicValues.seguro;

  // Generate DTO function
  const generateQuotationResponseDTO = (): QuotationResponseDTO => {
    const isMaritime = isMaritimeService(selectedServiceLogistic);

    return {
      quotationInfo: {
        quotationId: selectedQuotationId,
        status: "ANSWERED",
        correlative: quotationDetail?.correlative || "",
        date: quotationDate,
        serviceType: selectedServiceLogistic,
        cargoType: selectedTypeLoad,
        courier: selectedCourier,
        incoterm: selectedIncoterm,
        isFirstPurchase: isFirstPurchase,
        regime: isMaritime ? selectedRegimen : "",
        originCountry: isMaritime ? selectedPaisOrigen : "",
        destinationCountry: isMaritime ? selectedPaisDestino : "",
        customs: isMaritime ? selectedAduana : "",
        originPort: isMaritime ? selectedPuertoSalida : "",
        destinationPort: isMaritime ? selectedPuertoDestino : "",
        serviceTypeDetail: isMaritime ? selectedTipoServicio : "",
        transitTime: isMaritime ? tiempoTransito : 0,
        naviera: isMaritime ? naviera : "",
        proformaValidity: selectedProformaVigencia,
        cbm_total: 0,
        peso_total: 0,
        id_asesor: id_asesor || "",
      },
      calculations: {
        serviceCalculations: {},
        exemptions: exemptionState,
        dynamicValues: {
          ...dynamicValues,
          cif: cif,
          shouldExemptTaxes: dynamicValues.comercialValue < 200,
        },
      },
      products: quotationDetail?.products?.map((product: any) => ({
        productId: product.productId,
        name: product.name,
        adminComment: product.adminComment || "",
        seCotizaProducto: productQuotationState[product.productId] !== false,
        variants: (product.variants || []).map((variant: any) => ({
          variantId: variant.variantId,
          quantity: Number(variant.quantity) || 0,
          precio_unitario: 0,
          precio_express: 0,
          seCotizaVariante: variantQuotationState[product.productId]?.[variant.variantId] !== false,
        })),
      })) || [],
    };
  };

  // Save response function
  const handleSaveResponse = async () => {
    try {
      setIsSendingModalOpen(true);
      const dto = generateQuotationResponseDTO();
      
      await createQuotationResponseMutation.mutateAsync({
        data: dto,
        quotationId: selectedQuotationId,
      });

      window.history.back();
    } catch (error) {
      console.error("Error al guardar la respuesta:", error);
    } finally {
      setIsSendingModalOpen(false);
    }
  };

  return {
    // Data
    quotationDetail,
    isLoading,
    isError,
    
    // Dates and user
    quotationDate,
    id_asesor,
    nombre_asesor,
    
    // Service configuration
    selectedServiceLogistic,
    setSelectedServiceLogistic,
    selectedTypeLoad,
    setSelectedTypeLoad,
    selectedCourier,
    setSelectedCourier,
    selectedIncoterm,
    setSelectedIncoterm,
    
    // Maritime specific
    selectedRegimen,
    setSelectedRegimen,
    selectedPaisOrigen,
    setSelectedPaisOrigen,
    selectedPaisDestino,
    setSelectedPaisDestino,
    selectedAduana,
    setSelectedAduana,
    selectedPuertoSalida,
    setSelectedPuertoSalida,
    selectedPuertoDestino,
    setSelectedPuertoDestino,
    selectedTipoServicio,
    setSelectedTipoServicio,
    selectedProformaVigencia,
    setSelectedProformaVigencia,
    tiempoTransito,
    setTiempoTransito,
    naviera,
    setNaviera,
    
    // Dynamic values
    dynamicValues,
    updateDynamicValue,
    handleKgChange,
    
    // Business logic
    isFirstPurchase,
    setIsFirstPurchase,
    exemptionState,
    handleExemptionChange,
    
    // Product quotation
    productQuotationState,
    variantQuotationState,
    handleProductQuotationChange,
    handleVariantQuotationChange,
    
    // Calculations
    maritimeFlete,
    cif,
    isMaritimeService,
    
    // Actions
    handleSaveResponse,
    
    // UI state
    isSendingModalOpen,
    setIsSendingModalOpen,
  };
}