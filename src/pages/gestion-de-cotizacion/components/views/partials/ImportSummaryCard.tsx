import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChartBar } from "lucide-react";

export interface ImportSummaryCardProps {
  selectedIncoterm: string;
  comercialValue: number;
  totalGastosImportacion: number;
  inversionTotal: number;
  shouldExemptTaxes: boolean;
}

export default function ImportSummaryCard({
  selectedIncoterm,
  comercialValue,
  totalGastosImportacion,
  inversionTotal,
  shouldExemptTaxes,
}: ImportSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ChartBar className="h-5 w-5 text-orange-600" />
          Resumen de Gastos de Importación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2">
            <span className="text-lg text-gray-600">INCOTERM DE IMPORTACION</span>
            <span className="font-medium">{selectedIncoterm}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-lg text-gray-600">VALOR DE COMPRA FACTURA COMERCIAL</span>
            <span className="font-medium">USD {comercialValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-lg text-gray-600">TOTAL GASTOS DE IMPORTACION</span>
            <span className="font-medium">USD {totalGastosImportacion.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
            <span className="text-lg text-green-900">INVERSION TOTAL DE IMPORTACION</span>
            <span className="font-medium text-green-900">USD {inversionTotal.toFixed(2)}</span>
          </div>
          {shouldExemptTaxes && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-800">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">Exoneración Automática Activa</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Los impuestos están exonerados automáticamente porque el valor comercial es menor a $200.00
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


