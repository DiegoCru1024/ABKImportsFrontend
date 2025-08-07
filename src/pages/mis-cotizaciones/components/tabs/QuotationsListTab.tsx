import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import {
  useDeleteQuotation,
  useGetQuotationsListWithPagination,
} from "@/hooks/use-quation";
import { columnsQuotationsList } from "../table/columnsQuotationsList";
import { toast } from "sonner";
import ConfirmationModal from "@/components/modal-confirmation";
import SendingModal from "@/components/sending-modal";

interface QuotationsListTabProps {
  onViewDetails: (quotationId: string, correlative: string) => void;
  onEditQuotation: (quotationId: string, correlative: string) => void;
}

const QuotationsListTab: React.FC<QuotationsListTabProps> = ({
  onViewDetails,
  onEditQuotation,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(
    null
  );
  // Estados para nueva creación y eliminación
  const [searchTerm, setSearchTerm] = useState("");
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const {
    data: dataQuotations,
    isLoading,
    isError,
  } = useGetQuotationsListWithPagination(
    searchTerm,
    pageInfo.pageNumber,
    pageInfo.pageSize
  );
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

  const { mutate: deleteQuotation } = useDeleteQuotation();

  const onDelete = async (id: string) => {
    console.log("eliminarCotizacion", id);
    setSelectedQuotationId(id);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (selectedQuotationId) {
      setIsSending(true);
      try {
        deleteQuotation(selectedQuotationId);
      } catch (error) {
        console.error("Error al eliminar la cotización:", error);
        toast.error("Error al eliminar la cotización");
      } finally {
        setIsSending(false);
      }
    }
  };

  const columns = columnsQuotationsList({
    onViewDetails,
    onEditQuotation,
    onDelete,
  });

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
        <p className="text-muted-foreground text-sm leading-relaxed"></p>
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
      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Confirmación"
        description="¿Estás seguro de querer eliminar esta cotización?"
        buttonText="Eliminar"
      />

      <SendingModal isOpen={isSending} onClose={() => setIsSending(false)} />
    </Card>
  );
};

export default QuotationsListTab;
