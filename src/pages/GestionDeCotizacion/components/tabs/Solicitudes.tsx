import React from "react";
import { DataTable } from "@/components/table/data-table";
import { useGetQuotationsByUser } from "@/hooks/use-quation";
import { columnsQuotationsList } from "../../../MisCotizaciones/components/table/columnsQuotationsList";

interface SolicitudesTabProps {
  onViewDetails: (quotationId: string) => void;
}

const SolicitudesTab: React.FC<SolicitudesTabProps> = ({ onViewDetails }) => {
  const { data, isLoading, isError } = useGetQuotationsByUser();

  // Configurar datos para la tabla con paginación mock
  const quotations = data?.content || [];
  const pageInfo = {
    pageNumber: parseInt(data?.pageNumber || "1"),
    pageSize: parseInt(data?.pageSize || "10"),
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 1,
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

  if (isError) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-center text-red-600">
          Error al cargar las solicitudes de cotización. Por favor, intente nuevamente.
        </div>
      </div>
    );
  }

  const columns = columnsQuotationsList({ onViewDetails });

  return (
    <div className="space-y-4 p-6">
      <p className="text-black leading-relaxed">
        Aquí podrá ver todas las solicitudes de cotización recibidas.
      </p>
      <DataTable
        columns={columns}
        data={quotations}
        pageInfo={pageInfo}
        onPageChange={() => {}}
        onSearch={() => {}}
        searchTerm=""
        isLoading={isLoading}
        toolbarOptions={{ showSearch: true, showViewOptions: false }}
        paginationOptions={{
          showSelectedCount: true,
          showPagination: true,
          showNavigation: true,
        }}
      />
    </div>
  );
};

export default SolicitudesTab;
