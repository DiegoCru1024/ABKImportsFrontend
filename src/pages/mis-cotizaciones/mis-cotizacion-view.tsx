import React, { useState, useEffect } from "react";
import { FileText, Package, Plus, ArrowLeft, Undo2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { useGetQuotationsListWithPagination } from "@/hooks/use-quation";
import { columnsQuotationsList } from "./components/table/columnsQuotationsList";

import ConfirmationModal from "@/components/modal-confirmation";
import SendingModal from "@/components/sending-modal";
import { useDeleteQuotation } from "@/hooks/use-quation";
import { useNavigate } from "react-router-dom";

type ViewType = "list" | "details";

export default function MisCotizacionesView() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [data, setData] = useState<any[]>([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>("");
  const [selectedCorrelative, setSelectedCorrelative] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<string>("");
  const { mutate: deleteQuotation } = useDeleteQuotation();
  // Estados para paginación y búsqueda
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
    pageInfo.pageSize,
    ""
  );

  // Debug logs
  console.log("dataQuotations raw:", dataQuotations);
  console.log("isLoading:", isLoading);
  console.log("isError:", isError);

  useEffect(() => {
    if (dataQuotations) {
      // Mapear los datos de la API a la estructura esperada por el componente
      const mappedData = dataQuotations.content.map((item: any) => ({
        id: item.quotationId, // Cambiar quotationId por id
        correlative: item.correlative,
        status: item.status,
        service_type: item.service_type,
        productQuantity: item.productQuantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      
      setData(mappedData);
      console.log("dataQuotations", mappedData);
      setPageInfo({
        pageNumber: dataQuotations.pageNumber,
        pageSize: dataQuotations.pageSize,
        totalElements: dataQuotations.totalElements,
        totalPages: dataQuotations.totalPages,
      });
    }
  }, [dataQuotations, isLoading]);

  const handlePageChange = (page: number, pageSize: number) => {
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
      pageNumber: 1,
    }));
  };

  const handleViewDetails = (quotationId: string, correlative: string) => {
    navigate(`/dashboard/mis-cotizaciones/respuestas/${quotationId}`);
  };

  const handleEditQuotation = (
    quotationId: string,
    correlative: string,
    status: string
  ) => {
    // Redirigir a la nueva ruta de edición con el status como parámetro
    navigate(`/dashboard/editar/${quotationId}?status=${status}`);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedQuotationId("");
    setSelectedCorrelative("");
  };

  const handleDeleteQuotation = (quotationId: string) => {
    console.log("eliminarCotizacion", quotationId);
    setQuotationToDelete(quotationId);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    console.log("eliminando cotización:", quotationToDelete);
    setIsOpen(false);
    if (quotationToDelete) {
      setIsSending(true);
      deleteQuotation(quotationToDelete, {
        onSuccess: () => {
          setIsSending(false);
          setQuotationToDelete("");
          console.log("Cotización eliminada exitosamente");
        },
        onError: (error) => {
          setIsSending(false);
          setQuotationToDelete("");
          console.error("Error al eliminar la cotización:", error);
        },
      });
    }
  };

  const handleCancelDelete = () => {
    setIsOpen(false);
    setQuotationToDelete("");
  };

  // Calcular estadísticas
  const pendingCount = data.filter((q) => q.status === "pending").length;
  const draftCount = data.filter((q) => q.status === "draft").length;
  const completedCount = data.filter((q) => q.status === "completed").length;
  const inProgressCount = data.filter((q) => q.status === "in_progress").length;

  const columns = columnsQuotationsList({
    onViewDetails: handleViewDetails,
    onEditQuotation: handleEditQuotation,
    onDelete: handleDeleteQuotation,
  });

  // Vista de lista principal
  if (currentView === "list") {
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
                    Mis Cotizaciones
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Administra y supervisa todas tus cotizaciones
                  </p>
                </div>
              </div>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2"
                onClick={() => navigate("/dashboard/cotizacion-de-productos")}
              >
                <Plus className="h-4 w-4" />
                Nueva Cotización
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pendientes ({pendingCount})
                </CardTitle>
                <Package className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">
                  esperando respuesta
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Borradores ({draftCount})
                </CardTitle>
                <Package className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{draftCount}</div>
                <p className="text-xs text-muted-foreground">en proceso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completadas ({completedCount})
                </CardTitle>
                <Package className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCount}</div>
                <p className="text-xs text-muted-foreground">finalizadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  En Progreso ({inProgressCount})
                </CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressCount}</div>
                <p className="text-xs text-muted-foreground">en proceso</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de cotizaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Cotizaciones</CardTitle>
              <p className="text-sm text-muted-foreground">
                Todas las cotizaciones que has realizado
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-2">Cargando cotizaciones...</span>
                </div>
              ) : isError ? (
                <div className="text-center py-8 text-red-500">
                  Error al cargar las cotizaciones
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay cotizaciones disponibles
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={data}
                  searchTerm={searchTerm}
                  onSearch={handleSearch}
                  pageInfo={pageInfo}
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
          isOpen={isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirm}
          title="Confirmar eliminación"
          description="¿Estás seguro de querer eliminar esta cotización?"
          buttonText="Eliminar"
        />

        <SendingModal isOpen={isSending} onClose={() => setIsSending(false)} />
      </div>
    );
  }

  // Vista de detalles
  if (currentView === "details" && selectedQuotationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500/5 via-background to-orange-400/10">
        {/* Header con botón de regreso */}
        <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="w-full px-4 py-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="text-gray-600 hover:text-gray-900 p-0"
                  title="Atrás"
                >
                  <Undo2 className="h-8 w-8 text-orange-500 hover:text-orange-600" />
                </Button>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Respuesta de Cotización
                  </h1>
                  <p className="text-md text-muted-foreground font-medium">
                    Cotización #{selectedCorrelative}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*<ResponseListContainer 
          quotationId={selectedQuotationId}
          onBack={handleBackToList}
        />*/}
      </div>
    );
  }



  return null;
}
