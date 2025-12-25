import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {useGetAvailableSubQuotations} from "@/hooks/use-quatitation-response.tsx";
import type {PurchaseOrderType} from "@/api/interface/orden-compra-interface.ts";
import {useCreateOrdenCompra} from "@/hooks/use-orden-compra.ts";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";

interface CreateOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedType: PurchaseOrderType | null;
}

export function CreateOrderDialog({
                                      isOpen,
                                      onClose,
                                      selectedType,
                                  }: CreateOrderDialogProps) {
    const [selectedSubQuotations, setSelectedSubQuotations] = useState<string[]>([]);

    const { data: availableSubQuotations, isLoading } =
        useGetAvailableSubQuotations(selectedType);

    const createOrderMutation = useCreateOrdenCompra();

    // Reset selections when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedSubQuotations([]);
        }
    }, [isOpen]);

    const handleToggleSubQuotation = (id: string) => {
        setSelectedSubQuotations((prev) =>
            prev.includes(id)
                ? prev.filter((subId) => subId !== id)
                : [...prev, id]
        );
    };

    const handleCreateOrder = async () => {
        if (!selectedType || selectedSubQuotations.length === 0) return;

        try {
            await createOrderMutation.mutateAsync({
                type: selectedType,
                subQuotationIds: selectedSubQuotations,
            });

            toast.success("Orden de compra creada exitosamente");
            onClose();
        } catch (error) {
            // Error handled by the hook
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Seleccionar Sub-Cotizaciones
                    </DialogTitle>
                    <DialogDescription>
                        Seleccione las sub-cotizaciones para la orden de compra de tipo{" "}
                        <span className="font-semibold">{selectedType}</span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : availableSubQuotations && availableSubQuotations.length > 0 ? (
                        <div className="space-y-3">
                            {availableSubQuotations.map((subQuotation) => (
                                <Card
                                    key={subQuotation.id_sub_quotation}
                                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                                        selectedSubQuotations.includes(subQuotation.id_sub_quotation)
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                    onClick={() =>
                                        handleToggleSubQuotation(subQuotation.id_sub_quotation)
                                    }
                                >
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            checked={selectedSubQuotations.includes(
                                                subQuotation.id_sub_quotation
                                            )}
                                            onCheckedChange={() =>
                                                handleToggleSubQuotation(subQuotation.id_sub_quotation)
                                            }
                                            className="mt-1"
                                        />

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Package className="w-4 h-4 text-primary" />
                                                <span className="font-semibold text-sm">
                          {subQuotation.quotation_correlative}
                        </span>
                                                <Badge variant="secondary" className="text-xs">
                                                    v{subQuotation.version}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {subQuotation.type}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                            <AlertCircle className="w-12 h-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                No hay sub-cotizaciones disponibles para este tipo de servicio
                            </p>
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCreateOrder}
                        disabled={
                            selectedSubQuotations.length === 0 ||
                            createOrderMutation.isPending
                        }
                    >
                        {createOrderMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            `Crear Orden de Compra (${selectedSubQuotations.length})`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}