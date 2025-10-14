import { useState, useEffect, useCallback } from "react";
import { obtenerUser } from "@/lib/functions";

interface DynamicValues {
  comercialValue: number;
  flete: number;
  cajas: number;
  desaduanaje: number;
  kg: number;
  ton: number;
  kv: number;
  fob: number;
  seguro: number;
  tipoCambio: number;
  nroBultos: number;
  volumenCBM: number;
  calculoFlete: number;
  servicioConsolidado: number;
  separacionCarga: number;
  inspeccionProductos: number;
  gestionCertificado: number;
  inspeccionProducto: number;
  inspeccionFabrica: number;
  transporteLocal: number;
  otrosServicios: number;
  adValoremRate: number;
  antidumpingGobierno: number;
  antidumpingCantidad: number;
  iscRate: number;
  igvRate: number;
  ipmRate: number;
  percepcionRate: number;
  transporteLocalChinaEnvio: number;
  transporteLocalClienteEnvio: number;
  totalDerechos: number;
}

interface ExemptionState {
  servicioConsolidadoAereo: boolean;
  separacionCarga: boolean;
  inspeccionProductos: boolean;
  obligacionesFiscales: boolean;
  desaduanajeFleteSaguro: boolean;
  transporteLocalChina: boolean;
  transporteLocalCliente: boolean;
  servicioConsolidadoMaritimo: boolean;
  gestionCertificado: boolean;
  servicioInspeccion: boolean;
  transporteLocal: boolean;
  totalDerechos: boolean;
  descuentoGrupalExpress: boolean;
}

interface UseQuotationResponseFormProps {
  initialServiceLogistic?: string;
  initialIncoterm?: string;
  initialTypeLoad?: string;
  initialCourier?: string;
}

export function useQuotationResponseForm({
  initialServiceLogistic = "Pendiente",
  initialIncoterm = "DDP",
  initialTypeLoad = "mixto",
  initialCourier = "ups",
}: UseQuotationResponseFormProps = {}) {
  // Estado para la fecha de cotización
  const [quotationDate, setQuotationDate] = useState<string>("");
  
  // Estado para el modal de envío
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  
  // Estados para los selectores principales
  const [selectedTypeLoad, setSelectedTypeLoad] = useState<string>(initialTypeLoad);
  const [selectedCourier, setSelectedCourier] = useState<string>(initialCourier);
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>(initialIncoterm);
  const [selectedServiceLogistic, setSelectedServiceLogistic] = useState<string>(initialServiceLogistic);
  
  // Estados específicos para servicios marítimos
  const [selectedRegimen, setSelectedRegimen] = useState<string>("");
  const [selectedPaisOrigen, setSelectedPaisOrigen] = useState<string>("");
  const [selectedPaisDestino, setSelectedPaisDestino] = useState<string>("");
  const [selectedAduana, setSelectedAduana] = useState<string>("");
  const [selectedPuertoSalida, setSelectedPuertoSalida] = useState<string>("");
  const [selectedPuertoDestino, setSelectedPuertoDestino] = useState<string>("");
  const [selectedTipoServicio, setSelectedTipoServicio] = useState<string>("");
  const [tiempoTransito, setTiempoTransito] = useState<number>(0);
  const [selectedProformaVigencia, setSelectedProformaVigencia] = useState<string>("5");
  const [naviera, setNaviera] = useState<string>("");
  
  // Estados para valores dinámicos editables
  const [dynamicValues, setDynamicValues] = useState<DynamicValues>({
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
    percepcionRate: 3.5,
    transporteLocalChinaEnvio: 0.0,
    transporteLocalClienteEnvio: 0.0,
    totalDerechos: 0.0,
  });
  
  // Estado para primera compra
  const [isFirstPurchase, setIsFirstPurchase] = useState(false);
  const [id_asesor, setId_asesor] = useState<string | null>(null);
  const [nombre_asesor, setNombre_asesor] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  
  // Estados para exoneración de conceptos
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
    descuentoGrupalExpress: false,
  });
  
  // Estados para productos editables
  const [editableUnitCostProducts, setEditableUnitCostProducts] = useState<any[]>([]);
  const [editablePendingProducts, setEditablePendingProducts] = useState<any[]>([]);
  const [editableProductsWithVariants, setEditableProductsWithVariants] = useState<any[]>([]);
  
  // Estados para controlar qué productos/variantes se cotizan
  const [productQuotationState, setProductQuotationState] = useState<Record<string, boolean>>({});
  const [variantQuotationState, setVariantQuotationState] = useState<Record<string, Record<string, boolean>>>({});
  
  // Inicializar datos del asesor
  useEffect(() => {
    const user = obtenerUser();
    setId_asesor(user.id_usuario);
    setNombre_asesor(user?.name || null);
  }, []);

  // Calcular flete automáticamente para servicios marítimos
  useEffect(() => {
    if (isMaritimeService(selectedServiceLogistic)) {
      const maxValue = Math.max(dynamicValues.ton, dynamicValues.volumenCBM);
      const calculatedFlete = maxValue * dynamicValues.calculoFlete;

      if (calculatedFlete !== dynamicValues.flete) {
        setDynamicValues(prev => ({
          ...prev,
          flete: calculatedFlete
        }));
      }
    }
  }, [
    selectedServiceLogistic,
    dynamicValues.ton,
    dynamicValues.volumenCBM,
    dynamicValues.calculoFlete,
  ]);
  
  // Función para detectar si es servicio marítimo
  const isMaritimeService = (serviceType: string) => {
    return (
      serviceType === "Consolidado Maritimo" ||
      serviceType === "Consolidado Grupal Maritimo"
    );
  };
  
  // Función para actualizar valores dinámicos
  const updateDynamicValue = (field: keyof DynamicValues, value: number) => {
    setDynamicValues(prev => {
      const updated = {
        ...prev,
        [field]: value
      };

      // Si se actualiza el valor comercial, sincronizar FOB
      if (field === "comercialValue") {
        updated.fob = value;
      }

      return updated;
    });
  };
  
  // Lógica automática para conversión KG a TON
  const handleKgChange = (value: number) => {
    updateDynamicValue("kg", value);
    updateDynamicValue("ton", value / 1000);
  };
  
  // Calcular flete dinámicamente para servicios marítimos
  const calculateMaritimeFlete = () => {
    if (isMaritimeService(selectedServiceLogistic)) {
      const maxValue = Math.max(dynamicValues.ton, dynamicValues.volumenCBM);
      return maxValue * dynamicValues.calculoFlete;
    }
    return dynamicValues.flete;
  };
  
  // Calcular CIF dinámicamente
  const maritimeFlete = calculateMaritimeFlete();
  const cif = dynamicValues.fob + maritimeFlete + dynamicValues.seguro;
  
  // Función para obtener el nombre del servicio según el tipo
  const getServiceName = (serviceType: string) => {
    const aereoServices = [
      "Consolidado Express",
      "Consolidado Grupal Express", 
      "Almacenaje de mercancías",
    ];
    if (aereoServices.includes(serviceType)) {
      return "Servicio de Carga Consolidada Aérea";
    } else if (isMaritimeService(serviceType)) {
      return "Servicio de Carga Consolidada (CARGA- ADUANA)";
    }
    return "Servicio de Carga Consolidada Aérea";
  };
  
  // Función para obtener los campos del servicio según el tipo
  const getServiceFields = (serviceType: string) => {
    if (serviceType === "Consolidado Express") {
      return {
        servicioConsolidado: dynamicValues.servicioConsolidado,
        separacionCarga: dynamicValues.separacionCarga,
        inspeccionProductos: dynamicValues.inspeccionProductos,
      };
    } else if (serviceType === "Consolidado Grupal Express") {
      return {
        servicioConsolidado: dynamicValues.servicioConsolidado,
        seguroProductos: dynamicValues.separacionCarga, // Reutilizamos el valor pero con diferente etiqueta
        inspeccionProductos: dynamicValues.inspeccionProductos,
      };
    } else if (serviceType === "Almacenaje de mercancías") {
      return {
        servicioConsolidado: dynamicValues.servicioConsolidado,
        separacionCarga: dynamicValues.separacionCarga,
        inspeccionProductos: dynamicValues.inspeccionProductos,
      };
    } else if (isMaritimeService(serviceType)) {
      return {
        servicioConsolidado: dynamicValues.servicioConsolidado,
        gestionCertificado: dynamicValues.gestionCertificado,
        inspeccionProductos: dynamicValues.inspeccionProductos,
        inspeccionFabrica: dynamicValues.inspeccionFabrica,
        transporteLocal: dynamicValues.transporteLocal,
        otrosServicios: dynamicValues.otrosServicios,
      };
    }
    return {};
  };
  
  // Función para actualizar estado de exoneración
  const updateExemptionState = (field: keyof ExemptionState, value: boolean) => {
    setExemptionState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para actualizar estado de cotización de productos
  const updateProductQuotationState = useCallback((productId: string, value: boolean) => {
    setProductQuotationState(prev => ({
      ...prev,
      [productId]: value
    }));
  }, []);

  // Función para actualizar estado de cotización de variantes
  const updateVariantQuotationState = useCallback((productId: string, variantId: string, value: boolean) => {
    setVariantQuotationState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantId]: value
      }
    }));
  }, []);

  // Función para establecer productos con useCallback para evitar re-renders
  const setEditableUnitCostProductsCallback = useCallback((products: any[]) => {
    setEditableUnitCostProducts(products);
  }, []);

  const setEditablePendingProductsCallback = useCallback((products: any[]) => {
    setEditablePendingProducts(products);
  }, []);

  const setEditableProductsWithVariantsCallback = useCallback((products: any[]) => {
    setEditableProductsWithVariants(products);
  }, []);
  
  return {
    // Estados principales
    quotationDate,
    setQuotationDate,
    isSendingModalOpen,
    setIsSendingModalOpen,
    
    // Selectores
    selectedTypeLoad,
    setSelectedTypeLoad,
    selectedCourier,
    setSelectedCourier,
    selectedIncoterm,
    setSelectedIncoterm,
    selectedServiceLogistic,
    setSelectedServiceLogistic,
    
    // Configuración marítima
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
    tiempoTransito,
    setTiempoTransito,
    selectedProformaVigencia,
    setSelectedProformaVigencia,
    naviera,
    setNaviera,
    
    // Valores dinámicos
    dynamicValues,
    updateDynamicValue,
    handleKgChange,
    
    // Estados adicionales
    isFirstPurchase,
    setIsFirstPurchase,
    id_asesor,
    nombre_asesor,
    showCommentModal,
    setShowCommentModal,
    
    // Exoneraciones
    exemptionState,
    updateExemptionState,
    
    // Productos
    editableUnitCostProducts,
    setEditableUnitCostProducts: setEditableUnitCostProductsCallback,
    editablePendingProducts,
    setEditablePendingProducts: setEditablePendingProductsCallback,
    editableProductsWithVariants,
    setEditableProductsWithVariants: setEditableProductsWithVariantsCallback,
    productQuotationState,
    setProductQuotationState,
    variantQuotationState,
    setVariantQuotationState,
    updateProductQuotationState,
    updateVariantQuotationState,
    
    // Funciones utilitarias
    isMaritimeService: () => isMaritimeService(selectedServiceLogistic),
    calculateMaritimeFlete,
    cif,
    getServiceName: () => getServiceName(selectedServiceLogistic),
    getServiceFields: () => getServiceFields(selectedServiceLogistic),
  };
}