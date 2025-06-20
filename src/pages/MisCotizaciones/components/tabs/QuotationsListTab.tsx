import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { useGetQuotationsByUser } from "@/hooks/use-quation";
import { columnsQuotationsList } from "../table/columnsQuotationsList";
import type { QuotationListItem } from "../../types/interfaces";

interface QuotationsListTabProps {
  onViewDetails: (quotationId: string) => void;
}

const QuotationsListTab: React.FC<QuotationsListTabProps> = ({ onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError } = useGetQuotationsByUser();

  // Configurar datos de paginación
  const quotations: QuotationListItem[] = data?.content || [];
  const pageInfo = {
    pageNumber: parseInt(data?.pageNumber || "1"),
    pageSize: parseInt(data?.pageSize || "10"),
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
  };

  // Filtrar cotizaciones localmente si hay término de búsqueda
  const filteredQuotations = quotations.filter((quotation) =>
    quotation.correlative.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    // Aquí podrías implementar la lógica para recargar datos con nueva página
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset a la primera página
  };

  const columns = columnsQuotationsList({ onViewDetails });

  if (isError) {
    return (
      <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error al cargar las cotizaciones. Por favor, intente nuevamente.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="text-necro font-medium text-lg">
          Solicitudes de Cotización
        </CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed">
          En este apartado se especifican las solicitudes de cotización
          que han sido registrados en el sistema. Puede verificar su
          estado, la respuesta del administrador y los documentos
          asociados a su cotización; seleccionando el botón que indica
          "Ver Detalles".
        </p>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={searchTerm ? filteredQuotations : quotations}
          pageInfo={pageInfo}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchTerm={searchTerm}
          isLoading={isLoading}
          toolbarOptions={{
            showSearch: true,
            showViewOptions: false,
          }}
          paginationOptions={{
            showSelectedCount: true,
            showPagination: true,
            showNavigation: true,
          }}
        />
      </CardContent>
    </Card>
  );
};

export default QuotationsListTab; 