import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus } from "lucide-react";

import { columnsListResponses } from "../table/columnsListResponses";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { DataTable } from "@/components/table/data-table";
import SendingModal from "@/components/sending-modal";
import ConfirmationModal from "@/components/modal-confirmation";

import {
  useDeleteQuatitationResponse,
  useListQuatitationResponse,
} from "@/hooks/use-quatitation-response";

interface QuotationResponsesListProps {
  selectedQuotationId: string;
}

export default function QuotationResponsesList({
  selectedQuotationId,
}: QuotationResponsesListProps) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isSendingModalOpen, setIsSendingModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const {
    data: responses,
    isLoading,
    isError,
    refetch,
  } = useListQuatitationResponse(selectedQuotationId, page, size);

  const deleteResponseMutation = useDeleteQuatitationResponse();

  const handleCreateNewResponse = () => {
    navigate(`/dashboard/gestion-de-cotizacion/respuesta/${selectedQuotationId}`);
  };

  const handleEditResponse = (responseId: string, serviceType: string) => {
    navigate(
      `/dashboard/gestion-de-cotizacion/respuesta/${selectedQuotationId}/${responseId}`,
      { state: { serviceType } }
    );
  };

  const handleDeleteResponse = (responseId: string) => {
    setSelectedResponseId(responseId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedResponseId) return;

    setIsSendingModalOpen(true);
    try {
      await deleteResponseMutation.mutateAsync(selectedResponseId);
      await refetch();
    } catch (error) {
      console.error("Error al eliminar respuesta:", error);
    } finally {
      setIsSendingModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedResponseId(null);
    }
  };

  const handleTablePageChange = (page: number) => {
    setPage(page);
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const filteredResponses =
    responses?.content?.filter(
      (response) =>
        response.id_quotation_response
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        response.response_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.advisorName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingState
          message="Cargando respuestas de cotización..."
          variant="card"
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorState
          title="Error al cargar las respuestas"
          message="Por favor, intente recargar la página o contacte al administrador."
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    Respuestas de Cotización
                  </CardTitle>
                  <p className="text-slate-600 text-sm mt-1">
                    Administra todas las respuestas para la cotización #
                    {selectedQuotationId}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCreateNewResponse}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Respuesta
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {filteredResponses.length > 0 ? (
              <>
                <DataTable
                  columns={columnsListResponses({
                    onEditQuotation: handleEditResponse,
                    onDelete: handleDeleteResponse,
                  })}
                  data={filteredResponses}
                  pageInfo={{
                    pageNumber: responses ? responses.pageNumber : 1,
                    pageSize: responses ? responses.pageSize : 10,
                    totalElements: responses ? responses.totalElements : 0,
                    totalPages: responses ? responses.totalPages : 1,
                  }}
                  onPageChange={handleTablePageChange}
                  onSearch={handleSearch}
                  searchTerm={searchTerm}
                  isLoading={isLoading}
                  toolbarOptions={{
                    showSearch: true,
                    showViewOptions: false,
                  }}
                  paginationOptions={{
                    showSelectedCount: false,
                    showPagination: true,
                    showNavigation: true,
                  }}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay respuestas disponibles
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Crea la primera respuesta para esta cotización.
                </p>
                <Button
                  onClick={handleCreateNewResponse}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Crear Primera Respuesta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedResponseId(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Respuesta"
        description="¿Está seguro que desea eliminar esta respuesta? Esta acción no se puede deshacer."
        buttonText="Eliminar"
      />

      <SendingModal
        isOpen={isSendingModalOpen}
        onClose={() => setIsSendingModalOpen(false)}
      />
    </div>
  );
}
