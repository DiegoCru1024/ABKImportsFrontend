"use client"

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, Edit2, Eye } from "lucide-react"
import type { ProductoConVariantesDto, VarianteDetalleDto } from "@/api/interface/orden-compra-interface.ts"
import ImageCarouselModal from "@/components/ImageCarouselModal"

interface ProductoRowProps {
    producto: ProductoConVariantesDto
    onEditVariante: (variante: VarianteDetalleDto) => void
}

export function ProductoRow({ producto, onEditVariante }: ProductoRowProps) {
    const [open, setOpen] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [selectedVariantName, setSelectedVariantName] = useState("")

    const completionPercentage = Math.round((producto.total_comprado / producto.total_solicitado) * 100)

    // Obtener imagen del producto o de la primera variante con imagen
    const productImage = producto.product_image ||
        producto.variantes.find(v => v.variant_images && v.variant_images.length > 0)?.variant_images[0]

    const handleOpenImages = (images: string[], variantName: string) => {
        if (images && images.length > 0) {
            setSelectedImages(images)
            setSelectedVariantName(variantName)
            setIsImageModalOpen(true)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completado':
                return 'text-green-600'
            case 'Completado Parcial':
                return 'text-orange-600'
            case 'Pendiente':
                return 'text-gray-400'
            default:
                return 'text-gray-400'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Completado':
                return 'Completado'
            case 'Completado Parcial':
                return 'Parcial'
            case 'Pendiente':
                return 'Pendiente'
            default:
                return status
        }
    }

    return (
        <>
            <Card className="overflow-hidden border border-gray-200 hover:border-orange-400 transition-colors">
                <Collapsible open={open} onOpenChange={setOpen}>
                    {/* Header del Producto */}
                    <CollapsibleTrigger asChild>
                        <div className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-6">
                                {/* Imagen del producto */}
                                <div className="relative flex-shrink-0">
                                    {productImage ? (
                                        <img
                                            src={productImage}
                                            alt={producto.product_name}
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                            <span className="text-gray-400 text-sm">Sin imagen</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info del Producto */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
                                        {producto.product_name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {producto.variantes.length} {producto.variantes.length === 1 ? 'variante' : 'variantes'}
                                    </p>
                                </div>

                                {/* Estadísticas */}
                                <div className="flex items-center gap-8">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500 mb-1">Solicitado</div>
                                        <div className="text-2xl font-medium text-gray-900">{producto.total_solicitado}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500 mb-1">Comprado</div>
                                        <div className="text-2xl font-medium text-orange-600">{producto.total_comprado}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500 mb-1">Saldo</div>
                                        <div className="text-2xl font-medium text-gray-900">{producto.saldo_total}</div>
                                    </div>
                                    <div className="text-center min-w-[80px]">
                                        <div className="text-sm text-gray-500 mb-1">Progreso</div>
                                        <div className="text-2xl font-medium text-orange-600">{completionPercentage}%</div>
                                    </div>
                                </div>

                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>
                    </CollapsibleTrigger>

                    {/* Tabla de Variantes */}
                    <CollapsibleContent>
                        <div className="border-t border-gray-200 bg-gray-50/30">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-200 bg-white">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Imagen
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Solicitado
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Comprado
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Saldo
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precio Unit.
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acción
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                    {producto.variantes.map((variante) => (
                                        <tr key={variante.id_variant} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-6">
                                                {variante.variant_images && variante.variant_images.length > 0 ? (
                                                    <div className="relative group">
                                                        <img
                                                            src={variante.variant_images[0]}
                                                            alt={variante.variant_description}
                                                            className="w-20 h-20 object-cover rounded border border-gray-200 cursor-pointer"
                                                            onClick={() => handleOpenImages(variante.variant_images, variante.variant_description)}
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                                            <Eye className="w-5 h-5 text-white" />
                                                        </div>
                                                        {variante.variant_images.length > 1 && (
                                                            <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                                {variante.variant_images.length}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                                                        <span className="text-gray-400 text-xs">N/A</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-xs text-gray-500">Descripción de la variante:</span>
                                                        <div className="font-medium text-gray-900 mt-0.5">
                                                            {variante.variant_description}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
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
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {variante.cantidad_solicitada}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                    <span className="text-sm font-medium text-orange-600">
                                                        {variante.cantidad_comprada}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                    <span className={`text-sm font-medium ${variante.saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {variante.saldo}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        ${variante.precio_unitario.toFixed(2)}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                    <span className={`text-xs font-medium ${getStatusColor(variante.status)}`}>
                                                        {getStatusText(variante.status)}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onEditVariante(variante)}
                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            <ImageCarouselModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                files={[]}
                attachments={selectedImages}
                productName={selectedVariantName}
            />
        </>
    )
}