# Inspeccion de Mercancias - User View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a read-only "Inspeccion de Mercancias" detail view for `final` role users showing order financial info, customs channel semaphore, tracking map, and status history.

**Architecture:** New page at `/dashboard/inspeccion-de-mercancias/:id` with 3 sub-components (customs semaphore, financial cards, tracking history). Reuses `ShipmentRouteTrackingMap` for the map. Data from 3 sources: existing inspection endpoint + 2 new backend endpoints (documented in a spec .md). List page navigation fix to route to user-specific detail.

**Tech Stack:** React 19, TypeScript, TailwindCSS 4, TanStack Query, Leaflet (via ShipmentRouteTrackingMap), shadcn/ui components, Lucide icons.

---

## Task 1: Create Backend Spec for New Endpoints

**Files:**
- Create: `BACKEND_INSPECCION_MERCANCIAS_SPEC.md` (project root)

**Step 1: Write the spec file**

Create `BACKEND_INSPECCION_MERCANCIAS_SPEC.md` with these 2 endpoints:

### Endpoint 1: `GET /inspections/:id/order-summary`

Response:
```json
{
  "cargo_type": "general",
  "cargo_type_label": "Carga General",
  "total_product_cost": 125000,
  "customs_taxes": 15000,
  "logistics_services": 25000,
  "pending_payment": 40000,
  "customs_channel": "green"
}
```

Interface:
```typescript
type CustomsChannel = 'red' | 'yellow' | 'green';

interface InspectionOrderSummary {
  cargo_type: string;
  cargo_type_label: string;
  total_product_cost: number;
  customs_taxes: number;
  logistics_services: number;
  pending_payment: number;
  customs_channel: CustomsChannel;
}
```

### Endpoint 2: `GET /inspections/:id/shipments`

Response:
```json
{
  "shipments": [
    {
      "id": "uuid",
      "correlative": "SHP-001",
      "tracking_point": 21,
      "status": "in_transit",
      "current_location": "Los Angeles",
      "progress": 47,
      "shipping_type": "aerial",
      "status_history": [
        {
          "status": "in_transit",
          "location": "Los Angeles",
          "progress": 47,
          "timestamp": "2026-02-12T10:30:00Z",
          "notes": "Llego sin novedad"
        }
      ],
      "updated_at": "2026-02-12T10:30:00Z"
    }
  ]
}
```

Uses existing `Shipment` interface from `src/api/interface/shipmentInterface.ts`.

**Step 2: Commit**

```bash
git add BACKEND_INSPECCION_MERCANCIAS_SPEC.md
git commit -m "docs: add backend spec for inspection order-summary and shipments endpoints"
```

---

## Task 2: Add Interfaces for New Endpoints

**Files:**
- Modify: `src/api/interface/inspectionInterface.ts`

**Step 1: Add new interfaces at the bottom of the file**

After the existing `InspectionTrackingStatusesResponse` interface, add:

```typescript
// ============================================
// INTERFACES PARA VISTA DE INSPECCION DE MERCANCIAS (USUARIO)
// ============================================

export type CustomsChannel = 'red' | 'yellow' | 'green';

export interface InspectionOrderSummary {
  cargo_type: string;
  cargo_type_label: string;
  total_product_cost: number;
  customs_taxes: number;
  logistics_services: number;
  pending_payment: number;
  customs_channel: CustomsChannel;
}

export interface InspectionShipmentsResponse {
  shipments: import('./shipmentInterface').Shipment[];
}
```

**Step 2: Commit**

```bash
git add src/api/interface/inspectionInterface.ts
git commit -m "feat: add interfaces for order-summary and inspection-shipments endpoints"
```

---

## Task 3: Add API Functions for New Endpoints

**Files:**
- Modify: `src/api/inspection.ts`

**Step 1: Add imports at top of file**

Add `InspectionOrderSummary` and `InspectionShipmentsResponse` to the existing import from `./interface/inspectionInterface`.

**Step 2: Add 2 new API functions at the bottom**

```typescript
/**
 * Obtiene el resumen financiero y canal aduanero de una inspeccion
 * @param {string} id - ID de la inspeccion
 * @returns {Promise<InspectionOrderSummary>} - Resumen del pedido
 */
export const getInspectionOrderSummary = async (id: string): Promise<InspectionOrderSummary> => {
  try {
    return await apiFetch<InspectionOrderSummary>(`/inspections/${id}/order-summary`, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener el resumen del pedido:", error);
    throw error;
  }
};

/**
 * Obtiene los shipments vinculados a una inspeccion
 * @param {string} id - ID de la inspeccion
 * @returns {Promise<InspectionShipmentsResponse>} - Shipments de la inspeccion
 */
export const getInspectionShipments = async (id: string): Promise<InspectionShipmentsResponse> => {
  try {
    return await apiFetch<InspectionShipmentsResponse>(`/inspections/${id}/shipments`, {
      method: "GET",
    });
  } catch (error) {
    console.error("Error al obtener los shipments de la inspeccion:", error);
    throw error;
  }
};
```

**Step 3: Commit**

```bash
git add src/api/inspection.ts
git commit -m "feat: add API functions for order-summary and inspection-shipments"
```

---

## Task 4: Add Hooks for New Endpoints

**Files:**
- Modify: `src/hooks/use-inspections.ts`

**Step 1: Add imports**

Add `getInspectionOrderSummary` and `getInspectionShipments` to the import from `@/api/inspection`.

**Step 2: Add 2 new hooks at the bottom**

```typescript
/**
 * Hook para obtener el resumen financiero de una inspeccion
 * @param {string} inspectionId - ID de la inspeccion
 */
export function useGetInspectionOrderSummary(inspectionId: string) {
  return useQuery({
    queryKey: ["InspectionOrderSummary", inspectionId],
    queryFn: () => getInspectionOrderSummary(inspectionId),
    enabled: !!inspectionId,
  });
}

/**
 * Hook para obtener los shipments vinculados a una inspeccion
 * @param {string} inspectionId - ID de la inspeccion
 */
export function useGetInspectionShipments(inspectionId: string) {
  return useQuery({
    queryKey: ["InspectionShipments", inspectionId],
    queryFn: () => getInspectionShipments(inspectionId),
    enabled: !!inspectionId,
  });
}
```

**Step 3: Commit**

```bash
git add src/hooks/use-inspections.ts
git commit -m "feat: add hooks for order-summary and inspection-shipments queries"
```

---

## Task 5: Create Customs Channel Semaphore Component

**Files:**
- Create: `src/pages/inspeccion-de-mercancias/components/customs-channel-badge.tsx`

**Step 1: Create the component**

A visual semaphore with 3 circles (red, yellow, green). Only the active one is lit; the others are dimmed.

```typescript
import type { CustomsChannel } from "@/api/interface/inspectionInterface";

interface CustomsChannelBadgeProps {
  channel: CustomsChannel | undefined;
}

export function CustomsChannelBadge({ channel }: CustomsChannelBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Canal Aduanero
      </h3>
      <div className="flex items-center gap-3 bg-gray-900 px-5 py-2.5 rounded-full">
        {/* Red light */}
        <div
          className={`w-5 h-5 rounded-full transition-all duration-300 ${
            channel === "red"
              ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
              : "bg-gray-600"
          }`}
        />
        {/* Yellow light */}
        <div
          className={`w-5 h-5 rounded-full transition-all duration-300 ${
            channel === "yellow"
              ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.7)]"
              : "bg-gray-600"
          }`}
        />
        {/* Green light */}
        <div
          className={`w-5 h-5 rounded-full transition-all duration-300 ${
            channel === "green"
              ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]"
              : "bg-gray-600"
          }`}
        />
      </div>
      {channel && (
        <span className={`text-xs font-medium ${
          channel === "red" ? "text-red-600" :
          channel === "yellow" ? "text-yellow-600" :
          "text-green-600"
        }`}>
          {channel === "red" ? "Canal Rojo" :
           channel === "yellow" ? "Canal Naranja" :
           "Canal Verde"}
        </span>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/inspeccion-de-mercancias/components/customs-channel-badge.tsx
git commit -m "feat: add customs channel semaphore component"
```

---

## Task 6: Create Order Info Cards Component

**Files:**
- Create: `src/pages/inspeccion-de-mercancias/components/order-info-cards.tsx`

**Step 1: Create the component**

A row of 5 cards showing financial info. Follows the same card pattern from `inspection-detail-view.tsx` (Card with CardContent, gradient backgrounds, small text labels).

```typescript
import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, FileText, Truck, CreditCard } from "lucide-react";
import type { InspectionOrderSummary } from "@/api/interface/inspectionInterface";

interface OrderInfoCardsProps {
  summary: InspectionOrderSummary | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return "$ --";
  return `$ ${value.toLocaleString("es-PE")}`;
}

export function OrderInfoCards({ summary, isLoading }: OrderInfoCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-24" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* Tipo de Mercancia */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="h-3 w-3 text-blue-500" />
            <p className="text-[10px] font-medium text-gray-500">Tipo de Mercancia</p>
          </div>
          <p className="text-sm font-bold text-blue-600">
            {summary?.cargo_type_label || "Sin dato"}
          </p>
        </CardContent>
      </Card>

      {/* Costo Total Producto */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="h-3 w-3 text-emerald-500" />
            <p className="text-[10px] font-medium text-gray-500">Costo Total Producto</p>
          </div>
          <p className="text-lg font-bold text-emerald-600">
            {formatCurrency(summary?.total_product_cost)}
          </p>
        </CardContent>
      </Card>

      {/* Impuestos Aduaneros */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="h-3 w-3 text-amber-500" />
            <p className="text-[10px] font-medium text-gray-500">Impuestos Aduaneros</p>
          </div>
          <p className="text-lg font-bold text-amber-600">
            {formatCurrency(summary?.customs_taxes)}
          </p>
        </CardContent>
      </Card>

      {/* Servicios Logisticos */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Truck className="h-3 w-3 text-purple-500" />
            <p className="text-[10px] font-medium text-gray-500">Servicios Logisticos</p>
          </div>
          <p className="text-lg font-bold text-purple-600">
            {formatCurrency(summary?.logistics_services)}
          </p>
        </CardContent>
      </Card>

      {/* Pago Pendiente */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50/50 to-white">
        <CardContent className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CreditCard className="h-3 w-3 text-red-500" />
            <p className="text-[10px] font-medium text-gray-500">Pago Pendiente</p>
          </div>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(summary?.pending_payment)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/inspeccion-de-mercancias/components/order-info-cards.tsx
git commit -m "feat: add order info cards component with financial data"
```

---

## Task 7: Create Tracking History Panel Component

**Files:**
- Create: `src/pages/inspeccion-de-mercancias/components/tracking-history-panel.tsx`

**Step 1: Create the component**

Vertical timeline showing status_history entries from shipments, sorted by timestamp descending. Uses the same visual pattern as `shipment-detail-view.tsx` lines 355-389 but in a scrollable panel for the right sidebar.

```typescript
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { StatusHistoryEntry } from "@/api/interface/shipmentInterface";
import { formatDateLong } from "@/lib/format-time";

interface TrackingHistoryPanelProps {
  entries: StatusHistoryEntry[];
  isLoading: boolean;
}

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("transit") || s.includes("vessel")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (s.includes("pending") || s.includes("awaiting")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (s.includes("customs") || s.includes("inspection")) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending_product_arrival: "Pendiente llegada",
    in_inspection: "En inspeccion",
    awaiting_pickup: "Esperando recojo",
    dispatched: "Despachado",
    airport: "Aeropuerto",
    in_transit: "En transito",
    arrived_destination: "Llego a destino",
    customs: "Aduanas",
    delivered: "Entregado",
  };
  return map[status] || status;
};

export function TrackingHistoryPanel({ entries, isLoading }: TrackingHistoryPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg border bg-white">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <Clock className="h-8 w-8 mb-2" />
        <p className="text-xs">Sin historial de tracking</p>
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
      {sorted.map((entry, index) => (
        <div
          key={index}
          className="relative flex gap-3 p-2.5 rounded-lg border border-gray-100 bg-white hover:bg-gray-50/50 transition-colors"
        >
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${
              index === 0 ? "bg-blue-500" : "bg-gray-300"
            }`} />
            {index < sorted.length - 1 && (
              <div className="w-px h-full bg-gray-200 mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Badge className={`text-[10px] px-1.5 py-0 h-4 ${getStatusColor(entry.status)}`}>
              {getStatusText(entry.status)}
            </Badge>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-700">{entry.location}</span>
              <span className="text-[10px] text-gray-400">-</span>
              <span className="text-[10px] text-gray-400">{entry.progress}%</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {formatDateLong(entry.timestamp)}
            </p>
            {entry.notes && (
              <p className="text-[10px] text-gray-500 mt-1 italic">"{entry.notes}"</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/pages/inspeccion-de-mercancias/components/tracking-history-panel.tsx
git commit -m "feat: add tracking history panel component with timeline"
```

---

## Task 8: Create the Main Detail View Page

**Files:**
- Create: `src/pages/inspeccion-de-mercancias/inspeccion-de-mercancias-detail.tsx`

**Step 1: Create the detail view**

This is the main page component. Layout matches the mockup:
- Header with back button and title
- Map (left, 2/3 width) + Canal Aduanero + Tracking History (right, 1/3 width)
- Financial cards at bottom (full width row)

Data flow:
1. `useGetInspectionById(id)` -> basic inspection data
2. `useGetInspectionOrderSummary(id)` -> financial + customs channel
3. `useGetInspectionShipments(id)` -> shipments for max tracking_point + status_history

```typescript
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
```

**Step 2: Commit**

```bash
git add src/pages/inspeccion-de-mercancias/inspeccion-de-mercancias-detail.tsx
git commit -m "feat: add inspection detail view for final users with map, semaphore, and history"
```

---

## Task 9: Fix List Page Navigation for User Route

**Files:**
- Modify: `src/pages/gestion-de-mercancia/gestion-de-mercancias-view.tsx`

**Step 1: Make navigation path dynamic**

Currently `handleInspectionClick` hardcodes `/dashboard/gestion-de-mercancias/`. The same component is used for both admin and user routes. Use `useLocation` to detect which route we're on and navigate to the correct detail path.

Change line 40-42 from:
```typescript
const handleInspectionClick = (inspectionId: string) => {
  navigate(`/dashboard/gestion-de-mercancias/${inspectionId}`);
};
```

To:
```typescript
import { useNavigate, useLocation } from "react-router-dom";

// Inside component:
const location = useLocation();

const handleInspectionClick = (inspectionId: string) => {
  // If user is on the user route, navigate to user detail; else admin detail
  if (location.pathname.includes("inspeccion-de-mercancias")) {
    navigate(`/dashboard/inspeccion-de-mercancias/${inspectionId}`);
  } else {
    navigate(`/dashboard/gestion-de-mercancias/${inspectionId}`);
  }
};
```

Note: `useLocation` must be imported. Check if it's already imported from `react-router-dom` at the top of the file (currently only `useNavigate` is imported).

**Step 2: Commit**

```bash
git add src/pages/gestion-de-mercancia/gestion-de-mercancias-view.tsx
git commit -m "fix: make inspection list navigation dynamic based on current route"
```

---

## Task 10: Add Route in App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add import for the new detail page**

At the top of App.tsx, add:
```typescript
import InspeccionDeMercanciasDetail from "@/pages/inspeccion-de-mercancias/inspeccion-de-mercancias-detail";
```

**Step 2: Add the new route**

After the existing `/dashboard/inspeccion-de-mercancias` route (line 82-84), add:
```typescript
<Route
  path="/dashboard/inspeccion-de-mercancias/:id"
  element={<InspeccionDeMercanciasDetail />}
/>
```

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add route for user inspection detail view"
```

---

## Task 11: Verify Build Compiles

**Step 1: Run type check**

```bash
npm run type-check
```

Expected: no TypeScript errors.

**Step 2: Run build**

```bash
npm run build
```

Expected: build succeeds.

**Step 3: Run dev server and verify visually**

```bash
npm run dev
```

Open browser, login as `final` user, navigate to "Inspeccion de mercancias" in sidebar, click on an inspection, verify:
- Map renders with correct tracking point
- Canal Aduanero semaphore shows
- Tracking history panel shows entries
- Financial cards display at bottom
- Back button works

**Step 4: Final commit (if any lint/type fixes needed)**

```bash
git add -A
git commit -m "fix: address any type/lint issues from build verification"
```
