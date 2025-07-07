import { FileText } from "lucide-react";

// Definir las tabs
export const tabs = [
    {
      id: "solicitudes",
      label: "Solicitudes",
      icon: FileText,
      description: "Ver todas las solicitudes de cotización",
      disabled: false,
    },
    {
      id: "detalles",
      label: "Detalles de la cotización",
      icon: FileText,
      description: "Ver detalles de la cotización seleccionada",
      disabled: false,
    },
    {
      id: "respuesta",
      label: "Respuesta",
      icon: FileText,
      description: "Responder cotización",
      disabled: false,
    },
  ] as const;
  
  export type TabId = (typeof tabs)[number]["id"];

  // Configuraciones de estado
export const statusMap = {
  pending: { 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    label: "Pendiente",
    dotColor: "bg-yellow-500"
  },
  partial: { 
    color: "bg-blue-100 text-blue-800 border-blue-200", 
    label: "Parcial",
    dotColor: "bg-blue-500"
  },
  answered: { 
    color: "bg-green-100 text-green-800 border-green-200", 
    label: "Respondida",
    dotColor: "bg-green-500"
  },
};

export const statusFilterOptions = [
  { key: "all", label: "Todas", count: 0 },
  { key: "pending", label: "Pendientes", count: 0 },
  { key: "partial", label: "Parciales", count: 0 },
  { key: "answered", label: "Respondidas", count: 0 },
];