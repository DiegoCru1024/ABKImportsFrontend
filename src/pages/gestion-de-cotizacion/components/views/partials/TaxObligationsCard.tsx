import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";

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
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-green-600" />
          Obligaciones Fiscales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          <div className="p-4 space-y-2">
            <div className="font-semibold text-sm mb-3">IMPUESTOS</div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>AD/VALOREM</div>
              <div className="text-right">
                <div className="flex items-center justify-end">
                  <EditableNumericField value={adValoremRate} onChange={setAdValoremRate} />
                  <span className="ml-1">%</span>
                </div>
              </div>
              <div className="text-right">USD</div>
              <div className="text-right">{values.adValorem.toFixed(2)}</div>
            </div>

            {isMaritime && (
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>ANTIDUMPING</div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <EditableNumericField value={antidumpingGobierno} onChange={setAntidumpingGobierno} />
                    <span className="text-xs">x</span>
                    <EditableNumericField value={antidumpingCantidad} onChange={setAntidumpingCantidad} />
                  </div>
                </div>
                <div className="text-right">USD</div>
                <div className="text-right">{values.percepcion ? (values.totalDerechosDolares - values.adValorem - values.igvFiscal - values.ipm).toFixed(2) : (values.totalDerechosDolares - values.adValorem - values.igvFiscal - values.ipm).toFixed(2)}</div>
              </div>
            )}

            {isMaritime && (
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>ISC</div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <EditableNumericField value={iscRate} onChange={setIscRate} />
                    <span className="ml-1">%</span>
                  </div>
                </div>
                <div className="text-right">USD</div>
                <div className="text-right">{values.isc.toFixed(2)}</div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>IGV</div>
              <div className="text-right">
                <div className="flex items-center justify-end">
                  <EditableNumericField value={igvRate} onChange={setIgvRate} />
                  <span className="ml-1">%</span>
                </div>
              </div>
              <div className="text-right">USD</div>
              <div className="text-right">{values.igvFiscal.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>IPM</div>
              <div className="text-right">
                <div className="flex items-center justify-end">
                  <EditableNumericField value={ipmRate} onChange={setIpmRate} />
                  <span className="ml-1">%</span>
                </div>
              </div>
              <div className="text-right">USD</div>
              <div className="text-right">{values.ipm.toFixed(2)}</div>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
            <span className="font-medium text-green-900">Total de Derechos - Dólares</span>
            <span className="font-bold text-green-900">USD {values.totalDerechosDolares.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
            <span className="font-medium text-green-900">Total de Derechos - Soles</span>
            <span className="font-bold text-green-900">S/. {values.totalDerechosSoles.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


