import type { ColumnDef } from "@tanstack/react-table";
import type { ProductRow } from "../views/editableunitcosttable";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Checkbox } from "@/components/ui/checkbox";

// Definición de columnas dentro del componente para usar callbacks
export function columnsEditableUnitcost(
  updateProduct: (
    id: string,
    field: keyof ProductRow,
    value: number | boolean
  ) => void
): ColumnDef<ProductRow, any>[] {
  return [
    {
      id: "seCotiza",
      accessorKey: "seCotiza",
      header: () => <div className="text-center">COTIZAR</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.original.seCotiza}
            onCheckedChange={(checked) => {
              updateProduct(row.original.id, "seCotiza", checked as boolean);
            }}
          />
        </div>
      ),
      minSize: 80,
      size: 100,
      maxSize: 120,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "NOMBRE DEL PRODUCTO",
      cell: ({ row }) => (
        <div className={!row.original.seCotiza ? "text-gray-400" : ""}>
          {row.original.name}
        </div>
      ),
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
            disabled={!row.original.seCotiza}
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
          disabled={!row.original.seCotiza}
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
         <div className={`text-center font-semibold ${!row.original.seCotiza ? "text-gray-400" : ""}`}>
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
            <span className={`font-semibold ${!row.original.seCotiza ? "text-gray-400" : ""}`}>
              {(Number(row.original.equivalence) || 0).toFixed(2)}%
            </span>
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
        <div className={`text-center font-semibold ${!row.original.seCotiza ? "text-gray-400" : ""}`}>
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
        <div className={`text-center font-semibold ${!row.original.seCotiza ? "text-gray-400" : ""}`}>
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
        <div className={`text-center font-semibold ${!row.original.seCotiza ? "text-gray-400" : ""}`}>
          USD {(Number(row.original.unitCost) || 0).toFixed(2)}
        </div>
      ),
      minSize: 150,
      size: 200,
      maxSize: 250,
    },
  ];
}
