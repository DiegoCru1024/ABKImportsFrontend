// Tipos para producto y formulario
export interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  tamano: string;
  color: string;
  url: string;
  comentario: string;
  tipoServicio: string;
  peso: number;
  volumen: number;
  nro_cajas: number;
  archivos: File[];
}

