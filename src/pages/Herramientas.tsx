import React from "react";
import { BsTools } from "react-icons/bs";
import { Calculator, FileText, MapPin, Package, Truck, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Herramientas() {
  const herramientas = [
    {
      titulo: "Calculadora de Costos",
      descripcion: "Calcula los costos totales de importación",
      icono: Calculator,
      color: "bg-blue-500",
      categoria: "Finanzas",
    },
    {
      titulo: "Generador de Documentos",
      descripcion: "Genera documentos necesarios para importación",
      icono: FileText,
      color: "bg-green-500",
      categoria: "Documentación",
    },
    {
      titulo: "Rastreador de Envíos",
      descripcion: "Rastrea tus envíos en tiempo real",
      icono: MapPin,
      color: "bg-purple-500",
      categoria: "Tracking",
    },
    {
      titulo: "Clasificador Arancelario",
      descripcion: "Encuentra la clasificación arancelaria correcta",
      icono: Package,
      color: "bg-orange-500",
      categoria: "Clasificación",
    },
    {
      titulo: "Calculadora de Peso/Volumen",
      descripcion: "Calcula peso volumétrico de tus envíos",
      icono: Scale,
      color: "bg-red-500",
      categoria: "Logística",
    },
    {
      titulo: "Estimador de Tiempo de Tránsito",
      descripcion: "Estima tiempos de entrega por rutas",
      icono: Truck,
      color: "bg-indigo-500",
      categoria: "Transporte",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/5 via-background to-indigo-400/10">
      {/* Header */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 hover:bg-indigo-600">
                <BsTools className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Herramientas Logísticas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Conjunto de herramientas útiles para la gestión logística
                </p>
              </div>
            </div>
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2">
              <BsTools className="h-4 w-4" />
              Ver Todas
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Estadísticas de uso */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Herramientas Activas</CardTitle>
              <BsTools className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">herramientas disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Más Usada</CardTitle>
              <Calculator className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Calculadora</div>
              <p className="text-xs text-muted-foreground">1,234 usos este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">usuarios únicos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ahorro Estimado</CardTitle>
              <Truck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.5M</div>
              <p className="text-xs text-muted-foreground">en costos optimizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Grid de herramientas */}
        <Card>
          <CardHeader>
            <CardTitle>Herramientas Disponibles</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona una herramienta para comenzar a usarla
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {herramientas.map((herramienta, index) => {
                const IconComponent = herramienta.icono;
                return (
                  <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${herramienta.color} group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{herramienta.titulo}</CardTitle>
                          <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full w-fit">
                            {herramienta.categoria}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {herramienta.descripcion}
                      </p>
                      <Button 
                        className="w-full group-hover:shadow-md transition-all"
                        variant="outline"
                      >
                        Usar Herramienta
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sección de ayuda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Guías de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Cómo usar la calculadora de costos",
                  "Generación automática de documentos",
                  "Tips para optimizar tiempos de tránsito"
                ].map((guia, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <span className="text-sm font-medium">{guia}</span>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Próximamente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Simulador de rutas marítimas",
                  "Predictor de precios de combustible",
                  "Analizador de riesgos logísticos"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <span className="text-sm font-medium text-muted-foreground">{feature}</span>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Próximamente</span>
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

export default Herramientas;