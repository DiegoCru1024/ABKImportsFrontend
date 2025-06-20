export interface Cotizacion {
    id: string;
    correlative: string;
    service_type: string;
    status: string;
    created_at: Date;
    updated_at: Date;
    productQuantity: number;
    user: {
        id: string;
        name: string;
        email: string;
    }[];
  }

  export interface Producto {
    id:number;
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