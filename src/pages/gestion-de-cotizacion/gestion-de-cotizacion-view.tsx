import { useEffect, useState } from "react";
import { 
  FileText, 
  User, 
  Calendar, 
  Eye, 
  Package, 
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  ExternalLink
} from "lucide-react";

// Importar componentes modulares
import DetallesTab from "./components/views/details";

import { useGetQuotationsListWithPagination } from "@/hooks/use-quation";
import type { QuotationsByUserResponseInterfaceContent } from "@/api/interface/quotationInterface";

// Importar componentes UI
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { statusFilterOptions, statusMap, type TabId } from "@/pages/Cotizacion/components/static";
import { formatDate, formatDateTime } from "@/lib/format-time";



export default function GestionDeCotizacionesView() {
  // ********Tabs**** */
  const [mainTab, setMainTab] = useState<TabId>("solicitudes");

  // ********Cotización seleccionada**** */
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>("");

  // ********Producto seleccionado para respuesta**** */
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");

  // ********Estados de filtro y búsqueda**** */
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // ********Estados del modal de imágenes**** */
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalProductName, setModalProductName] = useState("");

  // ********Datos y paginación**** */
  const [data, setData] = useState<QuotationsByUserResponseInterfaceContent[]>([]);
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
      setData(dataQuotations.content);
      setPageInfo({
        pageNumber: typeof dataQuotations.pageNumber === 'string' 
          ? parseInt(dataQuotations.pageNumber) 
          : dataQuotations.pageNumber,
        pageSize: typeof dataQuotations.pageSize === 'string' 
          ? parseInt(dataQuotations.pageSize) 
          : dataQuotations.pageSize,
        totalElements: dataQuotations.totalElements,
        totalPages: dataQuotations.totalPages,
      });
    }
  }, [dataQuotations]);

  // ********Funciones auxiliares**** */
  
  // Determinar el estado de una cotización
  const getQuotationStatus = (quote: any) => {
    if (!quote.products || !Array.isArray(quote.products)) return "pending";
    
    const totalProducts = quote.products.length;
    const respondedProducts = quote.products.filter(
      (p: any) => p.statusResponseProduct === "answered"
    ).length;
    
    if (respondedProducts === 0) return "pending";
    if (respondedProducts < totalProducts) return "partial";
    return "answered";
  };

  // Filtrar cotizaciones según el estado seleccionado
  const filteredQuotes = data.filter((quote) => {
    if (statusFilter === "all") return true;
    return getQuotationStatus(quote) === statusFilter;
  });

  // Calcular conteos para los filtros
  const getStatusCounts = () => {
    const counts = { all: data.length, pending: 0, partial: 0, answered: 0 };
    
    data.forEach(quote => {
      const status = getQuotationStatus(quote);
      counts[status as keyof typeof counts]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  // ********Funciones de navegación**** */
  
  // Función para manejar la vista de detalles
  const handleViewDetails = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setMainTab("detalles");
  };

  // Función para manejar la selección de producto para respuesta
  const handleSelectProductForResponse = (
    productId: string,
    productName: string
  ) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
    setMainTab("respuesta");
  };

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    setPageInfo(prev => ({
      ...prev,
      pageNumber: newPage
    }));
  };



  // ********Funciones del modal de imágenes**** */
  
  // Abrir modal de imágenes
  const openImageModal = (images: string[], productName: string, imageIndex: number = 0) => {
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
    const link = document.createElement('a');
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
        <DetallesTab
          selectedQuotationId={selectedQuotationId}
        />
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

        {/* Filtros de estado */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {statusFilterOptions.map((opt: { key: string; label: string }) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  statusFilter === opt.key
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {opt.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  statusFilter === opt.key 
                    ? "bg-white/20 text-white" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {statusCounts[opt.key as keyof typeof statusCounts]}
                </span>
              </button>
            ))}
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
              <div className="text-red-600 font-medium mb-2">Error al cargar las cotizaciones</div>
              <div className="text-red-500 text-sm">
                Por favor, intente recargar la página o contacte al administrador.
              </div>
            </div>
          </Card>
        )}

        {/* Cards de cotizaciones */}
        {!isLoading && !isError && (
          <>
            <div className="space-y-4">
              {filteredQuotes.map((quote: any) => {
                const status = getQuotationStatus(quote);
                const statusConfig = statusMap[status as keyof typeof statusMap];
                const totalProducts = quote.products?.length || 0;
                const respondedProducts = quote.products?.filter(
                  (p: any) => p.statusResponseProduct === "answered"
                ).length || 0;
                const progress = totalProducts > 0 ? Math.round((respondedProducts / totalProducts) * 100) : 0;

                return (
                  <Card key={quote.id} className="hover:shadow-lg transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        {/* Info cliente */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {quote.correlative}
                              </h3>
                              <Badge className={`${statusConfig.color} border px-3 py-1 flex items-center gap-1`}>
                                <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-gray-900 font-medium">{quote.user?.name}</p>
                            <p className="text-sm text-gray-500">{quote.user?.email}</p>
                          </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{totalProducts}</div>
                            <div className="text-sm text-gray-600">Productos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{respondedProducts}</div>
                            <div className="text-sm text-gray-600">Respondidos</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{formatDate(quote.createdAt)} {formatDateTime(quote.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progreso de Respuestas</span>
                          <span className="text-sm text-gray-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Productos */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Productos ({totalProducts})
                        </h4>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {quote.products?.map((product: any) => (
                            <div key={product.id} className="flex-shrink-0 bg-gray-50 rounded-lg p-3 min-w-[200px]">
                              {product.attachments && product.attachments.length > 0 && (
                                <div className="relative group mb-2">
                                  <img
                                    src={product.attachments[0]}
                                    alt={product.name}
                                    className="w-full h-20 object-cover rounded cursor-pointer transition-all duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  {/* Overlay con hover effect */}
                                  <div 
                                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center cursor-pointer"
                                    onClick={() => openImageModal(product.attachments, product.name)}
                                  >
                                    <div className="flex items-center gap-2 text-white">
                                      <Eye className="w-5 h-5" />
                                      <span className="text-sm font-medium">
                                        {product.attachments.length > 1 
                                          ? `Ver ${product.attachments.length} imágenes` 
                                          : 'Ver imagen'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                  {/* Badge contador de imágenes */}
                                  {product.attachments.length > 1 && (
                                    <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-80 text-white text-xs px-2 py-1 rounded-full">
                                      +{product.attachments.length - 1}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                              <div className="text-xs text-gray-600 truncate">{product.comment}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {product.quantity} unidades
                              </div>
                              {product.statusResponseProduct === "answered" && (
                                <div className="mt-1">
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    Respondido
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botón acción */}
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleViewDetails(quote.id)}
                          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalles y Responder
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Paginación */}
            {pageInfo.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-700">
                  Mostrando {((pageInfo.pageNumber - 1) * pageInfo.pageSize) + 1} a{" "}
                  {Math.min(pageInfo.pageNumber * pageInfo.pageSize, pageInfo.totalElements)} de{" "}
                  {pageInfo.totalElements} resultados
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
                    .filter(page => 
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
                          variant={page === pageInfo.pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={page === pageInfo.pageNumber ? "bg-gray-900 text-white" : ""}
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
            {filteredQuotes.length === 0 && (
              <Card>
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron cotizaciones
                  </h3>
                  <p className="text-gray-500">
                    {statusFilter !== "all" 
                      ? `No hay cotizaciones con estado "${statusFilterOptions.find((opt: any) => opt.key === statusFilter)?.label}"`
                      : "Intente ajustar los filtros de búsqueda"
                    }
                  </p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modal de carrusel de imágenes */}
      <Dialog open={imageModalOpen} onOpenChange={closeImageModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden" showCloseButton={false}>
          <div className="relative bg-white">
            {/* Header del modal */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white/90 to-transparent p-4">
              <div className="flex items-center justify-between text-gray-900">
                <div>
                  <h3 className="font-semibold text-lg">{modalProductName}</h3>
                  <p className="text-sm text-gray-600">
                    Imagen {currentImageIndex + 1} de {selectedProductImages.length}
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
                    onClick={() => window.open(selectedProductImages[currentImageIndex], '_blank')}
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
                    target.src = '/placeholder-image.png'; // Imagen placeholder si falla
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
                          ? 'border-gray-900 shadow-md' 
                          : 'border-gray-300 opacity-60 hover:opacity-80 hover:border-gray-500'
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
