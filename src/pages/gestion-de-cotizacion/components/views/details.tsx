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
    }
  }, [quotationDetail, selectedServiceType]);

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
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-red-600">
          Error al cargar los detalles de la cotización. Por favor, intente
          nuevamente.
        </div>
      </div>
    );
  }

  //* Arrays de tipos de servicio
  const serviceTypes: string[] =
    quotationDetail.summaryByServiceType?.map((item) => item.service_type) ||
    [];

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
    <div className="space-y-4 p-6">
      {/* Header Bento Grid */}
      <div className="relative ">
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4 gap-3 text-lg">
              <PackageIcon className="w-6 h-6 text-blue-600" />
              Cotizacion {quotationDetail.correlative}
            </div>
          </div>

          {/* Timeline */}
          <div>
            {/* Fecha de registro */}
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Cliente: {quotationDetail.user.name}
                    </h3>
                    <p className="text-gray-600">
                      Correo: {quotationDetail.user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Fecha de registro:{" "}
                        {formatDate(quotationDetail.createdAt)} -{" "}
                        {formatDateTime(quotationDetail.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-gray-800 text-sm font-semibold">
                    Respuesta de la cotización:
                  </p>
                  <Badge
                    title={quotationDetail.statusResponseQuotation}
                    className={`${
                      statusColorsQuotation[
                        quotationDetail.statusResponseQuotation as keyof typeof statusResponseQuotation
                      ]
                    } px-4 py-2 text-sm font-semibold flex items-center gap-2`}
                  >
                    {
                      statusResponseQuotation[
                        quotationDetail.statusResponseQuotation as keyof typeof statusResponseQuotation
                      ]
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            {/*<div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progreso de Respuestas
                </span>
                <span className="text-sm text-gray-600">
                  {respondedProducts} de {totalProducts} productos
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                  }}
                ></div>
              </div>
            </div>*/}
          </div>
        </div>
      </div>
      <Card>
        <CardContent>
          <div className="flex items-center justify-left gap-4 mb-4">
          <Label className="text-xl font-bold align-middle text-center text-orange-500" title="Seleccione el tipo servicio que desea cotizar">
              Seleccione el tipo servicio que desea cotizar: 
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
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                              <SelectContent>
                                {servicios.map((servicio: { id: number; value: string; label: string }) => (
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
          {/* Linea de borde */}
          <div className="w-full h-1 bg-gray-200"></div>
       
          <div className="flex items-center align-middle gap-4">

            <div className="grid grid-cols-1  md:grid-cols-3 gap-4  p-4">
              {/*Primera columna*/}
              <div className="grid grid-cols-1  gap-4">
                <div className="flex items-center justify-center">
                  <Label className="text-xl font-bold align-middle text-center">
                    Información de logística
                  </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-lg border-2 p-4">
                  {/*Primera Fila*/}
                  <div className=" items-center gap-4 ">
                    <Label className="text-lg font-semibold py-2">
                      Tipo de carga
                    </Label>
                    <Input type="text" placeholder="Electrónicos" />
                  </div>
                  <div className=" items-center gap-4 ">
                    <Label className="text-lg  font-semibold py-2">
                      Cantidad de cajas
                    </Label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div className=" items-center gap-4 ">
                    <Label className="text-lg font-semibold py-2">
                      Incoterms
                    </Label>
                    <Input type="text" placeholder="CIF" />
                  </div>
                  {/*Segunda Fila*/}
                  <div className="items-center gap-4">
                    <Label className="text-lg font-semibold py-2">
                      Volumen
                    </Label>
                    <Input type="text" placeholder="100m3" />
                  </div>

                  <div className=" items-center gap-4 ">
                    <Label className="text-lg font-semibold py-2">Peso</Label>
                    <Input type="text" placeholder="100kg" />
                  </div>

                  <div className=" items-center gap-4 ">
                    <Label className="text-lg font-semibold py-2">
                      Naviera
                    </Label>
                    <Input type="text" placeholder="Logistics" />
                  </div>

                  {/*Tercera Fila*/}

                  <div className=" items-center gap-4 ">
                    <Label className="text-lg font-semibold py-2">
                      Courier{" "}
                    </Label>
                    <Input type="text" placeholder="DHL" />
                  </div>
                </div>
              </div>

              {/*Segunda columna*/}
              <div className="grid grid-cols-1  gap-4 ">
                <div className="flex items-center justify-center">
                  <Label className="text-xl font-bold align-middle text-center">
                    Detalles de precios
                  </Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border-2 p-4">
                  {/*Primera Fila*/}
                  <div className=" items-center gap-4 ">
                    <Label className="text-lg font-semibold py-2">
                      Flete internacional
                    </Label>
                    <Input type="text" placeholder="Electrónicos" />
                  </div>
                  <div className=" items-center gap-4 ">
                    <Label className="text-lg  font-semibold py-2">
                      Desaduanaje
                    </Label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div className=" items-center gap-4 ">
                    <Label className="text-lg font-semibold py-2">
                      Delivery
                    </Label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div className=" items-center gap-4 ">
                    <Label className="text-lg font-semibold py-2">
                      Otros gastos
                    </Label>
                    <Input type="number" placeholder="100" />
                  </div>
                </div>
              </div>

              {/*Tercera columna*/}
              <div className="grid grid-cols-1  gap-4">
                <div className="flex items-center justify-center">
                  <Label className="text-xl font-bold align-middle text-center">
                    Notas
                  </Label>
                </div>
                <div className="grid grid-cols-1  gap-4 rounded-lg border-2 p-4">
                  <div className="items-center gap-4">
                    <Label className="text-lg font-semibold py-2">
                      Recomendaciones
                    </Label>
                    <Textarea placeholder="Recomendaciones" />
                  </div>
                  <div className=" items-center gap-4">
                    <Label className="text-lg font-semibold py-2">
                      Observaciones
                    </Label>
                    <Textarea placeholder="Observaciones" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/*Tabla de cotizacion*/}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Productos de la Cotización</CardTitle>
          <CardDescription>
            Detalles de los productos incluidos en esta cotización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IMAGEN</TableHead>
                <TableHead>PRODUCTO</TableHead>
                <TableHead>PRECIO</TableHead>
                <TableHead>CANTIDAD</TableHead>
                <TableHead>PRECIO TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotationDetail?.products?.map((product, index) => (
                <TableRow key={index}>
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
                    <div className="font-medium">{product.name}</div>
                    {product.comment && (
                      <div className="text-sm text-gray-500 mt-1">
                        {product.comment}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {product.size} • {product.color}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Vol: {product.volume} • Cajas: {product.number_of_boxes}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.weight}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.quantity}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.statusResponseProduct ? "default" : "secondary"}
                      className={`${
                        product.statusResponseProduct
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.statusResponseProduct || "Pendiente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!quotationDetail?.products || quotationDetail.products.length === 0) && (
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
