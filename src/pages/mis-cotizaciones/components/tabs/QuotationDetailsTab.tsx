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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetQuotationById } from "@/hooks/use-quation";
import { columnsProductDetails } from "@/pages/mis-cotizaciones/components/table/columnsProductDetails";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/functions";
import { formatDate, formatDateTime } from "@/lib/format-time";
import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface";
import {
  statusColorsQuotation,
  statusResponseQuotation,
} from "@/pages/gestion-de-cotizacion/components/utils/static";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { columnsEditableUnitcost } from "@/pages/gestion-de-cotizacion/components/table/columnseditableunitcost";
import type { ProductRow } from "@/pages/gestion-de-cotizacion/components/views/editableunitcosttable";

interface DetallesTabProps {
  selectedQuotationId: string;
  onSelectProductForResponse: (productId: string, productName: string) => void;
}

const DetallesTab: React.FC<DetallesTabProps> = ({
  selectedQuotationId,
  onSelectProductForResponse,
}) => {
  // ✅ TODOS LOS HOOKS Y ESTADOS VAN PRIMERO
  const [subTab, setSubTab] = useState<
    "Todos" | "No respondido" | "Respondido" | "Observado"
  >("Todos");
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState<string[]>(
    []
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalProductName, setModalProductName] = useState("");
  const [productsList, setProductsList] = useState<ProductRow[]>([]);

  const [openImageModal, setOpenImageModal] = useState<boolean>(false);

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
    if (quotationDetail?.products && quotationDetail.products.length > 0) {
      // Mapea los productos iniciales a la estructura de ProductRow
      const initialProducts = quotationDetail.products.map((p) => ({
        id: p.id,
        name: p.name,
        price: 0, // o algún valor inicial
        quantity: p.quantity,
        total: 0,
        equivalence: 0,
        importCosts: 0,
        totalCost: 0,
        unitCost: 0,
      }));
      const recalculated = recalculateProducts(initialProducts);
      setProductsList(recalculated);
    }
  }, [quotationDetail?.products]);

  const updateProduct = (
    id: string,
    field: keyof ProductRow,
    value: number
  ) => {
    setProductsList((prev) => {
      const updated = prev.map((product) => {
        if (product.id === id) {
          const updatedProduct = { ...product, [field]: value };
          if (field === "price" || field === "quantity") {
            updatedProduct.total =
              (updatedProduct.price || 0) * (updatedProduct.quantity || 0);
          }
          return updatedProduct;
        }
        return product;
      });
      return recalculateProducts(updated);
    });
  };

  // El resto de tus funciones y cálculos
  const calculateFactorM = (products: ProductRow[]): number => {
    return 0;
  };
  const columns = columnsEditableUnitcost(updateProduct);
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
  // ...y las demás funciones como openImageModal, formatDate, etc.

  // ✅ AHORA SÍ, LAS COMPROBACIONES Y RETORNOS ANTICIPADOS
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

  const serviceTypes = [
    "Servicio Consolidado Aéreo",
    "Separación de Carga",
    "Inspección de Productos",
    "AD/VALOREM + IGV + IPM",
    "Desaduanaje + Flete + Seguro",
  ];

  return (
    <div className="space-y-4 p-6">
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Estado de respuesta:
                    </span>
                    <Badge
                      className={`${
                        statusColorsQuotation[
                          quotationDetail.statusResponseQuotation as keyof typeof statusResponseQuotation
                        ]
                      } border px-3 py-1 flex items-center gap-1`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          statusColorsQuotation[
                            quotationDetail.statusResponseQuotation as keyof typeof statusResponseQuotation
                          ]
                        }`}
                      ></div>
                      {
                        statusResponseQuotation[
                          quotationDetail.statusResponseQuotation as keyof typeof statusResponseQuotation
                        ]
                      }
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-gray-900 font-medium">
                    Cliente: {quotationDetail.user?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Correo: {quotationDetail.user?.email}
                  </p>
                </div>
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
                          onClick={() => setOpenImageModal(true)}
                          /*onClick={() =>
                            openImageModal(product.attachments, product.name)
                          }*/
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

      <div className="bg-white rounded-lg border">
        <div className=" pt-4 px-4 bg-white rounded-lg border">
          <div className="w-full  mx-auto space-y-4">
            {/* Header */}
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-2xl font-semibold text-slate-800 tracking-wide">
                Respuesta de la cotización
              </h1>
            </div>

            <Tabs
              value={selectedServiceType}
              onValueChange={setSelectedServiceType}
              className="w-full"
            >
              <TabsList className="relative flex border-b border-gray-200 rounded-">
                {serviceTypes.map((serviceType: any) => (
                  <TabsTrigger
                    key={serviceType}
                    value={serviceType}
                    className={`
            relative px-6 py-4 text-sm font-medium transition-colors
            ${
              selectedServiceType === serviceType
                ? "text-[#d7751f]"
                : "text-gray-600 hover:text-gray-800"
            }
          `}
                  >
                    {serviceType}
                    {/* Línea animada */}
                    <span
                      className={`
              absolute bottom-0 left-0 h-0.5 bg-[#d7751f]
              transition-all duration-300
              ${selectedServiceType === serviceType ? "w-full" : "w-0"}
            `}
                    />
                  </TabsTrigger>
                ))}
              </TabsList>
              {/* Genero un TabsContent por cada serviceType */}
              {quotationDetail.summaryByServiceType?.map((price, index) => {
                //const pricingData = getPricingData(price);
                return (
                  <TabsContent key={index} value={index.toString()}>
                    {/* Aquí pinto los datos de ese tipo de servicio */}
                    {/* Pricing Cards Grid */}
                  </TabsContent>
                );
              })}
            </Tabs>

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
                      </span>
                      <span className="font-medium">USD 0.00</span>
                    </div>
                    {/* Separación de Carga */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">
                        Separación de Carga
                      </span>
                      <span className="font-medium">USD 0.00</span>
                    </div>
                    {/* Inspección de Productos */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">
                        Inspección de Productos
                      </span>
                      <span className="font-medium">USD 0.00</span>
                    </div>
                    {/* AD/VALOREM + IGV + IPM */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">
                        AD/VALOREM + IGV + IPM
                      </span>
                      <span className="font-medium">USD 0.00</span>
                    </div>
                    {/* Desaduanaje + Flete + Seguro */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">
                        Desaduanaje + Flete + Seguro
                      </span>
                      <span className="font-medium">USD 0.00</span>
                    </div>

                    <Separator />
                    <div className="flex justify-between items-center py-2 bg-orange-50 px-3 rounded-lg">
                      <span className="font-medium text-orange-900">
                        Total Gastos de Importación
                      </span>
                      <span className="font-bold text-orange-900">
                        USD 0.00
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
                      <span className="font-medium">ABC</span>
                    </div>
                    {/* Valor de Compra Factura Comercial */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg text-gray-600">
                        VALOR DE COMPRA FACTURA COMERCIAL
                      </span>
                      <span className="font-medium">USD 0.00</span>
                    </div>
                    {/* Total Gastos de Importacion */}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg text-gray-600">
                        TOTAL GASTOS DE IMPORTACION
                      </span>
                      <span className="font-medium">USD 0.00</span>
                    </div>
                    <Separator />
                    {/* Inversion Total de Importacion */}
                    <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                      <span className="text-lg text-green-900">
                        INVERSION TOTAL DE IMPORTACION
                      </span>
                      <span className="font-medium text-green-900">
                        USD 0.00
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-6 bg-gray-50">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-center flex-1">
                    <div className="relative">
                      COSTEO UNITARIO DE IMPORTACIÓN
                      <div className="absolute top-0 right-0  text-black px-3 py-1 text-sm font-bold">
                        <div className="text-xs">FACTOR M.</div>
                        <div>{factorM.toFixed(2)}</div>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={productsList}
                    pageInfo={{
                      pageNumber: 1,
                      pageSize: 10,
                      totalElements: productsList.length,
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
                        <div className="text-3xl font-bold">
                          {totalQuantity}
                        </div>
                        <div className="text-sm opacity-90">Total Unidades</div>
                      </CardContent>
                    </Card>
                    <Card className="h-20 w-full bg-gradient-to-r from-blue-400 to-blue-300  rounded-lg text-white">
                      <CardContent className="p-4 h-full flex flex-col justify-center">
                        <div className="text-3xl font-bold">
                          {totalAmount.toFixed(2)}
                        </div>
                        <div className="text-sm opacity-90">
                          Precio Total USD
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="h-20 w-full bg-gradient-to-r from-green-400 to-green-300 rounded-lg text-white">
                      <CardContent className="p-4 h-full flex flex-col justify-center">
                        <div className="text-3xl font-bold">
                          {totalImportCostsSum.toFixed(2)}
                        </div>
                        <div className="text-sm opacity-90">
                          Total Importación
                        </div>
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

            {/* Footer Note */}
            <div className="text-center p-8">
              <div className="inline-flex items-center space-x-2 text-xs text-slate-400 font-light">
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <span>Cotización válida por 30 días</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesTab;
