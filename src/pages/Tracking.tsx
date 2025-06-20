import React from "react";
import { MapPinned, Truck, Package, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Tracking() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500/5 via-background to-green-400/10">
      {/* Header */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 hover:bg-green-600">
                <MapPinned className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Tracking de Mercancías
                </h1>
                <p className="text-sm text-muted-foreground">
                  Rastrea y monitorea el estado de tus envíos
                </p>
              </div>
            </div>
            <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2">
              <Package className="h-4 w-4" />
              Rastrear Envío
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
              <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">envíos en camino</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregados</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">por procesar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
              <MapPinned className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">31</div>
              <p className="text-xs text-muted-foreground">envíos activos</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de envíos recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Envíos Recientes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimos envíos registrados en el sistema
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "ENV-001", status: "En tránsito", destination: "Lima, Perú", eta: "2 días" },
                { id: "ENV-002", status: "Entregado", destination: "Callao, Perú", eta: "Completado" },
                { id: "ENV-003", status: "Pendiente", destination: "Arequipa, Perú", eta: "3 días" },
              ].map((envio) => (
                <div key={envio.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{envio.id}</p>
                      <p className="text-sm text-muted-foreground">{envio.destination}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={envio.status === "Entregado" ? "default" : envio.status === "En tránsito" ? "secondary" : "outline"}>
                      {envio.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{envio.eta}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Tracking; 