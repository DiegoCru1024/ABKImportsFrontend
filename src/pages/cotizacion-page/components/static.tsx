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
  draft: { 
    color: "bg-blue-100 text-blue-800 border-blue-200", 
    label: "Borrador",
    dotColor: "bg-blue-500"
  },
  in_progress: { 
    color: "bg-orange-100 text-orange-800 border-orange-200", 
    label: "En Proceso",
    dotColor: "bg-orange-500"
  },
  completed: { 
    color: "bg-green-100 text-green-800 border-green-200", 
    label: "Completada",
    dotColor: "bg-green-500"
  },
  approved: { 
    color: "bg-green-100 text-green-800 border-green-200", 
    label: "Aprobada",
    dotColor: "bg-green-500"
  },
};

// 1. Define una configuración por defecto
export const defaultStatusConfig = {
  color: "bg-gray-100 text-gray-800 border-gray-200",
  label: "Desconocido",
  dotColor: "bg-gray-500",
};

export const statusFilterOptions = [
  { key: "all", label: "Todas", count: 0 },
  { key: "pending", label: "Pendientes", count: 0 },
  { key: "draft", label: "Borradores", count: 0 },
  { key: "in_progress", label: "En Proceso", count: 0 },
  { key: "completed", label: "Completadas", count: 0 },
  { key: "approved", label: "Aprobadas", count: 0 },
];