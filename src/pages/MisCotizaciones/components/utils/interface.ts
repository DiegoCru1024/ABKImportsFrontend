export interface Cotizacion {
    id: string;
    tipoServicio: string;
    estado: string;
    fecha: Date;
  }
  
  export interface Producto {
    nombre: string;
    cantidad: number;
    especificaciones: string;
    estado: string;
    fecha: string;
    url: string;
    archivos: File[];
    comentario: string;
    tamano: string;
    color: string;
    tipoServicio: string;
    peso: number;
    volumen: number;
    nro_cajas: number;
  }