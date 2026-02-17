import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useGetInspectionById, useGetInspectionOrderSummary, useGetInspectionTrackingHistory, useGetInspectionShipments } from "@/hooks/use-inspections";
import { useGetShipmentTrackingStatuses } from "@/hooks/use-shipments";
import type { CargoType } from "@/api/interface/inspectionInterface";
import type { ShipmentTrackingStatus } from "@/api/interface/shipmentInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShipmentRouteTrackingMap } from "@/components/shipment-route-tracking";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { CustomsChannelBadge } from "./components/customs-channel-badge";
import { OrderInfoCards } from "./components/order-info-cards";
import { TrackingHistoryPanel } from "./components/tracking-history-panel";

/** Mapeo de status de producto a tracking point (1-13) */
const STATUS_TO_TRACKING_POINT: Record<string, number> = {
  pending_arrival: 1,
  in_inspection: 2,
  awaiting_pickup: 3,
  in_transit_0: 4,
  in_transit_50: 5,
  in_transit_75: 6,
  arrived_airport: 7,
  customs_inspection: 8,
  customs_waiting: 9,
  customs_delay: 10,
  customs_approved: 11,
  waiting_boarding: 12,
  boarding_confirmed: 13,
};

export default function InspeccionDeMercanciasDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: inspection, isLoading: loadingInspection, error } = useGetInspectionById(id || "");
  const { data: orderSummary, isLoading: loadingSummary } = useGetInspectionOrderSummary(id || "");
  const { data: trackingHistory, isLoading: loadingHistory } = useGetInspectionTrackingHistory(id || "");
  const { data: shipmentStatusesData } = useGetShipmentTrackingStatuses();
  const { data: shipmentsData } = useGetInspectionShipments(id || "");

  // Estados de tracking de shipments (14-45)
  const shipmentTrackingStatuses = useMemo(
    () => shipmentStatusesData?.statuses || [],
    [shipmentStatusesData?.statuses]
  );

  // Shipment vinculado (tomar el primero)
  const linkedShipment = useMemo(
    () => shipmentsData?.shipments?.[0] || null,
    [shipmentsData]
  );

  // Calcular el tracking point maximo entre todos los productos del content
  const maxTrackingPoint = useMemo((): number => {
    // Si hay un shipment vinculado con tracking_point >= 14, considerarlo
    const shipmentTp = linkedShipment?.tracking_point && linkedShipment.tracking_point >= 14
      ? linkedShipment.tracking_point
      : 0;

    const products = inspection?.content;
    if (!products?.length) {
      return Math.max(shipmentTp, inspection?.tracking_point || 1);
    }

    const productMax = products.reduce((max, product) => {
      // 1. Buscar en el mapeo local de inspección (1-13)
      let tp = STATUS_TO_TRACKING_POINT[product.status];

      // 2. Si no está, buscar en estados de shipment (14-45)
      if (tp === undefined) {
        const shipmentStatus = shipmentTrackingStatuses.find(
          (s: ShipmentTrackingStatus) => s.value === product.status
        );
        if (shipmentStatus) {
          tp = shipmentStatus.tracking_point;
        }
      }

      return Math.max(max, tp ?? 1);
    }, 1);

    // Retornar el mayor entre productos y shipment vinculado
    return Math.max(productMax, shipmentTp);
  }, [inspection, linkedShipment, shipmentTrackingStatuses]);

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
                    key={`map-${maxTrackingPoint}`}
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
                <TrackingHistoryPanel
                  data={trackingHistory}
                  isLoading={loadingHistory}
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
