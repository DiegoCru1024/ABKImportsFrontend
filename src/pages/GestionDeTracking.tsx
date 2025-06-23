import React, { useState } from "react";
import { MapPinned, Truck, Package, Clock, Eye, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

function GestionDeTracking() {
  const [searchTerm, setSearchTerm] = useState("");

  // Datos de ejemplo para envíos
  const envios = [
    {
      id: "ENV-001",
      cliente: "Empresa ABC",
      origen: "Shanghai, China",
      destino: "Lima, Perú",
      estado: "En tránsito",
      fechaSalida: "2024-01-15",
      fechaEstimada: "2024-02-01",
      transportista: "MSC Shipping",
      tipo: "Marítimo"
    },
    {
      id: "ENV-002",
      cliente: "Corporación XYZ",
      origen: "Los Angeles, USA",
      destino: "Callao, Perú",
      estado: "Entregado",
      fechaSalida: "2024-01-10",
      fechaEstimada: "2024-01-25",
      transportista: "FedEx",
      tipo: "Aéreo"
    },
    {
      id: "ENV-003",
      cliente: "Distribuidora DEF",
      origen: "Hamburg, Alemania",
      destino: "Arequipa, Perú",
      estado: "Pendiente",
      fechaSalida: "2024-01-20",
      fechaEstimada: "2024-02-10",
      transportista: "DHL",
      tipo: "Terrestre"
    },
    {
      id: "ENV-004",
      cliente: "Importadora GHI",
      origen: "Tokyo, Japón",
      destino: "Cusco, Perú",
      estado: "En tránsito",
      fechaSalida: "2024-01-18",
      fechaEstimada: "2024-02-05",
      transportista: "Japan Lines",
      tipo: "Marítimo"
    },
    {
      id: "ENV-005",
      cliente: "Comercial JKL",
      origen: "Miami, USA",
      destino: "Trujillo, Perú",
      estado: "Retraso",
      fechaSalida: "2024-01-12",
      fechaEstimada: "2024-01-28",
      transportista: "UPS",
      tipo: "Aéreo"
    }
  ];

  const filteredEnvios = envios.filter(envio =>
    envio.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    envio.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    envio.destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Entregado":
        return <Badge variant="default" className="bg-green-500">Entregado</Badge>;
      case "En tránsito":
        return <Badge variant="secondary">En tránsito</Badge>;
      case "Pendiente":
        return <Badge variant="outline">Pendiente</Badge>;
      case "Retraso":
        return <Badge variant="destructive">Retraso</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const color = tipo === "Marítimo" ? "bg-blue-500" : 
                  tipo === "Aéreo" ? "bg-purple-500" : "bg-orange-500";
    return <Badge className={`${color} text-white`}>{tipo}</Badge>;
  };

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
              <div className="text-2xl font-bold">{envios.length}</div>
              <p className="text-xs text-muted-foreground">envíos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {envios.filter(e => e.estado === "En tránsito").length}
              </div>
              <p className="text-xs text-muted-foreground">envíos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregados</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {envios.filter(e => e.estado === "Entregado").length}
              </div>
              <p className="text-xs text-muted-foreground">completados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Retrasos</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {envios.filter(e => e.estado === "Retraso").length}
              </div>
              <p className="text-xs text-muted-foreground">requieren atención</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de envíos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Envíos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Todos los envíos registrados en el sistema
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar envíos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Envío</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Transportista</TableHead>
                  <TableHead>Fecha Estimada</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnvios.map((envio) => (
                  <TableRow key={envio.id}>
                    <TableCell className="font-medium">{envio.id}</TableCell>
                    <TableCell>{envio.cliente}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{envio.origen} →</div>
                        <div className="text-muted-foreground">{envio.destino}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoBadge(envio.estado)}</TableCell>
                    <TableCell>{getTipoBadge(envio.tipo)}</TableCell>
                    <TableCell>{envio.transportista}</TableCell>
                    <TableCell>
                      {new Date(envio.fechaEstimada).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GestionDeTracking; 