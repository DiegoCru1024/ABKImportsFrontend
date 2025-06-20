import React from "react";
import { PackageSearch, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Inspeccion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-blue-400/10">
      {/* Header */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600">
                <PackageSearch className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Inspección de Mercancías
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gestiona y supervisa las inspecciones de productos importados
                </p>
              </div>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full shadow-md flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Nueva Inspección
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inspecciones Pendientes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">awaiting inspection</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">inspecciones completadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Este Mes</CardTitle>
              <PackageSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">inspecciones realizadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenido de la página */}
        <Card>
          <CardHeader>
            <CardTitle>Panel de Inspecciones</CardTitle>
            <p className="text-sm text-muted-foreground">
              Aquí puedes gestionar todas las inspecciones de mercancías
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <PackageSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Funcionalidad de inspección en desarrollo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Inspeccion; 