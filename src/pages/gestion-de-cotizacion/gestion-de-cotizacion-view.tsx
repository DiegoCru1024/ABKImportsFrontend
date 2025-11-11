import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  FileText,
  LayoutGrid,
  Columns3,
} from "lucide-react";

import QuotationResponseView from "./quotation-response-view/quotation-response-view";
import QuotationResponsesList from "./components/views/quotation-responses-list";
import { QuotationCard } from "./components/shared/quotation-card";
import { QuotationsKanbanView } from "./components/views/quotations-kanban-view";

import { useQuotationList } from "./hooks/use-quotation-list";
import { useImageModal } from "./hooks/use-image-modal";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { SearchFilters } from "@/components/shared/search-filters";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ImageCarouselModal } from "@/components/shared/image-carousel-modal";

const filterOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "pending", label: "Pendiente" },
  { value: "observed", label: "Observado" },
  { value: "approved", label: "Aprobado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "completed", label: "Completado" },
  { value: "answered", label: "Respondido" },
];

export default function GestionDeCotizacionesView() {
  const navigate = useNavigate();

  const [mainTab, setMainTab] = useState<string>("solicitudes");
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("kanban");

  const quotationList = useQuotationList();
  const imageModal = useImageModal();

  const handleViewDetails = (quotationId: string) => {
    navigate(`/dashboard/gestion-de-cotizacion/respuesta/${quotationId}`);
  };

  const handleViewListResponses = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setMainTab("listResponses");
  };

  if (mainTab === "detalles" && selectedQuotationId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Responder Cotización"
          description="Creando respuesta para la cotización"
          actions={
            <Button
              variant="ghost"
              onClick={() => setMainTab("solicitudes")}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a Solicitudes
            </Button>
          }
        />
        <QuotationResponseView selectedQuotationId={selectedQuotationId} />
      </div>
    );
  }

  if (mainTab === "listResponses" && selectedQuotationId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Lista de Respuestas"
          description="Todas las respuestas de la cotización"
          actions={
            <Button
              variant="ghost"
              onClick={() => setMainTab("solicitudes")}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a Solicitudes
            </Button>
          }
        />
        <QuotationResponsesList selectedQuotationId={selectedQuotationId} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
      <SectionHeader
        icon={<FileText className="h-6 w-6 text-white" />}
        title="Panel de Administración de Cotizaciones"
        description="Gestiona las cotizaciones de tus productos"
      />

      <div className="flex-1 flex flex-col container mx-auto px-4 py-6 max-w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Tarjetas</span>
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className="flex items-center gap-2"
            >
              <Columns3 className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </Button>
          </div>
        </div>

        {viewMode === "grid" && (
          <SearchFilters
            searchValue={quotationList.searchTerm}
            onSearchChange={quotationList.handleSearchChange}
            filterValue={quotationList.filter}
            onFilterChange={quotationList.handleFilterChange}
            filterOptions={filterOptions}
            searchPlaceholder="Buscar por cliente o ID de cotización..."
            filterPlaceholder="Filtrar por estado"
            onClearFilter={quotationList.clearFilter}
          />
        )}

        {quotationList.isLoading && (
          <LoadingState message="Cargando cotizaciones..." variant="card" />
        )}

        {quotationList.isError && (
          <ErrorState
            title="Error al cargar las cotizaciones"
            message="Por favor, intente recargar la página o contacte al administrador."
            variant="card"
          />
        )}

        {!quotationList.isLoading && !quotationList.isError && (
          <>
            {viewMode === "grid" ? (
              <>
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                  {quotationList.data.map((quotation) => (
                    <QuotationCard
                      key={quotation.quotationId}
                      quotation={quotation}
                      onViewDetails={handleViewDetails}
                      onViewResponses={handleViewListResponses}
                      onOpenImageModal={imageModal.openModal}
                    />
                  ))}
                </div>

                <PaginationControls
                  currentPage={quotationList.pageInfo.pageNumber}
                  totalPages={quotationList.pageInfo.totalPages}
                  totalElements={quotationList.pageInfo.totalElements}
                  pageSize={quotationList.pageInfo.pageSize}
                  onPageChange={quotationList.handlePageChange}
                />

                {quotationList.data.length === 0 && (
                  <div className="flex flex-col items-center justify-center flex-1 py-12">
                    <FileText className="w-16 h-16 mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No se encontraron cotizaciones
                    </h3>
                    <p className="text-sm text-gray-600">No hay cotizaciones que coincidan con tu búsqueda.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <QuotationsKanbanView
                  quotations={quotationList.data}
                  onViewDetails={handleViewDetails}
                  onViewResponses={handleViewListResponses}
                />
              </div>
            )}
          </>
        )}
      </div>

      <ImageCarouselModal
        isOpen={imageModal.isOpen}
        onClose={imageModal.closeModal}
        images={imageModal.selectedImages}
        currentIndex={imageModal.currentImageIndex}
        productName={imageModal.productName}
        onPrevious={imageModal.previousImage}
        onNext={imageModal.nextImage}
        onGoToImage={imageModal.goToImage}
        onDownload={imageModal.downloadImage}
      />
    </div>
  );
}
