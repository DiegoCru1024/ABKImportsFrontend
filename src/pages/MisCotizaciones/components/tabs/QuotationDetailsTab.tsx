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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetQuotationById } from "@/hooks/use-quation";
import { columnsProductDetails } from "@/pages/MisCotizaciones/components/table/columnsProductDetails";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/functions";
import type { ProductoResponseIdInterface } from "@/api/interface/quotationInterface";
import { statusColorsQuotation, statusResponseQuotation } from "@/pages/GestionDeCotizacion/components/utils/static";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DetallesTabProps {
  selectedQuotationId: string;
  onSelectProductForResponse: (productId: string, productName: string) => void;
}

const DetallesTab: React.FC<DetallesTabProps> = ({
  selectedQuotationId,
  onSelectProductForResponse,
}) => {
  const [subTab, setSubTab] = useState<
    "Todos" | "No respondido" | "Respondido" | "Observado"
  >("Todos");
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);
  
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");

  // Establecer el primer servicio como seleccionado cuando se cargan los datos
  useEffect(() => {
    if (quotationDetail?.summaryByServiceType?.[0]?.service_type && !selectedServiceType) {
      setSelectedServiceType(quotationDetail.summaryByServiceType[0].service_type);
    }
  }, [quotationDetail, selectedServiceType]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  // Mapear productos y agregar estado de respuesta mock
  const products: (ProductoResponseIdInterface & {
    estadoRespuesta: string;
  })[] = (quotationDetail?.products || []).map(
    (product: ProductoResponseIdInterface) => ({
      ...product,
      estadoRespuesta: product.statusResponseProduct
        ? "Respondido"
        : "No respondido",
    })
  );

  // Filtrar productos según el sub-tab
  const filteredProducts = products.filter(
    (p) => subTab === "Todos" || p.estadoRespuesta === subTab
  );

  const columns = columnsProductDetails({
    onViewTracking: (productId: string, productName: string) => {
      onSelectProductForResponse(productId, productName);
    },
  });

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

  // Función para generar los datos de precios basados en un servicio específico
  const getPricingData = (serviceData: any) => [
    {
      id: "total",
      title: "Precio Total de la cotización",
      amount: serviceData.total_price+serviceData.service_fee+serviceData.taxes+serviceData.express_price,
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
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
              <p className="text-gray-800">N° de cotización</p>
                <h1 className="text-lg font-bold text-gray-900">
                  {quotationDetail.correlative}
                </h1>
              
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <p className="text-gray-800 text-sm font-semibold">
                Estado de la cotización:
              </p>
              <Badge
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
          </div>

          {/* Timeline */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fecha de registro */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-900">
                          Fecha de registro
                        </p>
                        <p className="text-blue-700 text-sm">
                          {formatDate(quotationDetail.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-green-900">Cliente</p>
                        <p className="text-green-700 text-sm">
                          {quotationDetail.user.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo de servicio */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-orange-900">
                          Tipo de servicio
                        </p>
                        <p className="text-orange-700 text-sm">
                          {
                            quotationDetail.summaryByServiceType?.[0]
                              ?.service_type
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        {["Todos", "no_answered", "answered", "observed"].map((st) => (
          <button
            key={st}
            onClick={() => setSubTab(st as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
              subTab === st
                ? "text-[#d7751f] bg-[#fdf9ef]"
                : "text-gray-600 hover:text-gray-800 hover:bg-[#fdf9ef]"
            }`}
          >
            {st}
            {subTab === st && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d7751f]" />
            )}
          </button>
        ))}
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg border">
        <div className="p-4">
          <DataTable
            columns={columns}
            data={filteredProducts as any}
            pageInfo={{
              pageNumber: 1,
              pageSize: filteredProducts.length,
              totalElements: filteredProducts.length,
              totalPages: 1,
            }}
            onPageChange={() => {}}
            onSearch={() => {}}
            searchTerm=""
            isLoading={false}
            toolbarOptions={{ showSearch: false, showViewOptions: false }}
            paginationOptions={{
              showSelectedCount: false,
              showPagination: false,
              showNavigation: false,
            }}
          />
        </div>

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
              {quotationDetail.summaryByServiceType?.map((price) => {
                const pricingData = getPricingData(price);
                return (
                  <TabsContent key={price.service_type} value={price.service_type}>
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
            {quotationDetail.summaryByServiceType?.map((price) => {
              const pricingData = getPricingData(price);
              return selectedServiceType === price.service_type ? (
                <Card key={`total-${price.service_type}`} className=" shadow-sm bg-white/70 hover:bg-orange-50 transition-all duration-300">
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
                {/*<span>Precios sujetos a términos y condiciones</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>*/}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallesTab;
