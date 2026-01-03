import {useNavigate, useParams} from "react-router-dom";
import {useActualizarVariantes, useGetProductosConVariantes} from "@/hooks/use-orden-compra.ts";
import type {ActualizarVariantesDto, VarianteDetalleDto} from "@/api/interface/orden-compra-interface.ts";
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft} from "lucide-react";
import {Card} from "@/components/ui/card.tsx";
import {ProductoRow} from "@/pages/orden-compra/components/producto-row.tsx";
import {VarianteEditDialog} from "@/pages/orden-compra/components/variant-edit-dialog.tsx";


export default function ProductosDetallesOrdenCompra() {
    const navigate = useNavigate();
    const {ordenCompraId, subQuotationId} = useParams<{
        ordenCompraId: string;
        subQuotationId: string;
    }>();

    const { data: productos, isLoading } = useGetProductosConVariantes(subQuotationId || "");
    const { mutate: actualizarVariantes, isPending } = useActualizarVariantes()

    console.log("productos",productos)

    const [selectedVariante, setSelectedVariante] = useState<VarianteDetalleDto | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    const handleEditVariante = (variante: VarianteDetalleDto) => {
        setSelectedVariante(variante)
        setEditDialogOpen(true)
    }

    const handleSaveVariante = async (idOrdenCompraProducto: string, cantidad: number) => {
        const variantesAActualizar: ActualizarVariantesDto = {
            variantes: [{
                id_orden_compra_producto: idOrdenCompraProducto,
                cantidad_comprada: cantidad
            }],
        }

        actualizarVariantes(
            {
                ordenId: ordenCompraId || "",
                subQuotationId: subQuotationId || "",
                updateDto: variantesAActualizar,
            },
            {
                onSuccess: () => {
                    setEditDialogOpen(false)
                    setSelectedVariante(null)
                },
            },
        )
    }

    return (
        <main className="min-h-screen bg-background p-4 md:p-6">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Detalles de Productos</h1>
                        <p className="text-sm text-muted-foreground">
                            Orden: {ordenCompraId} • Sub-cotización: {subQuotationId}
                        </p>
                    </div>
                </div>

                {/* Contenido */}
                {!productos || productos.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-muted-foreground">No hay productos para mostrar</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {productos.map((producto) => (
                            <ProductoRow
                                key={producto.id_product}
                                producto={producto}
                                onEditVariante={handleEditVariante}
                            />
                        ))}
                    </div>
                )}

                {/* Dialog para editar variante */}
                <VarianteEditDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    variante={selectedVariante}
                    onSave={handleSaveVariante}
                    isSaving={isPending}
                />
            </div>
        </main>
    )
}