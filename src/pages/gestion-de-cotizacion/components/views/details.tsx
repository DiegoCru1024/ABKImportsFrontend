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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface";
import type { DetallesTabProps } from "../utils/interface";

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

const DetallesTab: React.FC<DetallesTabProps> = ({ selectedQuotationId }) => {
  //* Hook para obtener los detalles de la cotización - DEBE IR PRIMERO
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  const [id_usuario, setId_usuario] = useState<string | null>(null);
  useEffect(() => {
    //Obtener id_usuario del usuario logueado
    const id_usuario = obtenerUser().id_usuario;
    setId_usuario(id_usuario);
  }, []);

  //* Hook para crear respuesta de cotización
  const createQuotationResponseMutation = useCreateQuatitationResponse();

  //* Estado para la fecha de la cotización
  const [quotationDate, setQuotationDate] = useState<string>("");

  //* Estado de apertura de modal de respuesta
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

  //* Estado para el modal de envío
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);

  //* Estado para el servicio seleccionado
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");

  //* Estados para el sistema de respuestas
  const [selectedProduct, setSelectedProduct] =
    useState<ProductoResponseIdInterface | null>(null);

  //! Estado para almacenar los productos
  const [product, setProduct] = useState<ProductoResponseIdInterface[]>([]);

  //* Estados para productos editables
  const [editableProducts, setEditableProducts] = useState<
    ProductoResponseIdInterface[]
  >([]);

  //*Estado para obtener cantidad de productos
  const [totalProducts, setTotalProducts] = useState(0);

  //*Estado para obtener cantidad de productos respondidos
  const [respondedProducts, setRespondedProducts] = useState(0);

  //* Estados para los selectores
  const [selectedTypeLoad, setSelectedTypeLoad] = useState<string>("mixto");
  const [selectedCourier, setSelectedCourier] = useState<string>("ups");
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>("DDP");
  const [selectedServiceLogistic, setSelectedServiceLogistic] =
    useState<string>("Consolidado Express");

  //* Estados específicos para servicios marítimos
  const [selectedRegimen, setSelectedRegimen] = useState<string>(
    "importacion_consumo"
  );
  const [selectedPaisOrigen, setSelectedPaisOrigen] = useState<string>("china");
  const [selectedPaisDestino, setSelectedPaisDestino] =
    useState<string>("peru");
  const [selectedAduana, setSelectedAduana] = useState<string>("tacna");
  const [selectedPuertoSalida, setSelectedPuertoSalida] =
    useState<string>("shanghai");
  const [selectedPuertoDestino, setSelectedPuertoDestino] =
    useState<string>("callao");
  const [selectedTipoServicio, setSelectedTipoServicio] =
    useState<string>("directo");
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
      "Pendiente",
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
      "Pendiente",
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
        id_asesor: id_usuario || "",
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

  //* Establecer el primer servicio como seleccionado cuando se cargan los datos
  useEffect(() => {
    if (
      quotationDetail?.summaryByServiceType?.[0]?.service_type &&
      !selectedServiceType
    ) {
      setSelectedServiceType(
        quotationDetail.summaryByServiceType[0].service_type
      );
      setTotalProducts(quotationDetail.products.length);
      setRespondedProducts(
        quotationDetail.products
          .map((item) => item.statusResponseProduct)
          .filter(Boolean).length
      );
      setProduct(quotationDetail.products);
      setEditableProducts(quotationDetail.products);
    }
  }, [quotationDetail, selectedServiceType, isLoading]);

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
      }));
      setEditableUnitCostProducts(initialProducts);
    }
  }, [quotationDetail, editableUnitCostProducts.length]);

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

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="services">Servicios</TabsTrigger>
              <TabsTrigger value="unitCost">Costo Unitario</TabsTrigger>
            </TabsList>
            <TabsContent value="services">
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
                            <Label htmlFor="client">Nombres: </Label>
                            <Input id="client" className="font-medium" />
                            <Label htmlFor="client">Apellidos: </Label>
                            <Input id="client" className="font-medium" />
                            <Label htmlFor="client">DNI: </Label>
                            <Input id="client" className="font-medium" />
                            <Label htmlFor="client">RAZON SOCIAL: </Label>
                            <Input id="client" className="font-medium" />
                            <Label htmlFor="client">RUC: </Label>
                            <Input id="client" className="font-medium" />
                            <Label htmlFor="client">CONTACTO:</Label>
                            <Input id="client" className="font-medium" />
                          </div>

                          <div className="space-y-2">
                            <div>
                              <Label htmlFor="advisor">Asesor(a) : </Label>
                              <Input id="advisor" value="PAULO" />
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
                              onChange={
                                isMaritimeService(selectedServiceLogistic)
                                  ? handleKgChange
                                  : (value) => updateDynamicValue("kg", value)
                              }
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
                            <Label htmlFor="exchangeRate">Tipo de Cambio</Label>
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
                                value={dynamicValues.transporteLocalChinaEnvio}
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
                                      isMaritimeService(selectedServiceLogistic)
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Servicio de Carga Consolidada */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Plane className="h-5 w-5 text-blue-600" />
                          {getServiceName(selectedServiceLogistic)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="font-semibold text-sm mb-3">
                            AFECTO A IGV
                          </div>
                          {/* Campos dinámicos según el tipo de servicio */}
                          {Object.entries(
                            getServiceFields(selectedServiceLogistic)
                          ).map(([key, value]) => {
                            const fieldNames: { [key: string]: string } = {
                              servicioConsolidado: "SERVICIO CONSOLIDADO",
                              separacionCarga: "SEPARACION DE CARGA",
                              inspeccionProductos: "INSPECCION DE PRODUCTOS",
                              gestionCertificado:
                                "GESTION DE CERTIFICADO DE ORIGEN",
                              inspeccionProducto: "INSPECCION DE PRODUCTO",
                              inspeccionFabrica: "INSPECCION DE FABRICA",
                              transporteLocal: "TRANSPORTE A LOCAL",
                              otrosServicios: "OTROS SERVICIOS",
                            };

                            return (
                              <div
                                key={key}
                                className="grid grid-cols-2 gap-2 text-sm justify-between items-center py-2"
                              >
                                <div>{fieldNames[key]}</div>

                                <div>
                                  <span className="relative">
                                    <EditableNumericField
                                      value={value}
                                      onChange={(newValue) =>
                                        updateDynamicValue(
                                          key as keyof typeof dynamicValues,
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
                            );
                          })}
                          <Separator />
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-600">
                              IGV (18%)
                            </span>
                            <span className="font-medium">
                              {igvServices.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 bg-blue-50 px-3 rounded-lg">
                            <span className="font-medium text-blue-900">
                              Total del Servicio de Consolidación
                            </span>
                            <span className="font-bold text-blue-900">
                              USD {totalServices.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-4">
                    {/* Tax Obligations */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Calculator className="h-5 w-5 text-green-600" />
                          Obligaciones Fiscales
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid gap-3">
                          <div className="p-4 space-y-2">
                            <div className="font-semibold text-sm mb-3">
                              IMPUESTOS
                            </div>
                            {/* AD/VALOREM */}
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>AD/VALOREM</div>
                              <div className="text-right">
                                <div className="flex items-center justify-end">
                                  <EditableNumericField
                                    value={dynamicValues.adValoremRate}
                                    onChange={(value) =>
                                      updateDynamicValue("adValoremRate", value)
                                    }
                                  />
                                  <span className="ml-1">%</span>
                                </div>
                              </div>
                              <div className="text-right">USD</div>
                              <div className="text-right">
                                {adValorem.toFixed(2)}
                              </div>
                            </div>

                            {/* ANTIDUMPING - Solo para marítimo */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div className="grid grid-cols-4 gap-2 text-sm">
                                <div>ANTIDUMPING</div>
                                <div className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <EditableNumericField
                                      value={dynamicValues.antidumpingGobierno}
                                      onChange={(value) =>
                                        updateDynamicValue(
                                          "antidumpingGobierno",
                                          value
                                        )
                                      }
                                    />
                                    <span className="text-xs">x</span>
                                    <EditableNumericField
                                      value={dynamicValues.antidumpingCantidad}
                                      onChange={(value) =>
                                        updateDynamicValue(
                                          "antidumpingCantidad",
                                          value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="text-right">USD</div>
                                <div className="text-right">
                                  {antidumping.toFixed(2)}
                                </div>
                              </div>
                            )}

                            {/* ISC - Solo para marítimo */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div className="grid grid-cols-4 gap-2 text-sm">
                                <div>ISC</div>
                                <div className="text-right">
                                  <div className="flex items-center justify-end">
                                    <EditableNumericField
                                      value={dynamicValues.iscRate}
                                      onChange={(value) =>
                                        updateDynamicValue("iscRate", value)
                                      }
                                    />
                                    <span className="ml-1">%</span>
                                  </div>
                                </div>
                                <div className="text-right">USD</div>
                                <div className="text-right">
                                  {isc.toFixed(2)}
                                </div>
                              </div>
                            )}

                            {/* I.G.V */}
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>IGV</div>
                              <div className="text-right">
                                <div className="flex items-center justify-end">
                                  <EditableNumericField
                                    value={dynamicValues.igvRate}
                                    onChange={(value) =>
                                      updateDynamicValue("igvRate", value)
                                    }
                                  />
                                  <span className="ml-1">%</span>
                                </div>
                              </div>
                              <div className="text-right">USD</div>
                              <div className="text-right">
                                {igvFiscal.toFixed(2)}
                              </div>
                            </div>

                            {/* I.P.M */}
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>IPM</div>
                              <div className="text-right">
                                <div className="flex items-center justify-end">
                                  <EditableNumericField
                                    value={dynamicValues.ipmRate}
                                    onChange={(value) =>
                                      updateDynamicValue("ipmRate", value)
                                    }
                                  />
                                  <span className="ml-1">%</span>
                                </div>
                              </div>
                              <div className="text-right">USD</div>
                              <div className="text-right">{ipm.toFixed(2)}</div>
                            </div>

                            {/* PERCEPCION - Solo para marítimo */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div className="grid grid-cols-4 gap-2 text-sm">
                                <div>PERCEPCION</div>
                                <div className="text-right">
                                  <div className="flex items-center justify-end">
                                    <EditableNumericField
                                      value={dynamicValues.percepcionRate}
                                      onChange={(value) =>
                                        updateDynamicValue(
                                          "percepcionRate",
                                          value
                                        )
                                      }
                                    />
                                    <span className="ml-1">%</span>
                                  </div>
                                </div>
                                <div className="text-right">USD</div>
                                <div className="text-right">
                                  {percepcion.toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                            <span className="font-medium text-green-900">
                              Total de Derechos - Dólares
                            </span>
                            <span className="font-bold text-green-900">
                              USD {totalDerechosDolares.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                            <span className="font-medium text-green-900">
                              Total de Derechos - Soles
                            </span>
                            <span className="font-bold text-green-900">
                              S/. {totalDerechosSoles.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 bg-white">
                {/* Segunda sección - Gastos de Importación */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Import Expenses */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                        Gastos de Importación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {isMaritimeService(selectedServiceLogistic) ? (
                          // Gastos para servicios marítimos
                          <>
                            {/* Servicio Consolidado Marítimo */}

                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="servicioConsolidadoMaritimo"
                                  className="border-red-500 border-2"
                                  checked={
                                    exemptionState.servicioConsolidadoMaritimo
                                  }
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "servicioConsolidadoMaritimo",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  Servicio Consolidado Marítimo
                                  {(isFirstPurchase ||
                                    exemptionState.servicioConsolidadoMaritimo) && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>

                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  servicioConsolidadoMaritimoFinal,
                                  exemptionState.servicioConsolidadoMaritimo
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="gestionCertificado"
                                  className="border-red-500 border-2"
                                  checked={exemptionState.gestionCertificado}
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "gestionCertificado",
                                      checked as boolean
                                    )
                                  }
                                />

                                <span className="text-sm text-gray-600">
                                  Gestión de Certificado de Origen
                                  {(isFirstPurchase ||
                                    exemptionState.gestionCertificado) && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  gestionCertificadoFinal,
                                  exemptionState.gestionCertificado
                                ).toFixed(2)}
                              </span>
                            </div>
                            {/* Servicio de Inspección */}
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="servicioInspeccion"
                                  className="border-red-500 border-2"
                                  checked={exemptionState.servicioInspeccion}
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "servicioInspeccion",
                                      checked as boolean
                                    )
                                  }
                                />

                                <span className="text-sm text-gray-600">
                                  Servicio de Inspección
                                  {(isFirstPurchase ||
                                    exemptionState.servicioInspeccion) && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  servicioInspeccionFinal,
                                  exemptionState.servicioInspeccion
                                ).toFixed(2)}
                              </span>
                            </div>
                            {/* Transporte Local */}
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="transporteLocal"
                                  className="border-red-500 border-2"
                                  checked={exemptionState.transporteLocal}
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "transporteLocal",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  Transporte Local
                                  {(isFirstPurchase ||
                                    exemptionState.transporteLocal) && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  transporteLocalFinal,
                                  exemptionState.transporteLocal
                                ).toFixed(2)}
                              </span>
                            </div>
                            {/* Total de Derechos */}
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="totalDerechos"
                                  className="border-red-500 border-2"
                                  checked={exemptionState.totalDerechos}
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "totalDerechos",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  Total de Derechos
                                  {shouldExemptTaxes && (
                                    <span className="text-orange-600 text-xs ml-1">
                                      (AUTO-EXONERADO: Valor &lt; $200)
                                    </span>
                                  )}
                                  {!shouldExemptTaxes &&
                                    exemptionState.totalDerechos && (
                                      <span className="text-green-600 text-xs ml-1">
                                        (EXONERADO)
                                      </span>
                                    )}
                                  {!shouldExemptTaxes &&
                                    !exemptionState.totalDerechos &&
                                    isFirstPurchase && (
                                      <span className="text-green-600 text-xs ml-1">
                                        (-50%)
                                      </span>
                                    )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD {totalDerechosDolaresFinal.toFixed(2)}
                              </span>
                            </div>
                          </>
                        ) : (
                          // Gastos para servicios aéreos
                          <>
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="servicioConsolidadoAereo"
                                  className="border-red-500 border-2"
                                  checked={
                                    exemptionState.servicioConsolidadoAereo
                                  }
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "servicioConsolidadoAereo",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  Servicio Consolidado Aéreo
                                  {(isFirstPurchase ||
                                    exemptionState.servicioConsolidadoAereo) && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  servicioConsolidadoFinal,
                                  exemptionState.servicioConsolidadoAereo
                                ).toFixed(2)}
                              </span>
                            </div>
                            {/* Separación de Carga */}
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="separacionCarga"
                                  className="border-red-500 border-2"
                                  checked={exemptionState.separacionCarga}
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "separacionCarga",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  Separación de Carga
                                  {(isFirstPurchase ||
                                    exemptionState.separacionCarga) && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  separacionCargaFinal,
                                  exemptionState.separacionCarga
                                ).toFixed(2)}
                              </span>
                            </div>
                            {/* Inspección de Productos */}
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="inspeccionProductos"
                                  className="border-red-500 border-2"
                                  checked={exemptionState.inspeccionProductos}
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "inspeccionProductos",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  Inspección de Productos
                                  {(isFirstPurchase ||
                                    exemptionState.inspeccionProductos) && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  inspeccionProductosFinal,
                                  exemptionState.inspeccionProductos
                                ).toFixed(2)}
                              </span>
                            </div>
                            {/* AD/VALOREM + IGV + IPM */}
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="obligacionesFiscales"
                                  className="border-red-500 border-2"
                                  checked={exemptionState.obligacionesFiscales}
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "obligacionesFiscales",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  AD/VALOREM + IGV + IPM
                                  {shouldExemptTaxes && (
                                    <span className="text-orange-600 text-xs ml-1">
                                      (AUTO-EXONERADO: Valor &lt; $200)
                                    </span>
                                  )}
                                  {!shouldExemptTaxes &&
                                    exemptionState.obligacionesFiscales && (
                                      <span className="text-green-600 text-xs ml-1">
                                        (EXONERADO)
                                      </span>
                                    )}
                                  {!shouldExemptTaxes &&
                                    !exemptionState.obligacionesFiscales &&
                                    isFirstPurchase && (
                                      <span className="text-green-600 text-xs ml-1">
                                        (-50%)
                                      </span>
                                    )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD {totalDerechosDolaresFinal.toFixed(2)}
                              </span>
                            </div>
                            {/* Desaduanaje + Flete + Seguro */}
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="desaduanajeFleteSaguro"
                                  className="border-red-500 border-2"
                                  checked={
                                    exemptionState.desaduanajeFleteSaguro
                                  }
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "desaduanajeFleteSaguro",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  Desaduanaje + Flete + Seguro
                                  {exemptionState.desaduanajeFleteSaguro && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  desaduanajeFleteSaguro,
                                  exemptionState.desaduanajeFleteSaguro
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="transporteLocalChina"
                                  className="border-red-500 border-2"
                                  checked={exemptionState.transporteLocalChina}
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "transporteLocalChina",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  Transporte Local China
                                  {(isFirstPurchase ||
                                    exemptionState.transporteLocalChina) && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  dynamicValues.transporteLocalChinaEnvio,
                                  exemptionState.transporteLocalChina
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="transporteLocalCliente"
                                  className="border-red-500 border-2"
                                  checked={
                                    exemptionState.transporteLocalCliente
                                  }
                                  onCheckedChange={(checked) =>
                                    handleExemptionChange(
                                      "transporteLocalCliente",
                                      checked as boolean
                                    )
                                  }
                                />
                                <span className="text-sm text-gray-600">
                                  Transporte Local Cliente
                                  {(isFirstPurchase ||
                                    exemptionState.transporteLocalCliente) && (
                                    <span className="text-green-600 text-xs ml-1">
                                      (EXONERADO)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="font-medium">
                                USD{" "}
                                {applyExemption(
                                  dynamicValues.transporteLocalClienteEnvio,
                                  exemptionState.transporteLocalCliente
                                ).toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                        <Separator />
                        <div className="flex justify-between items-center py-2 bg-orange-50 px-3 rounded-lg">
                          <span className="font-medium text-orange-900">
                            Total Gastos de Importación
                          </span>
                          <span className="font-bold text-orange-900">
                            USD {totalGastosImportacion.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resumen de Gastos de Importación */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ChartBar className="h-5 w-5 text-orange-600" />
                        Resumen de Gastos de Importación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-2">
                        {/* Incoterm de Importacion */}
                        <div className="flex justify-between items-center py-2">
                          <span className="text-lg text-gray-600">
                            INCOTERM DE IMPORTACION
                          </span>
                          <span className="font-medium">
                            {selectedIncoterm}
                          </span>
                        </div>
                        {/* Valor de Compra Factura Comercial */}
                        <div className="flex justify-between items-center py-2">
                          <span className="text-lg text-gray-600">
                            VALOR DE COMPRA FACTURA COMERCIAL
                          </span>
                          <span className="font-medium">
                            USD {dynamicValues.comercialValue.toFixed(2)}
                          </span>
                        </div>
                        {/* Total Gastos de Importacion */}
                        <div className="flex justify-between items-center py-2">
                          <span className="text-lg text-gray-600">
                            TOTAL GASTOS DE IMPORTACION
                          </span>
                          <span className="font-medium">
                            USD {totalGastosImportacion.toFixed(2)}
                          </span>
                        </div>
                        <Separator />
                        {/* Inversion Total de Importacion */}
                        <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                          <span className="text-lg text-green-900">
                            INVERSION TOTAL DE IMPORTACION
                          </span>
                          <span className="font-medium text-green-900">
                            USD {inversionTotal.toFixed(2)}
                          </span>
                        </div>

                        {/* Botones de acción para DTO */}
                        <Separator className="my-4" />
                        <div className="flex flex-col gap-3">
                          {shouldExemptTaxes && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-orange-800">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span className="text-sm font-medium">
                                  Exoneración Automática Activa
                                </span>
                              </div>
                              <p className="text-xs text-orange-700 mt-1">
                                Los impuestos están exonerados automáticamente
                                porque el valor comercial es menor a $200.00
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="unitCost">
              <div className="min-h-screen ">
                <div className="grid grid-cols-1  gap-6 ">
                  <EditableUnitCostTable
                    initialProducts={editableUnitCostProducts}
                    totalImportCosts={totalGastosImportacion}
                    onCommercialValueChange={handleCommercialValueChange}
                    isFirstPurchase={isFirstPurchase}
                    onFirstPurchaseChange={handleFirstPurchaseChange}
                    onProductsChange={handleUnitCostProductsChange}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end mt-4">
            <div className="flex gap-3">
              <Button
                //onClick={handleGenerateDTO}
                variant="destructive"
                className="flex-1 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              {/* Botón Enviar */}
              <div className="flex justify-end mt-8">
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isLoading}
                      className="bg-orange-500 hover:bg-orange-600 animate-pulse text-white px-8 py-2 rounded-full  shadow-md flex items-center gap-2 disabled:opacity-50"
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

export default DetallesTab;
