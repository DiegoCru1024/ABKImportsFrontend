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
import { formatCurrency } from "@/lib/functions";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface";
import type { DetallesTabProps } from "../utils/interface";

// Importar datos estáticos
import {
  incotermsOptions,
  serviciosLogisticos,
  typeLoad,
  courier,
} from "../utils/static";

import ResponseQuotation from "./response-quotation";

import EditableUnitCostTable from "./editableunitcosttable";
import type { ProductRow } from "./editableunitcosttable";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/format-time";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const DetallesTab: React.FC<DetallesTabProps> = ({ selectedQuotationId }) => {
  //* Hook para obtener los detalles de la cotización - DEBE IR PRIMERO
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  //* Estado para la fecha de la cotización
  const [quotationDate, setQuotationDate] = useState<string>("");

  //* Estado de apertura de modal de respuesta
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);

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

    // Porcentajes de impuestos
    adValoremRate: 4.0,
    igvRate: 16.0,
    ipmRate: 2.0,
  });

  //* Estado para primera compra
  const [isFirstPurchase, setIsFirstPurchase] = useState(false);

  //* Estado para productos editables de la tabla de costeo unitario
  const [editableUnitCostProducts, setEditableUnitCostProducts] = useState<
    ProductRow[]
  >([]);

  //* Calcular CIF dinámicamente
  const cif = dynamicValues.fob + dynamicValues.flete + dynamicValues.seguro;

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

  //* Cálculos de obligaciones fiscales
  const adValorem = cif * (dynamicValues.adValoremRate / 100);
  const igvFiscal = (cif + adValorem) * (dynamicValues.igvRate / 100);
  const ipm = (cif + adValorem) * (dynamicValues.ipmRate / 100);
  const totalDerechosDolares = adValorem + igvFiscal + ipm;
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
    dynamicValues.desaduanaje + dynamicValues.flete + dynamicValues.seguro;

  // Aplicar 50% de descuento a impuestos si es primera compra
  const totalDerechosDolaresFinal = isFirstPurchase
    ? totalDerechosDolares * 0.5
    : totalDerechosDolares;

  const totalGastosImportacion =
    servicioConsolidadoFinal +
    separacionCargaFinal +
    inspeccionProductosFinal +
    totalDerechosDolaresFinal +
    desaduanajeFleteSaguro;

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
                                {typeLoad.map((type) => (
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
                            <Label htmlFor="boxes">Cajas</Label>
                            <EditableNumericField
                              value={dynamicValues.cajas}
                              onChange={(value) =>
                                updateDynamicValue("cajas", value)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                          <div>
                            <Label htmlFor="kg">Peso (KG)</Label>
                            <EditableNumericField
                              value={dynamicValues.kg}
                              onChange={(value) =>
                                updateDynamicValue("kg", value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="ton">Peso (TON)</Label>
                            <EditableNumericField
                              value={dynamicValues.ton}
                              onChange={(value) =>
                                updateDynamicValue("ton", value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="kv">K/V</Label>
                            <EditableNumericField
                              value={dynamicValues.kv}
                              onChange={(value) =>
                                updateDynamicValue("kv", value)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <div className="space-y-2">
                            {/* Regimen */}
                            <div>
                              <Label htmlFor="courier">Regimen</Label>
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
                            {/* Pais de Origen */}
                            <div>
                              <Label htmlFor="incoterm">Pais de Origen</Label>
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
                            {/* Pais de Destino */}
                            <div>
                              <Label htmlFor="incoterm">Pais de Destino</Label>
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

                            {/* Aduana */}
                            <div>
                              <Label htmlFor="freight">Aduana</Label>
                              <div className="relative">
                                <EditableNumericField
                                  value={dynamicValues.flete}
                                  onChange={(value) =>
                                    updateDynamicValue("flete", value)
                                  }
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                  USD
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {/* Puerto de salida */}
                            <div>
                              <Label htmlFor="courier">Puerto de Salida</Label>
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
                            {/* Puerto de destino */}
                            <div>
                              <Label htmlFor="incoterm">
                                Puerto de destino
                              </Label>
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

                            {/* T. Servicio */}
                            <div>
                              <Label htmlFor="freight">T. Servicio</Label>
                              <div className="relative">
                                <EditableNumericField
                                  value={dynamicValues.flete}
                                  onChange={(value) =>
                                    updateDynamicValue("flete", value)
                                  }
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                  USD
                                </span>
                              </div>
                            </div>
                            {/* Tiempo Transito */}
                            <div>
                              <Label htmlFor="customs">Tiempo Transito</Label>
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

                            {/* Moneda */}
                            <div>
                              <Label htmlFor="currency">
                                Proforma Vigencia
                              </Label>
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
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
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

                          {/* Flete */}
                          <div>
                            <Label htmlFor="freight">Flete</Label>
                            <div className="relative">
                              <EditableNumericField
                                value={dynamicValues.flete}
                                onChange={(value) =>
                                  updateDynamicValue("flete", value)
                                }
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                USD
                              </span>
                            </div>
                          </div>
                          {/* Desaduanaje */}
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
                          <div className="space-y-3">
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
                            <div className="grid grid-cols-2 gap-2 text-sm justify-between items-center py-2">
                              <div>FLETE</div>
                              <div>
                                <span className="relative">
                                  <EditableNumericField
                                    value={dynamicValues.flete}
                                    onChange={(newValue) =>
                                      updateDynamicValue(
                                        "flete" as keyof typeof dynamicValues,
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
                            {/* I.G.V */}
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>I.G.V</div>
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
                              <div>I.P.M</div>
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
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">
                            Servicio Consolidado Aéreo
                            {isFirstPurchase && (
                              <span className="text-green-600 text-xs ml-1">
                                (EXONERADO)
                              </span>
                            )}
                          </span>
                          <span className="font-medium">
                            USD {servicioConsolidadoFinal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">
                            Separación de Carga
                            {isFirstPurchase && (
                              <span className="text-green-600 text-xs ml-1">
                                (EXONERADO)
                              </span>
                            )}
                          </span>
                          <span className="font-medium">
                            USD {separacionCargaFinal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">
                            Inspección de Productos
                            {isFirstPurchase && (
                              <span className="text-green-600 text-xs ml-1">
                                (EXONERADO)
                              </span>
                            )}
                          </span>
                          <span className="font-medium">
                            USD {inspeccionProductosFinal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">
                            AD/VALOREM + IGV + IPM
                            {isFirstPurchase && (
                              <span className="text-green-600 text-xs ml-1">
                                (-50%)
                              </span>
                            )}
                          </span>
                          <span className="font-medium">
                            USD {totalDerechosDolaresFinal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">
                            Desaduanaje + Flete + Seguro
                          </span>
                          <span className="font-medium">
                            USD {desaduanajeFleteSaguro.toFixed(2)}
                          </span>
                        </div>
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

                  {/* Incoterm de Expdortación */}
                  <div className="space-y-4">
                    <div className="overflow-hidden border-1 rounded-sm">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        INCOTERM DE EXPORTACION
                      </div>
                      <div className=" text-center py-1 font-semibold">
                        {selectedIncoterm}
                      </div>
                    </div>

                    <div className="overflow-hidden border-1 rounded-sm">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        VALOR DE COMPRA FACTURA COMERCIAL
                      </div>
                      <div className="text-center py-2 font-semibold">
                        USD {dynamicValues.comercialValue.toFixed(2)}
                      </div>
                    </div>

                    <div className="overflow-hidden border-1 rounded-sm">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        TOTAL GASTOS DE IMPORTACION
                      </div>
                      <div className=" text-center py-2 font-semibold">
                        USD {totalGastosImportacion.toFixed(2)}
                      </div>
                    </div>

                    <div className="overflow-hidden border-1 rounded-sm">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        INVERSION TOTAL DE IMPORTACION
                      </div>
                      <div className=" text-center py-2 font-semibold bg-yellow-200">
                        USD {inversionTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
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
        </div>
      </div>

      <ResponseQuotation
        selectedProduct={selectedProduct}
        selectedQuotationId={selectedQuotationId}
        isResponseModalOpen={isResponseModalOpen}
        setIsResponseModalOpen={setIsResponseModalOpen}
      />
    </div>
  );
};

export default DetallesTab;
