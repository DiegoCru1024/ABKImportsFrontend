
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Calculator,


  Send,
  Loader2,
  PackageIcon,
  FileText,
  Package,
  Truck,
} from "lucide-react";


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
import { useGetDetailsResponse, usePatchQuatitationResponse } from "@/hooks/use-quatitation-response";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import SendingModal from "@/components/sending-modal";
import { useNavigate } from "react-router-dom";
import ServiceConsolidationCard from "./partials/ServiceConsolidationCard";
import ImportExpensesCard from "./partials/ImportExpensesCard";
import ImportSummaryCard from "./partials/ImportSummaryCard";
import TaxObligationsCard from "./partials/TaxObligationsCard";

const EditResponse = ({
  quotationId,
  quotationResponseId,
}: {
  quotationId: string;
  quotationResponseId: string;
}) => {
  const { data: detailsResponse, isLoading: isLoadingDetailsResponse, isError: isErrorDetails } =
    useGetDetailsResponse(quotationId, quotationResponseId);


    useEffect(() => {
      //Obtener id_usuario del usuario logueado
      const id_usuario = obtenerUser().id_usuario;
      setId_asesor(id_usuario);
    }, []);
  
    //* Hook para crear respuesta de cotización
    const patchQuotationResponseMutation = usePatchQuatitationResponse(quotationId, quotationResponseId);
  
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
  
      //********llamado a funcion para obtener datos del asesor */
      useEffect(() => {
        const user = obtenerUser();
        if (user) {
          setId_asesor(user?.id_usuario);
          setNombre_asesor(user?.name);
        }
      }, []);
  

    //* Función para enviar la respuesta al backend usando el hook
    const handleEditResponse = async () => {
      try {
        setIsSendingModalOpen(true);
        // Construir DTO mínimo desde estados actuales
        const dto = {
          quotationInfo: {
            quotationId,
            correlative: detailsResponse?.quotationInfo?.correlative || "",
            serviceType: detailsResponse?.quotationInfo?.serviceType || "",
          },
          dynamicValues: dynamicValues,
          serviceCalculations: detailsResponse?.serviceCalculations || {},
          unitCostProducts: editableUnitCostProducts,
        } as any;

        await patchQuotationResponseMutation.mutateAsync({ data: dto });
        console.log("Respuesta actualizada correctamente");
        // Volver al listado de respuestas de la misma cotización
        window.history.back();
      } catch (error) {
        console.error("Error al guardar la respuesta:", error);
      } finally {
        setIsSendingModalOpen(false);
      }
    };
  
    //* Obtener fecha actual de hoy
    useEffect(() => {
      const today = new Date();
      setQuotationDate(formatDate(today.toISOString()));
    }, []);
  
  
    //* Inicializar productos de la tabla de costeo unitario con los productos de la respuesta
    useEffect(() => {
      const unitProducts = detailsResponse?.unitCostProducts ?? [];
      if (unitProducts.length > 0) {
        const mapped = unitProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          quantity: Number(p.quantity) || 0,
          total: Number(p.total) || 0,
          equivalence: Number(p.equivalence) || 0,
          importCosts: Number(p.importCosts) || 0,
          totalCost: Number(p.totalCost) || 0,
          unitCost: Number(p.unitCost) || 0,
        }));
        setEditableUnitCostProducts(mapped);
      }
    }, [detailsResponse]);
  
  
    if (isLoadingDetailsResponse) {
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
  
    if (isErrorDetails || !detailsResponse) {
      return (
        <div className="p-6 text-center text-red-600">No se pudo cargar la respuesta.</div>
      );
    }


  return (
    <div className="space-y-6 p-4 min-h-screen ">
      {/* Header Bento Grid */}
      <div className="relative h-full w-full">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 gap-3 text-xl font-semibold">
              <PackageIcon className="w-7 h-7 text-blue-600" />
              Cotización {detailsResponse?.quotationInfo?.correlative || ""}
            </div>
          </div>

          <div className="w-full">
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
                              onChange={
                                handleKgChange
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
                  <ServiceConsolidationCard
                    title={getServiceName(selectedServiceLogistic)}
                    serviceFields={Object.fromEntries(
                      Object.entries(getServiceFields(selectedServiceLogistic)).map(([k, v]) => [k, v ?? 0])
                    ) as Record<string, number>}
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
                    setAdValoremRate={(v) => updateDynamicValue("adValoremRate", v)}
                    igvRate={dynamicValues.igvRate}
                    setIgvRate={(v) => updateDynamicValue("igvRate", v)}
                    ipmRate={dynamicValues.ipmRate}
                    setIpmRate={(v) => updateDynamicValue("ipmRate", v)}
                    isMaritime={isMaritimeService(selectedServiceLogistic)}
                    antidumpingGobierno={dynamicValues.antidumpingGobierno}
                    setAntidumpingGobierno={(v) => updateDynamicValue("antidumpingGobierno", v)}
                    antidumpingCantidad={dynamicValues.antidumpingCantidad}
                    setAntidumpingCantidad={(v) => updateDynamicValue("antidumpingCantidad", v)}
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
                      transporteLocalChinaEnvio: dynamicValues.transporteLocalChinaEnvio,
                      transporteLocalClienteEnvio: dynamicValues.transporteLocalClienteEnvio,
                    }}
                    exemptionState={exemptionState as unknown as Record<string, boolean>}
                    handleExemptionChange={(f, c) => handleExemptionChange(f as any, c)}
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
                    onFirstPurchaseChange={handleFirstPurchaseChange}
                    onProductsChange={handleUnitCostProductsChange}
                  />
                </div>
              </div>
          </div>
          <div className="flex justify-end mt-4">
            <div className="flex gap-3">
              {/* Botón Enviar */}
              <div className="flex justify-end ">
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isLoadingDetailsResponse}
                      className="bg-orange-500 hover:bg-orange-600  text-white px-8 py-2 rounded-sm shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoadingDetailsResponse ? (
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
                  onConfirm={handleEditResponse}
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

export default EditResponse;
