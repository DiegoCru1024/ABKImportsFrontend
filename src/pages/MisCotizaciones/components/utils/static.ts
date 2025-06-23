import { BarChart3, FileText, Search } from "lucide-react";

// Defino mapeo de colores para estados de cotización
export const estadoColorMap: Record<string, string> = {
    Pendiente: "bg-yellow-400 text-white",
    Revisado: "bg-green-500 text-white",
    Completado: "bg-green-500 text-white",
    Observado: "bg-yellow-400 text-white",
    Cancelado: "bg-red-500 text-white",
  };


  export const statusConfig = {
    pendiente: { 
      label: 'Pendiente', 
      className: 'bg-orange-400/15 text-orange-400  border-orange-400/30 hover:bg-orange-400/20',
      dot: 'bg-orange-400'
    },
    revisado: { 
      label: 'Revisado', 
      className: 'bg-green-500/15 text-green-400 border-green-400/30 hover:bg-green-400/20',
      dot: 'bg-green-400'
    },
    completado: { 
      label: 'Completado', 
      className: 'bg-green-500/15 text-green-500 border-green-500/30 hover:bg-green-500/20',
      dot: 'bg-green-500'
    },
    observado: { 
      label: 'Observado', 
      className: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/20',
      dot: 'bg-yellow-400'
    },
    cancelado: { 
      label: 'Cancelado', 
      className: 'bg-red-400/15 text-red-400 border-red-400/30 hover:bg-red-400/20',
      dot: 'bg-red-400'
    },
  };
  
  export const tabs = [
    {
      id: "mis",
      label: "Mis cotizaciones",
      icon: FileText,
      description: "Ver todas mis cotizaciones",
    },
    {
      id: "detalles",
      label: "Detalles de cotización",
      icon: Search,
      description: "Información detallada",
    },
    {
      id: "seguimiento",
      label: "Seguimiento",
      icon: BarChart3,
      description: "Estado y progreso",
      disabled: false,
    },
  ]

