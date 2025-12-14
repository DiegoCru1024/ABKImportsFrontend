import React from "react";
import { Calculator, DollarSign, Percent, Receipt, Radiation, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

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
  tipoCambio?: number;
}

export default function TaxObligationsCardView({
  fiscalObligations,
  isMaritime = false,
  tipoCambio = 3.7,
}: TaxObligationsCardViewProps) {
  const antidumpingValue = fiscalObligations.antidumping.antidumpingValor;

  const taxItems = [
    {
      key: "adValorem",
      label: "Ad Valorem",
      value: fiscalObligations.adValorem,
      icon: <Percent className="h-4 w-4 text-blue-500" />,
    },
    ...(isMaritime && antidumpingValue > 0
      ? [
          {
            key: "antidumping",
            label: "Antidumping",
            value: antidumpingValue,
            icon: <TrendingUp className="h-4 w-4 text-red-500" />,
          },
        ]
      : []),
    ...(isMaritime && fiscalObligations.isc !== undefined && fiscalObligations.isc > 0
      ? [
          {
            key: "isc",
            label: "ISC",
            value: fiscalObligations.isc,
            icon: <Radiation className="h-4 w-4 text-green-500" />,
          },
        ]
      : []),
    {
      key: "igv",
      label: "IGV",
      value: fiscalObligations.igv,
      icon: <Calculator className="h-4 w-4 text-purple-500" />,
    },
    {
      key: "ipm",
      label: "IPM",
      value: fiscalObligations.ipm,
      icon: <DollarSign className="h-4 w-4 text-orange-500" />,
    },
    ...(isMaritime &&
    fiscalObligations.percepcion !== undefined &&
    fiscalObligations.percepcion > 0
      ? [
          {
            key: "percepcion",
            label: "Percepción",
            value: fiscalObligations.percepcion,
            icon: <Receipt className="h-4 w-4 text-teal-500" />,
          },
        ]
      : []),
  ];

  const totalDerechosSoles = fiscalObligations.totalTaxes * tipoCambio;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calculator className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Obligaciones Fiscales</h3>
              <p className="text-xs text-gray-500">Impuestos y derechos aplicables</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-32 gap-y-4">
            {taxItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  USD {item.value.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Total de Derechos</span>
                  <p className="text-xs text-gray-500">En Dólares Americanos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-700">
                  USD {fiscalObligations.totalTaxes.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-100">
              <div className="flex items-center space-x-2">
                <Receipt className="h-4 w-4 text-teal-600" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Total de Derechos</span>
                  <p className="text-xs text-gray-500">En Soles Peruanos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-teal-700">
                  S/. {totalDerechosSoles.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
