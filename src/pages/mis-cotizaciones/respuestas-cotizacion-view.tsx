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
  ImageIcon,
  ListIcon,
  Truck,
  LinkIcon,
  Check,
  ChevronUp,
  ChevronDown,
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
import { Button } from "@/components/ui/button";
import ImageCarouselModal from "@/components/ImageCarouselModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Textarea } from "@/components/ui/textarea";

interface ResponseCotizacionViewProps {
  selectedQuotationId: string;
}

const ResponseCotizacionView: React.FC<ResponseCotizacionViewProps> = ({
  selectedQuotationId,
}) => {
  console.log(
    "ResponseCotizacionView renderizado con selectedQuotationId:",
    selectedQuotationId
  );
  // ✅ TODOS LOS HOOKS Y ESTADOS VAN PRIMERO

  // Hook para obtener las respuestas de cotización
  const {
    data: quotationResponses,
    isLoading: isLoadingResponses,
    isError: isErrorResponses,
  } = useGetQuatitationResponse(selectedQuotationId);

  // Hook para obtener los detalles de la cotización
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  // Debug logs
  console.log("selectedQuotationId:", selectedQuotationId);
  console.log("quotationResponses:", quotationResponses);
  console.log("isLoadingResponses:", isLoadingResponses);
  console.log("isErrorResponses:", isErrorResponses);

  const [selectedResponseTab, setSelectedResponseTab] = useState<string>("");
  const [modalProductName, setModalProductName] = useState("");
  const [productsList, setProductsList] = useState<ProductRow[]>([]);

  const [openImageModal, setOpenImageModal] = useState<boolean>(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [showAdminCommentModal, setShowAdminCommentModal] = useState(false);

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
    // Si hay respuestas, usar los productos de la respuesta seleccionada
    if (
      quotationResponses &&
      quotationResponses.length > 0 &&
      selectedResponseTab
    ) {
      const response = quotationResponses.find(
        (r) => r.serviceType === selectedResponseTab
      );

      if (response && response.products && response.products.length > 0) {
        // Mapear productos y sus variantes para crear ProductRow
        const mapped: ProductRow[] = response.products.map((product: any) => {
          // Usar quantityTotal del producto si está disponible, sino calcular desde variantes
          const totalQuantity =
            product.quantityTotal !== undefined
              ? Number(product.quantityTotal)
              : product.variants?.reduce(
                  (sum: number, variant: any) =>
                    sum + (Number(variant.quantity) || 0),
                  0
                ) || 0;

          const totalPrice =
            product.variants?.reduce(
              (sum: number, variant: any) => sum + (Number(variant.price) || 0),
              0
            ) || 0;

          const totalUnitCost =
            product.variants?.reduce(
              (sum: number, variant: any) =>
                sum + (Number(variant.unitCost) || 0),
              0
            ) || 0;

          const totalImportCosts =
            product.variants?.reduce(
              (sum: number, variant: any) =>
                sum + (Number(variant.importCosts) || 0),
              0
            ) || 0;

          return {
            id: product.productId,
            name: product.name,
            price: totalPrice,
            quantity: totalQuantity,
            total: totalPrice,
            equivalence: 0, // Se calculará después
            importCosts: totalImportCosts,
            totalCost: totalPrice + totalImportCosts,
            unitCost: totalUnitCost,
            seCotiza:
              product.seCotizaProducto !== undefined
                ? product.seCotizaProducto
                : true,
          };
        });

        // Recalcular equivalencias
        const recalculated = recalculateProducts(mapped);
        setProductsList(recalculated);
        return;
      }
    }
    // Fallback: mostrar productos de la cotización si no hay respuestas
    if (quotationDetail?.products && quotationDetail.products.length > 0) {
      const initialProducts = quotationDetail.products.map((p: any) => ({
        id: p.productId,
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
      console.log("Jas", JSON.stringify(quotationResponses, null, 2));
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

  //* Función para renderizar respuesta de tipo "Pendiente"
  const renderPendingResponse = (response: any) => {
    if (!response || !response.products) return null;

    console.log("renderPendingResponse - response:", response);
    console.log(
      "renderPendingResponse - response.products:",
      response.products
    );

    // Calcular sumatorias para tipo "Pendiente" basado en los productos
    const totalExpress = response.products.reduce(
      (sum: number, product: any) => {
        const productTotal =
          product.variants?.reduce(
            (vSum: number, variant: any) => vSum + (Number(variant.price) || 0),
            0
          ) || 0;
        return sum + (Number(productTotal) || 0);
      },
      0
    );

    const totalQuantity = response.products.reduce(
      (sum: number, product: any) => {
        // Usar quantityTotal del producto si está disponible, sino calcular desde variantes
        if (product.quantityTotal !== undefined) {
          return sum + (Number(product.quantityTotal) || 0);
        } else {
          const productTotal =
            product.variants?.reduce(
              (vSum: number, variant: any) =>
                vSum + (Number(variant.quantity) || 0),
              0
            ) || 0;
          return sum + (Number(productTotal) || 0);
        }
      },
      0
    );

    // Calcular totales adicionales
    const totalCBM = response.products.reduce(
      (sum: number, product: any) => sum + (Number(product.volume) || 0),
      0
    );

    const totalWeight = response.products.reduce(
      (sum: number, product: any) => sum + (Number(product.weight) || 0),
      0
    );

    const totalPrice = response.products.reduce((sum: number, product: any) => {
      const productTotal =
        product.variants?.reduce(
          (vSum: number, variant: any) => vSum + (Number(variant.price) || 0),
          0
        ) || 0;
      return sum + (Number(productTotal) || 0);
    }, 0);

    const totalGeneral = totalPrice + totalExpress;

    return (
      <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden rounded-2xl flex flex-col overflow-x-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-slate-800">
                  Respuesta
                </CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  Se visualiza la respuesta detallada de los productos de la
                  cotización con sus variantes
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {response.products?.length || 0} productos
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Header con indicadores mejorado */}
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200/60 rounded-xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Resumen de Respuesta
              </h2>
              <p className="text-slate-600 text-sm">
                Información general de la respuesta de la cotización actual
              </p>
            </div>

            {/* Indicadores principales con mejor diseño */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-center justify-center max-w-4xl mx-auto">
              {/* Primer indicador - N° de Items*/}
              <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-xl font-bold text-slate-800 mb-1">
                  {response.products?.length || 0}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  N° ITEMS
                </div>
              </div>
              {/* Segundo indicador - N° de Productos */}
              <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-xl font-bold text-slate-800 mb-1">
                  {response.products?.length || 0}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  N° PRODUCTOS
                </div>
              </div>
              {/* Tercer indicador - CBM Total*/}
              <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-xl font-bold text-slate-800 mb-1">
                  {totalCBM.toFixed(2)}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  CBM TOTAL
                </div>
              </div>
              {/* Cuarto indicador - Peso Total */}
              <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-xl font-bold text-slate-800 mb-1">
                  {totalWeight.toFixed(1)}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  PESO (KG)
                </div>
              </div>
              {/* Quinto indicador - Precio total */}
              <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-xl font-bold text-emerald-600 mb-1">
                  ${totalPrice.toFixed(2)}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  P. TOTAL
                </div>
              </div>
              {/* Sexto indicador - Express total */}
              <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-xl font-bold text-emerald-600 mb-1">
                  ${totalExpress.toFixed(2)}
                </div>
                <div className="text-xs font-medium text-slate-600">
                  EXPRESS
                </div>
              </div>
              {/* Séptimo indicador - Total General */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
                <div className="text-xl font-bold text-white mb-1">
                  ${totalGeneral.toFixed(2)}
                </div>
                <div className="text-xs font-medium text-emerald-100">
                  TOTAL
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            {/*Encabezado*/}
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-16">
                  Nro.
                </th>
                <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-40">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-slate-600" />
                    Imagen & URL
                  </div>
                </th>
                <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-72">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-600" />
                    Producto & Variantes
                  </div>
                </th>
                <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-48">
                  <div className="flex items-center gap-2">
                    <ListIcon className="h-4 w-4 text-emerald-600" />
                    Packing List
                  </div>
                </th>
                <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-52">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-indigo-600" />
                    Manipulación de Carga
                  </div>
                </th>
                <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-44">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-amber-600" />
                    Comentarios
                  </div>
                </th>
                <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-32">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    Precio
                  </div>
                </th>
                <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-32">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-orange-600" />
                    Express
                  </div>
                </th>
                <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-40">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    Total
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {response.products?.map((product: any, index: number) => {
                // Usar quantityTotal del producto si está disponible, sino calcular desde variantes
                const totalProductQuantity =
                  product.quantityTotal !== undefined
                    ? Number(product.quantityTotal)
                    : product.variants?.reduce(
                        (sum: number, variant: any) =>
                          sum + (Number(variant.quantity) || 0),
                        0
                      ) || 0;
                const totalProductPrice =
                  product.variants?.reduce(
                    (sum: number, variant: any) =>
                      sum + (Number(variant.price) || 0),
                    0
                  ) || 0;

                // Calcular el express total del producto
                const totalProductExpress =
                  product.variants?.reduce(
                    (sum: number, variant: any) =>
                      sum + (Number(variant.importCosts) || 0),
                    0
                  ) || 0;

                // Obtener las variantes del producto
                const variants = product.variants || [];
                const hasMultipleVariants = variants.length > 1;

                return (
                  <tr
                    key={product.productId}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}
                  >
                    <td className="p-4 py-6">
                      <div className="w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                    </td>
                    {/* Columna Imagen */}
                    <td className="p-4 py-6">
                      <div className="space-y-2">
                        <div className="relative w-30 h-24 bg-gray-100 border-2 border-gray-200 rounded-xl overflow-hidden group">
                          {product.attachments &&
                          product.attachments.length > 0 ? (
                            <>
                              <img
                                src={
                                  product.attachments[0] || "/placeholder.svg"
                                }
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                                  onClick={() => {
                                    setImageUrls(
                                      product.attachments as string[]
                                    );
                                    setModalProductName(product.name);
                                    setOpenImageModal(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-gray-700" />
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-xs">Sin imagen</span>
                            </div>
                          )}
                        </div>
                        {/* URL del producto */}
                        {product.url && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs"
                              onClick={() => window.open(product.url, "_blank")}
                            >
                              <LinkIcon className="h-3 w-3 mr-1" />
                              Ver link
                            </Button>
                          </div>
                        )}

                        {/* Comentario del Cliente */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            // Aquí podrías abrir un modal para mostrar el comentario
                            console.log(
                              "Comentario del producto:",
                              product.comment
                            );
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    {/*Columna Producto */}
                    <td className="p-4 py-6">
                      <div className="space-y-3">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        {/* Si tiene múltiples variantes, mostrar resumen */}
                        {hasMultipleVariants ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                                Total: {totalProductQuantity} unidades
                              </Badge>
                              <Badge className="text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200">
                                {variants.length} variantes
                              </Badge>
                            </div>
                            {/* Mostrar resumen de variantes */}
                            <div className="space-y-1">
                              {variants.map((variant: any, vIndex: number) => (
                                <div
                                  key={vIndex}
                                  className="text-xs text-gray-600 bg-gray-50 p-2 rounded"
                                >
                                  <div className="flex justify-between">
                                    <span>
                                      {variant.presentation ||
                                        variant.model ||
                                        `Variante ${vIndex + 1}`}
                                    </span>
                                    <span className="font-medium">
                                      {variant.quantity || 0} uds
                                    </span>
                                  </div>
                                  {variant.color && (
                                    <div className="text-gray-500">
                                      Color: {variant.color}
                                    </div>
                                  )}
                                  {variant.size && (
                                    <div className="text-gray-500">
                                      Tamaño: {variant.size}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* Si tiene una sola variante, mostrar detalles directamente */
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {/* Modelo */}
                            {variants[0]?.model && (
                              <div className="flex items-center gap-2">
                                <Badge className="text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200">
                                  Modelo
                                </Badge>
                                <span className="font-medium">
                                  {variants[0].model}
                                </span>
                              </div>
                            )}
                            {/* Color */}
                            {variants[0]?.color && (
                              <div className="flex items-center gap-2">
                                <Badge className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                                  Color
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="uppercase text-xs"
                                >
                                  {variants[0].color}
                                </Badge>
                              </div>
                            )}
                            {/* Tamaño */}
                            {variants[0]?.size && (
                              <div className="flex items-center gap-2">
                                <Badge className="text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200">
                                  Tamaño
                                </Badge>
                                <span className="font-medium">
                                  {variants[0].size}
                                </span>
                              </div>
                            )}
                            {/* Presentación */}
                            {variants[0]?.presentation && (
                              <div className="flex items-center gap-2">
                                <Badge className="text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200">
                                  Presentación
                                </Badge>
                                <span className="font-medium">
                                  {variants[0].presentation}
                                </span>
                              </div>
                            )}

                            {/* Cantidad */}
                            <div className="flex items-center gap-2">
                              <Badge className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                                Cantidad
                              </Badge>
                              <span className="font-medium">
                                {variants[0]?.quantity || 0}
                              </span>
                            </div>
                            {/* Express */}
                            <div className="flex items-center gap-2">
                              <Badge className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                                Express
                              </Badge>
                              <span className="font-medium">
                                ${variants[0]?.importCosts || 0}
                              </span>
                            </div>
                            {/* Precio Unitario */}
                            <div className="flex items-center gap-2">
                              <Badge className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200">
                                Precio Unitario
                              </Badge>
                              <span className="font-medium">
                                ${variants[0]?.unitCost || 0}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Columna Packing List */}
                    <td className="p-4">
                      <div className="space-y-2 grid grid-cols-2 gap-2">
                        <div className="flex flex-col items-center gap-2">
                          <Badge className="text-xs font-medium text-red-800 bg-red-50 border border-red-200">
                            Nro. Cajas
                          </Badge>
                          <div className="w-16">
                            <Input
                              type="number"
                              value={0}
                              className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <Badge className="text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200">
                            CBM
                          </Badge>
                          <div className="w-16">
                            <Input
                              type="number"
                              value={0}
                              className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Badge className="text-xs font-medium text-green-800 bg-green-50 border border-green-200">
                            PESO KG
                          </Badge>
                          <div className="w-16">
                            <Input
                              type="number"
                              value={0}
                              className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <Badge className="text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200">
                            PESO TON
                          </Badge>
                          <div className="w-16">
                            <Input
                              type="number"
                              value={0}
                              className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Columna Manipulación de Carga */}
                    <td className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`fragile-${product.id}`}
                            //checked={isFragile}
                            //onCheckedChange={(checked) => setIsFragile(checked as boolean)}
                          />
                          <Label
                            htmlFor={`fragile-${product.id}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Producto Frágil
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`stackable-${product.id}`}
                            //checked={isStackable}
                            //onCheckedChange={(checked) =>
                            //  setIsStackable(checked as boolean)
                            //}
                          />
                          <Label
                            htmlFor={`stackable-${product.id}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Producto Apilable
                          </Label>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Tipo de Carga
                          </Label>
                          <Select>
                            <SelectTrigger className="w-full h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GENERAL">GENERAL</SelectItem>
                              <SelectItem value="IMO">IMO</SelectItem>
                              <SelectItem value="MIXTA">MIXTA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 py-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 mt-1 text-green-600 items-center justify-center hover:text-green-800"
                            onClick={() => setShowAdminCommentModal(true)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Dialog para comentario del administrador */}
                      <Dialog
                        open={showAdminCommentModal}
                        onOpenChange={setShowAdminCommentModal}
                      >
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-green-600" />
                              Comentario del Administrador
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Agregar comentario del administrador:
                              </label>
                              <Textarea
                                placeholder="Escriba aquí el comentario del administrador..."
                                //value={adminComment}
                                //onChange={(e) => setAdminComment(e.target.value)}
                                className="w-full h-24 resize-none"
                                rows={4}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowAdminCommentModal(false)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => {
                                  // Guardar el comentario en el componente padre
                                  //onProductChange?.(getProductId(), "adminComment", adminComment);
                                  //console.log(
                                  // "Comentario del administrador guardado:",
                                  //adminComment
                                  //);
                                  setShowAdminCommentModal(false);
                                }}
                              >
                                Guardar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="p-4 py-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">
                          USD {(Number(totalProductPrice) || 0).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 py-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          USD {(Number(totalProductExpress) || 0).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 py-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          USD{" "}
                          {(
                            (Number(totalProductPrice) || 0) +
                            (Number(totalProductExpress) || 0)
                          ).toFixed(2)}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  // Función para renderizar las respuestas de importación
  const renderQuotationResponse = (response: any) => {
    if (!response) return null;

    // Si es tipo "Pendiente", mostrar vista específica
    if (response.serviceType === "Pendiente") {
      return renderPendingResponse(response);
    }

    // Para el nuevo DTO, mostrar información básica de la respuesta
    return (
      <div className="space-y-4">
        {/* Información de la respuesta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
                Información del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">
                    Tipo de Servicio
                  </span>
                  <span className="font-medium">{response.serviceType}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Tipo de Carga</span>
                  <span className="font-medium">
                    {response.quotationInfo?.cargoType || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Courier</span>
                  <span className="font-medium">
                    {response.quotationInfo?.courier || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Incoterm</span>
                  <span className="font-medium">
                    {response.quotationInfo?.incoterm || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de Productos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChartBar className="h-5 w-5 text-orange-600" />
                Resumen de Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg text-gray-600">TOTAL PRODUCTOS</span>
                  <span className="font-medium">
                    {response.products?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg text-gray-600">VALOR TOTAL</span>
                  <span className="font-medium">
                    USD {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg text-gray-600">CANTIDAD TOTAL</span>
                  <span className="font-medium">{totalQuantity}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                  <span className="text-lg text-green-900">COSTO TOTAL</span>
                  <span className="font-medium text-green-900">
                    USD {formatCurrency(grandTotal)}
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
                data={productsList}
                pageInfo={{
                  pageNumber: 1,
                  pageSize: 10,
                  totalElements: productsList?.length || 0,
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
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (isError || !quotationDetail) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-red-600">
          Error al cargar los detalles de la cotización.
        </div>
        <div className="text-center text-gray-500 text-sm">
          selectedQuotationId: {selectedQuotationId}
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
                    key={product.productId || product.id}
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
                                <a
                                  href={product.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600"
                                >
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
                        onClick={() =>
                          setSelectedResponseTab(response.serviceType)
                        }
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
