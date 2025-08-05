import type { ColumnDef } from "@tanstack/react-table";
import type { ProductRow } from "../views/editableunitcosttable";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";

// Definición de columnas dentro del componente para usar callbacks
export function columnsEditableUnitcost(
  updateProduct: (id: string, field: keyof ProductRow, value: number) => void
): ColumnDef<ProductRow, any>[] {
  return [
    {
      id: "name",
      accessorKey: "name",
      header: "NOMBRE DEL PRODUCTO",
      cell: ({ row }) => <div>{row.original.name}</div>,
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "price",
      accessorKey: "price",
      header: () => <div className="text-center">PRECIO</div>,
      cell: ({ row }) => {
        return (
          <EditableNumericField
            value={row.original.price}
            onChange={(value) => {
              updateProduct(row.original.id, "price", value);
            }}
          />
        );
      },
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "quantity",
      accessorKey: "quantity",
      header: () => <div className="text-center">CANTIDAD</div>,
      cell: ({ row }) => (
        <EditableNumericField
          value={row.original.quantity}
          onChange={(value) => {
            updateProduct(row.original.id, "quantity", value);
          }}
        />
      ),
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "total",
      accessorKey: "total",
      header: () => <div className="text-center">TOTAL</div>,
      cell: ({ row }) => (
        <div className="text-center font-semibold">
          USD {(Number(row.original.total) || 0).toFixed(2)}
        </div>
      ),
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "equivalence",
      accessorKey: "equivalence",
      header: () => <div className="text-center">EQUIVALENCIA</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center flex justify-center items-center">
            <span className="font-semibold">{(Number(row.original.equivalence) || 0).toFixed(2)}%</span>
          </div>
        );
      },
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "importCosts",
      accessorKey: "importCosts",
      header: () => <div className="text-center">GASTOS DE IMPORTACIÓN</div>,
      cell: ({ row }) => (
        <div className="text-center font-semibold">
          USD {(Number(row.original.importCosts) || 0).toFixed(2)}
        </div>
      ),
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "totalCost",
      accessorKey: "totalCost",
      header: () => <div className="text-center">COSTO TOTAL</div>,
      cell: ({ row }) => (
        <div className="text-center font-semibold">
          USD {(Number(row.original.totalCost) || 0).toFixed(2)}
        </div>
      ),
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
    {
      id: "unitCost",
      accessorKey: "unitCost",
      header: () => <div className="text-center">COSTO UNITARIO</div>,
      cell: ({ row }) => (
        <div className="text-center font-semibold">
          USD {(Number(row.original.unitCost) || 0).toFixed(2)}
        </div>
      ),
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
  ];
}
