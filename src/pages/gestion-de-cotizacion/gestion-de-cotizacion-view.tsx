import { useEffect, useState } from "react";
import {
  FileText,
  Calendar,
  Eye,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  ExternalLink,
  Clock,
  EyeOff,
} from "lucide-react";

// Importar componentes modulares
import DetailsResponse from "./components/views/detailsreponse";
import ListResponses from "./components/views/listreponses";

import { useGetQuotationsListWithPagination } from "@/hooks/use-quation";
import type { QuotationsByUserResponseInterfaceContent } from "@/api/interface/quotationInterface";

// Importar componentes UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { formatDate, formatDateTime } from "@/lib/format-time";

import {
  defaultStatusConfig,
  statusMap,
} from "@/pages/cotizacion-page/components/static";

export default function GestionDeCotizacionesView() {
  // ********Tabs**** */
  const [mainTab, setMainTab] = useState<string>("solicitudes");

  // ********Cotización seleccionada**** */
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>("");

  // ********Estados de filtro y búsqueda**** */

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // ********Estados del modal de imágenes**** */
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState<string[]>(
    []
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalProductName, setModalProductName] = useState("");

  // ********Datos y paginación**** */
  const [data, setData] = useState<QuotationsByUserResponseInterfaceContent[]>(
    []
  );
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });

  // Hook para obtener datos
  const {
    data: dataQuotations,
    isLoading,
    isError,
  } = useGetQuotationsListWithPagination(
    debouncedSearchTerm,
    pageInfo.pageNumber,
    pageInfo.pageSize
  );

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Actualizar datos cuando llegan del hook
  useEffect(() => {
    if (dataQuotations) {
      console.log("dataQuotations", dataQuotations);
      setData(dataQuotations.content);
      setPageInfo({
        pageNumber:
          typeof dataQuotations.pageNumber === "string"
            ? parseInt(dataQuotations.pageNumber)
            : dataQuotations.pageNumber,
        pageSize:
          typeof dataQuotations.pageSize === "string"
            ? parseInt(dataQuotations.pageSize)
            : dataQuotations.pageSize,
        totalElements: dataQuotations.totalElements,
        totalPages: dataQuotations.totalPages,
      });
    }
  }, [dataQuotations]);

  // ********Funciones de navegación**** */

  // Función para manejar la vista de detalles
  const handleViewDetails = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setMainTab("detalles");
  };

  const handleViewListResponses = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setMainTab("listResponses");
  };

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    setPageInfo((prev) => ({
      ...prev,
      pageNumber: newPage,
    }));
  };

  // ********Funciones del modal de imágenes**** */

  // Abrir modal de imágenes
  const openImageModal = (
    images: string[],
    productName: string,
    imageIndex: number = 0
  ) => {
    setSelectedProductImages(images);
    setModalProductName(productName);
    setCurrentImageIndex(imageIndex);
    setImageModalOpen(true);
  };

  // Cerrar modal de imágenes
  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedProductImages([]);
    setModalProductName("");
    setCurrentImageIndex(0);
  };

  // Navegar a la imagen anterior
  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedProductImages.length - 1 : prev - 1
    );
  };

  // Navegar a la siguiente imagen
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === selectedProductImages.length - 1 ? 0 : prev + 1
    );
  };

  // Descargar imagen actual
  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = selectedProductImages[currentImageIndex];
    link.download = `${modalProductName}_imagen_${currentImageIndex + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderizado condicional según el tab activo
  if (mainTab === "detalles" && selectedQuotationId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white shadow-sm">
          <div className="container flex items-center justify-between px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => setMainTab("solicitudes")}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a Solicitudes
            </Button>
          </div>
        </div>
        <DetailsResponse selectedQuotationId={selectedQuotationId} />
      </div>
    );
  }

    // Renderizado condicional según el tab activo
    if (mainTab === "listResponses" && selectedQuotationId) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="border-b bg-white shadow-sm">
            <div className="container flex items-center justify-between px-4 py-4">
              <Button
                variant="ghost"
                onClick={() => setMainTab("solicitudes")}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver a Solicitudes
              </Button>
            </div>
          </div>
            <ListResponses selectedQuotationId={selectedQuotationId} />
        </div>
      );
    }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      {/* Barra de navegación superior */}
      <div className="border-b-2 px-4 py-4 backdrop-blur-sm sticky top-0 z-10 border-border/60 bg-white/80">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
                <FileText className="h-6 w-6 text-white :" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Panel de Administración de Cotizaciones
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Gestiona las cotizaciones de tus productos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-6">
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por cliente o ID de cotización..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* Estados de carga y error */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex gap-3">
                    <div className="h-20 bg-gray-200 rounded w-48"></div>
                    <div className="h-20 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card className="border-red-200 bg-red-50">
            <div className="p-6 text-center">
              <div className="text-red-600 font-medium mb-2">
                Error al cargar las cotizaciones
              </div>
              <div className="text-red-500 text-sm">
                Por favor, intente recargar la página o contacte al
                administrador.
              </div>
            </div>
          </Card>
        )}

        {/* Cards de cotizaciones */}
        {!isLoading && !isError && (
          <>
            <div className="space-y-4">
              {data.map((quote: any) => {
                const statusConfig =
                  statusMap[quote.status as keyof typeof statusMap] ||
                  defaultStatusConfig;

                return (
                  <Card
                    key={quote.id}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        {/* Info cliente */}
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-2xl text-gray-900">
                                {quote.correlative}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                Estado de respuesta:
                              </span>
                              <Badge
                                className={`${statusConfig.color} border px-3 py-1 flex items-center gap-1`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}
                                ></div>
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-gray-900 font-medium">
                              Cliente: {quote.user?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Correo: {quote.user?.email}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex  flex-col  gap-1 items-start text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">
                                  Fecha: {formatDate(quote.createdAt)}{" "}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">
                                  Hora: {formatDateTime(quote.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información de productos */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Información de productos
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {quote.productQuantity}
                              </div>
                              <div className="text-sm text-gray-600">
                                Productos solicitados
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              Para ver los detalles completos de los productos,
                              haga clic en "Ver Detalles y Responder"
                            </div>
                          </div>
                        </div>
                      </div>
                      {quote.status !== "pending" && quote.status !=="draft" ? (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleViewListResponses(quote.id)}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <Eye className="w-4 h-4" />
                            Ver respuestas
                          </Button>
                        </div>
                      ) : (
                        <>
                        {quote.status !== "draft" ?(
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleViewDetails(quote.id)}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <Eye className="w-4 h-4" />
                            Responder
                          </Button>
                        </div>
                        ):
                        (
                          <div className="flex justify-end">
                            <Button
                              //onClick={() => handleViewDetails(quote.id)}
                              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <EyeOff className="w-4 h-4" />
                              Cotización en borrador
                            </Button>
                          </div>
                          )}
                      </>
                    )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Paginación */}
            {pageInfo.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-700">
                  Mostrando {(pageInfo.pageNumber - 1) * pageInfo.pageSize + 1}{" "}
                  a{" "}
                  {Math.min(
                    pageInfo.pageNumber * pageInfo.pageSize,
                    pageInfo.totalElements
                  )}{" "}
                  de {pageInfo.totalElements} resultados
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageInfo.pageNumber - 1)}
                    disabled={pageInfo.pageNumber <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pageInfo.totalPages ||
                        Math.abs(page - pageInfo.pageNumber) <= 1
                    )
                    .map((page: number, index: number, array: number[]) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <Button
                          variant={
                            page === pageInfo.pageNumber ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={
                            page === pageInfo.pageNumber
                              ? "bg-gray-900 text-white"
                              : ""
                          }
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pageInfo.pageNumber + 1)}
                    disabled={pageInfo.pageNumber >= pageInfo.totalPages}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {data.length === 0 && (
              <Card>
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron cotizaciones
                  </h3>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modal de carrusel de imágenes */}
      <Dialog open={imageModalOpen} onOpenChange={closeImageModal}>
        <DialogContent
          className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden"
          showCloseButton={false}
        >
          <div className="relative bg-white">
            {/* Header del modal */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white/90 to-transparent p-4">
              <div className="flex items-center justify-between text-gray-900">
                <div>
                  <h3 className="font-semibold text-lg">{modalProductName}</h3>
                  <p className="text-sm text-gray-600">
                    Imagen {currentImageIndex + 1} de{" "}
                    {selectedProductImages.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadImage}
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        selectedProductImages[currentImageIndex],
                        "_blank"
                      )
                    }
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeImageModal}
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Imagen principal */}
            <div className="relative flex items-center justify-center min-h-[60vh] max-h-[80vh]">
              {selectedProductImages.length > 0 && (
                <img
                  src={selectedProductImages[currentImageIndex]}
                  alt={`${modalProductName} - Imagen ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain cursor-pointer"
                  onClick={nextImage}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-image.png"; // Imagen placeholder si falla
                  }}
                />
              )}

              {/* Botones de navegación */}
              {selectedProductImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 hover:bg-gray-100 h-12 w-12 rounded-full shadow-lg bg-white/80 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 hover:bg-gray-100 h-12 w-12 rounded-full shadow-lg bg-white/80 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {selectedProductImages.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent p-4">
                <div className="flex justify-center gap-2 overflow-x-auto">
                  {selectedProductImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-all duration-200 ${
                        index === currentImageIndex
                          ? "border-gray-900 shadow-md"
                          : "border-gray-300 opacity-60 hover:opacity-80 hover:border-gray-500"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navegación por click */}
            <div className="absolute inset-0 grid grid-cols-2">
              {/* Área izquierda - click para imagen anterior */}
              <div
                className="cursor-pointer flex items-center justify-start pl-4"
                onClick={previousImage}
              />
              {/* Área derecha - click para imagen siguiente */}
              <div
                className="cursor-pointer flex items-center justify-end pr-4"
                onClick={nextImage}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
