import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPinned, Truck, Package, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { useGetShipments } from "@/hooks/use-shipments";
import { getShipmentColumns } from "@/components/table/columns-shipments";
import type { Shipment } from "@/api/interface/shipmentInterface";

function GestionDeTracking() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handlePageChange = (page: number, size: number) => {
    setPageInfo({
      pageNumber: page,
      pageSize: size,
      totalElements: pageInfo.totalElements,
      totalPages: pageInfo.totalPages,
    });
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  const handleViewDetails = (shipmentId: string) => {
    navigate(`/dashboard/tracking-de-mercancias/${shipmentId}`);
  };

  const {
    data: shipmentData,
    isLoading,
    error,
  } = useGetShipments(searchTerm, pageInfo.pageNumber, pageInfo.pageSize);

  useEffect(() => {
    if (shipmentData) {
      setShipments(shipmentData.content);
      setPageInfo({
        pageNumber: shipmentData.pageNumber,
        pageSize: shipmentData.pageSize,
        totalElements: shipmentData.totalElements,
        totalPages: shipmentData.totalPages,
      });
    }
  }, [shipmentData]);

  const columns = getShipmentColumns({ onViewDetails: handleViewDetails });

  // Calcular estadísticas
  const totalCount = shipments.length;
  const inTransitCount = shipments.filter(s => 
    s.status === "in_transit" || s.status === "on_vessel"
  ).length;
  const deliveredCount = shipments.filter(s => s.status === "delivered").length;
  const delayedCount = shipments.filter(s => 
    s.status === "pending_product_arrival" || s.status === "awaiting_pickup"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500/5 via-background to-teal-400/10">
      {/* Header */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 hover:bg-teal-600">
                <MapPinned className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de Tracking
                </h1>
                <p className="text-sm text-muted-foreground">
                  Administra y supervisa todos los envíos del sistema
                </p>
              </div>
            </div>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2">
              <Package className="h-4 w-4" />
              Nuevo Envío
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
              <CardTitle className="text-sm font-medium">Total Envíos</CardTitle>
              <Package className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-xs text-muted-foreground">envíos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inTransitCount}</div>
              <p className="text-xs text-muted-foreground">envíos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregados</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveredCount}</div>
              <p className="text-xs text-muted-foreground">completados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Retrasos</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{delayedCount}</div>
              <p className="text-xs text-muted-foreground">requieren atención</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de envíos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Envíos</CardTitle>
            <p className="text-sm text-muted-foreground">
              Todos los envíos registrados en el sistema
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-2">Cargando envíos...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error al cargar los envíos
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={shipments}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                pageInfo={pageInfo}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GestionDeTracking; 