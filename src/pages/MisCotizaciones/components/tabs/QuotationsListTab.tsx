import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { useGetQuotationsByUser } from "@/hooks/use-quation";
import { columnsQuotationsList } from "../table/columnsQuotationsList";


interface QuotationsListTabProps {
  onViewDetails: (quotationId: string) => void;
}

const QuotationsListTab: React.FC<QuotationsListTabProps> = ({ onViewDetails }) => {
  const [data, setData] = useState<any[]>([]);
  
  // Estados para nueva creación y eliminación
  const [searchTerm, setSearchTerm] = useState("");
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const { data: dataQuotations, isLoading, isError } = useGetQuotationsByUser();
  useEffect(() => {
    if (dataQuotations) {
      console.log("data", dataQuotations);
      setData(dataQuotations.content); // Aquí actualizas el estado de forma controlada
      setPageInfo({
        pageNumber: dataQuotations.pageNumber,
        pageSize: dataQuotations.pageSize,
        totalElements: dataQuotations.totalElements,
        totalPages: dataQuotations.totalPages,
      });
    }
  }, [dataQuotations, isLoading]);



  const handlePageChange = (page: number, pageSize: number) => {
    console.log(`Cambiando a página ${page} con tamaño ${pageSize}`);
    setPageInfo((prev) => ({
      ...prev,
      pageNumber: page,
      pageSize: pageSize,
    }));
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setPageInfo((prev) => ({
      ...prev,
      pageNumber: 0,
    }));
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
          data={data}
          pageInfo={pageInfo}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchTerm={searchTerm}
          isLoading={isLoading}
          toolbarOptions={{ showSearch: true, showViewOptions: false }}
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