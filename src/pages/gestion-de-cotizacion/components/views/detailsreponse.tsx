import React, { useState, useEffect } from "react";
import {
  Calendar,
  Calculator,
  FileText,
  Clock,
  Receipt,
  Settings,
  User,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Truck,
  MessageSquare,
  Package,
  PackageIcon,
  Box,
  Boxes,
  Edit3,
  Check,
  X,
  Plane,
  ChartBar,
  Download,
  Send,
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
  BoxesIcon,
} from "lucide-react";

import { useGetQuotationById } from "@/hooks/use-quation";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatCurrency, obtenerUser } from "@/lib/functions";

// Tabs removidos: ahora todo se muestra en una sola vista


import type { DetailsResponseProps } from "../utils/interface";

// Importar datos estáticos
import {
  incotermsOptions,
  serviciosLogisticos,
  typeLoad,
  typeLoadMaritime,
  regimenOptions,
  puertosSalida,
  puertosDestino,
  tipoServicio,
  proformaVigencia,
  courier,
  paisesOrigen,
  paisesDestino,
  aduana,
} from "../utils/static";

import EditableUnitCostTable from "./editableunitcosttable";
import type { ProductRow } from "./editableunitcosttable";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/format-time";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCreateQuatitationResponse } from "@/hooks/use-quatitation-response";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import SendingModal from "@/components/sending-modal";
import { useNavigate } from "react-router-dom";
import ServiceConsolidationCard from "./partials/ServiceConsolidationCard";
import ImportExpensesCard from "./partials/ImportExpensesCard";
import ImportSummaryCard from "./partials/ImportSummaryCard";
import TaxObligationsCard from "./partials/TaxObligationsCard";

const DetailsResponse: React.FC<DetailsResponseProps> = ({
  selectedQuotationId,
}) => {
  //* Hook para obtener los detalles de la cotización - DEBE IR PRIMERO
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  useEffect(() => {
    //Obtener id_usuario del usuario logueado
    const id_usuario = obtenerUser().id_usuario;
    setId_asesor(id_usuario);
  }, []);

  //* Hook para crear respuesta de cotización
  const createQuotationResponseMutation = useCreateQuatitationResponse();

  //* Estado para la fecha de la cotización
  const [quotationDate, setQuotationDate] = useState<string>("");

  //* Estado para el modal de envío
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);

  //* Estados para los selectores
  const [selectedTypeLoad, setSelectedTypeLoad] = useState<string>("mixto");
  const [selectedCourier, setSelectedCourier] = useState<string>("ups");
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>("DDP");
  const [selectedServiceLogistic, setSelectedServiceLogistic] =
    useState<string>("Consolidado Express");

  //* Estados específicos para servicios marítimos
  const [selectedRegimen, setSelectedRegimen] = useState<string>(
    ""
  );
  const [selectedPaisOrigen, setSelectedPaisOrigen] = useState<string>("");
  const [selectedPaisDestino, setSelectedPaisDestino] = useState<string>("");
  const [selectedAduana, setSelectedAduana] = useState<string>("");
  const [selectedPuertoSalida, setSelectedPuertoSalida] = useState<string>("");
  const [selectedPuertoDestino, setSelectedPuertoDestino] =
    useState<string>("");
  const [selectedTipoServicio, setSelectedTipoServicio] = useState<string>("");
  const [tiempoTransito, setTiempoTransito] = useState<number>(0);
  const [selectedProformaVigencia, setSelectedProformaVigencia] =
    useState<string>("5");
  const [naviera, setNaviera] = useState<string>("");

  //* Estados para valores dinámicos editables
  const [dynamicValues, setDynamicValues] = useState({
    // Valores principales
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

    // Campos específicos marítimos
    nroBultos: 0.0,
    volumenCBM: 0.0,
    calculoFlete: 0.0,

    // Servicios de consolidación aérea
    servicioConsolidado: 0.0,
    separacionCarga: 0.0,
    inspeccionProductos: 0.0,

    // Servicios de consolidación marítima (cuando aplique)
    gestionCertificado: 0.0,
    inspeccionProducto: 0.0,
    inspeccionFabrica: 0.0,
    transporteLocal: 0.0,
    otrosServicios: 0.0,

    // Porcentajes de impuestos (actualizados para marítimo)
    adValoremRate: 4.0,
    antidumpingGobierno: 0.0,
    antidumpingCantidad: 0.0,
    iscRate: 0.0,
    igvRate: 16.0,
    ipmRate: 2.0,
    percepcionRate: 5.0,

    // Campos específicos para transporte local china
    transporteLocalChinaEnvio: 0.0,
    transporteLocalClienteEnvio: 0.0,
  });

  //* Estado para primera compra
  const [isFirstPurchase, setIsFirstPurchase] = useState(false);
  const [id_asesor, setId_asesor] = useState<string | null>(null);
  const [nombre_asesor, setNombre_asesor] = useState<string | null>(null);

  //* Estados para exoneración de conceptos de gastos de importación
  const [exemptionState, setExemptionState] = useState({
    // Servicios Aéreos
    servicioConsolidadoAereo: false,
    separacionCarga: false,
    inspeccionProductos: false,
    obligacionesFiscales: false,
    desaduanajeFleteSaguro: false,
    transporteLocalChina: false,
    transporteLocalCliente: false,
    // Servicios Marítimos
    servicioConsolidadoMaritimo: false,
    gestionCertificado: false,
    servicioInspeccion: false,
    transporteLocal: false,
    totalDerechos: false,
  });

  //* Estado para productos editables de la tabla de costeo unitario
  const [editableUnitCostProducts, setEditableUnitCostProducts] = useState<
    ProductRow[]
  >([]);

  //* Estado para productos editables del tipo "Pendiente"
  const [editablePendingProducts, setEditablePendingProducts] = useState<
    Array<{
      id: string;
      name: string;
      quantity: number;
      boxes: number;
      priceXiaoYi: number;
      cbmTotal: number;
      express: number;
      total: number;
    }>
  >([]);

  //* Función para detectar si es servicio marítimo
  const isMaritimeService = (serviceType: string) => {
    return (
      serviceType === "Consolidado Maritimo" ||
      serviceType === "Consolidado Grupal Maritimo"
    );
  };

  //* Calcular flete dinámicamente para servicios marítimos
  const calculateMaritimeFlete = () => {
    if (isMaritimeService(selectedServiceLogistic)) {
      const maxValue = Math.max(dynamicValues.ton, dynamicValues.volumenCBM);
      return maxValue * dynamicValues.calculoFlete;
    }
    return dynamicValues.flete;
  };

  //* Lógica automática para conversión KG a TON
  const handleKgChange = (value: number) => {
    updateDynamicValue("kg", value);
    // Convertir automáticamente KG a TON
    updateDynamicValue("ton", value / 1000);
  };

  //* Calcular CIF dinámicamente
  const maritimeFlete = calculateMaritimeFlete();
  const cif = dynamicValues.fob + maritimeFlete + dynamicValues.seguro;

  //* Función para obtener el nombre del servicio según el tipo
  const getServiceName = (serviceType: string) => {
    const aereoServices = [
      "Consolidado Express",
      "Consolidado Grupal Express",
      "Almacenaje de mercancías",
    ];
    if (aereoServices.includes(serviceType)) {
      return "Servicio de Carga Consolidada Aérea";
    } else if (
      serviceType === "Consolidado Maritimo" ||
      serviceType === "Consolidado Grupal Maritimo"
    ) {
      return "Servicio de Carga Consolidada (CARGA- ADUANA)";
    }
    return "Servicio de Carga Consolidada Aérea"; // Por defecto
  };

  //* Función para obtener los campos del servicio según el tipo
  const getServiceFields = (serviceType: string) => {
    const aereoServices = [
      "Consolidado Express",
      "Consolidado Grupal Express",
      "Almacenaje de mercancías",
    ];
    if (aereoServices.includes(serviceType)) {
      return {
        servicioConsolidado: dynamicValues.servicioConsolidado,
        separacionCarga: dynamicValues.separacionCarga,
        inspeccionProductos: dynamicValues.inspeccionProductos,
      };
    } else if (
      serviceType === "Consolidado Maritimo" ||
      serviceType === "Consolidado Grupal Maritimo"
    ) {
      return {
        servicioConsolidado: dynamicValues.servicioConsolidado,
        gestionCertificado: dynamicValues.gestionCertificado,
        inspeccionProducto: dynamicValues.inspeccionProducto,
        inspeccionFabrica: dynamicValues.inspeccionFabrica,
        transporteLocal: dynamicValues.transporteLocal,
        otrosServicios: dynamicValues.otrosServicios,
      };
    }
    return {
      servicioConsolidado: dynamicValues.servicioConsolidado,
      separacionCarga: dynamicValues.separacionCarga,
      inspeccionProductos: dynamicValues.inspeccionProductos,
    };
  };

  //* Calcular valores dinámicos
  const serviceFields = getServiceFields(selectedServiceLogistic);
  const subtotalServices = Object.values(serviceFields).reduce(
    (sum, value) => sum + value,
    0
  );

  //* Calcular sumatorias para tipo "Pendiente"
  const totalExpressAirFreight = editablePendingProducts.reduce((sum, product) => sum + product.express, 0);
  const totalAgenteXiaoYi = editablePendingProducts.reduce((sum, product) => sum + (product.priceXiaoYi * product.quantity), 0);
  const totalPrecioTotal = totalExpressAirFreight + totalAgenteXiaoYi;
  //* Calcular IGV de los servicios
  const igvServices = subtotalServices * 0.18;
  const totalServices = subtotalServices + igvServices;

  //* Función para verificar si se deben exonerar impuestos automáticamente
  const shouldExemptTaxes = dynamicValues.comercialValue < 200;

  //* Función para manejar cambios en el estado de exoneración
  const handleExemptionChange = (
    field: keyof typeof exemptionState,
    checked: boolean
  ) => {
    setExemptionState((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  //* Función para aplicar exoneración a un valor
  const applyExemption = (value: number, isExempted: boolean) => {
    return isExempted ? 0 : value;
  };

  //* Cálculos de obligaciones fiscales
  const adValorem = cif * (dynamicValues.adValoremRate / 100);

  // Para servicios marítimos
  const antidumping = isMaritimeService(selectedServiceLogistic)
    ? dynamicValues.antidumpingGobierno * dynamicValues.antidumpingCantidad
    : 0;

  const isc = isMaritimeService(selectedServiceLogistic)
    ? (cif + adValorem) * (dynamicValues.iscRate / 100)
    : 0;

  const baseIgvIpm = isMaritimeService(selectedServiceLogistic)
    ? cif + adValorem + antidumping + isc
    : cif + adValorem;

  const igvFiscal = baseIgvIpm * (dynamicValues.igvRate / 100);
  const ipm = baseIgvIpm * (dynamicValues.ipmRate / 100);

  const percepcion = isMaritimeService(selectedServiceLogistic)
    ? (cif + adValorem + antidumping + isc + igvFiscal + ipm) *
      (dynamicValues.percepcionRate / 100)
    : 0;

  const totalDerechosDolares = isMaritimeService(selectedServiceLogistic)
    ? adValorem + antidumping + isc + igvFiscal + ipm + percepcion
    : adValorem + igvFiscal + ipm;

  const totalDerechosSoles = totalDerechosDolares * dynamicValues.tipoCambio;

  //* Cálculos de gastos de importación con lógica de primera compra
  const servicioConsolidadoFinal = isFirstPurchase
    ? 0
    : dynamicValues.servicioConsolidado * 1.18;
  const separacionCargaFinal = isFirstPurchase
    ? 0
    : dynamicValues.separacionCarga * 1.18;
  const inspeccionProductosFinal = isFirstPurchase
    ? 0
    : dynamicValues.inspeccionProductos * 1.18;
  const desaduanajeFleteSaguro =
    dynamicValues.desaduanaje + maritimeFlete + dynamicValues.seguro;

  // Aplicar 50% de descuento a impuestos si es primera compra
  // Aplicar exoneración total si valor comercial < $200 o si está marcado para exoneración
  const totalDerechosDolaresFinal =
    shouldExemptTaxes ||
    exemptionState.obligacionesFiscales ||
    exemptionState.totalDerechos
      ? 0
      : isFirstPurchase
      ? totalDerechosDolares * 0.5
      : totalDerechosDolares;

  // Cálculos específicos para servicios marítimos
  const servicioConsolidadoMaritimoFinal = isMaritimeService(
    selectedServiceLogistic
  )
    ? isFirstPurchase
      ? 0
      : dynamicValues.servicioConsolidado * 1.18
    : 0;

  const gestionCertificadoFinal = isMaritimeService(selectedServiceLogistic)
    ? isFirstPurchase
      ? 0
      : dynamicValues.gestionCertificado * 1.18
    : 0;

  const servicioInspeccionFinal = isMaritimeService(selectedServiceLogistic)
    ? isFirstPurchase
      ? 0
      : (dynamicValues.inspeccionProducto + dynamicValues.inspeccionFabrica) *
        1.18
    : 0;

  const transporteLocalFinal = isMaritimeService(selectedServiceLogistic)
    ? isFirstPurchase
      ? 0
      : dynamicValues.transporteLocal * 1.18
    : 0;

  const totalGastosImportacion = isMaritimeService(selectedServiceLogistic)
    ? applyExemption(
        servicioConsolidadoMaritimoFinal,
        exemptionState.servicioConsolidadoMaritimo
      ) +
      applyExemption(
        gestionCertificadoFinal,
        exemptionState.gestionCertificado
      ) +
      applyExemption(
        servicioInspeccionFinal,
        exemptionState.servicioInspeccion
      ) +
      applyExemption(transporteLocalFinal, exemptionState.transporteLocal) +
      totalDerechosDolaresFinal +
      applyExemption(
        dynamicValues.transporteLocalChinaEnvio,
        exemptionState.transporteLocalChina
      ) +
      applyExemption(
        dynamicValues.transporteLocalClienteEnvio,
        exemptionState.transporteLocalCliente
      )
    : applyExemption(
        servicioConsolidadoFinal,
        exemptionState.servicioConsolidadoAereo
      ) +
      applyExemption(separacionCargaFinal, exemptionState.separacionCarga) +
      applyExemption(
        inspeccionProductosFinal,
        exemptionState.inspeccionProductos
      ) +
      totalDerechosDolaresFinal +
      applyExemption(
        desaduanajeFleteSaguro,
        exemptionState.desaduanajeFleteSaguro
      ) +
      applyExemption(
        dynamicValues.transporteLocalChinaEnvio,
        exemptionState.transporteLocalChina
      ) +
      applyExemption(
        dynamicValues.transporteLocalClienteEnvio,
        exemptionState.transporteLocalCliente
      );

  //* Inversión total
  const inversionTotal = dynamicValues.comercialValue + totalGastosImportacion;

  //* Función para actualizar valores dinámicos
  const updateDynamicValue = (
    key: keyof typeof dynamicValues,
    value: number
  ) => {
    setDynamicValues((prev) => ({ ...prev, [key]: value }));
  };

  //* Función para manejar cambios del valor comercial desde las tablas
  const handleCommercialValueChange = (value: number) => {
    console.log("Estamos en el handleCommercialValueChange", value);
    updateDynamicValue("comercialValue", value);
  };

  //* Función para manejar cambios de primera compra
  const handleFirstPurchaseChange = (checked: boolean) => {
    setIsFirstPurchase(checked);
  };

  //* Función para manejar cambios en los productos de la tabla de costeo unitario
  const handleUnitCostProductsChange = (products: ProductRow[]) => {
    setEditableUnitCostProducts(products);
  };

  //* Función para manejar cambios en los productos del tipo "Pendiente"
  const handlePendingProductChange = (productId: string, field: string, value: number) => {
    setEditablePendingProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const updatedProduct = { ...product, [field]: value };
        
        // Calcular el total: (precioXiaoYi * quantity) + express
        if (field === 'priceXiaoYi' || field === 'quantity' || field === 'express') {
          updatedProduct.total = (updatedProduct.priceXiaoYi * updatedProduct.quantity) + updatedProduct.express;
        }
        
        return updatedProduct;
      }
      return product;
    }));
  };

    //********llamado a funcion para obtener datos del asesor */
    useEffect(() => {
      const user = obtenerUser();
      if (user) {
        setId_asesor(user?.id_usuario);
        setNombre_asesor(user?.name);
      }
    }, []);

  //* Función para generar el DTO con toda la información de la respuesta
  const generateQuotationResponseDTO = () => {
    return {
      // Información de la cotización
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
        regime: selectedRegimen,
        originCountry: selectedPaisOrigen,
        destinationCountry: selectedPaisDestino,
        customs: selectedAduana,
        originPort: selectedPuertoSalida,
        destinationPort: selectedPuertoDestino,
        serviceTypeDetail: selectedTipoServicio,
        transitTime: tiempoTransito,
        naviera: naviera,
        proformaValidity: selectedProformaVigencia,
        id_asesor: id_asesor || "",
      },

      // Valores dinámicos
      dynamicValues: {
        ...dynamicValues,
        cif: cif,
        shouldExemptTaxes: shouldExemptTaxes,
      },

      // Estados de exoneración
      exemptions: exemptionState,

      // Cálculos de servicios
      serviceCalculations: {
        // Servicios de consolidación
        serviceFields: {
          servicioConsolidado: serviceFields.servicioConsolidado || 0,
          separacionCarga: serviceFields.separacionCarga || 0,
          inspeccionProductos: serviceFields.inspeccionProductos || 0,
        },
        subtotalServices: subtotalServices,
        igvServices: igvServices,
        totalServices: totalServices,

        // Obligaciones fiscales
        fiscalObligations: {
          adValorem: adValorem,
          antidumping: antidumping,
          isc: isc,
          baseIgvIpm: baseIgvIpm,
          igvFiscal: igvFiscal,
          ipm: ipm,
          percepcion: percepcion,
          totalDerechosDolares: totalDerechosDolares,
          totalDerechosSoles: totalDerechosSoles,
          totalDerechosDolaresFinal: totalDerechosDolaresFinal,
        },

        // Gastos de importación
        importExpenses: {
          // Servicios Aéreos
          servicioConsolidadoFinal: servicioConsolidadoFinal,
          separacionCargaFinal: separacionCargaFinal,
          inspeccionProductosFinal: inspeccionProductosFinal,

          // Servicios Marítimos
          servicioConsolidadoMaritimoFinal: servicioConsolidadoMaritimoFinal,
          gestionCertificadoFinal: gestionCertificadoFinal,
          servicioInspeccionFinal: servicioInspeccionFinal,
          transporteLocalFinal: transporteLocalFinal,

          // Comunes
          desaduanajeFleteSaguro: desaduanajeFleteSaguro,

          // Totales aplicando exoneraciones
          finalValues: {
            servicioConsolidado: isMaritimeService(selectedServiceLogistic)
              ? applyExemption(
                  servicioConsolidadoMaritimoFinal,
                  exemptionState.servicioConsolidadoMaritimo
                )
              : applyExemption(
                  servicioConsolidadoFinal,
                  exemptionState.servicioConsolidadoAereo
                ),

            gestionCertificado: applyExemption(
              gestionCertificadoFinal,
              exemptionState.gestionCertificado
            ),
            servicioInspeccion: applyExemption(
              servicioInspeccionFinal,
              exemptionState.servicioInspeccion
            ),
            transporteLocal: applyExemption(
              transporteLocalFinal,
              exemptionState.transporteLocal
            ),
            separacionCarga: applyExemption(
              separacionCargaFinal,
              exemptionState.separacionCarga
            ),
            inspeccionProductos: applyExemption(
              inspeccionProductosFinal,
              exemptionState.inspeccionProductos
            ),
            desaduanajeFleteSaguro: applyExemption(
              desaduanajeFleteSaguro,
              exemptionState.desaduanajeFleteSaguro
            ),
            transporteLocalChina: applyExemption(
              dynamicValues.transporteLocalChinaEnvio,
              exemptionState.transporteLocalChina
            ),
            transporteLocalCliente: applyExemption(
              dynamicValues.transporteLocalClienteEnvio,
              exemptionState.transporteLocalCliente
            ),
          },

          totalGastosImportacion: totalGastosImportacion,
        },

        // Totales finales
        totals: {
          inversionTotal: inversionTotal,
        },
      },

      // Productos del costeo unitario
      unitCostProducts: editableUnitCostProducts,

      // Productos del tipo "Pendiente"
      pendingProducts: editablePendingProducts,
      pendingCalculations: {
        totalExpressAirFreight,
        totalAgenteXiaoYi,
        totalPrecioTotal,
      },
    };
  };

  //* Función para enviar la respuesta al backend usando el hook
  const handleSaveResponse = async () => {
    try {
      // Mostrar modal de envío
      setIsSendingModalOpen(true);

      const dto = generateQuotationResponseDTO();

      console.log(
        "Enviando respuesta al backend:",
        JSON.stringify(dto, null, 2)
      );

      // Llamada al backend usando el hook
      await createQuotationResponseMutation.mutateAsync({
        data: dto,
        quotationId: selectedQuotationId,
      });
      
      // Notificar y regresar a listado
      // Usamos toast del sistema de notificaciones (ya importado en hooks) o un alert simple
      console.log("Respuesta enviada correctamente");
      window.history.back();
    } catch (error) {
      console.error("Error al guardar la respuesta:", error);
    } finally {
      // El modal se cerrará automáticamente después del progreso
      setIsSendingModalOpen(false);
    }
  };

  //* Obtener fecha actual de hoy
  useEffect(() => {
    const today = new Date();
    setQuotationDate(formatDate(today.toISOString()));
  }, []);

  //* Inicializar productos de la tabla de costeo unitario cuando se cargan los datos
  useEffect(() => {
    if (quotationDetail?.products && editableUnitCostProducts.length === 0) {
      const initialProducts = quotationDetail.products.map((product) => ({
        id: product.id,
        name: product.name,
        price: 0,
        quantity: product.quantity,
        total: 0,
        equivalence: 0,
        importCosts: 0,
        totalCost: 0,
        unitCost: 0,
        seCotiza: true, // Por defecto todos los productos se cotizan
      }));
      setEditableUnitCostProducts(initialProducts);
    }
  }, [quotationDetail, editableUnitCostProducts.length]);

  //* Inicializar productos editables del tipo "Pendiente"
  useEffect(() => {
    if (quotationDetail?.products && editablePendingProducts.length === 0) {
      const initialPendingProducts = quotationDetail.products.map((product) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity || 0,
        boxes: product.quantity || 0,
        priceXiaoYi: 0,
        cbmTotal: 0,
        express: 0,
        total: 0,
      }));
      setEditablePendingProducts(initialPendingProducts);
    }
  }, [quotationDetail, editablePendingProducts.length]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !quotationDetail) {
    // Mostrar productos de ejemplo si no hay datos de cotización
    console.log("Mostrando productos de ejemplo");
  }

  return (
    <div className="space-y-6 p-4 min-h-screen ">
      {/* Header Bento Grid */}
      <div className="relative h-full w-full">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 gap-3 text-xl font-semibold">
              <PackageIcon className="w-7 h-7 text-blue-600" />
              Cotización {quotationDetail?.correlative || "EJEMPLO-001"}
            </div>
          </div>

          <div className="w-full">
            {selectedServiceLogistic === "Pendiente" ? (
              <div>
                {/* Información del Cliente y Detalles de Carga se mantienen */}

                {/* Información del Cliente */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Primera columna */}
                  <div className="space-y-4">
                    {/* Client Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Información del Cliente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 ">
                          <div className="space-y-2">
                            <Label htmlFor="nombre_cliente">Nombres: </Label>
                            <Input
                              id="nombre_cliente"
                              className="font-medium"
                            />
                            <Label htmlFor="apellidos_cliente">
                              Apellidos:{" "}
                            </Label>
                            <Input
                              id="apellidos_cliente"
                              className="font-medium"
                            />
                            <Label htmlFor="dni_cliente">DNI: </Label>
                            <Input id="dni_cliente" className="font-medium" />
                            <Label htmlFor="razon_social_cliente">
                              RAZON SOCIAL:{" "}
                            </Label>
                            <Input
                              id="razon_social_cliente"
                              className="font-medium"
                            />
                            <Label htmlFor="ruc_cliente">RUC: </Label>
                            <Input id="ruc_cliente" className="font-medium" />
                            <Label htmlFor="contacto_cliente">CONTACTO:</Label>
                            <Input
                              id="contacto_cliente"
                              className="font-medium"
                            />
                          </div>

                          <div className="space-y-2">
                            <div>
                              <Label htmlFor="advisor">Asesor(a) : </Label>
                                <Input id="advisor" value={nombre_asesor || ""} />
                            </div>
                            <Label htmlFor="date">Fecha de respuesta:</Label>
                            <Input id="date" value={quotationDate} />
                            <div>
                              <Label htmlFor="service">Tipo de Servicio</Label>
                              <Select
                                value={selectedServiceLogistic}
                                onValueChange={setSelectedServiceLogistic}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {serviciosLogisticos.map((servicio) => (
                                    <SelectItem
                                      key={servicio.value}
                                      value={servicio.value}
                                    >
                                      {servicio.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2"></div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Segunda columna */}
                  <div className="space-y-6">
                    {/* Cargo Details */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Package className="h-5 w-5 text-green-600" />
                          Detalles de Carga
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                          <div>
                            <Label htmlFor="cargoType">Tipo de Carga</Label>
                            <Select
                              value={selectedTypeLoad}
                              onValueChange={setSelectedTypeLoad}
                            >
                              <SelectTrigger className=" w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white w-full h-full">
                                {(isMaritimeService(selectedServiceLogistic)
                                  ? typeLoadMaritime
                                  : typeLoad
                                ).map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="commercialValue">
                              Valor Comercial
                            </Label>
                            <div className="relative">
                              <EditableNumericField
                                value={Number(
                                  dynamicValues.comercialValue.toFixed(2)
                                )}
                                onChange={(value) =>
                                  updateDynamicValue("comercialValue", value)
                                }
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                USD
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="boxes">
                              {isMaritimeService(selectedServiceLogistic)
                                ? "Nro Bultos"
                                : "Cajas"}
                            </Label>
                            <EditableNumericField
                              value={
                                isMaritimeService(selectedServiceLogistic)
                                  ? dynamicValues.nroBultos
                                  : dynamicValues.cajas
                              }
                              onChange={(value) =>
                                updateDynamicValue(
                                  isMaritimeService(selectedServiceLogistic)
                                    ? "nroBultos"
                                    : "cajas",
                                  value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                          <div>
                            <Label htmlFor="kg">Peso (KG)</Label>
                            <EditableNumericField
                              value={dynamicValues.kg}
                              onChange={handleKgChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="ton">Peso (TON)</Label>
                            <EditableNumericField
                              value={dynamicValues.ton}
                              onChange={
                                isMaritimeService(selectedServiceLogistic)
                                  ? () => {}
                                  : (value) => updateDynamicValue("ton", value)
                              }
                            />
                          </div>
                          {!isMaritimeService(selectedServiceLogistic) && (
                            <div>
                              <Label htmlFor="kv">K/V</Label>
                              <EditableNumericField
                                value={dynamicValues.kv}
                                onChange={(value) =>
                                  updateDynamicValue("kv", value)
                                }
                              />
                            </div>
                          )}
                          {isMaritimeService(selectedServiceLogistic) && (
                            <div>
                              <Label htmlFor="volumenCBM">Volumen (CBM)</Label>
                              <EditableNumericField
                                value={dynamicValues.volumenCBM}
                                onChange={(value) =>
                                  updateDynamicValue("volumenCBM", value)
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <div className="space-y-2">
                            {/* Regimen */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="regimen">Régimen</Label>
                                <Select
                                  value={selectedRegimen}
                                  onValueChange={setSelectedRegimen}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {regimenOptions.map((regimen) => (
                                      <SelectItem
                                        key={regimen.value}
                                        value={regimen.value}
                                      >
                                        {regimen.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Pais de Origen */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="paisOrigen">
                                  País de Origen
                                </Label>
                                <Select
                                  value={selectedPaisOrigen}
                                  onValueChange={setSelectedPaisOrigen}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {paisesOrigen.map((pais) => (
                                      <SelectItem
                                        key={pais.value}
                                        value={pais.value}
                                      >
                                        {pais.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Pais de Destino */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="paisDestino">
                                  País de Destino
                                </Label>
                                <Select
                                  value={selectedPaisDestino}
                                  onValueChange={setSelectedPaisDestino}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {paisesDestino.map((pais) => (
                                      <SelectItem
                                        key={pais.value}
                                        value={pais.value}
                                      >
                                        {pais.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Aduana */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="aduana">Aduana</Label>
                                <Select
                                  value={selectedAduana}
                                  onValueChange={setSelectedAduana}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {aduana.map((aduan) => (
                                      <SelectItem
                                        key={aduan.value}
                                        value={aduan.value}
                                      >
                                        {aduan.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Naviera */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="naviera">Naviera</Label>
                                <Input
                                  id="naviera"
                                  value={naviera}
                                  onChange={(e) => setNaviera(e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {/* Puerto de salida */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="puertoSalida">
                                  Puerto de Salida
                                </Label>
                                <Select
                                  value={selectedPuertoSalida}
                                  onValueChange={setSelectedPuertoSalida}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {puertosSalida.map((puerto) => (
                                      <SelectItem
                                        key={puerto.value}
                                        value={puerto.value}
                                      >
                                        {puerto.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Puerto de destino */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="puertoDestino">
                                  Puerto de Destino
                                </Label>
                                <Select
                                  value={selectedPuertoDestino}
                                  onValueChange={setSelectedPuertoDestino}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {puertosDestino.map((puerto) => (
                                      <SelectItem
                                        key={puerto.value}
                                        value={puerto.value}
                                      >
                                        {puerto.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* T. Servicio */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="tipoServicio">
                                  T. Servicio
                                </Label>
                                <Select
                                  value={selectedTipoServicio}
                                  onValueChange={setSelectedTipoServicio}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tipoServicio.map((tipo) => (
                                      <SelectItem
                                        key={tipo.value}
                                        value={tipo.value}
                                      >
                                        {tipo.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Tiempo Transito */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="tiempoTransito">
                                  T. Tránsito
                                </Label>
                                <EditableNumericField
                                  value={tiempoTransito}
                                  onChange={(value) => setTiempoTransito(value)}
                                />
                              </div>
                            )}

                            {/* Proforma Vigencia */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="proformaVigencia">
                                  Proforma Vigencia
                                </Label>
                                <Select
                                  value={selectedProformaVigencia}
                                  onValueChange={setSelectedProformaVigencia}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {proformaVigencia.map((vigencia) => (
                                      <SelectItem
                                        key={vigencia.value}
                                        value={vigencia.value}
                                      >
                                        {vigencia.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Primera Compra */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="firstPurchase"
                              checked={isFirstPurchase}
                              onCheckedChange={handleFirstPurchaseChange}
                            />
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700"
                            >
                              Es Primera Compra
                            </Badge>
                            {isFirstPurchase && (
                              <span className="text-xs text-green-600 font-semibold ml-2">
                                (Servicios exonerados y 50% descuento en
                                impuestos)
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Resumen tipo guía: Shipment (Courier), Express Air Freight, Total Agente Xiao Yi, Precio Total */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-6">
                  <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200/50 rounded-r-none">
                    <CardContent className="p-0">
                      <div className="bg-yellow-400 px-4 py-3 border-b border-yellow-500">
                        <h3 className="text-sm font-bold text-black text-center">
                          SHIPMENT
                        </h3>
                      </div>
                      <div className="p-4 text-center">
                        <Select
                          value={selectedCourier}
                          onValueChange={setSelectedCourier}
                        >
                          <SelectTrigger className="w-full justify-center">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {courier.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200/50 rounded-none border-l-0">
                    <CardContent className="p-0">
                      <div className="bg-amber-200 px-4 py-3 border-b border-amber-300">
                        <h3 className="text-sm font-bold text-black text-center">
                          EXPRESS AIR FREIGHT
                        </h3>
                      </div>
                      <div className="p-4 text-center space-y-1">
                        <div className="text-xs text-amber-600 font-medium">
                          USD
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                          {totalExpressAirFreight.toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200/50 rounded-none border-l-0">
                    <CardContent className="p-0">
                      <div className="bg-purple-300 px-4 py-3 border-b border-purple-400">
                        <h3 className="text-sm font-bold text-black text-center">
                          TOTAL AGENTE XIAO YI
                        </h3>
                      </div>
                      <div className="p-4 text-center space-y-1">
                        <div className="text-xs text-purple-600 font-medium">
                          USD
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                          {totalAgenteXiaoYi.toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200/50 rounded-l-none border-l-0">
                    <CardContent className="p-0">
                      <div className="bg-green-200 px-4 py-3 border-b border-green-300">
                        <h3 className="text-sm font-bold text-black text-center">
                          PRECIO TOTAL
                        </h3>
                      </div>
                      <div className="p-4 text-center space-y-1">
                        <div className="text-xs text-green-600 font-medium">
                          USD
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                          {totalPrecioTotal.toFixed(2)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1  gap-6">
                {/* Tabla de productos basada en quotationDetail/products con columnas guía */}
                <Card className="bg-white shadow-sm border-0 ring-1 ring-slate-200/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/60">
                            <th className="text-left p-4 text-sm font-semibold text-slate-700 w-16">
                              #
                            </th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700 w-32">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              Imagen
                            </div>
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700 min-w-64">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Producto
                            </div>
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700 w-40">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              Precio Xiao Yi
                            </div>
                          </th>
 
                          <th className="text-left p-4 text-sm font-semibold text-slate-700 w-48">
                            <div className="flex items-center gap-2">
                                <BoxesIcon className="h-4 w-4 text-green-600" />
                              CBM Total
                            </div>
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700 w-32">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-orange-600" />
                              Express
                            </div>
                          </th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700 w-40">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              Total
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                          {editablePendingProducts.map((product, index) => (
                            <tr
                              key={product.id}
                              className={`border-b border-slate-100 ${
                                index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                              }`}
                            >
                              <td className="p-4 py-6">
                                <div className="w-8 h-8 flex items-center justify-center text-sm font-semibold">
                                  {index + 1}
                                </div>
                            </td>
                              <td className="p-4 py-6">
                                <div className="w-16 h-16 bg-slate-100 border-2 border-slate-200 rounded-xl">
                                  Imagen
                                </div>
                            </td>
                              {/* INFORMACIÓN DEL PRODUCTO */}
                              <td className="p-4 py-6">
                                <div className="font-semibold text-slate-900">
                                  {product.name}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Badge className="text-center text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg py-1 mt-1">
                                      Cantidad
                                    </Badge>
                                    <div className="text-center">
                                      <EditableNumericField
                                        value={product.quantity}
                                        onChange={(value) => handlePendingProductChange(product.id, 'quantity', value)}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className="text-center text-xs font-medium text-red-800 bg-red-50 border border-red-200 rounded-lg py-1 mt-1">
                                      Cajas
                                    </Badge>
                                    <div className="text-center">
                                      <EditableNumericField
                                        value={product.boxes}
                                        onChange={(value) => handlePendingProductChange(product.id, 'boxes', value)}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className="text-center text-xs font-medium text-green-800 bg-green-50 border border-green-200 rounded-lg py-1 mt-1">
                                      URL
                                    </Badge>
                                    <div className="text-sm text-blue-600 truncate text-center">
                                      <a
                                        href={quotationDetail?.products?.find(p => p.id === product.id)?.url || ""}
                                        target="_blank"
                                        className="underline"
                                      >
                                        Ver link
                                      </a>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className="text-center text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200 rounded-lg py-1 mt-1">
                                      Tamaño
                                    </Badge>
                                    <div className="text-sm text-center">
                                      {quotationDetail?.products?.find(p => p.id === product.id)?.size || "-"}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className="text-center text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg py-1 mt-1">
                                    COLOR
                                  </Badge>
                                  <div className="flex items-center gap-2 justify-center">
                                    <Badge variant="secondary" className="uppercase">
                                      {quotationDetail?.products?.find(p => p.id === product.id)?.color || "-"}
                                    </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                                <div className="bg-blue-50/80 rounded-lg p-3 border border-blue-200/50 flex items-center flex-col justify-center">
                                  <div className="text-xs font-medium text-blue-600 mb-1">
                                    USD
                                  </div>
                                  <EditableNumericField
                                    value={product.priceXiaoYi}
                                    onChange={(value) => handlePendingProductChange(product.id, 'priceXiaoYi', value)}
                                  />
                              </div>
                            </td>
                            <td className="p-4">
                                <div className="bg-amber-50/80 rounded-lg p-3 border border-amber-200/50 flex items-center flex-col justify-center">
                                  <div className="text-xs font-medium text-amber-600 mb-1">
                                    CBM
                                  </div>
                                  <EditableNumericField
                                    value={product.cbmTotal}
                                    onChange={(value) => handlePendingProductChange(product.id, 'cbmTotal', value)}
                                  />
                              </div>
                            </td>
                            <td className="p-4">
                                <div className="bg-orange-50/80 rounded-lg p-3 border border-orange-200/50 flex items-center flex-col justify-center">
                                  <div className="text-xs font-medium text-orange-600 mb-1">
                                    USD
                                  </div>
                                  <EditableNumericField
                                    value={product.express}
                                    onChange={(value) => handlePendingProductChange(product.id, 'express', value)}
                                  />
                              </div>
                            </td>
                            <td className="p-4">
                                <div className="bg-green-50/80 rounded-lg p-3 border border-green-200/50 flex items-center flex-col justify-center">
                                  <div className="text-xs font-medium text-green-600 mb-1">
                                    USD
                                  </div>
                                  <div className="text-xl font-bold text-green-800">
                                    {product.total.toFixed(2)}
                                  </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
              </div>
            ) : (
              <>
              <div className="space-y-6 p-6 bg-white">
                {/* Información del Cliente */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Primera columna */}
                  <div className="space-y-4">
                    {/* Client Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Información del Cliente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 ">
                          <div className="space-y-2">
                            <Label htmlFor="nombre_cliente">Nombres: </Label>
                              <Input
                                id="nombre_cliente"
                                className="font-medium"
                              />
                              <Label htmlFor="apellidos_cliente">
                                Apellidos:{" "}
                              </Label>
                              <Input
                                id="apellidos_cliente"
                                className="font-medium"
                              />
                            <Label htmlFor="dni_cliente">DNI: </Label>
                            <Input id="dni_cliente" className="font-medium" />
                              <Label htmlFor="razon_social_cliente">
                                RAZON SOCIAL:{" "}
                              </Label>
                              <Input
                                id="razon_social_cliente"
                                className="font-medium"
                              />
                            <Label htmlFor="ruc_cliente">RUC: </Label>
                            <Input id="ruc_cliente" className="font-medium" />
                              <Label htmlFor="contacto_cliente">
                                CONTACTO:
                              </Label>
                              <Input
                                id="contacto_cliente"
                                className="font-medium"
                              />
                          </div>

                          <div className="space-y-2">
                            <div>
                              <Label htmlFor="advisor">Asesor(a) : </Label>
                                <Input
                                  id="advisor"
                                  value={nombre_asesor || ""}
                                />
                            </div>
                            <Label htmlFor="date">Fecha de respuesta:</Label>
                            <Input id="date" value={quotationDate} />
                            <div>
                                <Label htmlFor="service">
                                  Tipo de Servicio
                                </Label>
                              <Select
                                value={selectedServiceLogistic}
                                onValueChange={setSelectedServiceLogistic}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {serviciosLogisticos.map((servicio) => (
                                    <SelectItem
                                      key={servicio.value}
                                      value={servicio.value}
                                    >
                                      {servicio.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2"></div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Segunda columna */}
                  <div className="space-y-6">
                    {/* Cargo Details */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Package className="h-5 w-5 text-green-600" />
                          Detalles de Carga
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                          <div>
                            <Label htmlFor="cargoType">Tipo de Carga</Label>
                            <Select
                              value={selectedTypeLoad}
                              onValueChange={setSelectedTypeLoad}
                            >
                              <SelectTrigger className=" w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white w-full h-full">
                                {(isMaritimeService(selectedServiceLogistic)
                                  ? typeLoadMaritime
                                  : typeLoad
                                ).map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="commercialValue">
                              Valor Comercial
                            </Label>
                            <div className="relative">
                              <EditableNumericField
                                value={Number(
                                  dynamicValues.comercialValue.toFixed(2)
                                )}
                                onChange={(value) =>
                                  updateDynamicValue("comercialValue", value)
                                }
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                USD
                              </span>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="boxes">
                              {isMaritimeService(selectedServiceLogistic)
                                ? "Nro Bultos"
                                : "Cajas"}
                            </Label>
                            <EditableNumericField
                              value={
                                isMaritimeService(selectedServiceLogistic)
                                  ? dynamicValues.nroBultos
                                  : dynamicValues.cajas
                              }
                              onChange={(value) =>
                                updateDynamicValue(
                                  isMaritimeService(selectedServiceLogistic)
                                    ? "nroBultos"
                                    : "cajas",
                                  value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                          <div>
                            <Label htmlFor="kg">Peso (KG)</Label>
                            <EditableNumericField
                              value={dynamicValues.kg}
                                onChange={handleKgChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="ton">Peso (TON)</Label>
                            <EditableNumericField
                              value={dynamicValues.ton}
                              onChange={
                                isMaritimeService(selectedServiceLogistic)
                                  ? () => {}
                                    : (value) =>
                                        updateDynamicValue("ton", value)
                              }
                            />
                          </div>
                          {!isMaritimeService(selectedServiceLogistic) && (
                            <div>
                              <Label htmlFor="kv">K/V</Label>
                              <EditableNumericField
                                value={dynamicValues.kv}
                                onChange={(value) =>
                                  updateDynamicValue("kv", value)
                                }
                              />
                            </div>
                          )}
                          {isMaritimeService(selectedServiceLogistic) && (
                            <div>
                                <Label htmlFor="volumenCBM">
                                  Volumen (CBM)
                                </Label>
                              <EditableNumericField
                                value={dynamicValues.volumenCBM}
                                onChange={(value) =>
                                  updateDynamicValue("volumenCBM", value)
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <div className="space-y-2">
                            {/* Regimen */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="regimen">Régimen</Label>
                                <Select
                                  value={selectedRegimen}
                                  onValueChange={setSelectedRegimen}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {regimenOptions.map((regimen) => (
                                      <SelectItem
                                        key={regimen.value}
                                        value={regimen.value}
                                      >
                                        {regimen.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Pais de Origen */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="paisOrigen">
                                  País de Origen
                                </Label>
                                <Select
                                  value={selectedPaisOrigen}
                                  onValueChange={setSelectedPaisOrigen}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {paisesOrigen.map((pais) => (
                                      <SelectItem
                                        key={pais.value}
                                        value={pais.value}
                                      >
                                        {pais.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Pais de Destino */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="paisDestino">
                                  País de Destino
                                </Label>
                                <Select
                                  value={selectedPaisDestino}
                                  onValueChange={setSelectedPaisDestino}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {paisesDestino.map((pais) => (
                                      <SelectItem
                                        key={pais.value}
                                        value={pais.value}
                                      >
                                        {pais.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Aduana */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="aduana">Aduana</Label>
                                <Select
                                  value={selectedAduana}
                                  onValueChange={setSelectedAduana}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {aduana.map((aduan) => (
                                      <SelectItem
                                        key={aduan.value}
                                        value={aduan.value}
                                      >
                                        {aduan.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Naviera */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="naviera">Naviera</Label>
                                <Input
                                  id="naviera"
                                  value={naviera}
                                  onChange={(e) => setNaviera(e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {/* Puerto de salida */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="puertoSalida">
                                  Puerto de Salida
                                </Label>
                                <Select
                                  value={selectedPuertoSalida}
                                  onValueChange={setSelectedPuertoSalida}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {puertosSalida.map((puerto) => (
                                      <SelectItem
                                        key={puerto.value}
                                        value={puerto.value}
                                      >
                                        {puerto.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Puerto de destino */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="puertoDestino">
                                  Puerto de Destino
                                </Label>
                                <Select
                                  value={selectedPuertoDestino}
                                  onValueChange={setSelectedPuertoDestino}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {puertosDestino.map((puerto) => (
                                      <SelectItem
                                        key={puerto.value}
                                        value={puerto.value}
                                      >
                                        {puerto.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* T. Servicio */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="tipoServicio">
                                  T. Servicio
                                </Label>
                                <Select
                                  value={selectedTipoServicio}
                                  onValueChange={setSelectedTipoServicio}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tipoServicio.map((tipo) => (
                                      <SelectItem
                                        key={tipo.value}
                                        value={tipo.value}
                                      >
                                        {tipo.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Tiempo Transito */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="tiempoTransito">
                                  T. Tránsito
                                </Label>
                                <EditableNumericField
                                  value={tiempoTransito}
                                    onChange={(value) =>
                                      setTiempoTransito(value)
                                    }
                                />
                              </div>
                            )}

                            {/* Proforma Vigencia */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="proformaVigencia">
                                  Proforma Vigencia
                                </Label>
                                <Select
                                  value={selectedProformaVigencia}
                                  onValueChange={setSelectedProformaVigencia}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {proformaVigencia.map((vigencia) => (
                                      <SelectItem
                                        key={vigencia.value}
                                        value={vigencia.value}
                                      >
                                        {vigencia.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Primera Compra */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="firstPurchase"
                              checked={isFirstPurchase}
                              onCheckedChange={handleFirstPurchaseChange}
                            />
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700"
                            >
                              Es Primera Compra
                            </Badge>
                            {isFirstPurchase && (
                              <span className="text-xs text-green-600 font-semibold ml-2">
                                (Servicios exonerados y 50% descuento en
                                impuestos)
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div>
                  {/* Shipping Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Truck className="h-5 w-5 text-purple-600" />
                        Detalles de Envío
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {/* Primera columna */}
                        <div className="space-y-2">
                          {/* Courier */}
                          <div>
                            <Label htmlFor="courier">Courier</Label>
                            <Select
                              value={selectedCourier}
                              onValueChange={setSelectedCourier}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white w-full h-full">
                                {courier.map((courierOption) => (
                                  <SelectItem
                                    key={courierOption.value}
                                    value={courierOption.value}
                                  >
                                    {courierOption.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Incoterm */}
                          <div>
                            <Label htmlFor="incoterm">Incoterm</Label>
                            <Select
                              value={selectedIncoterm}
                              onValueChange={setSelectedIncoterm}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {incotermsOptions.map((incoterm) => (
                                  <SelectItem
                                    key={incoterm.value}
                                    value={incoterm.value}
                                  >
                                    {incoterm.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Flete / Cálculo Flete */}
                          <div>
                            <Label htmlFor="freight">
                              {isMaritimeService(selectedServiceLogistic)
                                ? "Cálculo Flete"
                                : "Flete"}
                            </Label>
                            <div className="relative">
                              <EditableNumericField
                                value={
                                  isMaritimeService(selectedServiceLogistic)
                                    ? dynamicValues.calculoFlete
                                    : dynamicValues.flete
                                }
                                onChange={(value) =>
                                  updateDynamicValue(
                                    isMaritimeService(selectedServiceLogistic)
                                      ? "calculoFlete"
                                      : "flete",
                                    value
                                  )
                                }
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                USD
                              </span>
                            </div>
                          </div>
                          {/* Desaduanaje */}

                          {!isMaritimeService(selectedServiceLogistic) && (
                            <div>
                              <Label htmlFor="customs">Desaduanaje</Label>
                              <div className="relative">
                                <EditableNumericField
                                  value={dynamicValues.desaduanaje}
                                  onChange={(value) =>
                                    updateDynamicValue("desaduanaje", value)
                                  }
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                  USD
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Moneda */}
                          <div>
                            <Label htmlFor="currency">Moneda</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">DÓLARES</SelectItem>
                                <SelectItem value="pen">SOLES</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Tipo de Cambio */}
                          <div>
                              <Label htmlFor="exchangeRate">
                                Tipo de Cambio
                              </Label>
                            <EditableNumericField
                              value={dynamicValues.tipoCambio}
                              onChange={(value) =>
                                updateDynamicValue("tipoCambio", value)
                              }
                            />
                          </div>
                        </div>

                        {/* Tercera columna */}
                        <div className="space-y-2">
                          {/* Servicio de Carga Consolidada */}

                          <div className="grid grid-cols-2 gap-2 text-sm justify-between items-center py-2 ">
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="exchangeRate">
                                Transporte Local China
                              </Label>
                              <EditableNumericField
                                  value={
                                    dynamicValues.transporteLocalChinaEnvio
                                  }
                                onChange={(value) =>
                                  updateDynamicValue(
                                    "transporteLocalChinaEnvio",
                                    value
                                  )
                                }
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="exchangeRate">
                                Transporte Local Cliente
                              </Label>
                              <EditableNumericField
                                value={
                                  dynamicValues.transporteLocalClienteEnvio
                                }
                                onChange={(value) =>
                                  updateDynamicValue(
                                    "transporteLocalClienteEnvio",
                                    value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <Separator />
                          <div className="space-y-3">
                            {/* FOB */}
                            <div className="grid grid-cols-2 gap-2 text-sm justify-between items-center py-2">
                              <div>FOB</div>
                              <div>
                                <span className="relative">
                                  <EditableNumericField
                                    value={dynamicValues.fob}
                                    onChange={(newValue) =>
                                      updateDynamicValue(
                                        "fob" as keyof typeof dynamicValues,
                                        newValue
                                      )
                                    }
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                    USD
                                  </span>
                                </span>
                              </div>
                            </div>
                            {/* Flete */}
                            <div className="grid grid-cols-2 gap-2 text-sm justify-between items-center py-2">
                              <div>FLETE</div>
                              <div>
                                <span className="relative">
                                  <EditableNumericField
                                    value={
                                        isMaritimeService(
                                          selectedServiceLogistic
                                        )
                                        ? maritimeFlete
                                        : dynamicValues.flete
                                    }
                                    onChange={(value) =>
                                      updateDynamicValue(
                                        isMaritimeService(
                                          selectedServiceLogistic
                                        )
                                          ? "calculoFlete"
                                          : "flete",
                                        value
                                      )
                                    }
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                    USD
                                  </span>
                                </span>
                              </div>
                            </div>
                            {/* Seguro */}
                            <div className="grid grid-cols-2 gap-2 text-sm justify-between items-center py-2">
                              <div>SEGURO</div>
                              <div>
                                <span className="relative">
                                  <EditableNumericField
                                    value={dynamicValues.seguro}
                                    onChange={(newValue) =>
                                      updateDynamicValue(
                                        "seguro" as keyof typeof dynamicValues,
                                        newValue
                                      )
                                    }
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                    USD
                                  </span>
                                </span>
                              </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-2 text-sm rounded-lg bg-green-200 p-2">
                              <div className="font-semibold">CIF</div>
                              <div className="text-center font-semibold">
                                USD {cif.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-6 p-6 bg-white">
                  {/* Servicio de Carga Consolidada */}
                  <div className="space-y-4">
                <ServiceConsolidationCard
                  title={getServiceName(selectedServiceLogistic)}
                      serviceFields={
                        Object.fromEntries(
                          Object.entries(
                            getServiceFields(selectedServiceLogistic)
                          ).map(([k, v]) => [k, v ?? 0])
                        ) as Record<string, number>
                      }
                  updateDynamicValue={(key, v) =>
                    updateDynamicValue(key as keyof typeof dynamicValues, v)
                  }
                  igvServices={igvServices}
                  totalServices={totalServices}
                />
                  </div>
                  <div className="space-y-4">
                    {/* Tax Obligations */}
                <TaxObligationsCard
                  adValoremRate={dynamicValues.adValoremRate}
                      setAdValoremRate={(v) =>
                        updateDynamicValue("adValoremRate", v)
                      }
                  igvRate={dynamicValues.igvRate}
                  setIgvRate={(v) => updateDynamicValue("igvRate", v)}
                  ipmRate={dynamicValues.ipmRate}
                  setIpmRate={(v) => updateDynamicValue("ipmRate", v)}
                  isMaritime={isMaritimeService(selectedServiceLogistic)}
                  antidumpingGobierno={dynamicValues.antidumpingGobierno}
                      setAntidumpingGobierno={(v) =>
                        updateDynamicValue("antidumpingGobierno", v)
                      }
                  antidumpingCantidad={dynamicValues.antidumpingCantidad}
                      setAntidumpingCantidad={(v) =>
                        updateDynamicValue("antidumpingCantidad", v)
                      }
                  iscRate={dynamicValues.iscRate}
                  setIscRate={(v) => updateDynamicValue("iscRate", v)}
                  values={{
                    adValorem,
                    igvFiscal,
                    ipm,
                    isc,
                    percepcion,
                    totalDerechosDolares,
                    totalDerechosSoles,
                  }}
                />
                </div>
              </div>

              <div className="space-y-6 p-6 bg-white">
                {/* Segunda sección - Gastos de Importación */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Import Expenses */}
                  <ImportExpensesCard
                    isMaritime={isMaritimeService(selectedServiceLogistic)}
                    values={{
                                  servicioConsolidadoMaritimoFinal,
                                  gestionCertificadoFinal,
                                  servicioInspeccionFinal,
                                  transporteLocalFinal,
                      totalDerechosDolaresFinal,
                                  desaduanajeFleteSaguro,
                        transporteLocalChinaEnvio:
                          dynamicValues.transporteLocalChinaEnvio,
                        transporteLocalClienteEnvio:
                          dynamicValues.transporteLocalClienteEnvio,
                      }}
                      exemptionState={
                        exemptionState as unknown as Record<string, boolean>
                      }
                      handleExemptionChange={(f, c) =>
                        handleExemptionChange(f as any, c)
                      }
                    applyExemption={applyExemption}
                    servicioConsolidadoFinal={servicioConsolidadoFinal}
                    separacionCargaFinal={separacionCargaFinal}
                    inspeccionProductosFinal={inspeccionProductosFinal}
                    shouldExemptTaxes={shouldExemptTaxes}
                    totalGastosImportacion={totalGastosImportacion}
                  />

                  {/* Resumen de Gastos de Importación */}
                  <ImportSummaryCard
                    selectedIncoterm={selectedIncoterm}
                    comercialValue={dynamicValues.comercialValue}
                    totalGastosImportacion={totalGastosImportacion}
                    inversionTotal={inversionTotal}
                    shouldExemptTaxes={shouldExemptTaxes}
                  />
                        </div>
                        </div>

              {/* Sección de Costeo Unitario integrada en la misma vista */}
              <div className="min-h-screen ">
                <div className="grid grid-cols-1 gap-6 ">
                  <EditableUnitCostTable
                    initialProducts={editableUnitCostProducts}
                    totalImportCosts={totalGastosImportacion}
                    onCommercialValueChange={handleCommercialValueChange}
                    isFirstPurchase={isFirstPurchase}
                    onProductsChange={handleUnitCostProductsChange}
                  />
                </div>
              </div>
              </>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <div className="flex gap-3">
              {/* Botón Enviar */}
              <div className="flex justify-end ">
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isLoading}
                      className="bg-orange-500 hover:bg-orange-600  text-white px-8 py-2 rounded-sm shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      Enviar
                    </Button>
                  }
                  title="Confirmar envío de cotización"
                  description={`¿Está seguro de enviar la cotización?`}
                  confirmText="Enviar"
                  cancelText="Cancelar"
                  onConfirm={handleSaveResponse}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de carga */}
      <SendingModal
        isOpen={isSendingModalOpen}
        onClose={() => setIsSendingModalOpen(false)}
      />
    </div>
  );
};

export default DetailsResponse;
