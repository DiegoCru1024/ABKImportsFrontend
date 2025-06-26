import React, { useMemo } from "react";
import { PackageSearch, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { useGetInspectionsByUser, useGenerateInspectionId } from "@/hooks/use-inspections";
import { DataTable } from "@/components/table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Inspeccion() {
  const { data, isLoading, error } = useGetInspectionsByUser();
  const inspections = (data as any)?.content || [];
  const generateMutation = useGenerateInspectionId();
  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    { accessorKey: "id", header: "ID Inspección" },
    { accessorKey: "quotation_id", header: "ID Cotización" },
    { accessorKey: "shipping_service_type", header: "Tipo de Servicio" },
    { accessorKey: "status", header: "Estado" },
    {
      accessorKey: "createdAt",
      header: "Fecha de creación",
      cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleString("es-ES")}</span>,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <ConfirmDialog
          trigger={<Button variant="ghost" size="sm">Generar ID de Inspección</Button>}
          title="Confirmar generación de ID"
          description={`¿Generar ID de inspección para cotización ${row.original.quotation_id}?`}
          confirmText="Generar"
          cancelText="Cancelar"
          onConfirm={() =>
            generateMutation.mutate({ quotation_id: row.original.quotation_id, shipping_service_type: "maritimo" })
          }
        />
      ),
    },
  ], [generateMutation]);

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
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Error al cargar las inspecciones: {error.message}</p>
              </div>
            )}
            <DataTable
              columns={columns}
              data={inspections}
              pageInfo={{
                pageNumber: (data as any)?.number || 0,
                pageSize: (data as any)?.size || inspections.length,
                totalElements: (data as any)?.totalElements || inspections.length,
                totalPages: (data as any)?.totalPages || 1,
              }}
              onPageChange={() => {}}
              onSearch={() => {}}
              searchTerm=""
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Inspeccion; 