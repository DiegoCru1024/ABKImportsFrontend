import React from "react";
import { Badge } from "@/components/ui/badge";
import { Anchor, Globe, Ship } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardTitle } from "@/components/ui/card";

export interface MaritimeServiceFormViewProps {
  maritimeConfig: {
    regime: string;
    customs: string;
    naviera: string;
    originPort: string;
    destinationPort: string;
    transitTime: number;
    originCountry: string;
    destinationCountry: string;
  };
}

export default function MaritimeServiceFormView({
  maritimeConfig,
}: MaritimeServiceFormViewProps) {
  const maritimeItems = [
    {
      key: "regime",
      label: "RÉGIMEN",
      value: maritimeConfig.regime,
      icon: <Ship className="h-4 w-4 text-teal-500" />,
      color: "teal",
    },
    {
      key: "customs",
      label: "ADUANA",
      value: maritimeConfig.customs,
      icon: <Anchor className="h-4 w-4 text-blue-500" />,
      color: "blue",
    },
    {
      key: "naviera",
      label: "NAVIERA",
      value: maritimeConfig.naviera,
      icon: <Ship className="h-4 w-4 text-cyan-500" />,
      color: "cyan",
    },
    {
      key: "originPort",
      label: "PUERTO ORIGEN",
      value: maritimeConfig.originPort,
      icon: <Anchor className="h-4 w-4 text-emerald-500" />,
      color: "emerald",
    },
    {
      key: "destinationPort",
      label: "PUERTO DESTINO",
      value: maritimeConfig.destinationPort,
      icon: <Anchor className="h-4 w-4 text-indigo-500" />,
      color: "indigo",
    },
    {
      key: "transitTime",
      label: "TIEMPO DE TRÁNSITO",
      value: `${maritimeConfig.transitTime} días`,
      icon: <Globe className="h-4 w-4 text-purple-500" />,
      color: "purple",
    },
    {
      key: "originCountry",
      label: "PAÍS ORIGEN",
      value: maritimeConfig.originCountry,
      icon: <Globe className="h-4 w-4 text-green-500" />,
      color: "green",
    },
    {
      key: "destinationCountry",
      label: "PAÍS DESTINO",
      value: maritimeConfig.destinationCountry,
      icon: <Globe className="h-4 w-4 text-blue-500" />,
      color: "blue",
    },
  ];

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="maritime-config" className="border-0">
        <div className="shadow-lg border-1 border-teal-200 bg-white rounded-lg">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg rounded-b-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-teal-200 rounded-lg">
                  <Ship className="h-6 w-6 text-teal-700" />
                </div>
                <div>
                  <div>Configuración Marítima</div>
                  <div className="text-sm font-normal text-teal-700">
                    Detalles del servicio marítimo
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
                    className="bg-teal-100 text-teal-800 border-teal-200"
                  >
                    MARÍTIMO
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Información del transporte
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {maritimeItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-teal-200 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${item.color}-50 rounded-lg`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            Configuración
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-sm">
                          {item.value}
                        </div>
                      </div>
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
