import React, { Suspense, lazy } from 'react';

// Importación dinámica del componente del mapa para evitar problemas de SSR
const ShipmentRouteMap = lazy(() => import('./ShipmentRouteMap'));

interface DynamicMapProps {
  shipment: any;
  shipmentInfo: any;
}

export default function DynamicMap({ shipment, shipmentInfo }: DynamicMapProps) {
  return (
    <Suspense fallback={
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
          <div className="mt-4 h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    }>
      <ShipmentRouteMap shipment={shipment} shipmentInfo={shipmentInfo} />
    </Suspense>
  );
} 