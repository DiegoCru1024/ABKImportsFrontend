export interface AddValoremIgvImpInterface {
  descuento: boolean;

  valor: number;
}
export interface ExpenseFieldsInterface {
  servicioConsolidado: number;

  separacionCarga: number;

  seguroProductos: number;

  gestionCertificado: number;

  totalDerechos: number;

  servicioTransporte: number;

  servicioInspeccion: number;

  otrosServicios: number;

  //! Solo consolidado express simplificada

  desaduanaje: number;

  //! Solo para consolidado express personal
  addvaloremigvipm: number;

  desadunajefleteseguro: number;
  //! Solo consolidado express grupal
  addvaloremigvipm50: number;

  //? Aplica para consolidado express simplificada y grupal
  fleteInternacional: number;
}
