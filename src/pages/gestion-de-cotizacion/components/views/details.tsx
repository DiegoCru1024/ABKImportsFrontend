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

const DetallesTab: React.FC<DetallesTabProps> = ({ selectedQuotationId }) => {
  //* Hook para obtener los detalles de la cotización - DEBE IR PRIMERO
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

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
  const [editableUnitCostProducts, setEditableUnitCostProducts] = useState<ProductRow[]>([]);

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
      return "SERVICIO DE CARGA CONSOLIDADA AÉREA";
    } else if (
      serviceType === "Consolidado Maritimo" ||
      serviceType === "Consolidado Grupal Maritimo"
    ) {
      return "SERVICIO DE CARGA CONSOLIDADA (CARGA- ADUANA)";
    }
    return "SERVICIO DE CARGA CONSOLIDADA AÉREA"; // Por defecto
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
  const servicioConsolidadoFinal = isFirstPurchase ? 0 : dynamicValues.servicioConsolidado * 1.18;
  const separacionCargaFinal = isFirstPurchase ? 0 : dynamicValues.separacionCarga * 1.18;
  const inspeccionProductosFinal = isFirstPurchase ? 0 : dynamicValues.inspeccionProductos * 1.18;
  const desaduanajeFleteSaguro =
    dynamicValues.desaduanaje + dynamicValues.flete + dynamicValues.seguro;
  
  // Aplicar 50% de descuento a impuestos si es primera compra
  const totalDerechosDolaresFinal = isFirstPurchase ? totalDerechosDolares * 0.5 : totalDerechosDolares;
  
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
  const handleFirstPurchaseChange = (value: boolean) => {
    setIsFirstPurchase(value);
  };

  //* Función para manejar cambios en los productos de la tabla de costeo unitario
  const handleUnitCostProductsChange = (products: ProductRow[]) => {
    setEditableUnitCostProducts(products);
  };

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

  //!Importante:
  //! Función para renderizar campo editable
  const renderEditableField = (
    value: number,
    onChange: (value: number) => void,
    currency: string = "USD",
    step: number = 0.01
  ) => (
    <Input
      type="number" 
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="text-center font-semibold border-none bg-transparent h-auto p-1 text-sm"
      step={step}
      onFocus={(e) => e.target.select()}
    />
  );

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
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-lg ">
                      <div className="bg-black text-white text-center py-2 font-semibold">
                        CLIENTE
                      </div>
                      <div className=" text-black bg-white text-center py-2 font-semibold text-lg">
                        PAULO
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg">
                      <div className="grid grid-cols-3">
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          TIPO DE CARGA
                        </div>
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          VALOR COMERCIAL
                        </div>
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          CAJAS
                        </div>
                      </div>
                      <div className="grid grid-cols-3">
                        {/* Tipo de carga */}
                        <div className=" text-center py-3 bg-white font-semibold w-full  h-full border ">
                          <Select
                            value={selectedTypeLoad}
                            onValueChange={setSelectedTypeLoad}
                          >
                            <SelectTrigger className=" border-none font-semibold w-full h-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white w-full h-full">
                              {typeLoad.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Valor comercial */}
                        <div className="bg-white border text-black text-center py-3 font-semibold">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">USD</span>
                            {renderEditableField(
                              dynamicValues.comercialValue,
                              (value) =>
                                updateDynamicValue("comercialValue", value)
                            )}
                          </div>
                        </div>
                        {/* Cajas */}
                        <div className="bg-white text-black text-center py-3 font-semibold border">
                          {renderEditableField(dynamicValues.cajas, (value) =>
                            updateDynamicValue("cajas", value)
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden">
                      <div className="grid grid-cols-3 w-full  h-full border">
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          COURIER
                        </div>
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          FLETE
                        </div>
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          DESADUANAJE
                        </div>
                      </div>
                      <div className="grid grid-cols-3">
                        {/* Courier */}
                        <div className="  text-center font-semibold w-full h-full border">
                          <Select
                            value={selectedCourier}
                            onValueChange={setSelectedCourier}
                          >
                            <SelectTrigger className="  border-none font-semibold w-full h-full">
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
                        {/* Flete */}
                        <div className="bg-white border text-black text-center py-3 font-semibold">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">USD</span>
                            <EditableNumericField
                              value={dynamicValues.flete}
                              onChange={(value) =>
                                updateDynamicValue("flete", value)
                              }
                            />
                          </div>
                        </div>
                        {/* Desaduanaje */}
                        <div className="bg-white border text-black text-center py-3 font-semibold">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">USD</span>
                            <EditableNumericField
                              value={dynamicValues.desaduanaje}
                              onChange={(value) =>
                                updateDynamicValue("desaduanaje", value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-lg">
                      <div className="grid grid-cols-6 w-full  h-full border">
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          KG
                        </div>
                        <div className="bg-white border text-black text-center py-2 font-semibold">
                        <EditableNumericField
                              value={dynamicValues.kg}
                              onChange={(value) =>
                                updateDynamicValue("kg", value)
                              }
                            />
                        </div>
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          TON
                        </div>
                        <div className="bg-white border text-black text-center py-2 font-semibold">
                          <EditableNumericField
                            value={dynamicValues.ton}
                            onChange={(value) =>
                              updateDynamicValue("ton", value)
                            }
                          />
                        </div>
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          K/V
                        </div>
                        <div className="bg-white border text-black text-center py-2 font-semibold">
                          <EditableNumericField
                            value={dynamicValues.kv}
                            onChange={(value) =>
                              updateDynamicValue("kv", value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de Proforma */}
                  <div className="overflow-hidden">
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">FECHA</div>
                        <div className="text-center">:</div>
                        <div className="text-right">7/21/2025</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">ASESOR(A)</div>
                        <div className="text-center">:</div>
                        <div className="text-center">PAULO</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">T. SERVICIO</div>
                        <div className="text-center">:</div>
                        <div className="text-right">
                          <Select
                            value={selectedServiceLogistic}
                            onValueChange={setSelectedServiceLogistic}
                          >
                            <SelectTrigger className="border-none p-0 h-auto bg-transparent text-sm">
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
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">INCOTERM</div>
                        <div className="text-center">:</div>
                        <div className="text-right">
                          <Select
                            value={selectedIncoterm}
                            onValueChange={setSelectedIncoterm}
                          >
                            <SelectTrigger className="border-none p-0 h-auto bg-transparent text-sm">
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
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">TIPO DE CAMBIO</div>
                        <div className="text-center"></div>
                        <div className="text-right">
                          <EditableNumericField
                            value={dynamicValues.tipoCambio}
                            onChange={(value) =>
                              updateDynamicValue("tipoCambio", value)
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">MONEDA</div>
                        <div className="text-center">:</div>
                        <div className="text-center">DOLARES</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2  p-2">
                        <div className="font-semibold">FOB</div>
                        <div className="text-center">:</div>
                        <div className="text-right font-semibold">
                          <div className="flex items-center justify-end">
                            <span className="mr-1">USD</span>
                            <EditableNumericField
                              value={dynamicValues.fob}
                              onChange={(value) =>
                                updateDynamicValue("fob", value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2  p-2">
                        <div className="font-semibold">FLETE</div>
                        <div className="text-center">:</div>
                        <div className="text-right font-semibold">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">USD</span>
                            <EditableNumericField
                              value={dynamicValues.flete}
                              onChange={(value) =>
                                updateDynamicValue("flete", value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold text-blue-600">
                          SEGURO
                        </div>
                        <div className="text-center">:</div>
                        <div className="text-right text-blue-600 font-semibold">
                          <div className="flex items-center justify-end">
                            <span className="mr-1">USD</span>
                            <EditableNumericField
                              value={dynamicValues.seguro}
                              onChange={(value) =>
                                updateDynamicValue("seguro", value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm bg-green-200 p-2">
                        <div className="font-semibold">CIF</div>
                        <div className="text-center">:</div>
                        <div className="text-center font-semibold">
                          USD {cif.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 bg-white">
                {/* Primera sección - Servicio de Carga Consolidada */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="overflow-hidden rounded-sm">
                    <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                      {getServiceName(selectedServiceLogistic)}
                    </div>
                    <div className="p-4 space-y-2">
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
                            className="grid grid-cols-3 gap-2 text-sm"
                          >
                            <div>{fieldNames[key]}</div>
                            <div className="text-right">USD</div>
                            <div className="text-right">
                              <EditableNumericField
                                value={value}
                                onChange={(newValue) =>
                                  updateDynamicValue(
                                    key as keyof typeof dynamicValues,
                                    newValue
                                  )
                                }
                              />
                            </div>
                          </div>
                        );
                      })}

                      <hr className="my-3" />
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
                        <div>IGV (18%)</div>
                        <div></div>
                        <div className="text-right">
                          {igvServices.toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
                        <div>
                          {selectedServiceLogistic === "Consolidado Maritimo" ||
                          selectedServiceLogistic ===
                            "Consolidado Grupal Maritimo"
                            ? "TOTAL DE SERVICIO DE CARGA Y DESADUANAJE"
                            : "TOTAL DEL SERVICIO DE CONSOLIDACION"}
                        </div>
                        <div className="text-right">USD</div>
                        <div className="text-right">
                          {totalServices.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-sm">
                    <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                      OBLIGACIONES FISCALES
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="font-semibold text-sm mb-3">
                        IMPUESTOS
                      </div>
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
                        <div className="text-right">{adValorem.toFixed(2)}</div>
                      </div>
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
                        <div className="text-right">{igvFiscal.toFixed(2)}</div>
                      </div>
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
                      <hr className="my-3" />
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold p-2">
                        <div>TOTAL DE DERECHOS - DÓLARES</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">
                          {totalDerechosDolares.toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
                        <div>TOTAL DE DERECHOS - SOLES</div>
                        <div className="text-right">S/.</div>
                        <div className="text-right">
                          {totalDerechosSoles.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Segunda sección - Gastos de Importación */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="overflow-hidden rounded-sm">
                    <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                      GASTOS DE IMPORTACION
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">
                          SERVICIO CONSOLIDADO AEREO
                          {isFirstPurchase && <span className="text-green-600 text-xs ml-1">(EXONERADO)</span>}
                        </div>
                        <div className="text-right">USD</div>
                        <div className="text-right">
                          {isFirstPurchase ? "0.00" : servicioConsolidadoFinal.toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">
                          SEPARACION DE CARGA
                          {isFirstPurchase && <span className="text-green-600 text-xs ml-1">(EXONERADO)</span>}
                        </div>
                        <div className="text-right">USD</div>
                        <div className="text-right">
                          {isFirstPurchase ? "0.00" : separacionCargaFinal.toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">
                          INSPECCION DE PRODUCTOS
                          {isFirstPurchase && <span className="text-green-600 text-xs ml-1">(EXONERADO)</span>}
                        </div>
                        <div className="text-right">USD</div>
                        <div className="text-right">
                          {isFirstPurchase ? "0.00" : inspeccionProductosFinal.toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">
                          AD/VALOREM+IGV+IPM
                          {isFirstPurchase && <span className="text-green-600 text-xs ml-1">(-50%)</span>}
                        </div>
                        <div className="text-right">USD</div>
                        <div className="text-right">
                          {totalDerechosDolaresFinal.toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">
                          DESADUANAJE + FLETE+SEGURO
                        </div>
                        <div className="text-right">USD</div>
                        <div className="text-right">
                          {desaduanajeFleteSaguro.toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold bg-purple-200 p-2">
                        <div>TOTAL GASTOS DE IMPORTACION</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">
                          {totalGastosImportacion.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-sm">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        INCOTERM DE EXPORTACION
                      </div>
                      <div className="bg-gray-800 text-white text-center py-1 font-semibold">
                        {selectedIncoterm}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-sm">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        VALOR DE COMPRA FACTURA COMERCIAL
                      </div>
                      <div className="bg-yellow-400 text-black text-center py-2 font-semibold">
                        USD {dynamicValues.comercialValue.toFixed(2)}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-sm">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        TOTAL GASTOS DE IMPORTACION
                      </div>
                      <div className="bg-purple-200 text-black text-center py-2 font-semibold">
                        USD {totalGastosImportacion.toFixed(2)}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-sm">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        INVERSION TOTAL DE IMPORTACION
                      </div>
                      <div className="bg-green-200 text-black text-center py-2 font-semibold">
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
                    products={quotationDetail?.products || []}
                    totalImportCosts={totalGastosImportacion}
                    onCommercialValueChange={handleCommercialValueChange}
                    isFirstPurchase={isFirstPurchase}
                    onFirstPurchaseChange={handleFirstPurchaseChange}
                    initialProducts={editableUnitCostProducts}
                    onProductsChange={handleUnitCostProductsChange}
                  />

                  {/*<Tabs defaultValue="static" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="static">Vista Estática</TabsTrigger>
                      <TabsTrigger value="editable">Vista Editable</TabsTrigger>
                    </TabsList>

                    <TabsContent value="static">
                      <UnitCostTable 
                        products={quotationDetail?.products || productosEjemplo}
                        totalImportCosts={totalGastosImportacion}
                      />
                    </TabsContent>

                    <TabsContent value="editable">
                      
                    </TabsContent>
                  </Tabs>*/}
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
