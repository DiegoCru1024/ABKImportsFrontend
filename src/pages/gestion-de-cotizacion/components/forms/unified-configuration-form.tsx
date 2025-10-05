import { useState } from "react";
import { Calculator, Settings, Shield } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [showConfig, setShowConfig] = useState(false);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Valores Dinámicos - Columna Izquierda */}
      <div>
        <Accordion type="single" collapsible>
          <AccordionItem value="valores-dinamicos" className="border-0">
            <Card className="bg-gradient-to-br from-emerald-50/40 to-green-50/30 shadow-lg border border-emerald-200/60 rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <AccordionTrigger className="flex-1 hover:no-underline py-0">
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
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center gap-2 ml-4"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                </AccordionTrigger>
               
              </CardHeader>

              <AccordionContent>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Columna Izquierda */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
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

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
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

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
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

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Transporte Local (China)
                        </Label>
                        <EditableNumericField
                          value={dynamicValues.transporteLocalChinaEnvio}
                          onChange={(value: number) =>
                            onUpdateValue("transporteLocalChinaEnvio", value)
                          }
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
                              onChange={(value: number) =>
                                onUpdateValue("nroBultos", value)
                              }
                              decimalPlaces={0}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">
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

                    {/* Columna Derecha */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Flete
                        </Label>
                        <EditableNumericField
                          value={dynamicValues.flete}
                          onChange={(value: number) =>
                            onUpdateValue("flete", value)
                          }
                          prefix="$"
                          decimalPlaces={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
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
                        <Label className="text-sm font-medium text-slate-700">
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
                        <Label className="text-sm font-medium text-slate-700">
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

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          CIF
                        </Label>
                        <EditableNumericField
                          value={cif}
                          onChange={() => {}}
                          prefix="$"
                          decimalPlaces={2}
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
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

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Transporte Local (Destino)
                        </Label>
                        <EditableNumericField
                          value={dynamicValues.transporteLocalClienteEnvio}
                          onChange={(value: number) =>
                            onUpdateValue("transporteLocalClienteEnvio", value)
                          }
                          decimalPlaces={2}
                        />
                      </div>

                      {isMaritimeService && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">
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
                      )}
                    </div>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Columna Derecha */}
      <div className="space-y-6 grid grid-cols-2 gap-4">
        {/* Porcentajes de Impuestos */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            showConfig ? "opacity-100 translate-x-0" : "opacity-30"
          )}
        >
           <Accordion type="single" collapsible>
           <AccordionItem value="porcentajes-impuestos" className="border-0">
          <Card
            className={cn(
              "bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300",
              showConfig ? "shadow-lg border-green-200" : "shadow-sm"
            )}
          >
            <CardHeader>
            <AccordionTrigger className="flex-1 hover:no-underline py-0">
              <CardTitle className="text-lg font-semibold text-slate-800">
                Porcentajes de Impuestos
              </CardTitle>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
            <CardContent>
              <div className="space-y-4">
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
                    disabled={!showConfig}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    IGV (%)
                  </Label>
                  <EditableNumericField
                    value={dynamicValues.igvRate}
                    onChange={(value: number) =>
                      onUpdateValue("igvRate", value)
                    }
                    suffix="%"
                    decimalPlaces={2}
                    disabled={!showConfig}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    IPM (%)
                  </Label>
                  <EditableNumericField
                    value={dynamicValues.ipmRate}
                    onChange={(value: number) =>
                      onUpdateValue("ipmRate", value)
                    }
                    suffix="%"
                    decimalPlaces={2}
                    disabled={!showConfig}
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
                    disabled={!showConfig}
                  />
                </div>
              </div>
            </CardContent>
            </AccordionContent>
          </Card>
          </AccordionItem>
          </Accordion>
        </div>

        {/* Exoneraciones de Conceptos */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            showConfig ? "opacity-100 translate-x-0" : "opacity-30"
          )}
        >
          <Accordion type="single" collapsible>
            <AccordionItem value="exoneraciones" className="border-0">
              <Card
                className={cn(
                  "bg-white shadow-lg border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300",
                  showConfig ? "shadow-lg border-orange-200" : "shadow-sm"
                )}
              >
                <CardHeader>
                  <AccordionTrigger className="flex-1 hover:no-underline py-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-800">
                          Exoneraciones
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-sm">
                          Configure las exoneraciones aplicables
                        </CardDescription>
                      </div>
                    </div>
                  </AccordionTrigger>
                </CardHeader>

                <AccordionContent>
                  <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-1 gap-3">
                {visibleExemptions.map((exemption) => (
                  <div
                    key={exemption.id}
                    className="flex items-center space-x-2"
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
                      disabled={!showConfig}
                    />
                    <Label
                      htmlFor={exemption.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {exemption.label}
                    </Label>
                  </div>
                ))}
              </div>

              {Object.values(exemptionState).some(Boolean) && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-3 w-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-800">
                      Exoneraciones Activas
                    </span>
                  </div>
                  <p className="text-xs text-amber-700">
                    {Object.values(exemptionState).filter(Boolean).length}{" "}
                    exoneraciones aplicadas
                  </p>
                </div>
              )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Botón de cerrar configuración */}
        {showConfig && (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowConfig(false)}
              variant="outline"
              className="px-8"
            >
              Deshabilitar Configuración
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
