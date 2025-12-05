import type {ColumnDef} from "@tanstack/react-table";
import type {contentQuotationResponseDTO} from "@/api/interface/quotationResponseInterfaces";
import {Edit, Eye, Trash} from "lucide-react";
import {Button} from "@/components/ui/button";

interface ColumnsListResponsesProps {
    onEditQuotation: (id: string, serviceType: string) => void;
    onDelete: (id: string) => void;
}

export function columnsListResponses({
                                         onEditQuotation,
                                         onDelete,
                                     }: ColumnsListResponsesProps): ColumnDef<
    contentQuotationResponseDTO,
    any
>[] {
    return [
        /*{
          id: "id_quotation_response",
          accessorKey: "id_quotation_response",
          header: "ID de la Respuesta",
        },*/
        {
            id: "serviceType",
            accessorKey: "serviceType",
            header: "Tipo de Servicio",
            cell: ({row}) => {
                return <div className="uppercase">{row.original.serviceType}</div>;
            },
        },
        {
            id: "advisorName",
            accessorKey: "advisorName",
            header: "Nombre administrador",
            cell: ({row}) => {
                return <div className="uppercase">{row.original.advisorName}</div>;
            },
        },
        {
            id: "response_date",
            accessorKey: "response_date",
            header: "Fecha de Respuesta",
            cell: ({row}) => {
                return <div>{row.original.response_date}</div>;
            },
        },
        {
            id: "hora",
            accessorKey: "hora",
            header: "Hora de Respuesta",
            cell: ({row}) => {
                return <div>{row.original.hora}</div>;
            },
        },
        {
            id: "timezone",
            accessorKey: "timezone",
            header: "Zona Horaria",
            cell: ({row}) => {
                return <div>{row.original.timezone}</div>;
            },
        },
        {
            id: "version",
            accessorKey: "version",
            header: "Version de Respuesta",
            cell: ({row}) => {
                return <div>{row.original.version}</div>;
            },
        },
        {
            id: "actions",
            header: "Acciones",
            size: 150,
            cell: ({row}) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditQuotation(row.original.id_sub_quotation, row.original.serviceType)}
                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                        title="Editar respuesta"
                    >
                        <Edit className="w-4 h-4"/>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(row.original.id_quotation_response)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="Eliminar respuesta"
                    >
                        <Trash className="w-4 h-4"/>
                    </Button>
                </div>
            ),
        },
    ];
}
