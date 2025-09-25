export interface AddValoremIgvImpInterface {
  descuento: boolean;

  valor: number;
}
export interface ExpenseFieldsInterface {
  servicioConsolidado: number;

  separacionCarga: number;

  seguroProductos: number;

  inspeccionProducts: number;

  addvaloremigvipm: AddValoremIgvImpInterface;

  desadunajefleteseguro: number;

  transporteLocal: number;

  transporteLocalChinaEnvio: number;

  transporteLocalClienteEnvio: number;
}
