import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus } from "lucide-react";

import {
  useDeleteQuatitationResponse,
  useGetListResponsesByQuotationId,
} from "@/hooks/use-quatitation-response";
import { columnsListResponses } from "../table/columnsListResponses";
import type { contentQuotationResponseDTO } from "@/api/interface/quotationResponseInterfaces";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { DataTable } from "@/components/table/data-table";
import SendingModal from "@/components/sending-modal";
import ConfirmationModal from "@/components/modal-confirmation";

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
      <ErrorState
        title="ID de cotización no válido"
        message="No se proporcionó un ID de cotización válido"
        variant="page"
      />
    );
  }

  if (isLoading) {
    return <LoadingState message="Cargando respuestas..." variant="page" />;
  }
  
  if (isError) {
    return (
      <ErrorState
        title="Error al cargar las respuestas"
        message="Ha ocurrido un problema al cargar las respuestas de la cotización"
        variant="page"
      />
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
      <SectionHeader
        icon={<FileText className="h-6 w-6 text-white" />}
        title="Lista de Respuestas"
        description="Todas las respuestas de la cotización"
        actions={
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow-sm flex items-center gap-2"
            onClick={() =>
              navigate(
                `/dashboard/gestion-de-cotizacion/respuestas/${selectedQuotationId}/responder`
              )
            }
          >
            <Plus className="h-4 w-4" />
            Nueva Respuesta
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle className="text-xl font-bold text-slate-800">
              Lista de Respuestas
            </CardTitle>
            <p className="text-sm text-slate-600">
              Todas las respuestas generadas para esta cotización
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <LoadingState message="Cargando respuestas..." variant="inline" />
            ) : isError ? (
              <ErrorState
                title="Error al cargar respuestas"
                message="No se pudieron cargar las respuestas de la cotización"
                variant="inline"
              />
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
