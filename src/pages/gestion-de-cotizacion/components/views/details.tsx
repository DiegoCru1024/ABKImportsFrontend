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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetQuotationById } from "@/hooks/use-quation";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/functions";

import {
  statusColorsQuotation,
  statusResponseQuotation,
} from "../utils/static";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface";
import type { DetallesTabProps } from "../utils/interface";
import { formatDate, formatDateTime } from "@/lib/format-time";
import ResponseQuotation from "./response-quotation";
import { servicios } from "@/pages/cotizacion/components/data/static";

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
    sendResponse: false
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
    sendResponse: false
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
    sendResponse: false
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
    sendResponse: false
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
    sendResponse: false
  }
];

const DetallesTab: React.FC<DetallesTabProps> = ({ selectedQuotationId }) => {
  //* Hook para obtener los detalles de la cotización - DEBE IR PRIMERO
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  //* Estados - TODOS LOS USESTATE JUNTOS
  const [subTab, setSubTab] = useState<
    "Todos" | "No respondido" | "Respondido" | "Observado"
  >("Todos");

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
  const [editableProducts, setEditableProducts] = useState<ProductoResponseIdInterface[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  //*Estado para obtener cantidad de productos
  const [totalProducts, setTotalProducts] = useState(0);

  //*Estado para obtener cantidad de productos respondidos
  const [respondedProducts, setRespondedProducts] = useState(0);
  const [progress, setProgress] = useState(0);

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

  //* Función para calcular el precio total de todos los productos
  const calculateTotalPrice = () => {
    return editableProducts.reduce((total, product) => {
      const price = parseFloat(product.weight) || 0;
      const quantity = product.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  //* Función para editar un producto
  const handleEditProduct = (productId: string) => {
    setEditingProduct(productId);
  };

  //* Función para guardar cambios en un producto
  const handleSaveProduct = (productId: string) => {
    setEditingProduct(null);
    // Aquí puedes agregar la lógica para guardar en la base de datos
    console.log("Guardando producto:", productId);
  };

  //* Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingProduct(null);
    // Restaurar los valores originales
    setEditableProducts(quotationDetail?.products || productosEjemplo);
  };

  //* Función para actualizar el valor de un producto
  const handleUpdateProduct = (productId: string, field: string, value: string) => {
    setEditableProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, [field]: field === 'quantity' ? parseInt(value) || 0 : value }
          : product
      )
    );
  };

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

  //* Arrays de tipos de servicio
  const serviceTypes: string[] =
    quotationDetail?.summaryByServiceType?.map((item) => item.service_type) ||
    ["Consolidado Grupal", "Consolidado Express", "Courier"];

  //* Función para generar los datos de precios basados en un servicio específico
  const getPricingData = (serviceData: any) => [
    {
      id: "total",
      title: "Precio Total de la cotización",
      amount:
        serviceData.total_price +
        serviceData.service_fee +
        serviceData.taxes +
        serviceData.express_price,
      description: "Suma total de todos los conceptos",
      icon: Calculator,
      isTotal: true,
    },
    {
      id: "quote",
      title: "Precio de la cotización",
      amount: serviceData.total_price,
      description: "Costo base del servicio cotizado",
      icon: FileText,
    },
    {
      id: "express",
      title: "Precio express",
      amount: serviceData.express_price,
      description: "Cargo adicional por servicio urgente",
      icon: Clock,
    },
    {
      id: "taxes",
      title: "Precio de los impuestos",
      amount: serviceData.taxes,
      description: "Impuestos aplicables según legislación",
      icon: Receipt,
    },
    {
      id: "services",
      title: "Precio de los servicios",
      amount: serviceData.service_fee,
      description: "Servicios adicionales incluidos",
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header Bento Grid */}
      <div className="relative">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 gap-3 text-xl font-semibold">
              <PackageIcon className="w-7 h-7 text-blue-600" />
              Cotización {quotationDetail?.correlative || "EJEMPLO-001"}
            </div>
          </div>

          {/* Timeline */}
          <div>
            {/* Fecha de registro */}
            <Card className="shadow-sm">
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Cliente */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      Cliente: {quotationDetail?.user?.name || "Cliente Ejemplo"}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Correo: {quotationDetail?.user?.email || "cliente@ejemplo.com"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Fecha de registro:{" "}
                        {quotationDetail ? formatDate(quotationDetail.createdAt) : "2024-01-15"} -{" "}
                        {quotationDetail ? formatDateTime(quotationDetail.createdAt) : "10:30 AM"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-gray-800 text-sm font-semibold">
                    Respuesta de la cotización:
                  </p>
                  <Badge
                    title={quotationDetail?.statusResponseQuotation || "Pendiente"}
                    className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm font-semibold flex items-center gap-2"
                  >
                    {quotationDetail?.statusResponseQuotation || "Pendiente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sección de selección de servicio mejorada */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Label className="text-xl font-bold text-orange-500" title="Seleccione el tipo servicio que desea cotizar">
              Seleccione el tipo de servicio que desea cotizar
            </Label>
            <Select
              value={selectedServiceType}
              onValueChange={(value) => {
                setSelectedServiceType(value);
                if (value !== "Almacenaje de Mercancia") {
                  setSelectedServiceType(value);
                }
                if (value === "Consolidado Express" || value === "Consolidado Grupal Express") {
                  setSelectedServiceType(value);
                }
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Seleccione un servicio" />
              </SelectTrigger>
              <SelectContent>
                {servicios.map((servicio: { id: number; value: string; label: string }) => (
                  <SelectItem key={servicio.value} value={servicio.value}>
                    {servicio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 mb-6"></div>

          {/* Grid de información mejorado */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información de logística */}
            <Card className="h-fit shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-center text-blue-600 flex items-center justify-center gap-2">
                  <Truck className="w-5 h-5" />
                  Información de Logística
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Tipo de carga</Label>
                    <Input type="text" placeholder="Electrónicos" className="focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Cantidad de cajas</Label>
                    <Input type="number" placeholder="15" className="focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Incoterms</Label>
                    <Input type="text" placeholder="CIF" className="focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Volumen</Label>
                    <Input type="text" placeholder="21 m³" className="focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Peso</Label>
                    <Input type="text" placeholder="125 kg" className="focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Naviera</Label>
                    <Input type="text" placeholder="MSC" className="focus:border-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Courier</Label>
                    <Input type="text" placeholder="DHL" className="focus:border-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles de precios */}
            <Card className="h-fit shadow-sm border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-center text-green-600 flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Detalles de Precios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Flete internacional</Label>
                    <Input type="text" placeholder="$450.00" className="focus:border-green-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Desaduanaje</Label>
                    <Input type="text" placeholder="$75.00" className="focus:border-green-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Delivery</Label>
                    <Input type="text" placeholder="$25.00" className="focus:border-green-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Otros gastos</Label>
                    <Input type="text" placeholder="$15.00" className="focus:border-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas */}
            <Card className="h-fit shadow-sm border-l-4 border-l-purple-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-center text-purple-600 flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Recomendaciones</Label>
                  <Textarea 
                    placeholder="Embalar productos frágiles con cuidado extra..." 
                    className="focus:border-purple-500 min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Observaciones</Label>
                  <Textarea 
                    placeholder="Entrega prioritaria para equipos de oficina..." 
                    className="focus:border-purple-500 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de cotización simplificada */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">Productos de la Cotización</CardTitle>
              <CardDescription>
                Detalles de los productos incluidos en esta cotización
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total de Productos</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(calculateTotalPrice())}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">IMAGEN</TableHead>
                  <TableHead className="font-semibold">PRODUCTO</TableHead>
                  <TableHead className="font-semibold">PRECIO UNITARIO</TableHead>
                  <TableHead className="font-semibold">CANTIDAD</TableHead>
                  <TableHead className="font-semibold">PRECIO TOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editableProducts?.map((product, index) => (
                  <TableRow key={product.id || index} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {product.url ? (
                          <img
                            src={product.url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.comment && (
                        <div className="text-sm text-gray-600 mt-1">
                          {product.comment}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                                            {editingProduct === product.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">$</span>
                          <Input
                            type="number"
                            value={product.weight}
                            onChange={(e) => handleUpdateProduct(product.id, 'weight', e.target.value)}
                            className="w-24"
                            step="0.01"
                          />
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveProduct(product.id)}
                              className="text-green-600 hover:text-green-700 p-1"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{formatCurrency(parseFloat(product.weight))}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product.id)}
                            className="text-blue-600 hover:text-blue-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                                             {editingProduct === product.id ? (
                         <div className="flex items-center gap-2">
                           <Input
                             type="number"
                             value={product.quantity}
                             onChange={(e) => handleUpdateProduct(product.id, 'quantity', e.target.value)}
                             className="w-20"
                             min="1"
                           />
                         </div>
                       ) : (
                         <div className="flex items-center gap-2">
                           <span className="font-medium text-gray-900">{product.quantity}</span>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleEditProduct(product.id)}
                             className="text-blue-600 hover:text-blue-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-green-600 text-lg">
                        {formatCurrency((parseFloat(product.weight) || 0) * (product.quantity || 0))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!editableProducts || editableProducts.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-gray-500">
                        No hay productos disponibles
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Resumen total */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-gray-800">Total General de Productos:</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(calculateTotalPrice())}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border">
        <div className=" pt-4 px-4 bg-white rounded-lg border">
          <div className="w-full  mx-auto space-y-4">
            {/* Header */}
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-2xl font-semibold text-slate-800 tracking-wide">
                Resumen de Cotización
              </h1>
            </div>

            <Tabs
              value={selectedServiceType}
              onValueChange={setSelectedServiceType}
              className="w-full"
            >
              <TabsList className="relative flex border-b border-gray-200">
                {serviceTypes.map((serviceType) => (
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
                      className={` absolute bottom-0 left-0 h-0.5 bg-[#d7751f] transition-all duration-300
              ${selectedServiceType === serviceType ? "w-full" : "w-0"}
            `}
                    />
                  </TabsTrigger>
                ))}
              </TabsList>
              {/* Genero un TabsContent por cada serviceType */}
              {quotationDetail?.summaryByServiceType?.map((price) => {
                const pricingData = getPricingData(price);
                return (
                  <TabsContent
                    key={price.service_type}
                    value={price.service_type}
                  >
                    {/* Aquí pinto los datos de ese tipo de servicio */}
                    {/* Pricing Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pricingData.slice(1).map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <Card
                            key={item.id + index}
                            className="border-0 shadow-sm bg-white/50 backdrop-blur-sm hover:bg-orange-50 transition-all duration-300 "
                          >
                            <CardContent className="gap-4">
                              <div className="flex  justify-between  mb-2">
                                <div className="flex items-center  space-x-3">
                                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                    <IconComponent className="h-3.5 w-3.5 text-slate-500" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-base  text-slate-700 mb-1">
                                      {item.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400  leading-relaxed">
                                      {item.description}
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl  text-slate-700">
                                    {formatCurrency(item.amount)}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {item.amount}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>

            {/* Total Card - Clean and Prominent */}
            {quotationDetail?.summaryByServiceType?.map((price) => {
              const pricingData = getPricingData(price);
              return selectedServiceType === price.service_type ? (
                <Card
                  key={`total-${price.service_type}`}
                  className=" shadow-sm bg-white/70 hover:bg-orange-50 transition-all duration-300"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                          <Calculator className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg  text-slate-800 mb-1">
                            {pricingData[0].title}
                          </CardTitle>
                          <CardDescription className="text-slate-500  text-sm">
                            {pricingData[0].description}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl  text-slate-800 mb-2 flex items-center justify-between">
                          {formatCurrency(pricingData[0].amount)}
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 font-light border-0"
                          >
                            Total
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 text-center">
                          Precio final con todos los conceptos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null;
            })}

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
