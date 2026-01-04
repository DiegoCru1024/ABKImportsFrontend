import { useNavigate, useParams } from "react-router-dom";
import { useActualizarVariantes, useGetProductosConVariantes } from "@/hooks/use-orden-compra.ts";
import type { ActualizarVariantesDto, VarianteDetalleDto } from "@/api/interface/orden-compra-interface.ts";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card.tsx";
import { ProductoRow } from "@/pages/orden-compra/components/producto-row.tsx";
import { VarianteEditDialog } from "@/pages/orden-compra/components/variant-edit-dialog.tsx";

export default function ProductosDetallesOrdenCompra() {
    const navigate = useNavigate();
    const { ordenCompraId, subQuotationId } = useParams<{
        ordenCompraId: string;
        subQuotationId: string;
    }>();

    const { data: productos, isLoading, refetch } = useGetProductosConVariantes(subQuotationId || "");
    console.log("producto que llegaron",productos);
    const { mutate: actualizarVariantes, isPending } = useActualizarVariantes();

    const [selectedVariante, setSelectedVariante] = useState<VarianteDetalleDto | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const handleEditVariante = (variante: VarianteDetalleDto) => {
        setSelectedVariante(variante);
        setEditDialogOpen(true);
    };

    const handleSaveVariante = async (idOrdenCompraProducto: string, cantidad: number) => {
        const variantesAActualizar: ActualizarVariantesDto = {
            variantes: [{
                id_orden_compra_producto: idOrdenCompraProducto,
                cantidad_comprada: cantidad
            }],
        };

        actualizarVariantes(
            {
                ordenId: ordenCompraId || "",
                subQuotationId: subQuotationId || "",
                updateDto: variantesAActualizar,
            },
            {
                onSuccess: () => {
                    setEditDialogOpen(false);
                    setSelectedVariante(null);
                },
            },
        );
    };

    // Calcular estadísticas totales
    const estadisticas = useMemo(() => {
        if (!productos) return null;

        const stats = productos.reduce((acc, producto) => {
            const montoAgenteProducto = producto.variantes.reduce((sum, v) =>
                sum + v.monto_agente, 0
            );

            return {
                totalSolicitado: acc.totalSolicitado + producto.total_solicitado,
                totalComprado: acc.totalComprado + producto.total_comprado,
                totalSaldo: acc.totalSaldo + producto.saldo_total,
                montoAgenteTotal: acc.montoAgenteTotal + montoAgenteProducto,
            };
        }, {
            totalSolicitado: 0,
            totalComprado: 0,
            totalSaldo: 0,
            montoAgenteTotal: 0,
        });

        const porcentaje = stats.totalSolicitado > 0
            ? Math.round((stats.totalComprado / stats.totalSolicitado) * 100)
            : 0;

        return { ...stats, porcentaje };
    }, [productos]);



    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.history.back()}
                                className="hover:bg-gray-100"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-medium text-gray-900">
                                    Detalles de Productos
                                </h1>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                    <span>Orden: {ordenCompraId}</span>
                                    <span>•</span>
                                    <span>Sub-cotización: {subQuotationId}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="border-gray-300"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </Button>
                    </div>

                    {/* Estadísticas principales */}
                    {estadisticas && (
                        <Card className="p-6 bg-white border border-gray-200">
                            <div className="grid grid-cols-5 gap-6 mb-4">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Solicitado</div>
                                    <div className="text-3xl font-medium text-gray-900">
                                        {estadisticas.totalSolicitado}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Comprado</div>
                                    <div className="text-3xl font-medium text-orange-600">
                                        {estadisticas.totalComprado}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Saldo</div>
                                    <div className={`text-3xl font-medium ${estadisticas.totalSaldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {estadisticas.totalSaldo}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Monto Agente</div>
                                    <div className="text-3xl font-medium text-amber-600">
                                        ${estadisticas.montoAgenteTotal.toFixed(2)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Progreso</div>
                                    <div className="text-3xl font-medium text-orange-600">
                                        {estadisticas.porcentaje}%
                                    </div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-500 transition-all duration-500"
                                    style={{ width: `${estadisticas.porcentaje}%` }}
                                />
                            </div>
                        </Card>
                    )}
                </div>

                {/* Lista de productos */}
                {isLoading ? (
                    <Card className="p-12 text-center bg-white border border-gray-200">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500"></div>
                            <p className="text-gray-500">Cargando productos...</p>
                        </div>
                    </Card>
                ) : !productos || productos.length === 0 ? (
                    <Card className="p-12 text-center bg-white border border-gray-200 border-dashed">
                        <p className="text-gray-500">No hay productos disponibles</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
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
    );
}