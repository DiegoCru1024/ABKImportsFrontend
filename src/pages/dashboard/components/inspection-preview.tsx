import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetInspectionById, useGetInspectionOrderSummary, useGetInspectionTrackingHistory, useGetInspectionShipments } from "@/hooks/use-inspections";
import { useGetShipmentTrackingStatuses } from "@/hooks/use-shipments";
import type { CargoType } from "@/api/interface/inspectionInterface";
import type { ShipmentTrackingStatus } from "@/api/interface/shipmentInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShipmentRouteTrackingMap } from "@/components/shipment-route-tracking";
import { ArrowRight, ChevronLeft, ChevronRight, PackageSearch, Package } from "lucide-react";
import { CustomsChannelBadge } from "@/pages/inspeccion-de-mercancias/components/customs-channel-badge";
import { TrackingHistoryPanel } from "@/pages/inspeccion-de-mercancias/components/tracking-history-panel";
import { OrderInfoCards } from "@/pages/inspeccion-de-mercancias/components/order-info-cards";

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

interface InspectionPreviewProps {
  inspectionId: string;
  currentIndex: number;
  totalInspections: number;
  onPrev: () => void;
  onNext: () => void;
}

export function InspectionPreview({
  inspectionId,
  currentIndex,
  totalInspections,
  onPrev,
  onNext,
}: InspectionPreviewProps) {
  const navigate = useNavigate();

  const { data: inspection, isLoading: loadingInspection } = useGetInspectionById(inspectionId);
  const { data: orderSummary, isLoading: loadingSummary } = useGetInspectionOrderSummary(inspectionId);
  const { data: trackingHistory, isLoading: loadingHistory } = useGetInspectionTrackingHistory(inspectionId);
  const { data: shipmentStatusesData } = useGetShipmentTrackingStatuses();
  const { data: shipmentsData } = useGetInspectionShipments(inspectionId);

  const shipmentTrackingStatuses = useMemo(
    () => shipmentStatusesData?.statuses || [],
    [shipmentStatusesData?.statuses]
  );

  const linkedShipment = useMemo(
    () => shipmentsData?.shipments?.[0] || null,
    [shipmentsData]
  );

  const maxTrackingPoint = useMemo((): number => {
    const shipmentTp = linkedShipment?.tracking_point && linkedShipment.tracking_point >= 14
      ? linkedShipment.tracking_point
      : 0;

    const products = inspection?.content;
    if (!products?.length) {
      return Math.max(shipmentTp, inspection?.tracking_point || 1);
    }

    const productMax = products.reduce((max, product) => {
      let tp = STATUS_TO_TRACKING_POINT[product.status];
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

    return Math.max(productMax, shipmentTp);
  }, [inspection, linkedShipment, shipmentTrackingStatuses]);

  const cargoType: CargoType = inspection?.cargo_type || "general";

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalInspections - 1;

  if (loadingInspection) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Cargando pedido activo...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mb-4">
          <Package className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">Sin pedidos activos</h3>
        <p className="text-sm text-slate-500 mb-4 max-w-xs">
          No tienes envios pendientes en este momento. Cotiza tus productos para iniciar un nuevo envio.
        </p>
        <Button
          onClick={() => navigate("/dashboard/cotizacion-de-productos")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          size="sm"
        >
          Cotizar productos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con info del pedido + navegacion */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <PackageSearch className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Estado de tu Pedido</h3>
            <p className="text-xs text-gray-500">ID: {inspection.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navegacion entre inspecciones */}
          {totalInspections > 1 && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={!hasPrev}
                className="h-7 w-7 p-0 border-gray-200"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-gray-500 px-1.5 tabular-nums min-w-[3rem] text-center">
                {currentIndex + 1} de {totalInspections}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNext}
                className="h-7 w-7 p-0 border-gray-200"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/dashboard/inspeccion-de-mercancias/${inspectionId}`)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs gap-1"
          >
            Ver detalle
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Map + Sidebar compacto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Mapa (2/3) */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-[320px] w-full">
                <ShipmentRouteTrackingMap
                  key={`dashboard-map-${inspectionId}-${maxTrackingPoint}`}
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

        {/* Sidebar: Canal + Historial (1/3) */}
        <div className="lg:col-span-1 space-y-3">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-3 flex justify-center">
              <CustomsChannelBadge channel={orderSummary?.customs_channel} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-3">
              <TrackingHistoryPanel
                data={trackingHistory}
                isLoading={loadingHistory}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Cards */}
      <OrderInfoCards summary={orderSummary} isLoading={loadingSummary} />
    </div>
  );
}
