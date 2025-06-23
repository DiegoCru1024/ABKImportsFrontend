import React from "react";
import { Handshake, DollarSign, Package, Truck, Plane, Ship } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Tarifas() {
  const servicios = [
    {
      titulo: "Importación Estándar",
      descripcion: "Servicio completo de importación para productos generales",
      precio: "$1,200",
      periodo: "por envío",
      caracteristicas: [
        "Gestión de documentos",
        "Despacho aduanero",
        "Seguimiento 24/7",
        "Seguro incluido"
      ],
      icono: Package,
      popular: false,
    },
    {
      titulo: "Importación Express",
      descripcion: "Servicio premium con tiempos reducidos de entrega",
      precio: "$1,800",
      periodo: "por envío",
      caracteristicas: [
        "Proceso acelerado",
        "Gestión prioritaria",
        "Seguimiento dedicado",
        "Seguro premium",
        "Soporte 24/7"
      ],
      icono: Plane,
      popular: true,
    },
    {
      titulo: "Carga Marítima",
      descripcion: "Ideal para grandes volúmenes con tiempos flexibles",
      precio: "$800",
      periodo: "por contenedor",
      caracteristicas: [
        "Contenedor completo",
        "Consolidación disponible",
        "Gestión documental",
        "Tracking marítimo"
      ],
      icono: Ship,
      popular: false,
    },
  ];

  const tarifasAdicionales = [
    { servicio: "Almacenaje", precio: "$15", unidad: "por día/m³" },
    { servicio: "Inspección adicional", precio: "$200", unidad: "por inspección" },
    { servicio: "Gestión urgente", precio: "$300", unidad: "por trámite" },
    { servicio: "Seguro adicional", precio: "0.5%", unidad: "del valor CIF" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/5 via-background to-emerald-400/10">
      {/* Header */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600">
                <Handshake className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Tarifas & Servicios
                </h1>
                <p className="text-sm text-muted-foreground">
                  Conoce nuestros precios y servicios disponibles
                </p>
              </div>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Solicitar Cotización
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
              <Handshake className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">planes disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">clientes usando servicios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ahorro Promedio</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25%</div>
              <p className="text-xs text-muted-foreground">vs. competencia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
              <Handshake className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">clientes satisfechos</p>
            </CardContent>
          </Card>
        </div>

        {/* Planes de servicio */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Planes de Servicio</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona el plan que mejor se adapte a tus necesidades
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {servicios.map((servicio, index) => {
                const IconComponent = servicio.icono;
                return (
                  <Card key={index} className={`hover:shadow-lg transition-all duration-200 ${servicio.popular ? 'ring-2 ring-emerald-500 relative' : ''}`}>
                    {servicio.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-emerald-500 text-white">Más Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-3">
                      <div className="mx-auto p-3 rounded-full bg-emerald-100 w-fit mb-4">
                        <IconComponent className="h-8 w-8 text-emerald-600" />
                      </div>
                      <CardTitle className="text-xl">{servicio.titulo}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {servicio.descripcion}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-600">{servicio.precio}</div>
                        <p className="text-sm text-muted-foreground">{servicio.periodo}</p>
                      </div>
                      
                      <ul className="space-y-2">
                        {servicio.caracteristicas.map((caracteristica, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 mr-3"></div>
                            {caracteristica}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full ${servicio.popular ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                      >
                        Contratar Servicio
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tarifas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Tarifas Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tarifasAdicionales.map((tarifa, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{tarifa.servicio}</span>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">{tarifa.precio}</div>
                      <div className="text-xs text-muted-foreground">{tarifa.unidad}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Beneficios Incluidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Consultoría especializada",
                  "Soporte técnico incluido",
                  "Reportes detallados",
                  "Gestión de reclamos"
                ].map((beneficio, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg bg-emerald-50">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mr-3"></div>
                    <span className="text-sm font-medium">{beneficio}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Tarifas; 