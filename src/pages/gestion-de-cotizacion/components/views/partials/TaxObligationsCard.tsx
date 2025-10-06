import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  DollarSign,
  Percent,
  Receipt,
  TrendingUp,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Separator } from "@/components/ui/separator";

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
  values: {
    adValorem: number;
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
  values,
}: TaxObligationsCardProps) {
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
            value: values.percepcion
              ? values.totalDerechosDolares -
                values.adValorem -
                values.igvFiscal -
                values.ipm
              : values.totalDerechosDolares -
                values.adValorem -
                values.igvFiscal -
                values.ipm,
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
            icon: <Receipt className="h-4 w-4 text-purple-500" />,
            color: "purple",
          },
        ]
      : []),
    {
      key: "igv",
      label: "IGV",
      rate: igvRate,
      setRate: setIgvRate,
      value: values.igvFiscal,
      icon: <Calculator className="h-4 w-4 text-green-500" />,
      color: "green",
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

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-end">
                            <EditableNumericField
                              value={item.rate}
                              onChange={item.setRate}
                            />
                            <span className="ml-1 text-sm text-gray-500 font-medium">
                              %
                            </span>
                          </div>
                          {item.isComplex && (
                            <>
                              <span className="text-xs text-gray-400">x</span>
                              <div className="flex items-center justify-end">
                                <EditableNumericField
                                  value={item.additionalRate}
                                  onChange={item.setAdditionalRate}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="font-semibold text-gray-900">
                            USD {item.value.toFixed(2)}
                          </div>
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
                          En Dólares Americanos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl">
                        USD {values.totalDerechosDolares.toFixed(2)}
                      </div>
                      <div className="text-sm opacity-90">Total impuestos</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-200 to-teal-200 text-emerald-900 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-300 rounded-lg">
                        <Receipt className="h-5 w-5 text-emerald-800" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          Total de Derechos
                        </div>
                        <div className="text-sm opacity-90">
                          En Soles Peruanos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl">
                        S/. {values.totalDerechosSoles.toFixed(2)}
                      </div>
                      <div className="text-sm opacity-90">Total impuestos</div>
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
