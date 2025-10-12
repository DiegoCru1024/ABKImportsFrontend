export interface ServiceFiledsInterface {
  servicioConsolidado: number;

  separacionCarga: number;

  seguroProductos: number;

  inspeccionProductos: number;

  gestionCertificado: number;

  inspeccionProducto: number;

  transporteLocal: number;

  transporteLocalChina: number;

  transporteLocalDestino: number;

  otrosServicios: number;

  [key: string]: number;
}
