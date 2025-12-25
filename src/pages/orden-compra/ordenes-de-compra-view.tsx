"use client"
import {ServiceTypeCards} from "@/pages/orden-compra/components/ServiceTypeCards.tsx";
import {CreateOrderDialog} from "@/pages/orden-compra/components/CreateOrderDialog.tsx";
import {OrdersTable} from "@/pages/orden-compra/components/OrdersTable.tsx";
import type {PurchaseOrderType} from "@/api/interface/orden-compra-interface.ts";
import {useState} from "react";


export default function OrdenesDeCompraView() {
    const [selectedType, setSelectedType] = useState<PurchaseOrderType | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleServiceTypeClick = (type: PurchaseOrderType) => {
        setSelectedType(type);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedType(null);
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    CREAR ORDEN DE COMPRA
                </h1>
                <p className="text-muted-foreground">
                    Seleccione el tipo de servicio para comenzar
                </p>
            </div>

            {/* Service Type Cards */}
            <ServiceTypeCards onSelectType={handleServiceTypeClick} />

            {/* Create Order Dialog */}
            <CreateOrderDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                selectedType={selectedType}
            />

            {/* Orders Table */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">LISTAS DE ÓRDENES DE COMPRA</h2>
                <OrdersTable />
            </div>
        </div>
    );
}