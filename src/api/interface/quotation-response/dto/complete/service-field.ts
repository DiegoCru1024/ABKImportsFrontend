export interface ServiceFiledsInterface {
  servicioConsolidado: number;

  separacionCarga: number;

  seguroProductos: number;

  inspeccionProductos: number;

  gestionCertificado: number;

  inspeccionFabrica: number;

  transporteLocalChina: number;

  transporteLocalDestino: number;

  otrosServicios: number;

  [key: string]: number;
}
