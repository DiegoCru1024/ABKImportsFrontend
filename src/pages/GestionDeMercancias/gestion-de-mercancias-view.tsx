import { PackageSearch } from 'lucide-react'
import { useMemo } from "react";
import { useGetInspectionsByUser, useGenerateInspectionId } from "@/hooks/use-inspections";
import { DataTable } from "@/components/table/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";

function gestionDeMercancias() {


  
  const { data, isLoading, error } = useGetInspectionsByUser("",0,10);
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
      {/* Top Navigation Bar */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full px-4 py-4 border-b border-border/60">
          <div className="flex items-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600">
              <PackageSearch className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Gestión de mercancías
              </h1>
            </div>
          </div>
        </div>
      </div>
      {/* Contenido principal */}
      <div className="p-6">
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
      </div>
    </div>
  )
}

export default gestionDeMercancias