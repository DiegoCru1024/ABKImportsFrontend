import {useState} from "react";
import {CheckCircle, DollarSign, Package, X} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {LoadingState} from "@/components/ui/loading-state";
import {ErrorState} from "@/components/ui/error-state";
import {useGenerateInspectionId} from "@/hooks/use-inspections";
import {cn} from "@/lib/utils";
import {useGetSubQuotationsList} from "@/hooks/use-quatitation-response.tsx";

interface ApproveQuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    quotationId: string;
    quotationCorrelative?: string;
}

export function ApproveQuotationModal({
                                          isOpen,
                                          onClose,
                                          quotationId,
                                          quotationCorrelative,
                                      }: ApproveQuotationModalProps) {
    const [step, setStep] = useState<"confirm" | "select">("confirm");
    const [selectedSubQuotationId, setSelectedSubQuotationId] = useState<string>("");

    const {data: subQuotations, isLoading, isError} = useGetSubQuotationsList(quotationId);
    const {mutateAsync: generateInspection, isPending: isGenerating} = useGenerateInspectionId();

    console.log("Lista de sub cotisaciones que vinieron", subQuotations);

    const handleConfirmApprove = () => {
        setStep("select");
    };

    const handleSelectSubQuotation = (id: string) => {
        setSelectedSubQuotationId(id);
    };

    const handleApprove = async () => {
        if (!selectedSubQuotationId) return;

        try {
            await generateInspection({
                quotation_id: quotationId,
                subquotation_id: selectedSubQuotationId,
            });
            handleClose();
        } catch (error) {
            console.error("Error al aprobar la cotización:", error);
        }
    };

    const handleClose = () => {
        setStep("confirm");
        setSelectedSubQuotationId("");
        onClose();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
        }).format(price);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl border-2 border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
                <DialogClose
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                    <X className="h-4 w-4"/>
                    <span className="sr-only">Cerrar</span>
                </DialogClose>

                {step === "confirm" ? (
                    <>
                        <DialogHeader className="space-y-4">
                            <div
                                className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                                <CheckCircle className="h-8 w-8 text-green-600"/>
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                                ¿Aprobar Cotización?
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 text-center leading-relaxed">
                                ¿Estás seguro de que deseas aprobar la cotización{" "}
                                <span className="font-semibold text-gray-900">
                  {quotationCorrelative || quotationId}
                </span>
                                ? Esto te permitirá seleccionar una respuesta para generar una inspección.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleConfirmApprove}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                            >
                                Continuar
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader className="space-y-4">
                            <div
                                className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full">
                                <Package className="h-8 w-8 text-blue-600"/>
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                                Elija la Respuesta de la Cotización
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 text-center leading-relaxed">
                                Seleccione una de las sub-cotizaciones disponibles para aprobar
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6">
                            {isLoading && (
                                <LoadingState message="Cargando sub-cotizaciones..." variant="inline"/>
                            )}

                            {isError && (
                                <ErrorState
                                    title="Error al cargar"
                                    message="No se pudieron cargar las sub-cotizaciones. Intente nuevamente."
                                    variant="inline"
                                />
                            )}

                            {!isLoading && !isError && subQuotations && (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {subQuotations.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3"/>
                                            <p className="text-gray-600">No hay sub-cotizaciones disponibles</p>
                                        </div>
                                    ) : (
                                        subQuotations.map((subQuotation) => (
                                            <Card
                                                key={subQuotation.id_subQuotation}
                                                className={cn(
                                                    "p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                                                    selectedSubQuotationId === subQuotation.id_subQuotation
                                                        ? "border-green-500 bg-green-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                )}
                                                onClick={() => handleSelectSubQuotation(subQuotation.id_subQuotation)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Package className="w-5 h-5 text-blue-600"/>
                                                            <h4 className="font-semibold text-gray-900">
                                                                {subQuotation.servicio}
                                                            </h4>
                                                            <span
                                                                className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full border border-blue-200">
                        v{subQuotation.version}
                    </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <DollarSign className="w-4 h-4"/>
                                                            <span className="text-lg font-bold text-green-600">
                        {formatPrice(subQuotation.precioTotal)}
                    </span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                            selectedSubQuotationId === subQuotation.id_subQuotation
                                                                ? "border-green-500 bg-green-500"
                                                                : "border-gray-300"
                                                        )}
                                                    >
                                                        {selectedSubQuotationId === subQuotation.id_subQuotation && (
                                                            <CheckCircle className="w-4 h-4 text-white"/>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setStep("confirm")}
                                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                disabled={isGenerating}
                            >
                                Atrás
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={!selectedSubQuotationId || isGenerating}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <div
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>
                                        Aprobando...
                                    </>
                                ) : (
                                    "Aprobar Cotización"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}