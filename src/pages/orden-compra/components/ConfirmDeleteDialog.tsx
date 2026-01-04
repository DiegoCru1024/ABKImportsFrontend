import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEliminarSubQuotationDeOrden } from "@/hooks/use-orden-compra.ts";

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    ordenId: string;
    subQuotationId: string;
    quotationName: string;
}

export function ConfirmDeleteDialog({
                                        isOpen,
                                        onClose,
                                        ordenId,
                                        subQuotationId,
                                        quotationName,
                                    }: ConfirmDeleteDialogProps) {
    const { mutate: eliminarSubQuotation, isPending } = useEliminarSubQuotationDeOrden();

    const handleConfirmDelete = () => {
        eliminarSubQuotation(
            {
                ordenId,
                subQuotationId,
            },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-red-100">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl">Confirmar Eliminación</DialogTitle>
                    </div>
                    <DialogDescription className="text-base pt-2">
                        ¿Está seguro de que desea eliminar la sub-quotation{" "}
                        <span className="font-semibold text-gray-900">{quotationName}</span>{" "}
                        de esta orden de compra?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <p className="text-sm text-red-800">
                            <strong>Advertencia:</strong> Esta acción eliminará todos los productos y
                            datos asociados a esta sub-quotation de la orden de compra.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            "Sí, Eliminar"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}