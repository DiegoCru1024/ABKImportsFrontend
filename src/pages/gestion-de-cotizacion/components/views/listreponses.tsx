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
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ListResponsesProps {
  selectedQuotationId: string;
}

const ListResponses: React.FC<ListResponsesProps> = ({
  selectedQuotationId,
}) => {
  console.log("ListResponses component received selectedQuotationId:", selectedQuotationId);
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

  console.log("ListResponses - listResponses data:", listResponses);
  console.log("ListResponses - isLoading:", isLoading);
  console.log("ListResponses - isError:", isError);

  const { mutateAsync: deleteQuotationResponse } =
    useDeleteQuatitationResponse();

  const data: contentQuotationResponseDTO[] = listResponses?.content ?? [];

  if (!selectedQuotationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10 p-6">
        <div className="text-center text-red-600">
          Error: No se proporcionó un ID de cotización válido
        </div>
        <div className="text-center text-gray-500 text-sm mt-2">
          selectedQuotationId: {selectedQuotationId}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2">Cargando respuestas...</span>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10 p-6">
        <div className="text-center text-red-600">
          Error al cargar las respuestas
        </div>
        <div className="text-center text-gray-500 text-sm mt-2">
          selectedQuotationId: {selectedQuotationId}
        </div>
      </div>
    );
  }

  const handleEditQuotation = (idResponse: string) => {
    navigate(
      `/dashboard/gestion-de-cotizacion/respuestas/${selectedQuotationId}/editar/${idResponse}`
    );
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
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      {/* Header */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Lista de Respuestas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Todas las respuestas de la cotización
                </p>
              </div>
            </div>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2"
              onClick={() =>
                navigate(
                  `/dashboard/gestion-de-cotizacion/respuestas/${selectedQuotationId}/responder`
                )
              }
            >
              <Plus className="h-4 w-4" />
              Nueva Respuesta
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
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
      </div>

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
