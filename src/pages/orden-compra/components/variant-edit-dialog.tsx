import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import type { VarianteDetalleDto } from "@/api/interface/orden-compra-interface.ts"

interface VarianteEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    variante: VarianteDetalleDto | null
    onSave: (id: string, cantidad: number) => void
    isSaving?: boolean
}

export function VarianteEditDialog({
                                       open,
                                       onOpenChange,
                                       variante,
                                       onSave,
                                       isSaving = false,
                                   }: VarianteEditDialogProps) {
    const [cantidad, setCantidad] = useState<number>(0)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        if (variante) {
            setCantidad(variante.cantidad_comprada || 0)
            setError("")
        }
    }, [variante])

    const handleSave = () => {
        if (!variante) return

        if (cantidad < 0) {
            setError("La cantidad no puede ser negativa")
            return
        }

        if (cantidad > variante.cantidad_solicitada) {
            setError("La cantidad no puede ser mayor a lo solicitado")
            return
        }

        onSave(variante.id_orden_compra_producto, cantidad)
        onOpenChange(false)
    }

    const handleCantidadChange = (value: string) => {
        const num = parseInt(value)
        if (!isNaN(num)) {
            setCantidad(num)
            setError("")
        } else if (value === "") {
            setCantidad(0)
            setError("")
        }
    }

    if (!variante) return null

    const nuevoSaldo = variante.cantidad_solicitada - cantidad
    const porcentajeCompletado = (cantidad / variante.cantidad_solicitada) * 100

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-medium text-gray-900">
                        Editar Cantidad Comprada
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Info de la variante */}
                    <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                        {variante.variant_images && variante.variant_images.length > 0 ? (
                            <img
                                src={variante.variant_images[0]}
                                alt={variante.variant_description}
                                className="w-24 h-24 object-cover rounded border border-gray-200"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                                <span className="text-gray-400 text-xs">N/A</span>
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="mb-3">
                                <div className="text-xs text-gray-500 mb-1">Descripción de la variante:</div>
                                <div className="font-medium text-gray-900">
                                    {variante.variant_description}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {variante.color && (
                                    <div>
                                        <span className="text-gray-500">Color:</span>
                                        <span className="ml-1 text-gray-900">{variante.color}</span>
                                    </div>
                                )}
                                {variante.size && (
                                    <div>
                                        <span className="text-gray-500">Talla:</span>
                                        <span className="ml-1 text-gray-900">{variante.size}</span>
                                    </div>
                                )}
                                {variante.model && (
                                    <div>
                                        <span className="text-gray-500">Modelo:</span>
                                        <span className="ml-1 text-gray-900">{variante.model}</span>
                                    </div>
                                )}
                                {variante.presentation && (
                                    <div>
                                        <span className="text-gray-500">Presentación:</span>
                                        <span className="ml-1 text-gray-900">{variante.presentation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas actuales */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Solicitado</div>
                            <div className="text-2xl font-medium text-gray-900">
                                {variante.cantidad_solicitada}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">Saldo Actual</div>
                            <div className={`text-2xl font-medium ${variante.saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {variante.saldo}
                            </div>
                        </div>
                    </div>

                    {/* Input de cantidad */}
                    <div className="space-y-2">
                        <Label htmlFor="cantidad" className="text-sm font-medium text-gray-900">
                            Cantidad Comprada
                        </Label>
                        <Input
                            id="cantidad"
                            type="number"
                            min="0"
                            max={variante.cantidad_solicitada}
                            value={cantidad}
                            onChange={(e) => handleCantidadChange(e.target.value)}
                            className={`text-lg h-12 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            disabled={isSaving}
                        />
                        {error && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </p>
                        )}
                        <div className="text-xs text-gray-500">
                            Máximo: {variante.cantidad_solicitada}
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Progreso</span>
                            <span className="text-sm font-medium text-orange-600">
                                {porcentajeCompletado.toFixed(0)}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-500 transition-all duration-300"
                                style={{ width: `${porcentajeCompletado}%` }}
                            />
                        </div>
                    </div>

                    {/* Nuevo saldo */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Nuevo saldo</span>
                            <span className={`text-lg font-medium ${nuevoSaldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {nuevoSaldo}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !!error}
                        className="bg-orange-500 hover:bg-orange-600 text-white min-w-[120px]"
                    >
                        {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}