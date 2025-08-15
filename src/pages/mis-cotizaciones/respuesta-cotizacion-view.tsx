"use client";
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/table/data-table";
import {
  Calendar,
  Calculator,
  FileText,
  Clock,
  Receipt,
  Settings,
  User,
  MessageSquare,
  Palette,
  Ruler,
  Package,
  Eye,
  ChartBar,
  DollarSign,
  Link,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetQuotationById } from "@/hooks/use-quation";
import { useGetQuatitationResponse } from "@/hooks/use-quatitation-response";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/functions";
import UrlImageViewerModal from "./components/UrlImageViewerModal";
import { formatDate, formatDateTime } from "@/lib/format-time";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { ProductRow } from "@/pages/gestion-de-cotizacion/components/views/editableunitcosttable";
import { columnsUnitCost } from "./components/table/columnsUnitCost";

interface ResponseCotizacionViewProps {
  selectedQuotationId: string;
}

const ResponseCotizacionView: React.FC<ResponseCotizacionViewProps> = ({
  selectedQuotationId,
}) => {
  // ✅ TODOS LOS HOOKS Y ESTADOS VAN PRIMERO

  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  // Hook para obtener las respuestas de cotización
  const {
    data: quotationResponses,
    isLoading: isLoadingResponses,
    isError: isErrorResponses,
  } = useGetQuatitationResponse(selectedQuotationId);

  const [selectedResponseTab, setSelectedResponseTab] = useState<string>("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState<string[]>(
    []
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalProductName, setModalProductName] = useState("");
  const [productsList, setProductsList] = useState<ProductRow[]>([]);

  const [openImageModal, setOpenImageModal] = useState<boolean>(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // ✅ TODA LA LÓGICA Y FUNCIONES QUE USAN LOS HOOKS TAMBIÉN VAN AQUÍ

  // Función para recalcular productos (necesaria para el useEffect)
  const recalculateProducts = (updatedProducts: ProductRow[]) => {
    const totalCommercialValue = updatedProducts.reduce(
      (sum, product) => sum + (product.total || 0),
      0
    );
    const recalculatedProducts = updatedProducts.map((product) => {
      const equivalence =
        totalCommercialValue > 0
          ? ((product.total || 0) / totalCommercialValue) * 100
          : 0;
      const importCosts = (equivalence / 100) * 0.0; // Tu lógica aquí
      const totalCost = (product.total || 0) + importCosts;
      const unitCost = product.quantity > 0 ? totalCost / product.quantity : 0;
      return {
        ...product,
        equivalence: Math.round(equivalence * 100) / 100,
        importCosts: Math.round(importCosts * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        unitCost: Math.round(unitCost * 100) / 100,
      };
    });
    return recalculatedProducts;
  };

  useEffect(() => {
    // Si hay respuestas, usar los unitCostProducts de la respuesta seleccionada
    if (
      quotationResponses &&
      quotationResponses.length > 0 &&
      selectedResponseTab
    ) {
      const response = quotationResponses.find(
        (r) => r.serviceType === selectedResponseTab
      );
      const mapped: ProductRow[] = (response?.unitCostProducts || []).map(
        (p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          quantity: Number(p.quantity) || 0,
          total: Number(p.total) || 0,
          equivalence: Number(p.equivalence) || 0,
          importCosts: Number(p.importCosts) || 0,
          totalCost: Number(p.totalCost) || 0,
          unitCost: Number(p.unitCost) || 0,
          seCotiza: p.seCotiza !== undefined ? p.seCotiza : true,
        })
      );
      setProductsList(mapped);
      return;
    }
    // Fallback: mostrar productos de la cotización si no hay respuestas
    if (quotationDetail?.products && quotationDetail.products.length > 0) {
      const initialProducts = quotationDetail.products.map((p) => ({
        id: p.id,
        name: p.name,
        price: 0,
        quantity: p.quantity,
        total: 0,
        equivalence: 0,
        importCosts: 0,
        totalCost: 0,
        unitCost: 0,
        seCotiza: true,
      }));
      const recalculated = recalculateProducts(initialProducts);
      setProductsList(recalculated);
    }
  }, [quotationResponses, quotationDetail?.products, selectedResponseTab]);

  // useEffect para establecer la primera respuesta como seleccionada
  useEffect(() => {
    if (
      quotationResponses &&
      quotationResponses.length > 0 &&
      !selectedResponseTab
    ) {
      console.log("Jas",JSON.stringify(quotationResponses,null,2 ));
      setSelectedResponseTab(quotationResponses[0].serviceType);
    }
  }, [quotationResponses, selectedResponseTab]);



  // El resto de tus funciones y cálculos
  const calculateFactorM = (products: ProductRow[]): number => {
    if (products.length === 0) return 0;
    const first = products[0];
    if (!first.price || !first.unitCost) return 0;
    return Number(first.price) / Number(first.unitCost);
  };

  const columns = columnsUnitCost();

  const totalQuantity = productsList.reduce(
    (sum, product) => sum + (product.quantity || 0),
    0
  );
  const totalAmount = productsList.reduce(
    (sum, product) => sum + (product.total || 0),
    0
  );
  const totalImportCostsSum = productsList.reduce(
    (sum, product) => sum + (product.importCosts || 0),
    0
  );
  const grandTotal = productsList.reduce(
    (sum, product) => sum + (product.totalCost || 0),
    0
  );
  const factorM = calculateFactorM(productsList);

  // Función para obtener los conceptos de gastos según el tipo de servicio
  const getImportExpenseConcepts = (serviceType: string) => {
    const serviceTypeLower = serviceType.toLowerCase();
    
    // Para servicios aéreos/express y almacenaje
    if (serviceTypeLower.includes('express') || 
        serviceTypeLower.includes('aereo') || 
        serviceTypeLower.includes('aéreo') ||
        serviceTypeLower.includes('almacenaje')) {
      return [
        { 
          key: 'servicioConsolidado', 
          label: 'Servicio Consolidado Aéreo',
          path: 'serviceCalculations.importExpenses.finalValues.servicioConsolidado'
        },
        { 
          key: 'separacionCarga', 
          label: 'Separación de Carga',
          path: 'serviceCalculations.importExpenses.finalValues.separacionCarga'
        },
        { 
          key: 'inspeccionProductos', 
          label: 'Inspección de Productos',
          path: 'serviceCalculations.importExpenses.finalValues.inspeccionProductos'
        },
        { 
          key: 'desaduanajeFleteSaguro', 
          label: 'Desaduanaje + Flete + Seguro',
          path: 'serviceCalculations.importExpenses.finalValues.desaduanajeFleteSaguro'
        },
        { 
          key: 'transporteLocalChina', 
          label: 'Transporte Local China',
          path: 'serviceCalculations.importExpenses.finalValues.transporteLocalChina'
        },
        { 
          key: 'transporteLocalCliente', 
          label: 'Transporte Local Cliente',
          path: 'serviceCalculations.importExpenses.finalValues.transporteLocalCliente'
        },
        { 
          key: 'totalDerechosDolaresFinal', 
          label: 'AD/VALOREM + IGV + IPM',
          path: 'serviceCalculations.fiscalObligations.totalDerechosDolaresFinal'
        }
      ];
    }
    
    // Para servicios marítimos
    if (serviceTypeLower.includes('maritimo') || 
        serviceTypeLower.includes('marítimo') ||
        serviceTypeLower.includes('grupal')) {
      return [
        { 
          key: 'servicioConsolidado', 
          label: 'Servicio Consolidado Marítimo',
          path: 'serviceCalculations.importExpenses.finalValues.servicioConsolidado'
        },
        { 
          key: 'gestionCertificado', 
          label: 'Gestión de Certificado de Origen',
          path: 'serviceCalculations.importExpenses.finalValues.gestionCertificado'
        },
        { 
          key: 'servicioInspeccion', 
          label: 'Servicio de Inspección',
          path: 'serviceCalculations.importExpenses.finalValues.servicioInspeccion'
        },
        { 
          key: 'transporteLocal', 
          label: 'Transporte Local',
          path: 'serviceCalculations.importExpenses.finalValues.transporteLocal'
        },
        { 
          key: 'totalDerechosDolaresFinal', 
          label: 'Total de Derechos',
          path: 'serviceCalculations.fiscalObligations.totalDerechosDolaresFinal'
        }
      ];
    }
    
    // Fallback para otros tipos de servicio
    return [
      { 
        key: 'servicioConsolidado', 
        label: 'Servicio Consolidado',
        path: 'serviceCalculations.importExpenses.finalValues.servicioConsolidado'
      },
      { 
        key: 'separacionCarga', 
        label: 'Separación de Carga',
        path: 'serviceCalculations.importExpenses.finalValues.separacionCarga'
      },
      { 
        key: 'inspeccionProductos', 
        label: 'Inspección de Productos',
        path: 'serviceCalculations.importExpenses.finalValues.inspeccionProductos'
      },
      { 
        key: 'gestionCertificado', 
        label: 'Gestión de Certificado',
        path: 'serviceCalculations.importExpenses.finalValues.gestionCertificado'
      },
      { 
        key: 'desaduanajeFleteSaguro', 
        label: 'Desaduanaje + Flete + Seguro',
        path: 'serviceCalculations.importExpenses.finalValues.desaduanajeFleteSaguro'
      },
      { 
        key: 'transporteLocalChina', 
        label: 'Transporte Local China',
        path: 'serviceCalculations.importExpenses.finalValues.transporteLocalChina'
      },
      { 
        key: 'transporteLocalCliente', 
        label: 'Transporte Local Cliente',
        path: 'serviceCalculations.importExpenses.finalValues.transporteLocalCliente'
      }
    ];
  };

  // Función para obtener valor anidado de un objeto usando un path de string
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || 0;
  };

  // Función para renderizar respuesta de tipo "Pendiente"
  const renderPendingResponse = (response: any) => {
    if (!response || !response.pendingProducts) return null;

    // Calcular sumatorias para tipo "Pendiente"
    const totalExpressAirFreight = response.pendingCalculations?.totalExpressAirFreight || 0;
    const totalAgenteXiaoYi = response.pendingCalculations?.totalAgenteXiaoYi || 0;
    const totalPrecioTotal = response.pendingCalculations?.totalPrecioTotal || 0;

    return (
      <div className="space-y-6">
        {/* Resumen de totales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* SHIPMENT */}
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-2">SHIPMENT</div>
              <div className="flex items-center gap-2">
                <select className="bg-transparent border-none text-white text-sm font-medium">
                  <option>UPS</option>
                </select>
                <div className="text-lg font-bold">USD 0.00</div>
              </div>
            </CardContent>
          </Card>

          {/* EXPRESS AIR FREIGHT */}
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-2">EXPRESS AIR FREIGHT</div>
              <div className="text-lg font-bold">USD {totalExpressAirFreight.toFixed(2)}</div>
            </CardContent>
          </Card>

          {/* TOTAL AGENTE XIAO YI */}
          <Card className="bg-gradient-to-r from-purple-400 to-purple-300 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-2">TOTAL AGENTE XIAO YI</div>
              <div className="text-lg font-bold">USD {totalAgenteXiaoYi.toFixed(2)}</div>
            </CardContent>
          </Card>

          {/* PRECIO TOTAL */}
          <Card className="bg-gradient-to-r from-green-400 to-green-300 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-2">PRECIO TOTAL</div>
              <div className="text-lg font-bold">USD {totalPrecioTotal.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de productos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-center">
              PRODUCTOS - SERVICIO PENDIENTE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-left font-semibold text-gray-700">#</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Imagen</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Producto</th>
                    <th className="p-4 text-center font-semibold text-gray-700">$ Precio Xiao Yi</th>
                    <th className="p-4 text-center font-semibold text-gray-700">CBM Total</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Express</th>
                    <th className="p-4 text-center font-semibold text-gray-700">$ Total</th>
                  </tr>
                </thead>
                <tbody>
                  {response.pendingProducts?.map((product: any, index: number) => (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="p-4 py-6">
                        <div className="w-8 h-8 flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="p-4 py-6">
                        <div className="w-16 h-16 bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center">
                          <span className="text-xs text-gray-500">Imagen</span>
                        </div>
                      </td>
                      <td className="p-4 py-6">
                        <div className="space-y-2">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Cantidad:</span>
                              <span className="ml-1 font-medium">{product.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Cajas:</span>
                              <span className="ml-1 font-medium">{product.boxes}</span>
                            </div>
                          </div>
                          {product.url && (
                            <div className="text-sm">
                              <span className="text-gray-600">URL:</span>
                              <a href={product.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:text-blue-600">
                                Ver link
                              </a>
                            </div>
                          )}
                          {product.size && (
                            <div className="text-sm">
                              <span className="text-gray-600">Tamaño:</span>
                              <span className="ml-1 font-medium">{product.size}</span>
                            </div>
                          )}
                          {product.color && (
                            <div className="text-sm">
                              <span className="text-gray-600">COLOR:</span>
                              <span className="ml-1 font-medium">{product.color}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 py-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-800">
                            USD {product.priceXiaoYi?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 py-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-amber-800">
                            CBM {product.cbmTotal?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 py-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-800">
                            USD {product.express?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 py-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-800">
                            USD {product.total?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Función para renderizar las respuestas de importación
  const renderQuotationResponse = (response: any) => {
    if (!response) return null;

    // Si es tipo "Pendiente", mostrar vista específica
    if (response.serviceType === "Pendiente") {
      return renderPendingResponse(response);
    }

    const concepts = getImportExpenseConcepts(response.serviceType);

    return (
      <div className="space-y-4">
        {/* Gastos de Importación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
                Gastos de Importación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {concepts.map((concept) => (
                  <div key={concept.key} className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">
                      {concept.label}
                    </span>
                    <span className="font-medium">
                      USD {formatCurrency(getNestedValue(response, concept.path))}
                    </span>
                  </div>
                ))}

                <Separator />
                <div className="flex justify-between items-center py-2 bg-orange-50 px-3 rounded-lg">
                  <span className="font-medium text-orange-900">
                    Total Gastos de Importación
                  </span>
                  <span className="font-bold text-orange-900">
                    USD{" "}
                    {formatCurrency(
                      response.serviceCalculations?.importExpenses
                        ?.totalGastosImportacion || 0
                    )}
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
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg text-gray-600">
                    INCOTERM DE IMPORTACION
                  </span>
                  <span className="font-medium">{response.serviceType}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg text-gray-600">
                    VALOR DE COMPRA FACTURA COMERCIAL
                  </span>
                  <span className="font-medium">
                    USD {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg text-gray-600">
                    TOTAL GASTOS DE IMPORTACION
                  </span>
                  <span className="font-medium">
                    USD{" "}
                    {formatCurrency(
                      response.serviceCalculations?.importExpenses
                        ?.totalGastosImportacion || 0
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                  <span className="text-lg text-green-900">
                    INVERSION TOTAL DE IMPORTACION
                  </span>
                  <span className="font-medium text-green-900">
                    USD{" "}
                    {formatCurrency(
                      response.serviceCalculations?.totals?.inversionTotal || 0
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de costeo unitario de importación */}
        <div className="p-2 bg-gray-50 grid grid-cols-1">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-center flex-1">
                <div className="relative">
                  COSTEO UNITARIO DE IMPORTACIÓN - {response.serviceType}
                  <div className="absolute top-0 right-0 text-black px-3 py-1 text-sm font-bold">
                    <div className="text-xs">FACTOR M.</div>
                    <div>{factorM.toFixed(2)}</div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={response.unitCostProducts || []}
                pageInfo={{
                  pageNumber: 1,
                  pageSize: 10,
                  totalElements: response.unitCostProducts?.length || 0,
                  totalPages: 1,
                }}
                onPageChange={() => {}}
                onSearch={() => {}}
                searchTerm={""}
                isLoading={false}
                paginationOptions={{
                  showSelectedCount: false,
                  showPagination: false,
                  showNavigation: false,
                }}
                toolbarOptions={{
                  showSearch: false,
                  showViewOptions: false,
                }}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <Card className="h-20 w-full bg-gradient-to-r from-red-400 to-red-300 rounded-lg text-white">
                  <CardContent className="p-4 h-full flex flex-col justify-center">
                    <div className="text-3xl font-bold">{totalQuantity}</div>
                    <div className="text-sm opacity-90">Total Unidades</div>
                  </CardContent>
                </Card>
                <Card className="h-20 w-full bg-gradient-to-r from-blue-400 to-blue-300  rounded-lg text-white">
                  <CardContent className="p-4 h-full flex flex-col justify-center">
                    <div className="text-3xl font-bold">
                      {totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm opacity-90">Precio Total USD</div>
                  </CardContent>
                </Card>

                <Card className="h-20 w-full bg-gradient-to-r from-green-400 to-green-300 rounded-lg text-white">
                  <CardContent className="p-4 h-full flex flex-col justify-center">
                    <div className="text-3xl font-bold">
                      {totalImportCostsSum.toFixed(2)}
                    </div>
                    <div className="text-sm opacity-90">Total Importación</div>
                  </CardContent>
                </Card>

                <Card className="h-20 w-full bg-gradient-to-r from-orange-400 to-orange-300 rounded-lg text-white">
                  <CardContent className="p-4 h-full flex flex-col justify-center">
                    <div className="text-3xl font-bold">
                      {grandTotal.toFixed(2)}
                    </div>
                    <div className="text-sm opacity-90">Total Costo</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse">{/* ... tu skeleton loader ... */}</div>
      </div>
    );
  }

  if (isError || !quotationDetail) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-red-600">
          Error al cargar los detalles de la cotización.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header Bento Grid */}
      <div className="relative ">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div>
            <div className="flex items-center justify-between mb-4">
              {/* Info cliente */}
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-2xl text-gray-900">
                      {quotationDetail.correlative}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex  flex-col  gap-1 items-start text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Fecha: {formatDate(quotationDetail.createdAt)}{" "}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        Hora: {formatDateTime(quotationDetail.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {quotationDetail.products.length}
                  </div>
                  <div className="text-sm text-gray-600">Productos</div>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Productos ({quotationDetail.products.length})
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {quotationDetail.products?.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex bg-gray-50 rounded-lg p-3 gap-3 min-w-[320px]"
                  >
                    {/* Imagen del producto */}
                    {product.attachments && product.attachments.length > 0 && (
                      <div className="relative w-[120px] h-[120px] group flex-shrink-0">
                        <img
                          src={product.attachments[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover rounded cursor-pointer transition-all duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                        {/* Overlay con hover effect */}
                        <div
                          className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center cursor-pointer"
                          onClick={() => {
                            setImageUrls(product.attachments as string[]);
                            setModalProductName(product.name);
                            setOpenImageModal(true);
                          }}
                        >
                          <div className="flex flex-col items-center gap-1 text-white">
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-medium text-center">
                              {product.attachments.length > 1
                                ? `Ver ${product.attachments.length}`
                                : "Ver imagen"}
                            </span>
                          </div>
                        </div>
                        {/* Badge contador de imágenes */}
                        {product.attachments.length > 1 && (
                          <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-80 text-white text-xs px-2 py-1 rounded-full">
                            +{product.attachments.length - 1}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Información del producto */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-2">
                        {/* Header del producto */}
                        <div>
                          <h3 className="font-bold text-base text-gray-900 capitalize leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {product.quantity} unidades
                            </Badge>
                          </div>
                        </div>

                        {/* Especificaciones */}
                        <div className="space-y-1">
                          {product.size && (
                            <div className="flex items-center gap-1 text-xs">
                              <Ruler className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">Tamaño:</span>
                              <span className="font-medium text-gray-900">
                                {product.size}
                              </span>
                            </div>
                          )}
                          {product.color && (
                            <div className="flex items-center gap-1 text-xs">
                              <Palette className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">Color:</span>
                              <span className="font-medium text-gray-900">
                                {product.color}
                              </span>
                            </div>
                          )}
                          {product.url && (
                            <div className="flex items-center gap-1 text-xs">
                              <Link className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">URL:</span>
                              <span className="font-medium text-gray-900">
                                <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                                  Ver link
                                </a>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Comentarios destacados */}
                        {product.comment && (
                          <div className="bg-blue-50 border-l-3 border-blue-400 p-2 rounded-r">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-blue-700 font-medium leading-tight">
                                {product.comment}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal visor de imágenes */}
      <UrlImageViewerModal
        isOpen={openImageModal}
        onClose={() => setOpenImageModal(false)}
        urls={imageUrls}
        productName={modalProductName}
      />

      <div className="bg-white rounded-lg border">
        <div className=" pt-4 px-4 bg-white rounded-lg border">
          <div className="w-full  mx-auto space-y-4">
            {/* Header */}
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-2xl font-semibold text-slate-800 tracking-wide">
                Respuesta de la cotización
              </h1>
            </div>

            {/* Mostrar respuestas si existen, si no mostrar vacío */}
            {isLoadingResponses ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : isErrorResponses ||
              !quotationResponses ||
              quotationResponses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-500 text-lg mb-2">
                  No hay respuestas de cotización disponibles
                </div>
                <div className="text-gray-400 text-sm">
                  Las respuestas aparecerán aquí una vez que el administrador
                  las procese
                </div>
              </div>
            ) : (
              <Tabs
                value={selectedResponseTab}
                onValueChange={setSelectedResponseTab}
                className="w-full"
              >
                <div className="relative mb-6">
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {quotationResponses.map((response, index) => (
                      <button
                        key={`${response.serviceType}-${index}`}
                        onClick={() => setSelectedResponseTab(response.serviceType)}
                        className={`
                          relative flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200
                          ${
                            selectedResponseTab === response.serviceType
                              ? "bg-white text-[#d7751f] shadow-sm border border-gray-200"
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          }
                        `}
                      >
                        {response.serviceType}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generar un TabsContent por cada respuesta */}
                {quotationResponses.map((response, index) => (
                  <TabsContent
                    key={`${response.serviceType}-content-${index}`}
                    value={response.serviceType}
                    className="mt-6"
                  >
                    {renderQuotationResponse(response)}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseCotizacionView;
