"use client"

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, Edit2 } from "lucide-react"
import type {ProductoConVariantesDto, VarianteDetalleDto} from "@/api/interface/orden-compra-interface.ts";

interface ProductoRowProps {
    producto: ProductoConVariantesDto
    onEditVariante: (variante: VarianteDetalleDto) => void
}

export function ProductoRow({ producto, onEditVariante }: ProductoRowProps) {
    const [open, setOpen] = useState(false)

    const completionPercentage = Math.round((producto.total_comprado / producto.total_solicitado) * 100)

    return (
        <div className="space-y-2">
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer p-4 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between gap-4">
                            {/* Imagen y nombre */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {producto.product_image && (
                                    <img
                                        src={producto.product_image || "/placeholder.svg"}
                                        alt={producto.product_name}
                                        className="h-16 w-16 rounded object-cover flex-shrink-0"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-foreground truncate">{producto.product_name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {producto.variantes.length} variante
                                        {producto.variantes.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            <div className="hidden md:flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Solicitado</p>
                                    <p className="text-sm font-semibold">{producto.total_solicitado}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Comprado</p>
                                    <p className="text-sm font-semibold text-orange-600">{producto.total_comprado}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Saldo</p>
                                    <p className="text-sm font-semibold">{producto.saldo_total}</p>
                                </div>

                                {/* Barra de progreso */}
                                <div className="w-24">
                                    <div className="mb-1 flex h-2 w-full overflow-hidden rounded-full bg-secondary/20">
                                        <div
                                            className="bg-orange-600 transition-all duration-300"
                                            style={{ width: `${completionPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-center text-xs font-medium">{completionPercentage}%</p>
                                </div>
                            </div>

                            {/* Botón expandir */}
                            <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
                        </div>

                        {/* Estadísticas para mobile */}
                        <div className="mt-3 grid grid-cols-3 gap-2 md:hidden text-center text-xs">
                            <div>
                                <p className="text-muted-foreground">Solicitado</p>
                                <p className="font-semibold">{producto.total_solicitado}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Comprado</p>
                                <p className="font-semibold text-orange-600">{producto.total_comprado}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Saldo</p>
                                <p className="font-semibold">{producto.saldo_total}</p>
                            </div>
                        </div>
                    </Card>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-2 space-y-2 pl-4">
                    {producto.variantes.map((variante) => (
                        <div key={variante.id_variant} className="rounded-lg border border-border bg-card/50 p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">{variante.variant_description}</p>
                                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground flex-wrap">
                                        {variante.color && <span>{variante.color}</span>}
                                        {variante.size && <span>•</span>}
                                        {variante.size && <span>Talla: {variante.size}</span>}
                                        {variante.model && <span>•</span>}
                                        {variante.model && <span>Modelo: {variante.model}</span>}
                                    </div>
                                    <div className="mt-2 flex gap-4 text-xs">
                                        <div>
                                            <p className="text-muted-foreground">Solicitado</p>
                                            <p className="font-semibold">{variante.cantidad_solicitada}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Comprado</p>
                                            <p className="font-semibold text-orange-600">{variante.cantidad_comprada}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Saldo</p>
                                            <p className="font-semibold">{variante.saldo}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-shrink-0 bg-transparent"
                                    onClick={() => onEditVariante(variante)}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
