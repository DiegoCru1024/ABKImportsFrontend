import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useGetInspectionById, useGetInspectionOrderSummary, useGetInspectionShipments } from "@/hooks/use-inspections";
import type { CargoType } from "@/api/interface/inspectionInterface";
import type { StatusHistoryEntry } from "@/api/interface/shipmentInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShipmentRouteTrackingMap } from "@/components/shipment-route-tracking";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { CustomsChannelBadge } from "./components/customs-channel-badge";
import { OrderInfoCards } from "./components/order-info-cards";
import { TrackingHistoryPanel } from "./components/tracking-history-panel";

export default function InspeccionDeMercanciasDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: inspection, isLoading: loadingInspection, error } = useGetInspectionById(id || "");
  const { data: orderSummary, isLoading: loadingSummary } = useGetInspectionOrderSummary(id || "");
  const { data: shipmentsData, isLoading: loadingShipments } = useGetInspectionShipments(id || "");

  // Calculate max tracking_point across all shipments
  const maxTrackingPoint = useMemo((): number => {
    const shipments = shipmentsData?.shipments;
    if (!shipments?.length) {
      // Fallback to inspection tracking_point (1-13)
      return inspection?.tracking_point || 1;
    }
    return shipments.reduce((max, s) => {
      const tp = (s as any).tracking_point ?? 14;
      return Math.max(max, tp);
    }, 14);
  }, [shipmentsData, inspection]);

  // Aggregate all status_history entries from all shipments
  const allStatusHistory = useMemo((): StatusHistoryEntry[] => {
    const shipments = shipmentsData?.shipments;
    if (!shipments?.length) return [];
    return shipments.flatMap((s) => s.status_history || []);
  }, [shipmentsData]);

  const cargoType: CargoType = inspection?.cargo_type || "general";

  if (loadingInspection) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Cargando inspeccion...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/inspeccion-de-mercancias")}
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar</h2>
            <p className="text-red-700">
              {error?.message || "No se pudo cargar los detalles de la inspeccion"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/inspeccion-de-mercancias")}
              className="flex items-center gap-2 hover:bg-gray-50 -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Volver</span>
            </Button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <PackageSearch className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  Inspeccion de Mercancias
                </h1>
                <p className="text-xs text-gray-500">
                  ID: {inspection.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Map + Right sidebar layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map (left, 2/3) */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm bg-white overflow-hidden h-full">
              <CardContent className="p-0">
                <div className="relative h-[560px] w-full">
                  <ShipmentRouteTrackingMap
                    serviceType={
                      inspection.shipping_service_type === "maritime"
                        ? "maritime"
                        : "aerial"
                    }
                    cargoType={cargoType}
                    currentPointNumber={maxTrackingPoint}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar (1/3): Canal Aduanero + Historial */}
          <div className="lg:col-span-1 space-y-4">
            {/* Canal Aduanero */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4 flex justify-center">
                <CustomsChannelBadge channel={orderSummary?.customs_channel} />
              </CardContent>
            </Card>

            {/* Historial de Tracking */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Historial de Tracking
                </h3>
                <TrackingHistoryPanel
                  entries={allStatusHistory}
                  isLoading={loadingShipments}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Cards (full width bottom row) */}
        <OrderInfoCards summary={orderSummary} isLoading={loadingSummary} />
      </div>
    </div>
  );
}
