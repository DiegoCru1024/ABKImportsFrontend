import {
  useDeleteQuatitationResponse,
  useGetListResponsesByQuotationId,
} from "@/hooks/use-quatitation-response";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { columnsListResponses } from "../table/columnsListResponses";
import type { contentQuotationResponseDTO } from "@/api/interface/quotationResponseInterfaces";
import SendingModal from "@/components/sending-modal";
import ConfirmationModal from "@/components/modal-confirmation";

interface ListResponsesProps {
  selectedQuotationId: string;
}

const ListResponses: React.FC<ListResponsesProps> = ({
  selectedQuotationId,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenConfirmation, setIsOpenConfirmation] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    data: listResponses,
    isLoading,
    isError,
  } = useGetListResponsesByQuotationId(selectedQuotationId, page, pageSize);

  const { mutateAsync: deleteQuotationResponse } = useDeleteQuatitationResponse();

  const data: contentQuotationResponseDTO[] = listResponses?.content ?? [];

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar las respuestas</div>;

  const handleEditQuotation = (idResponse: string) => {
    navigate(`/dashboard/gestion-de-cotizacion/respuestas/${selectedQuotationId}/editar/${idResponse}`);
  };

  const handleDeleteQuotation = (idResponse: string) => {
    // 1) Guardar el id a eliminar y abrir modal de confirmación
    setSelectedId(idResponse);
    setIsOpenConfirmation(true);
  };

  const handleConfirmDeleteQuotation = async () => {
    if (!selectedId) return;
    // 2) Cerrar confirmación y abrir modal de envío
    setIsOpenConfirmation(false);
    setIsOpen(true);
    try {
      await deleteQuotationResponse(selectedId);
    } catch (error) {
      console.error(error);
    } finally {
      // 3) Cerrar modal de envío y limpiar selección
      setIsOpen(false);
      setSelectedId(null);
    }
  };

  const columns = columnsListResponses({
    onEditQuotation: handleEditQuotation,
    onDelete: handleDeleteQuotation,
  });

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-2">
      {/* Tabla de cotizaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Respuestas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Todas las respuestas de la cotización
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-2">Cargando respuestas...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar las respuestas
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data || []}
              searchTerm={searchTerm}
              onSearch={handleSearch}
              pageInfo={
                listResponses || {
                  pageNumber: 1,
                  pageSize: 10,
                  totalElements: 0,
                  totalPages: 1,
                }
              }
              onPageChange={handlePageChange}
              isLoading={isLoading}
              toolbarOptions={{ showSearch: true, showViewOptions: false }}
              paginationOptions={{
                showSelectedCount: true,
                showPagination: true,
                showNavigation: true,
              }}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={isOpenConfirmation}
        onClose={() => setIsOpenConfirmation(false)}
        onConfirm={handleConfirmDeleteQuotation}
        title="Eliminar respuesta"
        description="¿Estás seguro de querer eliminar esta respuesta?"
        buttonText="Eliminar"
        disabled={false}
      />
      <SendingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default ListResponses;
