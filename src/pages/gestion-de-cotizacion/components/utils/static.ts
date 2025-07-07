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
    { value: "Consolidado Grupal Maritimo", label: "Consolidado Grupal Maritimo" },
    { value: "Almacenaje de mercancias", label: "Almacenaje de mercancias" },
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
  export const statusColorsQuotation: Record<keyof typeof statusResponseQuotation, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    answered: "bg-green-100  text-green-800",
    observed: "bg-blue-100   text-blue-800",
    completed: "bg-green-100   text-green-800",
    cancelled: "bg-gray-100   text-gray-800",
  };

