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
import { formatCurrency } from "@/lib/functions";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface";
import type { DetallesTabProps } from "../utils/interface";

// Importar datos estáticos
import { 
  incotermsOptions, 
  serviciosLogisticos, 
  typeLoad, 
  courier 
} from "../utils/static";

import ResponseQuotation from "./response-quotation";

import EditableUnitCostTable from "./editableunitcosttable";
import UnitCostTable from "./unitcosttable";

// Productos de ejemplo
const productosEjemplo: ProductoResponseIdInterface[] = [
  {
    id: "1",
    name: "Laptop HP EliteBook 840",
    weight: "899.99",
    quantity: 2,
    url: "",
    comment: "Laptop empresarial con procesador Intel i7",
    size: "14 pulgadas",
    color: "Plateado",
    volume: "2.5 L",
    number_of_boxes: 1,
    attachments: [],
    statusResponseProduct: "",
    sendResponse: false,
  },
  {
    id: "2",
    name: "Mouse Logitech MX Master 3",
    weight: "79.99",
    quantity: 5,
    url: "",
    comment: "Mouse inalámbrico ergonómico",
    size: "Estándar",
    color: "Negro",
    volume: "0.3 L",
    number_of_boxes: 1,
    attachments: [],
    statusResponseProduct: "",
    sendResponse: false,
  },
  {
    id: "3",
    name: "Monitor Samsung 27'' 4K",
    weight: "299.99",
    quantity: 3,
    url: "",
    comment: "Monitor 4K UHD para oficina",
    size: "27 pulgadas",
    color: "Negro",
    volume: "15 L",
    number_of_boxes: 1,
    attachments: [],
    statusResponseProduct: "",
    sendResponse: false,
  },
  {
    id: "4",
    name: "Teclado Mecánico Keychron K2",
    weight: "129.99",
    quantity: 4,
    url: "",
    comment: "Teclado mecánico inalámbrico",
    size: "75%",
    color: "Gris",
    volume: "1.2 L",
    number_of_boxes: 1,
    attachments: [],
    statusResponseProduct: "",
    sendResponse: false,
  },
  {
    id: "5",
    name: "Auriculares Sony WH-1000XM4",
    weight: "349.99",
    quantity: 2,
    url: "",
    comment: "Auriculares con cancelación de ruido",
    size: "Over-ear",
    color: "Negro",
    volume: "2 L",
    number_of_boxes: 1,
    attachments: [],
    statusResponseProduct: "",
    sendResponse: false,
  },
];

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
  const [progress, setProgress] = useState(0);

  //* Estados para los selectores
  const [selectedTypeLoad, setSelectedTypeLoad] = useState<string>("mixto");
  const [selectedCourier, setSelectedCourier] = useState<string>("ups");
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>("DDP");
  const [selectedServiceLogistic, setSelectedServiceLogistic] = useState<string>("Consolidado Express");

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
    } else if (!quotationDetail && !isLoading) {
      // Si no hay datos de cotización, usar productos de ejemplo
      setEditableProducts(productosEjemplo);
      setTotalProducts(productosEjemplo.length);
      setSelectedServiceType("Consolidado Grupal");
    }
  }, [quotationDetail, selectedServiceType, isLoading]);

  //* Calcular progreso cuando cambien los productos respondidos
  useEffect(() => {
    setProgress(
      totalProducts > 0
        ? Math.round((respondedProducts / totalProducts) * 100)
        : 0
    );
  }, [totalProducts, respondedProducts]);

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
              <div className="space-y-6 p-6 bg-gray-50">
                {/* Información del Cliente */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="overflow-hidden">
                      <div className="bg-black text-white text-center py-2 font-semibold">
                        CLIENTE
                      </div>
                      <div className="bg-yellow-300 text-black text-center py-2 font-semibold text-lg">
                        PAULO
                      </div>
                    </div>

                    <Card className="overflow-hidden">
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
                        <div className="bg-purple-500 text-white text-center py-3 font-semibold">
                          <Select value={selectedTypeLoad} onValueChange={setSelectedTypeLoad}>
                            <SelectTrigger className="bg-purple-500 text-white border-none font-semibold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {typeLoad.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="bg-yellow-300 text-black text-center py-3 font-semibold">
                          USD 1,100.00
                        </div>
                        <div className="bg-white text-black text-center py-3 font-semibold border">
                          2
                        </div>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="grid grid-cols-3">
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
                        <div className="bg-amber-600 text-white text-center py-3 font-semibold">
                          <Select value={selectedCourier} onValueChange={setSelectedCourier}>
                            <SelectTrigger className="bg-amber-600 text-white border-none font-semibold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {courier.map((courierOption) => (
                                <SelectItem key={courierOption.value} value={courierOption.value}>
                                  {courierOption.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="bg-purple-400 text-white text-center py-3 font-semibold">
                          USD 500.00
                        </div>
                        <div className="bg-purple-400 text-white text-center py-3 font-semibold">
                          USD 89.90
                        </div>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="grid grid-cols-6">
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          KG
                        </div>
                        <div className="bg-white text-black text-center py-2 font-semibold border">
                          50
                        </div>
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          TON
                        </div>
                        <div className="bg-white text-black text-center py-2 font-semibold border">
                          0.05
                        </div>
                        <div className="bg-black text-white text-center py-2 font-semibold">
                          K/V
                        </div>
                        <div className="bg-white text-black text-center py-2 font-semibold border">
                          100
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Información de Proforma */}
                  <Card className="overflow-hidden">
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">N° PROFORMA</div>
                        <div className="text-center">:</div>
                        <div className="text-right font-semibold">
                          456456456
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">FECHA</div>
                        <div className="text-center">:</div>
                        <div className="text-right">7/21/2025</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">ASESOR(A)</div>
                        <div className="text-center">:</div>
                        <div className="text-right">SELECCIONA</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">T. SERVICIO</div>
                        <div className="text-center">:</div>
                        <div className="text-right">
                          <Select value={selectedServiceLogistic} onValueChange={setSelectedServiceLogistic}>
                            <SelectTrigger className="border-none p-0 h-auto bg-transparent text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {serviciosLogisticos.map((servicio) => (
                                <SelectItem key={servicio.value} value={servicio.value}>
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
                          <Select value={selectedIncoterm} onValueChange={setSelectedIncoterm}>
                            <SelectTrigger className="border-none p-0 h-auto bg-transparent text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {incotermsOptions.map((incoterm) => (
                                <SelectItem key={incoterm.value} value={incoterm.value}>
                                  {incoterm.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div></div>
                        <div className="text-center">:</div>
                        <div className="text-right"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">TIPO DE CAMBIO</div>
                        <div className="text-center"></div>
                        <div className="text-right">3.70</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold">MONEDA</div>
                        <div className="text-center">:</div>
                        <div className="text-right">DOLARES</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2 bg-yellow-200 p-2">
                        <div className="font-semibold">FOB</div>
                        <div className="text-center">:</div>
                        <div className="text-right font-semibold">
                          USD 1,100.00
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2 bg-yellow-200 p-2">
                        <div className="font-semibold">FLETE</div>
                        <div className="text-center">:</div>
                        <div className="text-right font-semibold">
                          USD 500.00
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
                        <div className="font-semibold text-blue-600">
                          SEGURO
                        </div>
                        <div className="text-center">:</div>
                        <div className="text-right text-blue-600 font-semibold">
                          USD 8.25
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm bg-green-200 p-2">
                        <div className="font-semibold">CIF</div>
                        <div className="text-center">:</div>
                        <div className="text-right font-semibold">
                          USD 1,608.25
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="space-y-6 p-6 bg-gray-50">
                {/* Primera sección - Servicio de Carga Consolidada Aérea */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="overflow-hidden">
                    <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                      SERVICIO DE CARGA CONSOLIDADA AEREA
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="font-semibold text-sm mb-3">
                        AFECTO A IGV
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>SERVICIO CONSOLIDADO</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">30.00</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>SEPARACION DE CARGA</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">0.00</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>INSPECCION DE PRODUCTOS</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">0.00</div>
                      </div>
                      <hr className="my-3" />
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
                        <div>IGV (18%)</div>
                        <div></div>
                        <div className="text-right">5.40</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
                        <div>TOTAL DEL SERVICIO DE CONSOLIDACION</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">35.40</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="overflow-hidden">
                    <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                      OBLIGACIONES FISCALES
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="font-semibold text-sm mb-3">
                        IMPUESTOS
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>AD/VALOREM</div>
                        <div className="text-right">4%</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">64.33</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>I.G.V</div>
                        <div className="text-right">16%</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">267.61</div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>I.P.M</div>
                        <div className="text-right">2%</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">33.45</div>
                      </div>
                      <hr className="my-3" />
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold bg-purple-200 p-2">
                        <div>TOTAL DE DERECHOS - DÓLARES</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">365.39</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
                        <div>TOTAL DE DERECHOS - SOLES</div>
                        <div className="text-right">S/.</div>
                        <div className="text-right">1351.96</div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Segunda sección - Gastos de Importación */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="overflow-hidden">
                    <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                      GASTOS DE IMPORTACION
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">
                          SERVICIO CONSOLIDADO AEREO
                        </div>
                        <div className="text-right">USD</div>
                        <div className="text-right">35.40</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">SEPARACION DE CARGA</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">-</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">
                          INSPECCION DE PRODUCTOS
                        </div>
                        <div className="text-right">USD</div>
                        <div className="text-right">-</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">AD/VALOREM+IGV+IPM</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">365.39</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm border-b pb-1">
                        <div className="font-semibold">
                          DESADUANAJE + FLETE+SEGURO
                        </div>
                        <div className="text-right">USD</div>
                        <div className="text-right">598.15</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm font-semibold bg-purple-200 p-2">
                        <div>TOTAL GASTOS DE IMPORTACION</div>
                        <div className="text-right">USD</div>
                        <div className="text-right">998.94</div>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <Card className="overflow-hidden">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        INCOTERM DE EXPORTACOIN FOB
                      </div>
                      <div className="bg-gray-800 text-white text-center py-1 font-semibold">
                        FOB
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        VALOR DE COMPRA FACTURA COMERCIAL
                      </div>
                      <div className="bg-yellow-400 text-black text-center py-2 font-semibold">
                        USD 1,100.00
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        TOTAL GASTOS DE IMPORTACION
                      </div>
                      <div className="bg-purple-200 text-black text-center py-2 font-semibold">
                        USD 998.94
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="bg-orange-500 text-white text-center py-2 font-semibold">
                        INVERSION TOTAL DE IMPORTACION
                      </div>
                      <div className="bg-green-200 text-black text-center py-2 font-semibold">
                        USD 2,098.94
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="unitCost">
            <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1  gap-6 py-8">
    

        <Tabs defaultValue="static" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="static">Vista Estática</TabsTrigger>
            <TabsTrigger value="editable">Vista Editable</TabsTrigger>
          </TabsList>

          <TabsContent value="static">
            <UnitCostTable />
          </TabsContent>

          <TabsContent value="editable">
            <EditableUnitCostTable />
          </TabsContent>
        </Tabs>
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
