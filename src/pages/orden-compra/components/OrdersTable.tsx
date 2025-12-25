import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Ship,
    Plane,
    Users,
    Eye,
    Edit,
    Calendar,
    Package,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {PurchaseOrderStatus} from "@/api/interface/orden-compra-interface.ts";
import {useGetAllOrdenesCompra} from "@/hooks/use-orden-compra.ts";

const getServiceIcon = (type: string) => {
    if (type.includes("Maritimo")) return Ship
    if (type.includes("Express")) return Plane
    return Users
}

const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
        case PurchaseOrderStatus.COMPLETADO:
            return "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400"
        case PurchaseOrderStatus.EN_PROGRESO:
            return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400"
        case PurchaseOrderStatus.COMPLETADO_PARCIALMENTE:
            return "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400"
        case PurchaseOrderStatus.PENDIENTE_DE_COMPRA:
            return "bg-primary/10 text-primary border-primary/20"
        default:
            return "bg-muted text-muted-foreground border-border"
    }
}

const getIconColor = (type: string) => {
    if (type.includes("Maritimo")) return "text-secondary bg-secondary/10"
    if (type.includes("Express")) return "text-primary bg-primary/10"
    return "text-secondary bg-secondary/10"
}

export function OrdersTable() {
    const { data: orders, isLoading } = useGetAllOrdenesCompra();

    if (isLoading) {
        return (
            <Card className="border-border/50">
                <div className="p-6 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </div>
            </Card>
        )
    }

    if (!orders || orders.length === 0) {
        return (
            <Card className="p-16 border-border/50">
                <div className="text-center space-y-4">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-muted-foreground text-base">No hay órdenes de compra registradas</p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow >
                            <TableHead className=" font-bold">N°</TableHead>
                            <TableHead className=" font-bold">
                                TIPO DE SERVICIO
                            </TableHead>
                            <TableHead className=" font-bold">
                                FECHA - HORA
                            </TableHead>
                            <TableHead className="font-bold text-center">
                                PART.
                            </TableHead>
                            <TableHead className=" font-bold text-center">
                                ITEMS
                            </TableHead>
                            <TableHead className="font-bold">ESTADO</TableHead>
                            <TableHead className=" font-bold text-center">
                                ACCIONES
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order, index) => {
                            const ServiceIcon = getServiceIcon(order.type);
                            const iconColor = getIconColor(order.type);
                            return (
                                <TableRow
                                    key={order.id_orden_compra}
                                    className="hover:bg-muted/50"
                                >
                                    {/* Number with Icon */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${iconColor}`}>
                                                <ServiceIcon className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold">{index + 1}</span>
                                        </div>
                                    </TableCell>

                                    {/* Service Type */}
                                    <TableCell>
                                        <div className="font-medium">{order.type}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {order.correlative}
                                        </div>
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm">
                        {format(new Date(order.created_at), "dd/MM - hh:mm a", {
                            locale: es,
                        })}
                      </span>
                                        </div>
                                    </TableCell>

                                    {/* Participants */}
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-semibold">
                        {order.numero_participantes}
                      </span>
                                        </div>
                                    </TableCell>

                                    {/* Items */}
                                    <TableCell className="text-center">
                                        <span className="font-semibold">{order.numero_items}</span>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={getStatusColor(order.status)}
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y">
                {orders.map((order, index) => {
                    const ServiceIcon = getServiceIcon(order.type);
                    const iconColor = getIconColor(order.type);

                    return (
                        <div key={order.id_orden_compra} className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${iconColor}`}>
                                        <ServiceIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Orden #{index + 1}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {order.correlative}
                                        </div>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={getStatusColor(order.status)}
                                >
                                    {order.status}
                                </Badge>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Servicio: </span>
                                    <span className="font-medium">{order.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>
                    {format(new Date(order.created_at), "dd/MM/yyyy - hh:mm a", {
                        locale: es,
                    })}
                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span>{order.numero_participantes} participantes</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">{order.numero_items}</span>{" "}
                                        items
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}