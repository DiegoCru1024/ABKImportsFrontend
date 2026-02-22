import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, CalendarDays, Newspaper, ClipboardList } from "lucide-react";
import { useGetActiveInspection, useGetInspectionsByUser } from "@/hooks/use-inspections";
import type { Inspection } from "@/api/interface/inspectionInterface";
import { InspectionPreview } from "./components/inspection-preview";
import { OrdersListPanel } from "./components/orders-list-panel";
import { PlaceholderPanel } from "./components/placeholder-panel";

export default function DashboardView() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const { data: activeInspection, isLoading: loadingActive } = useGetActiveInspection();
  const { data: inspectionData, isLoading: loadingList, error: listError } = useGetInspectionsByUser("", page, 5);

  // Sincronizar lista de inspecciones
  useEffect(() => {
    if (inspectionData) {
      setInspections(inspectionData.content);
      setTotalPages(inspectionData.totalPages);
    }
  }, [inspectionData]);

  // Cuando se carga la inspeccion activa, posicionar el indice en ella
  useEffect(() => {
    if (activeInspection && inspections.length > 0) {
      const idx = inspections.findIndex((i) => i.id === activeInspection.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [activeInspection, inspections]);

  const currentInspectionId = inspections[currentIndex]?.id || activeInspection?.id || null;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(inspections.length - 1, prev + 1));
  }, [inspections.length]);

  const handleSelectInspection = useCallback((id: string) => {
    const idx = inspections.findIndex((i) => i.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  }, [inspections]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setCurrentIndex(0);
  }, []);

  const isLoading = loadingActive || loadingList;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-500">Resumen de tus operaciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal 2x2 */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ===== CUADRANTE SUPERIOR IZQUIERDO (2/3) ===== */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm h-full">
              <CardContent className="p-5">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Cargando pedido activo...</p>
                    </div>
                  </div>
                ) : (
                  <InspectionPreview
                    inspectionId={currentInspectionId || ""}
                    currentIndex={currentIndex}
                    totalInspections={inspections.length}
                    onPrev={handlePrev}
                    onNext={handleNext}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* ===== CUADRANTE SUPERIOR DERECHO (1/3) ===== */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm h-full">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-50 to-violet-100">
                    <CalendarDays className="h-3.5 w-3.5 text-violet-500" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-gray-800">
                    Calendario Logistico
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <PlaceholderPanel
                  title="Calendario Logistico"
                  description="Proximamente podras ver tus fechas de embarque, llegada y despacho en un solo lugar."
                  icon={CalendarDays}
                />
              </CardContent>
            </Card>
          </div>

          {/* ===== CUADRANTE INFERIOR IZQUIERDO (2/3) ===== */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                      <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <CardTitle className="text-sm font-semibold text-gray-800">
                      Mis Pedidos
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <OrdersListPanel
                  inspections={inspections}
                  isLoading={loadingList}
                  error={listError}
                  selectedInspectionId={currentInspectionId}
                  onSelectInspection={handleSelectInspection}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* ===== CUADRANTE INFERIOR DERECHO (1/3) ===== */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm h-full">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <Newspaper className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-gray-800">
                    Eventos y Noticias
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <PlaceholderPanel
                  title="Eventos y Noticias"
                  description="Mantente informado sobre novedades de importacion, eventos del sector y actualizaciones de ABK Imports."
                  icon={Newspaper}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
