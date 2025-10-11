//! Incoterms
export const incotermsOptions = [
  { value: "EXW", label: "EXW - Ex Works" },
  { value: "FCA", label: "FCA - Free Carrier" },
  { value: "CIF", label: "CIF - Cost, Insurance & Freight" },
  { value: "FOB", label: "FOB - Free On Board" },
  { value: "FAS", label: "FAS - Free Alongside Ship" },
  { value: "DDP", label: "DDP - Delivered Duty Paid" },
  { value: "DAP", label: "DAP - Delivered At Place" },
  { value: "DAT", label: "DAT - Delivered At Terminal" },
  { value: "DDU", label: "DDU - Delivered Duty Unpaid" },
];

//! Servicios logisticos
export const serviciosLogisticos = [
  { value: "Pendiente", label: "Pendiente" },
  { value: "Consolidado Express", label: "Consolidado Express" },
  { value: "Consolidado Grupal Express", label: "Consolidado Grupal Express" },
  { value: "Consolidado Maritimo", label: "Consolidado Maritimo" },
  {
    value: "Consolidado Grupal Maritimo",
    label: "Consolidado Grupal Maritimo",
  },
  { value: "Almacenaje de mercancias", label: "Almacenaje de mercancias" },
];

//!Tipo de carga - Aéreo
export const typeLoad = [
  { value: "general", label: "GENERAL" },
  { value: "imo", label: "IMO" },
  { value: "mixto", label: "MIXTO" },
  { value: "suelta", label: "SUELTA" },
  { value: "seca", label: "SECA" },
];

//!Tipo de carga - Marítimo
export const typeLoadMaritime = [
  { value: "carga_general", label: "CARGA GENERAL" },
  { value: "carga_imo", label: "CARGA IMO" },
  { value: "carga_pesada", label: "CARGA PESADA" },
  { value: "carga_suelta", label: "CARGA SUELTA" },
  { value: "carga_seca", label: "CARGA SECA" },
];

//!Régimen
export const regimenOptions = [
  { value: "importacion_consumo", label: "Importación para el consumo" },
  { value: "despacho_simplificado", label: "Despacho Simplificado" },
];

//!Paises de origen
export const paisesOrigen = [
  { value: "china", label: "CHINA" },
  { value: "india", label: "INDIA" },
  { value: "spain", label: "ESPAÑA" },
  { value: "usa", label: "USA" },
  { value: "turkey", label: "TURQUIA" },
  { value: "corea", label: "COREA" },
  { value: "japan", label: "JAPON" },
  { value: "mexico", label: "MÉXICO" },
  { value: "brazil", label: "BRASIL" },
  { value: "argentina", label: "ARGENTINA" },
  { value: "chile", label: "CHILE" },
  { value: "colombia", label: "COLOMBIA" },
  { value: "otros", label: "OTROS" },
];

//!Paises de destino
export const paisesDestino = [
  { value: "peru", label: "PERU" },
  { value: "chile", label: "CHILE" },
  { value: "argentina", label: "ARGENTINA" },
  { value: "colombia", label: "COLOMBIA" },
];

//!Aduana
export const aduana = [
  { value: "tacna", label: "TACNA" },
  { value: "maritima_del_callao", label: "MARITIMA DEL CALLAO" },
  { value: "ilove", label: "ILO" },
  { value: "otros", label: "OTROS" },
];

//!Puertos de salida
export const puertosSalida = [
  { value: "shanghai", label: "SHANGHÁI" },
  { value: "shenzhen", label: "SHENZHEN" },
  { value: "ningbo_zhoushan", label: "NINGBO-ZHOUSHAN" },
  { value: "guangzhou", label: "GUANGZHOU" },
  { value: "hong_kong", label: "HONG KONG" },
  { value: "tianjin", label: "TIANJIN" },
  { value: "xiamen", label: "XIAMEN" },
  { value: "qingdao", label: "QINGDAO" },
  { value: "dalian", label: "DALIAN" },
  { value: "lianyungang", label: "LIANYUNGANG" },
  { value: "fuzhou", label: "FUZHOU" },
  { value: "yingkou", label: "YINGKOU" },
  { value: "zhuhai", label: "ZHUHAI" },
  { value: "jinan", label: "JINAN" },
  { value: "hainan", label: "HAINAN" },
  { value: "qinzhou", label: "QINZHOU" },
  { value: "beihai", label: "BEIHAI" },
  { value: "fangchenggang", label: "FANGCHENGGANG" },
];

//!Puertos de destino
export const puertosDestino = [
  { value: "callao", label: "CALLAO" },
  { value: "ilo", label: "ILO" },
  { value: "arica", label: "ARICA" },
  { value: "chancay", label: "CHANCAY" },
];

//!Tipo de servicio
export const tipoServicio = [
  { value: "directo", label: "DIRECTO" },
  { value: "transbordo", label: "TRANSBORDO" },
];

//!Proforma vigencia
export const proformaVigencia = [
  { value: "1", label: "1 DÍA" },
  { value: "2", label: "2 DÍAS" },
  { value: "3", label: "3 DÍAS" },
  { value: "4", label: "4 DÍAS" },
  { value: "5", label: "5 DÍAS" },
  { value: "6", label: "6 DÍAS" },
  { value: "7", label: "7 DÍAS" },
  { value: "8", label: "8 DÍAS" },
  { value: "9", label: "9 DÍAS" },
  { value: "10", label: "10 DÍAS" },
  { value: "11", label: "11 DÍAS" },
  { value: "12", label: "12 DÍAS" },
  { value: "13", label: "13 DÍAS" },
  { value: "14", label: "14 DÍAS" },
  { value: "15", label: "15 DÍAS" },
  { value: "16", label: "16 DÍAS" },
  { value: "17", label: "17 DÍAS" },
  { value: "18", label: "18 DÍAS" },
  { value: "19", label: "19 DÍAS" },
  { value: "20", label: "20 DÍAS" },
];

//!Courier
export const courier = [
  { value: "dhl", label: "DHL" },
  { value: "fedex", label: "FEDEX" },
  { value: "ups", label: "UPS" },
  { value: "ems", label: "EMS" },
  { value: "other", label: "OTROS" },
];
//! Estado de la respuesta de la cotización
export const statusResponseQuotation = {
  pending: "Pendiente",
  answered: "Respondido",
  observed: "Observado",
  completed: "Completado",
  cancelled: "Cancelado",
};

//! Colores de los estados de la respuesta de la cotización
export const statusColorsQuotation: Record<
  keyof typeof statusResponseQuotation,
  string
> = {
  pending: "bg-yellow-100 text-yellow-800",
  answered: "bg-green-100  text-green-800",
  observed: "bg-blue-100   text-blue-800",
  completed: "bg-green-100   text-green-800",
  cancelled: "bg-gray-100   text-gray-800",
};
