import React, { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { Calendar, IdCard, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetQuotationById } from "@/hooks/use-quation";
import { columnsDetallesDeCotizacionAdmin } from "../table/columnsDetallesDeCotizacion";
  import type { ColumnasDetallesDeCotizacionAdmin } from "../utils/interface";

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

  const columns = columnsDetallesDeCotizacionAdmin({
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h4 className="font-semibold text-orange-800 mb-2">Tipo de Servicio</h4>
          <p className="text-orange-700">{quotationDetail.service_type}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Estado</h4>
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
      </div>
    </div>
  );
};

export default DetallesTab;
