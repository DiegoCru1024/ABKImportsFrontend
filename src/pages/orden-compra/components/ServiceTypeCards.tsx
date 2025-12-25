import {PurchaseOrderType} from "@/api/interface/orden-compra-interface.ts";
import { Card } from "@/components/ui/card";
import {Layers, Plane, Plus, Ship, Users, Warehouse} from "lucide-react";
import {cn} from "@/lib/utils.ts";

interface ServiceTypeCardsProps {
    onSelectType: (type: PurchaseOrderType) => void;
}

const serviceTypes = [
    {
        type: PurchaseOrderType.CONSOLIDADO_MARITIMO,
        label: "MARÍTIMO",
        icon: Ship,
        gradient: "from-blue-500 to-blue-600",
        hoverGradient: "hover:from-blue-600 hover:to-blue-700",
    },
    {
        type: PurchaseOrderType.CONSOLIDADO_GRUPAL_MARITIMO,
        label: "MARÍTIMO GRUPAL",
        icon: Layers,
        gradient: "from-indigo-500 to-indigo-600",
        hoverGradient: "hover:from-indigo-600 hover:to-indigo-700",
    },
    {
        type: PurchaseOrderType.CONSOLIDADO_EXPRESS,
        label: "AÉREO EXPRESS",
        icon: Plane,
        gradient: "from-orange-500 to-orange-600",
        hoverGradient: "hover:from-orange-600 hover:to-orange-700",
    },
    {
        type: PurchaseOrderType.CONSOLIDADO_GRUPAL_EXPRESS,
        label: "AÉREO GRUPAL",
        icon: Users,
        gradient: "from-amber-500 to-amber-600",
        hoverGradient: "hover:from-amber-600 hover:to-amber-700",
    },
    {
        type: null,
        label: "ALMACÉN",
        icon: Warehouse,
        gradient: "from-gray-400 to-gray-500",
        hoverGradient: "hover:from-gray-500 hover:to-gray-600",
        disabled: true,
    },
];

export function ServiceTypeCards({ onSelectType }: ServiceTypeCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {serviceTypes.map((service, index) => {
                const Icon = service.icon;
                const isDisabled = service.disabled;

                return (
                    <Card
                        key={index}
                        className={cn(
                            "relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-0",
                            `bg-gradient-to-br ${service.gradient} ${!isDisabled && service.hoverGradient}`,
                            isDisabled && "opacity-60 cursor-not-allowed"
                        )}
                        onClick={() => !isDisabled && service.type && onSelectType(service.type)}
                    >
                        <div className="p-6 text-white space-y-4">
                            {/* Icon */}
                            <div className="flex items-center justify-center">
                                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                                    <Icon className="w-12 h-12" />
                                </div>
                            </div>

                            {/* Label */}
                            <h3 className="text-center font-bold text-lg">
                                {service.label}
                            </h3>

                            {/* Plus Button */}
                            {!isDisabled && (
                                <div className="absolute top-3 right-3">
                                    <div className="p-1.5 bg-white/30 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}