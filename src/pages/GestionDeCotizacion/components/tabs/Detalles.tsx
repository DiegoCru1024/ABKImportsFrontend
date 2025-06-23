import React, { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { Calendar, IdCard, UserRound, Calculator, FileText, Clock, Receipt, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetQuotationById } from "@/hooks/use-quation";
  import type { ColumnasDetallesDeCotizacionAdmin } from "../utils/interface";
import { columnsProductDetails } from "@/pages/MisCotizaciones/components/table/columnsProductDetails";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/functions";

interface DetallesTabProps {
  selectedQuotationId: string;
  onSelectProductForResponse: (productId: string, productName: string) => void;
}

const DetallesTab: React.FC<DetallesTabProps> = ({ 
  selectedQuotationId,
  onSelectProductForResponse
}) => {
  const [subTab, setSubTab] = useState<"Todos" | "No respondido" | "Respondido" | "Observado">("Todos");
  
  const { data: quotationDetail, isLoading, isError } = useGetQuotationById(selectedQuotationId);

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
  const products: (ColumnasDetallesDeCotizacionAdmin & { estadoRespuesta: string })[] = 
    (quotationDetail?.products || []).map((product: ColumnasDetallesDeCotizacionAdmin) => ({
      ...product,
      estadoRespuesta: product.responses?.length > 0 ? "Respondido" : "No respondido"
    }));

  // Filtrar productos según el sub-tab
  const filteredProducts = products.filter(
    (p) => subTab === "Todos" || p.estadoRespuesta === subTab
  );

  const columns = columnsProductDetails({
    onViewTracking: (productId: string, productName: string) => {
      onSelectProductForResponse(productId, productName);
    }
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
          Error al cargar los detalles de la cotización. Por favor, intente nuevamente.
        </div>
      </div>
    );
  }

  const total_price =
    quotationDetail?.summationTotal +
      quotationDetail?.express_price +
      quotationDetail?.summationTaxes +
      quotationDetail?.summationServiceFee || 0;

  //* Pricing Data
  // Estructura de los datos para el resumen de precios
  const pricingData = [
    {
      id: "total",
      title: "Precio Total de la cotización",
      amount: total_price,
      description: "Suma total de todos los conceptos",
      icon: Calculator,
      isTotal: true,
    },
    {
      id: "quote",
      title: "Precio de la cotización",
      amount: quotationDetail?.summationTotal || 0,
      description: "Costo base del servicio cotizado",
      icon: FileText,
    },
    {
      id: "express",
      title: "Precio express",
      amount: quotationDetail?.express_price || 0,
      description: "Cargo adicional por servicio urgente",
      icon: Clock,
    },
    {
      id: "taxes",
      title: "Precio de los impuestos",
      amount: quotationDetail?.summationTaxes || 0,
      description: "Impuestos aplicables según legislación",
      icon: Receipt,
    },
    {
      id: "services",
      title: "Precio de los servicios",
      amount: quotationDetail?.summationServiceFee || 0,
      description: "Servicios adicionales incluidos",
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-4 p-6">
      {/* Información general de la cotización */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="mb-4 text-black leading-relaxed">
          <strong>Id de cotización: </strong>
          <div className="flex items-center gap-2">
            <IdCard className="w-4 h-4 text-[#d7751f]" />
            <span className="font-mono text-sm">{quotationDetail.correlative}</span>
          </div>
        </div>
        <div className="mb-4 text-black leading-relaxed flex flex-col">
          <strong>Fecha de registro:</strong>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#d7751f]" />
            <span>{formatDate(quotationDetail.createdAt)}</span>
          </div>
        </div>
        <div className="mb-4 text-black leading-relaxed flex flex-col">
          <strong>Datos del cliente:</strong>
          <div className="flex items-center gap-2">
            <UserRound className="w-4 h-4 text-[#d7751f]" />
            <p>{quotationDetail.user.name} - {quotationDetail.user.email}</p>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4  mb-6">
        <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
          <h4 className="font-semibold text-orange-800 mb-2">Tipo de Servicio</h4>
          <p className="text-orange-700">{quotationDetail.service_type}</p>
        </div>
        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Estado de la cotización</h4>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {quotationDetail.status}
          </Badge>
        </div>
      </div>

      <p className="text-black leading-relaxed">
        Productos de la cotización <strong>{quotationDetail.correlative}</strong>
      </p>

      {/* Sub Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        {["Todos", "No respondido", "Respondido", "Observado"].map((st) => (
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
            data={filteredProducts}
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
            <div className="w-16 h-px bg-slate-300 mx-auto"></div>
            <p className="text-slate-500  text-sm">
              Resumen detallado de conceptos
            </p>
          </div>

          {/* Total Card - Clean and Prominent */}
          <Card className=" shadow-sm bg-white/70 hover:bg-orange-50 transition-all duration-300">
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
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

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
