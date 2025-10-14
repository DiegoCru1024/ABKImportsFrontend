# INSTRUCCIONES DE FORMATEO DE CÓDIGO - VITE + TYPESCRIPT

## 1. ESTRUCTURA DE CARPETAS PARA VISTAS/PÁGINAS
```
src/pages/
├── [nombre-de-vista]/
│   ├── index.tsx                    # Re-export del componente principal
│   ├── [nombre-de-vista]-view.tsx   # Componente principal de la vista
│   ├── components/                  # Componentes específicos de la vista
│   │   ├── table/                   # Componentes de tabla
│   │   ├── views/                   # Sub-vistas
│   │   │   └── partials/           # Componentes parciales
│   │   └── utils/                  # Utilidades específicas
│   ├── hooks/                      # Hooks personalizados de la vista
│   ├── types/                      # Types/interfaces específicos
│   └── utils/                      # Utilidades de la vista
```

## 2. CONVENCIONES DE NOMENCLATURA

### Archivos:
- **Componentes**: `kebab-case` para carpetas, `PascalCase` para archivos `.tsx`
- **Hooks**: `use-[nombre].ts` en kebab-case
- **Utilities**: `kebab-case.ts`
- **Types**: `[nombre]Interface.ts` o `types.ts`

### Variables y funciones:
- **Variables**: `camelCase`
- **Constantes**: `SCREAMING_SNAKE_CASE`
- **Funciones**: `camelCase`
- **Componentes**: `PascalCase`
- **Interfaces/Types**: `PascalCase` terminados en `Interface` o `Type`

## 3. CONFIGURACIÓN TYPESCRIPT (ESTRICTA)

```typescript
// tsconfig.app.json base
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 4. ESTRUCTURA DE COMPONENTES REACT

### Componente de Vista Principal:
```typescript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { SomeInterface } from "@/api/interface/someInterface";

// Importaciones de iconos agrupadas
import {
  Icon1,
  Icon2,
  Icon3,
} from "lucide-react";

// Importaciones de componentes locales
import LocalComponent from "./components/local-component";

// Importaciones de hooks personalizados
import { useCustomHook } from "@/hooks/use-custom-hook";

// Importaciones de componentes UI
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Importaciones de utilidades
import { formatDate } from "@/lib/format-time";

export default function ViewName() {
  // 1. Hooks de React Router
  const navigate = useNavigate();
  
  // 2. Estados locales (agrupados por funcionalidad)
  const [mainState, setMainState] = useState<string>("");
  const [data, setData] = useState<SomeInterface[]>([]);
  
  // 3. Estados de UI/Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 4. Hooks personalizados
  const { data: apiData, isLoading, isError } = useCustomHook();
  
  // 5. Effects
  useEffect(() => {
    // Lógica del effect
  }, [dependency]);
  
  // 6. Handlers (agrupados por funcionalidad)
  const handleSomething = (id: string) => {
    // Lógica del handler
  };
  
  // 7. Early returns
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  
  // 8. Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido */}
    </div>
  );
}
```

## 5. REGLAS DE IMPORTACIONES

### Orden de importaciones:
1. React y librerías externas
2. Iconos (agrupados)
3. Componentes locales relativos
4. Hooks personalizados
5. Componentes UI (@/components/ui/*)
6. Utilidades (@/lib/*)
7. Interfaces/Types (@/api/interface/*)

```typescript
// ✅ CORRECTO
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  Eye,
} from "lucide-react";

import LocalComponent from "./components/local-component";
import { useCustomHook } from "@/hooks/use-custom-hook";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-time";
import type { SomeInterface } from "@/api/interface/someInterface";

// ❌ INCORRECTO - orden mezclado
import { formatDate } from "@/lib/format-time";
import { useState } from "react";
import { Button } from "@/components/ui/button";
```

## 6. REGLAS DE TIPADO

### Tipos explícitos requeridos:
```typescript
// ✅ CORRECTO - tipos explícitos
const [data, setData] = useState<UserInterface[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [count, setCount] = useState<number>(0);

// Props con interface
interface ComponentProps {
  title: string;
  items: ItemInterface[];
  onSelect?: (id: string) => void;
}

export default function Component({ title, items, onSelect }: ComponentProps) {
  // ...
}

// ❌ INCORRECTO - tipos implícitos
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(false);
```

### Event handlers tipados:
```typescript
// ✅ CORRECTO
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // lógica
};
```

## 7. REGLAS DE STYLING (TAILWIND)

### Clases ordenadas por categoría:
```typescript
// ✅ CORRECTO - orden: layout → spacing → colors → typography → effects
className="flex items-center justify-between p-4 bg-white text-gray-900 font-medium shadow-lg hover:shadow-xl transition-shadow"

// ❌ INCORRECTO - orden aleatorio  
className="text-gray-900 flex shadow-lg p-4 font-medium hover:shadow-xl bg-white items-center justify-between transition-shadow"
```

## 8. REGLAS DE FUNCIONES Y HANDLERS

### Naming patterns:
```typescript
// ✅ CORRECTO
const handleViewDetails = (id: string) => { };
const handlePageChange = (page: number) => { };
const toggleModal = () => { };
const openModal = () => { };
const closeModal = () => { };

// ❌ INCORRECTO
const viewDetails = (id: string) => { };
const changePage = (page: number) => { };
const modal = () => { };
```

## 9. REGLAS ESPECÍFICAS DEL PROYECTO

### Uso del alias `@/`:
```typescript
// ✅ CORRECTO
import { Button } from "@/components/ui/button";
import { useCustomHook } from "@/hooks/use-custom-hook";
import type { UserInterface } from "@/api/interface/user";

// ❌ INCORRECTO
import { Button } from "../../components/ui/button";
import { useCustomHook } from "../hooks/use-custom-hook";
```

### Utility function `cn()`:
```typescript
// ✅ CORRECTO - usar cn() para combinar clases
import { cn } from "@/lib/utils";

className={cn(
  "base-classes",
  condition && "conditional-classes",
  customClassName
)}

// ❌ INCORRECTO
className={`base-classes ${condition ? 'conditional-classes' : ''} ${customClassName}`}
```

## 10. COMANDOS DE FORMATEO Y VALIDACIÓN

```bash
# Verificar tipos
npm run type-check

# Linting
npm run lint

# Build para producción
npm run build
```

## 11. REGLAS DE JSX/TSX

### Estructura condicional:
```typescript
// ✅ CORRECTO - early returns para casos especiales
if (isLoading) {
  return <LoadingComponent />;
}

if (isError) {
  return <ErrorComponent />;
}

// ✅ CORRECTO - renderizado condicional inline para elementos opcionales
{data.length > 0 && (
  <div>Contenido</div>
)}

// ❌ INCORRECTO - ternario complejo anidado
{isLoading ? <Loading /> : isError ? <Error /> : data.length > 0 ? <Content /> : <Empty />}
```

## 12. REGLAS ADICIONALES DE BUENAS PRÁCTICAS

### Custom Hooks:
```typescript
// ✅ CORRECTO - Hook personalizado
export default function useCustomHook(param: string) {
  const [data, setData] = useState<DataInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    // Lógica del hook
  }, [param]);

  return { data, isLoading, isError };
}
```

### Error Handling:
```typescript
// ✅ CORRECTO - manejo de errores consistente
const handleAsyncAction = async () => {
  try {
    setIsLoading(true);
    const result = await apiCall();
    setData(result);
  } catch (error) {
    setIsError(true);
    console.error('Error en handleAsyncAction:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Comentarios en código:
- **NO AGREGAR COMENTARIOS** a menos que sea explícitamente solicitado
- El código debe ser auto-documentado a través de nombres descriptivos
- Solo usar comentarios para explicar lógica compleja o decisiones de negocio

---

**Estas instrucciones están basadas en las convenciones existentes del proyecto ABKImports y siguen las mejores prácticas de TypeScript 5.8+ y Vite 6+.**