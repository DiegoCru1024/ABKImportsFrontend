# Módulo de Gestión de Cotizaciones - Refactorizado

## 📋 Descripción

Módulo completamente refactorizado para la gestión y respuesta de cotizaciones con arquitectura mejorada, componentes reutilizables y diseño profesional siguiendo las mejores prácticas.

## 🏗️ Arquitectura Mejorada

### Estructura de Archivos
```
src/pages/gestion-de-cotizacion/
├── index.tsx                     # Re-export principal
├── gestion-de-cotizacion-view.tsx # Vista principal refactorizada
├── components/
│   ├── index.ts                  # Barrel exports
│   ├── shared/                   # Componentes compartidos
│   │   ├── quotation-card.tsx    # Card de cotización mejorada
│   │   └── product-grid.tsx      # Grid de productos
│   ├── views/                    # Vistas específicas
│   │   ├── detailsreponse.tsx    # Vista de respuesta (existente)
│   │   ├── listreponses.tsx      # Lista de respuestas (mejorada)
│   │   └── ...
│   └── utils/                    # Utilidades (existente)
├── hooks/                        # Hooks personalizados
│   ├── use-quotation-list.ts     # Lógica de listado
│   ├── use-image-modal.ts        # Lógica del modal de imágenes
│   └── use-quotation-response.ts # Lógica de respuesta
├── types/                        # Tipos TypeScript
│   └── quotation-types.ts        # Tipos centralizados
└── README.md                     # Esta documentación
```

## 🎨 Componentes Reutilizables Creados

### Componentes UI Base
- **SectionHeader**: Header profesional con icono, título y acciones
- **StatusBadge**: Badge de estado con variantes visuales
- **InfoCard**: Card informativa con múltiples variantes
- **MetricCard**: Card de métricas con estilos diferenciados
- **LoadingState**: Estados de carga consistentes
- **ErrorState**: Estados de error con acciones de retry

### Componentes de Formulario
- **FormSection**: Sección de formulario con diseño profesional
- **FormField**: Campo de formulario con label y validación
- **NumericField**: Campo numérico con prefijos/sufijos
- **CalculationSummary**: Resumen de cálculos con totales

### Componentes Específicos
- **SearchFilters**: Barra de búsqueda y filtros reutilizable
- **PaginationControls**: Controles de paginación mejorados
- **ImageCarouselModal**: Modal de carrusel de imágenes
- **QuotationCard**: Card de cotización con diseño mejorado
- **ProductGrid**: Grid responsivo de productos

## 🔧 Hooks Personalizados

### useQuotationList
Maneja toda la lógica del listado de cotizaciones:
- Estado de búsqueda con debounce
- Filtros de estado
- Paginación
- Estado de expansión de productos

### useImageModal
Gestiona el modal de carrusel de imágenes:
- Navegación entre imágenes
- Descarga de imágenes
- Estado del modal

### useQuotationResponse
Centraliza la lógica de respuesta de cotizaciones:
- Configuración de servicios
- Valores dinámicos
- Estados de exoneración
- Generación de DTO

## 🎯 Mejoras Implementadas

### 1. Arquitectura
- ✅ Separación de responsabilidades
- ✅ Hooks personalizados para lógica de negocio
- ✅ Componentes reutilizables
- ✅ Tipado estricto con TypeScript

### 2. Diseño UI/UX
- ✅ Paleta de colores profesional
- ✅ Espaciado consistente
- ✅ Transiciones suaves
- ✅ Diseño responsivo
- ✅ Micro-interacciones

### 3. Performance
- ✅ Debounce en búsquedas
- ✅ Componentes optimizados
- ✅ Estados de carga eficientes
- ✅ Renderizado condicional mejorado

### 4. Mantenibilidad
- ✅ Código modular
- ✅ Imports organizados según guía
- ✅ Convenciones de nomenclatura
- ✅ Documentación inline

## 🔄 Funcionalidades Preservadas

Todas las funcionalidades originales han sido preservadas:
- ✅ Listado de cotizaciones con filtros
- ✅ Vista de respuesta con cálculos dinámicos
- ✅ Gestión de productos y variantes
- ✅ Modal de imágenes con navegación
- ✅ Estados de cotización (borrador, pendiente, etc.)
- ✅ Generación de DTO para backend
- ✅ Navegación entre vistas

## 🚀 Cómo Usar

### Importación Básica
```typescript
import GestionDeCotizacionesView from "@/pages/gestion-de-cotizacion";
```

### Usando Componentes Específicos
```typescript
import { 
  QuotationCard, 
  useQuotationList,
  useImageModal 
} from "@/pages/gestion-de-cotizacion/components";
```

### Usando Hooks
```typescript
const quotationList = useQuotationList();
const imageModal = useImageModal();
```

## 📝 Patrones de Código

### Estructura de Componente
```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon1, Icon2 } from "lucide-react";

import LocalComponent from "./components/local-component";
import { useCustomHook } from "@/hooks/use-custom-hook";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-time";

export default function ComponentName() {
  // 1. Router hooks
  const navigate = useNavigate();
  
  // 2. Estados locales
  const [state, setState] = useState<string>("");
  
  // 3. Custom hooks
  const { data, isLoading } = useCustomHook();
  
  // 4. Handlers
  const handleAction = () => {
    // lógica
  };
  
  // 5. Early returns
  if (isLoading) return <LoadingState />;
  
  // 6. Render
  return <div>Content</div>;
}
```

## 🎨 Guía de Estilos Aplicada

- **Espacios**: Uso generoso del whitespace
- **Jerarquía Visual**: Títulos, subtítulos y texto balanceados  
- **Colores**: Paleta profesional con azules, grises y acentos
- **Transiciones**: Animaciones suaves de 200ms
- **Tipografía**: Weights consistentes (normal, semibold, bold)
- **Componentes**: Diseño modular y reutilizable

## 🧪 Testing

Para validar las funcionalidades:

1. **Listado de cotizaciones**: Verificar filtros y búsqueda
2. **Modal de imágenes**: Probar navegación y descarga
3. **Responsive**: Validar en diferentes tamaños
4. **Estados**: Comprobar loading, error y empty states
5. **Navegación**: Verificar transiciones entre vistas

## 🔮 Próximas Mejoras Sugeridas

- [ ] Implementar testing unitario
- [ ] Agregar internacionalización (i18n)
- [ ] Optimizar con React.memo donde aplique
- [ ] Implementar skeleton loading
- [ ] Agregar analytics de uso