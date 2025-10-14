import React from "react";
import { Badge } from "@/components/ui/badge";
import { Package, Plane, Settings, Truck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardTitle } from "@/components/ui/card";

export interface QuotationConfigurationFormViewProps {
  generalInformation: {
    courier: string;
    incoterm: string;
    cargoType: string;
    serviceLogistic: string;
  };
}

export default function QuotationConfigurationFormView({
  generalInformation,
}: QuotationConfigurationFormViewProps) {
  const configItems = [
    {
      key: "serviceLogistic",
      label: "SERVICIO LOGÍSTICO",
      value: generalInformation.serviceLogistic,
      icon: <Truck className="h-4 w-4 text-blue-500" />,
      color: "blue",
      bgColor: "bg-blue-100/60 text-blue-800 border-blue-300/50",
    },
    {
      key: "incoterm",
      label: "INCOTERM",
      value: generalInformation.incoterm,
      icon: <Package className="h-4 w-4 text-green-500" />,
      color: "green",
      bgColor: "bg-green-100/60 text-green-800 border-green-300/50",
    },
    {
      key: "cargoType",
      label: "TIPO DE CARGA",
      value: generalInformation.cargoType,
      icon: <Plane className="h-4 w-4 text-orange-500" />,
      color: "orange",
      bgColor: "bg-orange-100/60 text-orange-800 border-orange-300/50",
    },
    {
      key: "courier",
      label: "COURIER",
      value: generalInformation.courier,
      icon: <Settings className="h-4 w-4 text-purple-500" />,
      color: "purple",
      bgColor: "bg-purple-100/60 text-purple-800 border-purple-300/50",
    },
  ];

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="quotation-config" className="border-0">
        <div className="shadow-lg border-1 border-blue-200 bg-white rounded-lg">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg rounded-b-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <div>Información de la cotización</div>
                  <div className="text-sm font-normal text-blue-700">
                    Información general
                  </div>
                </div>
              </CardTitle>
            </AccordionTrigger>
          </div>

          <AccordionContent>
            <div className="space-y-4 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    CONFIGURACIÓN
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Parámetros del servicio
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {configItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${item.color}-50 rounded-lg`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500">Servicio</div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${item.bgColor} text-sm`}
                      >
                        {item.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
