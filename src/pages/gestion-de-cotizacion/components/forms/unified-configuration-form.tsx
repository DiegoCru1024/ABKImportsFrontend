import { useState } from "react";
import { Calculator, Settings, Shield, Percent } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

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
  adValoremRate: number;
  igvRate: number;
  ipmRate: number;
  percepcionRate: number;
  transporteLocalChinaEnvio: number;
  transporteLocalClienteEnvio: number;
  totalDerechos: number;
}

interface ExemptionState {
  servicioConsolidadoAereo: boolean;
  separacionCarga: boolean;
  inspeccionProductos: boolean;
  obligacionesFiscales: boolean;
  desaduanajeFleteSaguro: boolean;
  transporteLocalChina: boolean;
  transporteLocalCliente: boolean;
  servicioConsolidadoMaritimo: boolean;
  gestionCertificado: boolean;
  servicioInspeccion: boolean;
  transporteLocal: boolean;
  totalDerechos: boolean;
  descuentoGrupalExpress: boolean;
}

interface UnifiedConfigurationFormProps {
  dynamicValues: DynamicValues;
  onUpdateValue: (key: keyof DynamicValues, value: number) => void;
  onKgChange: (value: number) => void;
  exemptionState: ExemptionState;
  onExemptionChange: (field: keyof ExemptionState, value: boolean) => void;
  isMaritimeService: boolean;
  cif?: number;
}

export function UnifiedConfigurationForm({
  dynamicValues,
  onUpdateValue,
  onKgChange,
  exemptionState,
  onExemptionChange,
  isMaritimeService,
  cif = 0,
}: UnifiedConfigurationFormProps) {
  const [openTaxDialog, setOpenTaxDialog] = useState(false);
  const [openExemptionDialog, setOpenExemptionDialog] = useState(false);

  const exemptions = [
    {
      id: "servicioConsolidadoAereo",
      label: "Servicio Consolidado Aéreo",
      show: !isMaritimeService,
    },
    {
      id: "separacionCarga",
      label: "Separación de Carga",
      show: !isMaritimeService,
    },
    {
      id: "inspeccionProductos",
      label: "Inspección de Productos",
      show: !isMaritimeService,
    },
    {
      id: "servicioConsolidadoMaritimo",
      label: "Servicio Consolidado Marítimo",
      show: isMaritimeService,
    },
    {
      id: "gestionCertificado",
      label: "Gestión de Certificado",
      show: isMaritimeService,
    },
    {
      id: "servicioInspeccion",
      label: "Servicio de Inspección",
      show: isMaritimeService,
    },
    {
      id: "transporteLocal",
      label: "Transporte Local",
      show: isMaritimeService,
    },
    {
      id: "obligacionesFiscales",
      label: "Obligaciones Fiscales",
      show: true,
    },
    {
      id: "desaduanajeFleteSaguro",
      label: "Desaduanaje, Flete y Seguro",
      show: true,
    },
    {
      id: "transporteLocalChina",
      label: "Transporte Local China",
      show: true,
    },
    {
      id: "transporteLocalCliente",
      label: "Transporte Local Cliente",
      show: true,
    },
    {
      id: "totalDerechos",
      label: "Total Derechos",
      show: true,
    },
    {
      id: "descuentoGrupalExpress",
      label: "Descuento 50% (Express Grupal)",
      show: !isMaritimeService,
    },
  ];

  const visibleExemptions = exemptions.filter((exemption) => exemption.show);

  return (
    <div className="space-y-4">
      {/* Botones de configuración */}
      <div className="flex gap-3 justify-end">
        <Dialog open={openTaxDialog} onOpenChange={setOpenTaxDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Percent className="h-4 w-4" />
              Porcentajes de Impuestos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Porcentajes de Impuestos</DialogTitle>
              <DialogDescription>
                Configure los porcentajes de impuestos aplicables
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Ad Valorem (%)
                </Label>
                <EditableNumericField
                  value={dynamicValues.adValoremRate}
                  onChange={(value: number) =>
                    onUpdateValue("adValoremRate", value)
                  }
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
                  onChange={(value: number) => onUpdateValue("igvRate", value)}
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
                  onChange={(value: number) => onUpdateValue("ipmRate", value)}
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
                  onChange={(value: number) =>
                    onUpdateValue("percepcionRate", value)
                  }
                  suffix="%"
                  decimalPlaces={2}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={openExemptionDialog} onOpenChange={setOpenExemptionDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="h-4 w-4" />
              Exoneraciones
              {Object.values(exemptionState).filter(Boolean).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">
                  {Object.values(exemptionState).filter(Boolean).length}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Exoneraciones</DialogTitle>
              <DialogDescription>
                Configure las exoneraciones aplicables a la cotización
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
              {visibleExemptions.map((exemption) => (
                <div
                  key={exemption.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                >
                  <Checkbox
                    id={exemption.id}
                    checked={
                      exemptionState[
                        exemption.id as keyof typeof exemptionState
                      ]
                    }
                    onCheckedChange={(checked) =>
                      onExemptionChange(
                        exemption.id as keyof ExemptionState,
                        checked as boolean
                      )
                    }
                    className="h-4 w-4"
                  />
                  <Label
                    htmlFor={exemption.id}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {exemption.label}
                  </Label>
                </div>
              ))}
            </div>
            {Object.values(exemptionState).some(Boolean) && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-amber-600" />
                  <span className="text-xs font-medium text-amber-800">
                    {Object.values(exemptionState).filter(Boolean).length}{" "}
                    exoneraciones activas
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Valores Dinámicos Agrupados */}
      <Accordion type="single" collapsible defaultValue="valores-dinamicos">
        <AccordionItem value="valores-dinamicos" className="border-0">
          <Card className="bg-gradient-to-br from-emerald-50/40 to-green-50/30 shadow-lg border border-emerald-200/60 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <AccordionTrigger className="hover:no-underline py-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-100/60 to-green-100/50 rounded-lg shadow-sm">
                    <Calculator className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-xl font-semibold text-slate-800">
                      Valores Dinámicos
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      Configure los valores de cálculo para la cotización
                    </CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
            </CardHeader>

            <AccordionContent>
              <CardContent className="space-y-6">
                {/* Grupo 1: Obligaciones Fiscales (CIF) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                    <div className="h-2 w-2 rounded-full bg-emerald-600"></div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      Obligaciones Fiscales
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-600">
                      Valor Comercial
                    </Label>
                    <EditableNumericField
                      value={dynamicValues.comercialValue}
                      onChange={(value: number) =>
                        onUpdateValue("comercialValue", value)
                      }
                      prefix="$"
                      decimalPlaces={2}
                    />
                  </div>

                  {/* Cálculo CIF destacado - Diseño Vertical */}
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-600 animate-pulse"></div>
                      <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">
                        Cálculo CIF (FOB + Flete + Seguro)
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {/* FOB */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-emerald-700">
                          FOB
                        </Label>
                        <EditableNumericField
                          value={dynamicValues.fob}
                          onChange={(value: number) =>
                            onUpdateValue("fob", value)
                          }
                          prefix="$"
                          decimalPlaces={2}
                        />
                      </div>

                      {/* Flete */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          Flete
                          {isMaritimeService && (
                            <span className="text-[10px] text-emerald-600 font-normal">
                              (Calculado)
                            </span>
                          )}
                        </Label>
                        <div className="flex gap-2 items-center">
                          <EditableNumericField
                            value={dynamicValues.flete}
                            onChange={(value: number) =>
                              onUpdateValue("flete", value)
                            }
                            prefix="$"
                            decimalPlaces={2}
                            readOnly={isMaritimeService}
                          />
                          {isMaritimeService && (
                            <div className="space-y-1 flex-1">
                              <Label className="text-[10px] font-medium text-slate-500">
                                Cálculo Flete
                              </Label>
                              <EditableNumericField
                                value={dynamicValues.calculoFlete}
                                onChange={(value: number) =>
                                  onUpdateValue("calculoFlete", value)
                                }
                                prefix="$"
                                decimalPlaces={2}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Seguro */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-emerald-700">
                          Seguro
                        </Label>
                        <EditableNumericField
                          value={dynamicValues.seguro}
                          onChange={(value: number) =>
                            onUpdateValue("seguro", value)
                          }
                          prefix="$"
                          decimalPlaces={2}
                        />
                      </div>

                      {/* Separador visual */}
                      <div className="border-t-2 border-emerald-400 my-2"></div>

                      {/* CIF - Resultado destacado */}
                      <div className="space-y-2 p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg border-2 border-emerald-500 shadow-md">
                        <Label className="text-base font-extrabold text-emerald-900 flex items-center gap-2">
                          <span className="text-xl">=</span>
                          CIF (TOTAL)
                        </Label>
                        <div className="relative">
                          <EditableNumericField
                            value={cif}
                            onChange={() => {}}
                            prefix="$"
                            decimalPlaces={2}
                            readOnly
                          />
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded"></div>
                        </div>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          Valor más importante para cálculos fiscales
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grupo 2: Servicio de Consolidación & Gastos de Importación (Transporte) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      Servicio de Consolidación & Gastos de Importación
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">
                        Transporte Local (China)
                      </Label>
                      <EditableNumericField
                        value={dynamicValues.transporteLocalChinaEnvio}
                        onChange={(value: number) =>
                          onUpdateValue("transporteLocalChinaEnvio", value)
                        }
                        prefix="$"
                        decimalPlaces={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">
                        Transporte Local (Destino)
                      </Label>
                      <EditableNumericField
                        value={dynamicValues.transporteLocalClienteEnvio}
                        onChange={(value: number) =>
                          onUpdateValue("transporteLocalClienteEnvio", value)
                        }
                        prefix="$"
                        decimalPlaces={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">
                        Desaduanaje
                      </Label>
                      <EditableNumericField
                        value={dynamicValues.desaduanaje}
                        onChange={(value: number) =>
                          onUpdateValue("desaduanaje", value)
                        }
                        prefix="$"
                        decimalPlaces={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">
                        Total de Derechos
                      </Label>
                      <EditableNumericField
                        value={dynamicValues.totalDerechos}
                        onChange={() => {}}
                        prefix="$"
                        decimalPlaces={2}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Grupo 3: Información General */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
                    <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                    <h3 className="text-sm font-semibold text-slate-700">
                      Información General
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">
                        Cajas
                      </Label>
                      <EditableNumericField
                        value={dynamicValues.cajas}
                        onChange={(value: number) =>
                          onUpdateValue("cajas", value)
                        }
                        decimalPlaces={0}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">
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
                      <Label className="text-xs font-medium text-slate-600">
                        Peso (TON)
                      </Label>
                      <EditableNumericField
                        value={dynamicValues.ton}
                        onChange={(value: number) =>
                          onUpdateValue("ton", value)
                        }
                        suffix="ton"
                        decimalPlaces={3}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-600">
                        Tipo de Cambio
                      </Label>
                      <EditableNumericField
                        value={dynamicValues.tipoCambio}
                        onChange={(value: number) =>
                          onUpdateValue("tipoCambio", value)
                        }
                        decimalPlaces={2}
                      />
                    </div>

                    {!isMaritimeService && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-600">
                          KV
                        </Label>
                        <EditableNumericField
                          value={dynamicValues.kv}
                          onChange={(value: number) =>
                            onUpdateValue("kv", value)
                          }
                          decimalPlaces={2}
                        />
                      </div>
                    )}

                    {isMaritimeService && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-600">
                            Nro. Bultos
                          </Label>
                          <EditableNumericField
                            value={dynamicValues.nroBultos}
                            onChange={(value: number) =>
                              onUpdateValue("nroBultos", value)
                            }
                            decimalPlaces={0}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-600">
                            Volumen CBM
                          </Label>
                          <EditableNumericField
                            value={dynamicValues.volumenCBM}
                            onChange={(value: number) =>
                              onUpdateValue("volumenCBM", value)
                            }
                            suffix="m³"
                            decimalPlaces={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-600">
                            Cálculo Flete
                          </Label>
                          <EditableNumericField
                            value={dynamicValues.calculoFlete}
                            onChange={(value: number) =>
                              onUpdateValue("calculoFlete", value)
                            }
                            prefix="$"
                            decimalPlaces={2}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
