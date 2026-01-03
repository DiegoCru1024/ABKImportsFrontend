import React from "react";
import {
  Calculator,
  DollarSign,
  Percent,
  Radiation,
  Receipt,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";

export interface TaxObligationsCardProps {
  adValoremRate: number;
  setAdValoremRate: (v: number) => void;
  igvRate: number;
  setIgvRate: (v: number) => void;
  ipmRate: number;
  setIpmRate: (v: number) => void;
  isMaritime: boolean;
  antidumpingGobierno: number;
  setAntidumpingGobierno: (v: number) => void;
  antidumpingCantidad: number;
  setAntidumpingCantidad: (v: number) => void;
  iscRate: number;
  setIscRate: (v: number) => void;
  percepcionMultiplier?: number;
  setPercepcionMultiplier?: (v: number) => void;
  values: {
    adValorem: number;
    antidumping: number;
    igvFiscal: number;
    ipm: number;
    isc: number;
    percepcion: number;
    totalDerechosDolares: number;
    totalDerechosSoles: number;
  };
}

export default function TaxObligationsCard({
  adValoremRate,
  setAdValoremRate,
  igvRate,
  setIgvRate,
  ipmRate,
  setIpmRate,
  isMaritime,
  antidumpingGobierno,
  setAntidumpingGobierno,
  antidumpingCantidad,
  setAntidumpingCantidad,
  iscRate,
  setIscRate,
  percepcionMultiplier = 3.5,
  setPercepcionMultiplier,
  values,
}: TaxObligationsCardProps) {
  // La percepción ya viene calculada correctamente desde use-quotation-calculations
  const calculatedPercepcion = values.percepcion;

    
  const taxItems = [
    {
      key: "adValorem",
      label: "AD/VALOREM",
      rate: adValoremRate,
      setRate: setAdValoremRate,
      value: values.adValorem,
      icon: <Percent className="h-4 w-4 text-blue-500" />,
      color: "blue",
    },
    ...(isMaritime
      ? [
          {
            key: "antidumping",
            label: "ANTIDUMPING",
            rate: antidumpingGobierno,
            setRate: setAntidumpingGobierno,
            value: values.antidumping,
            icon: <TrendingUp className="h-4 w-4 text-red-500" />,
            color: "red",
            isComplex: true,
            additionalRate: antidumpingCantidad,
            setAdditionalRate: setAntidumpingCantidad,
          },
        ]
      : []),
    ...(isMaritime
      ? [
          {
            key: "isc",
            label: "ISC",
            rate: iscRate,
            setRate: setIscRate,
            value: values.isc,
            icon: <Radiation className="h-4 w-4 text-green-500" />,
            color: "green",
          },
        ]
      : []),
    {
      key: "igv",
      label: "IGV",
      rate: igvRate,
      setRate: setIgvRate,
      value: values.igvFiscal,
      icon: <Calculator className="h-4 w-4 text-purple-500" />,
      color: "purple",
    },
    {
      key: "ipm",
      label: "IPM",
      rate: ipmRate,
      setRate: setIpmRate,
      value: values.ipm,
      icon: <DollarSign className="h-4 w-4 text-orange-500" />,
      color: "orange",
    },
    ...(isMaritime
      ? [
          {
            key: "percepcion",
            label: "PERCEPCION",
            rate: percepcionMultiplier,
            setRate: setPercepcionMultiplier || (() => {}),
            value: calculatedPercepcion,
            icon: <Receipt className="h-4 w-4 text-teal-500" />,
            color: "teal",
            isMultiplier: false,
          },
        ]
      : []),
  ];

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

          <div className="space-y-4">
            {taxItems.map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span className="text-sm text-gray-900 font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <EditableNumericField
                      value={item.rate}
                      onChange={item.setRate}
                    />
                    <span className="text-sm text-gray-500 font-medium">
                      {item.isMultiplier ? "x" : "%"}
                    </span>
                  </div>
                  {item.isComplex && (
                    <>
                      <span className="text-sm text-gray-400">x</span>
                      <EditableNumericField
                        value={item.additionalRate}
                        onChange={item.setAdditionalRate}
                      />
                    </>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-gray-500 font-medium">USD</span>
                    <p className="text-base font-semibold text-gray-900">
                      {item.value.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-emerald-700" />
                <div>
                  <span className="text-sm font-semibold text-emerald-900">Total de Derechos</span>
                  <p className="text-xs text-emerald-700">En Dólares Americanos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-emerald-700">
                  USD {values.totalDerechosDolares.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-teal-700" />
                <div>
                  <span className="text-sm font-semibold text-teal-900">Total de Derechos</span>
                  <p className="text-xs text-teal-700">En Soles Peruanos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-teal-700">
                  S/. {values.totalDerechosSoles.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
