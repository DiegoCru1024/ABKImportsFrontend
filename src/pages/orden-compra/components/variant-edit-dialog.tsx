import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type {VarianteDetalleDto} from "@/api/interface/orden-compra-interface.ts";


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
    const [cantidad, setCantidad] = useState<number>(variante?.cantidad_comprada || 0)

    const handleSave = () => {
        if (variante) {
            onSave(variante.id_orden_compra_producto, cantidad,)
            onOpenChange(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && variante) {
            setCantidad(variante.cantidad_comprada)
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Variante</DialogTitle>
                </DialogHeader>
                {variante && (
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg bg-muted p-3">
                            <p className="text-sm font-medium">{variante.variant_description}</p>
                            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                                {variante.color && <span>Color: {variante.color}</span>}
                                {variante.size && <span>Talla: {variante.size}</span>}
                                {variante.model && <span>Modelo: {variante.model}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Solicitado</p>
                                <p className="font-semibold">{variante.cantidad_solicitada}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Saldo</p>
                                <p className="font-semibold text-orange-600">{variante.saldo}</p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="cantidad">Cantidad Comprada</Label>
                            <Input
                                id="cantidad"
                                type="number"
                                min="0"
                                max={variante.cantidad_solicitada}
                                value={cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                className="mt-2"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">Máximo: {variante.cantidad_solicitada}</p>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
