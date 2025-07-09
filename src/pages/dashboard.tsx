import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, Polyline } from "react-leaflet";
import { Marker as LeafletMarker, Icon, DivIcon } from "leaflet";

// Coordenadas de ejemplo para el tracking
const trackingPoints = [
  { lat: -12.0464, lng: -77.0428, type: "start", label: "Punto de Inicio - Almacén Principal", time: "08:00 AM" },
  { lat: -12.0500, lng: -77.0350, type: "waypoint", label: "Checkpoint 1 - Av. Javier Prado", time: "08:30 AM" },
  { lat: -12.0580, lng: -77.0280, type: "waypoint", label: "Checkpoint 2 - San Isidro", time: "09:15 AM" },
  { lat: -12.0650, lng: -77.0200, type: "waypoint", label: "Checkpoint 3 - Miraflores", time: "10:00 AM" },
  { lat: -12.0720, lng: -77.0150, type: "current", label: "Ubicación Actual - Barranco", time: "10:45 AM" },
  { lat: -12.0800, lng: -77.0100, type: "destination", label: "Destino Final - Chorrillos", time: "11:30 AM (Estimado)" }
];

// Crear iconos personalizados
const createCustomIcon = (type: string, color: string) => {
  return new DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 10px;
      ">
        ${type === 'start' ? 'S' : type === 'current' ? 'C' : type === 'destination' ? 'D' : '●'}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

export default function DashboardPage() {
  const [user, setUser] = useState<string | null>(null);
  
  // Centro del mapa en Lima, Perú
  const center = {
    lat: -12.0464,
    lng: -77.0428,
  }

  // Extraer solo las coordenadas para la polilínea
  const polylinePositions = trackingPoints.map(point => [point.lat, point.lng] as [number, number]);

  // Función para obtener el color del icono según el tipo
  const getIconColor = (type: string) => {
    switch (type) {
      case 'start': return '#22c55e'; // Verde
      case 'waypoint': return '#3b82f6'; // Azul
      case 'current': return '#f59e0b'; // Naranja
      case 'destination': return '#ef4444'; // Rojo
      default: return '#6b7280'; // Gris
    }
  };

  // Función para obtener el estado del punto
  const getPointStatus = (type: string) => {
    switch (type) {
      case 'start': return 'Completado';
      case 'waypoint': return 'Completado';
      case 'current': return 'En tránsito';
      case 'destination': return 'Pendiente';
      default: return 'Desconocido';
    }
  };

  function DraggableMarker() {
    const [draggable, setDraggable] = useState(false)
    const [position, setPosition] = useState(center)
    const markerRef = useRef<LeafletMarker>(null)
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current
          if (marker != null) {
            setPosition(marker.getLatLng())
          }
        },
      }),
      [],
    )
    const toggleDraggable = useCallback(() => {
      setDraggable((d) => !d)
    }, [])
  
    return (
      <Marker
        draggable={draggable}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}>
        <Popup minWidth={90}>
          <span onClick={toggleDraggable}>
            {draggable
              ? 'Marker is draggable'
              : 'Click here to make marker draggable'}
          </span>
        </Popup>
      </Marker>
    )
  }

  return (
    <div className="container mx-auto p-6" id="dashboard">
      <h1 className="text-2xl font-bold mb-4" id="dashboard-title">
        Dashboard - Tracking de Mercancías
      </h1>
      
      {/* Información del tracking */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Información del Envío</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">ID de Envío:</span> ABK-2024-001
          </div>
          <div>
            <span className="font-medium">Estado:</span> 
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">En tránsito</span>
          </div>
          <div>
            <span className="font-medium">Progreso:</span> 4/6 checkpoints completados
          </div>
        </div>
      </div>

      <div className="w-full h-96 border rounded-lg overflow-hidden">
        <MapContainer 
          center={center} 
          zoom={12} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Línea azul que conecta todos los puntos */}
          <Polyline
            positions={polylinePositions}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
            dashArray="10, 5"
          />
          
          {/* Markers para cada punto de tracking */}
          {trackingPoints.map((point, index) => (
            <Marker
              key={index}
              position={[point.lat, point.lng]}
              icon={createCustomIcon(point.type, getIconColor(point.type))}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-blue-600">{point.label}</div>
                  <div className="text-gray-600 mt-1">
                    <div>Hora: {point.time}</div>
                    <div>Estado: 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        getPointStatus(point.type) === 'Completado' ? 'bg-green-100 text-green-800' :
                        getPointStatus(point.type) === 'En tránsito' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getPointStatus(point.type)}
                      </span>
                    </div>
                    <div>Coordenadas: {point.lat.toFixed(4)}, {point.lng.toFixed(4)}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Leyenda */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Leyenda:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Punto de Inicio</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Checkpoints</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>Ubicación Actual</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Destino Final</span>
          </div>
        </div>
      </div>
    </div>
  );
}
