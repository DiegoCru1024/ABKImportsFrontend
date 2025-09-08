import {
  Calculator,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";

interface DynamicValues {
  comercialValue: number;
  flete: number;
  cajas: number;
  desaduanaje: number;
  kg: number;
  ton: number;
  kv: number;
  fob: number;
  seguro: number;
  tipoCambio: number;
  nroBultos: number;
  volumenCBM: number;
  calculoFlete: number;
  servicioConsolidado: number;
  separacionCarga: number;
  inspeccionProductos: number;
  gestionCertificado: number;
  inspeccionProducto: number;
  inspeccionFabrica: number;
  transporteLocal: number;
  otrosServicios: number;
  adValoremRate: number;
  antidumpingGobierno: number;
  antidumpingCantidad: number;
  iscRate: number;
  igvRate: number;
  ipmRate: number;
  percepcionRate: number;
  transporteLocalChinaEnvio: number;
  transporteLocalClienteEnvio: number;
}

interface DynamicValuesFormProps {
  dynamicValues: DynamicValues;
  onUpdateValue: (field: keyof DynamicValues, value: number) => void;
  onKgChange: (value: number) => void;
  isMaritimeService: boolean;
}

export function DynamicValuesForm({
  dynamicValues,
  onUpdateValue,
  onKgChange,
  isMaritimeService,
}: DynamicValuesFormProps) {
  return (
    <Card className="bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-slate-800">
              Valores Dinámicos
            </CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              Configure los valores de cálculo para la cotización
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Valor Comercial
            </Label>
            <EditableNumericField
              value={dynamicValues.comercialValue}
              onChange={(value) => onUpdateValue("comercialValue", value)}
              prefix="$"
              decimalPlaces={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Flete
            </Label>
            <EditableNumericField
              value={dynamicValues.flete}
              onChange={(value) => onUpdateValue("flete", value)}
              prefix="$"
              decimalPlaces={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Cajas
            </Label>
            <EditableNumericField
              value={dynamicValues.cajas}
              onChange={(value) => onUpdateValue("cajas", value)}
              decimalPlaces={0}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Desaduanaje
            </Label>
            <EditableNumericField
              value={dynamicValues.desaduanaje}
              onChange={(value) => onUpdateValue("desaduanaje", value)}
              prefix="$"
              decimalPlaces={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Peso (KG)
            </Label>
            <EditableNumericField
              value={dynamicValues.kg}
              onChange={onKgChange}
              suffix="kg"
              decimalPlaces={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Peso (TON)
            </Label>
            <EditableNumericField
              value={dynamicValues.ton}
              onChange={(value) => onUpdateValue("ton", value)}
              suffix="ton"
              decimalPlaces={3}
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              KV
            </Label>
            <EditableNumericField
              value={dynamicValues.kv}
              onChange={(value) => onUpdateValue("kv", value)}
              decimalPlaces={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              FOB
            </Label>
            <EditableNumericField
              value={dynamicValues.fob}
              onChange={(value) => onUpdateValue("fob", value)}
              prefix="$"
              decimalPlaces={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Seguro
            </Label>
            <EditableNumericField
              value={dynamicValues.seguro}
              onChange={(value) => onUpdateValue("seguro", value)}
              prefix="$"
              decimalPlaces={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Tipo de Cambio
            </Label>
            <EditableNumericField
              value={dynamicValues.tipoCambio}
              onChange={(value) => onUpdateValue("tipoCambio", value)}
              decimalPlaces={2}
            />
          </div>

          {isMaritimeService && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Nro. Bultos
                </Label>
                <EditableNumericField
                  value={dynamicValues.nroBultos}
                  onChange={(value) => onUpdateValue("nroBultos", value)}
                  decimalPlaces={0}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Volumen CBM
                </Label>
                <EditableNumericField
                  value={dynamicValues.volumenCBM}
                  onChange={(value) => onUpdateValue("volumenCBM", value)}
                  suffix="m³"
                  decimalPlaces={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Cálculo Flete
                </Label>
                <EditableNumericField
                  value={dynamicValues.calculoFlete}
                  onChange={(value) => onUpdateValue("calculoFlete", value)}
                  prefix="$"
                  decimalPlaces={2}
                />
              </div>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Servicios de Consolidación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Servicio Consolidado
              </Label>
              <EditableNumericField
                value={dynamicValues.servicioConsolidado}
                onChange={(value) => onUpdateValue("servicioConsolidado", value)}
                prefix="$"
                decimalPlaces={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Separación de Carga
              </Label>
              <EditableNumericField
                value={dynamicValues.separacionCarga}
                onChange={(value) => onUpdateValue("separacionCarga", value)}
                prefix="$"
                decimalPlaces={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Inspección de Productos
              </Label>
              <EditableNumericField
                value={dynamicValues.inspeccionProductos}
                onChange={(value) => onUpdateValue("inspeccionProductos", value)}
                prefix="$"
                decimalPlaces={2}
              />
            </div>

            {isMaritimeService && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Gestión de Certificado
                  </Label>
                  <EditableNumericField
                    value={dynamicValues.gestionCertificado}
                    onChange={(value) => onUpdateValue("gestionCertificado", value)}
                    prefix="$"
                    decimalPlaces={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Inspección de Producto
                  </Label>
                  <EditableNumericField
                    value={dynamicValues.inspeccionProducto}
                    onChange={(value) => onUpdateValue("inspeccionProducto", value)}
                    prefix="$"
                    decimalPlaces={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Inspección de Fábrica
                  </Label>
                  <EditableNumericField
                    value={dynamicValues.inspeccionFabrica}
                    onChange={(value) => onUpdateValue("inspeccionFabrica", value)}
                    prefix="$"
                    decimalPlaces={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Transporte Local
                  </Label>
                  <EditableNumericField
                    value={dynamicValues.transporteLocal}
                    onChange={(value) => onUpdateValue("transporteLocal", value)}
                    prefix="$"
                    decimalPlaces={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Otros Servicios
                  </Label>
                  <EditableNumericField
                    value={dynamicValues.otrosServicios}
                    onChange={(value) => onUpdateValue("otrosServicios", value)}
                    prefix="$"
                    decimalPlaces={2}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Porcentajes de Impuestos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Ad Valorem (%)
              </Label>
              <EditableNumericField
                value={dynamicValues.adValoremRate}
                onChange={(value) => onUpdateValue("adValoremRate", value)}
                suffix="%"
                decimalPlaces={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                IGV (%)
              </Label>
              <EditableNumericField
                value={dynamicValues.igvRate}
                onChange={(value) => onUpdateValue("igvRate", value)}
                suffix="%"
                decimalPlaces={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                IPM (%)
              </Label>
              <EditableNumericField
                value={dynamicValues.ipmRate}
                onChange={(value) => onUpdateValue("ipmRate", value)}
                suffix="%"
                decimalPlaces={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Percepción (%)
              </Label>
              <EditableNumericField
                value={dynamicValues.percepcionRate}
                onChange={(value) => onUpdateValue("percepcionRate", value)}
                suffix="%"
                decimalPlaces={2}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}