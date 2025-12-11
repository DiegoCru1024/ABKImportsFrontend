import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, Percent, Receipt } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface TaxObligationsCardViewProps {
  fiscalObligations: {
    igv: number;
    ipm: number;
    adValorem: number;
    isc?: number;
    percepcion?: number;
    totalTaxes: number;
    antidumping: {
      antidumpingGobierno: number;
      antidumpingCantidad: number;
      antidumpingValor: number;
    };
  };
  isMaritime?: boolean;
}

export default function TaxObligationsCardView({
  fiscalObligations,
  isMaritime = false,
}: TaxObligationsCardViewProps) {
  // Calcular total de antidumping (suma de gobierno, cantidad y valor)
  const totalAntidumping =
    fiscalObligations.antidumping.antidumpingGobierno +
    fiscalObligations.antidumping.antidumpingCantidad +
    fiscalObligations.antidumping.antidumpingValor;

  // Configurar items de impuestos según tipo de servicio
  // Marítimos: AD/VALOREM, ANTIDUMPING, ISC, IGV, IPM, PERCEPCIÓN
  // Aéreos: AD/VALOREM, IGV, IPM
  const taxItems = [
    {
      key: "adValorem",
      label: "AD/VALOREM",
      value: fiscalObligations.adValorem,
      icon: <Percent className="h-4 w-4 text-blue-500" />,
      color: "blue",
    },
    ...(isMaritime && totalAntidumping > 0
      ? [
          {
            key: "antidumping",
            label: "ANTIDUMPING",
            value: totalAntidumping,
            icon: <DollarSign className="h-4 w-4 text-red-500" />,
            color: "red",
          },
        ]
      : []),
    ...(isMaritime && fiscalObligations.isc && fiscalObligations.isc > 0
      ? [
          {
            key: "isc",
            label: "ISC",
            value: fiscalObligations.isc,
            icon: <Receipt className="h-4 w-4 text-purple-500" />,
            color: "purple",
          },
        ]
      : []),
    {
      key: "igv",
      label: "IGV",
      value: fiscalObligations.igv,
      icon: <Calculator className="h-4 w-4 text-green-500" />,
      color: "green",
    },
    {
      key: "ipm",
      label: "IPM",
      value: fiscalObligations.ipm,
      icon: <DollarSign className="h-4 w-4 text-orange-500" />,
      color: "orange",
    },
    ...(isMaritime &&
    fiscalObligations.percepcion &&
    fiscalObligations.percepcion > 0
      ? [
          {
            key: "percepcion",
            label: "PERCEPCIÓN",
            value: fiscalObligations.percepcion,
            icon: <Percent className="h-4 w-4 text-teal-500" />,
            color: "teal",
          },
        ]
      : []),
  ];

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="tax-obligations" className="border-0">
        <div className="shadow-lg border-1 border-emerald-200 bg-white rounded-lg">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg rounded-b-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-emerald-200 rounded-lg">
                  <Calculator className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <div>Obligaciones Fiscales</div>
                  <div className="text-sm font-normal text-emerald-700">
                    Impuestos y Derechos
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
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    IMPUESTOS
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Aplicables según régimen
                  </span>
                </div>

                <div className="space-y-3">
                  {taxItems.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-green-200 transition-all duration-200 hover:shadow-sm"
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
                            Impuesto fiscal
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          USD {item.value.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-200 to-emerald-200 text-green-900 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-300 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-800" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          Total de Derechos
                        </div>
                        <div className="text-sm opacity-90">
                          Total impuestos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl">
                        USD {fiscalObligations.totalTaxes.toFixed(2)}
                      </div>
                      <div className="text-sm opacity-90">Suma total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
