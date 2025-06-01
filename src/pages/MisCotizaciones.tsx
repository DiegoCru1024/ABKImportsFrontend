import { FileText, PackageOpen } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface Cotizacion {
  id: string;
  estado: string;
  fecha: string;
}

interface Producto {
  nombre: string;
  cantidad: number;
  especificaciones: string;
  estado: string;
  fecha: string;
}

export default function MisCotizaciones() {
  const [tab, setTab] = useState<'mis' | 'detalles' | 'seguimiento'>('mis');
  const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  // Datos de ejemplo
  const cotizaciones: Cotizacion[] = [
    { id: 'UNMSM-20250052720', estado: 'Cotizado', fecha: '2025-05-12' },
    { id: 'UNMSM-20250052721', estado: 'En Revisión', fecha: '2025-05-15' },
  ];

  const productos: Producto[] = [
    { nombre: 'Camiseta Personalizada', cantidad: 50, especificaciones: 'Tamaño: M, Color: Azul', estado: 'Cotizado', fecha: '2024-01-14' },
    { nombre: 'Taza Cerámica', cantidad: 100, especificaciones: 'Tamaño: 350ml, Color: Blanco', estado: 'Cotizado', fecha: '2024-01-13' },
    { nombre: 'Llavero Promocional', cantidad: 200, especificaciones: 'Material: Acrílico, Color: Transparente', estado: 'En Revisión', fecha: '2024-01-15' },
  ];

  // Columnas Mis Cotizaciones
  const colsMis: ColumnDef<Cotizacion, any>[] = [
    { accessorKey: 'id', header: 'Id Solicitud' },
    { accessorKey: 'estado', header: 'Estado' },
    { accessorKey: 'fecha', header: 'Fecha' },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => {
          setSelectedCotizacion(row.original);
          setTab('detalles');
        }}>
          Ver detalles
        </Button>
      ),
    },
  ];

  // Columnas Detalles de Cotización
  const colsDetalles: ColumnDef<Producto, any>[] = [
    { accessorKey: 'nombre', header: 'Producto' },
    { accessorKey: 'cantidad', header: 'Cantidad' },
    { accessorKey: 'especificaciones', header: 'Especificaciones' },
    { accessorKey: 'estado', header: 'Estado' },
    { accessorKey: 'fecha', header: 'Fecha' },
    {
      id: 'verSeguimiento',
      header: 'Acciones',
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => {
          setSelectedProducto(row.original);
          setTab('seguimiento');
        }}>
          Ver seguimiento
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100 border-t-2 border-b-2 border-gray-200">
      {/* Top Navigation Bar */}
      <div className="border-b-2 border-gray-200 px-4 py-4 bg-white ">
        <div className="container   flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 ">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Mis cotizaciones
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`${tab === 'mis' ? 'border-blue-500 text-blue-600' : 'text-gray-600'} pb-2`} 
          onClick={() => setTab('mis')}
        >Mis cotizaciones</button>
        <button
          className={`${tab === 'detalles' ? 'border-blue-500 text-blue-600' : 'text-gray-400 cursor-not-allowed'} pb-2`} 
          disabled={!selectedCotizacion}
          onClick={() => selectedCotizacion && setTab('detalles')}
        >Detalles de cotización</button>
        <button
          className={`${tab === 'seguimiento' ? 'border-blue-500 text-blue-600' : 'text-gray-400 cursor-not-allowed'} pb-2`} 
          disabled={!selectedProducto}
          onClick={() => selectedProducto && setTab('seguimiento')}
        >Seguimiento</button>
      </div>

      {/* Contenidos */}
      {tab === 'mis' && (
        <>
          <p className="mb-4 text-gray-700">En esta sección verá todas sus cotizaciones realizadas.</p>
          <DataTable
            columns={colsMis}
            data={cotizaciones}
            toolbarOptions={{ showSearch: true, showViewOptions: false }}
            paginationOptions={{ showSelectedCount: true, showPagination: true, showNavigation: true }}
          />
        </>
      )}

      {tab === 'detalles' && selectedCotizacion && (
        <>
          <p className="mb-4 text-gray-700">Detalle de la cotización <strong>{selectedCotizacion.id}</strong></p>
          <DataTable
            columns={colsDetalles}
            data={productos}
            toolbarOptions={{ showSearch: false, showViewOptions: false }}
            paginationOptions={{ showSelectedCount: false, showPagination: false, showNavigation: false }}
          />
        </>
      )}

      {tab === 'seguimiento' && selectedProducto && (
        <div className="space-y-6">
          <p className="text-lg font-semibold">{selectedProducto.nombre}</p>
          <p>Cantidad: {selectedProducto.cantidad} unidades</p>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Precio Unitario</p>
                <p className="font-medium">$15.99</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Precio Total</p>
                <p className="font-medium">$799.50</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tiempo de Entrega</p>
                <p className="font-medium">7-10 días hábiles</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Descuento Aplicable</p>
                <p className="font-medium">5% por pago anticipado</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Comentarios</p>
                <p>Podemos entregar en 7 días hábiles. El logo será impreso en la parte frontal.</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recomendaciones</p>
                <p>Recomendamos usar tela de algodón premium para mayor durabilidad.</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Muestras</p>
                <p>Disponibles bajo solicitud</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 pt-6">
            <Button variant="outline" onClick={() => window.open('https://wa.me/123456789')}>
              Solicitar cambios
            </Button>
            <Button onClick={() => window.open('https://wa.me/123456789')}>Aceptar cotización</Button>
          </div>
        </div>
      )}
    </div>
  );
}
