🎨 GUÍA DE ESTILO Y CONVENCIONES PARA UI - VITE + TYPESCRIPT
Esta guía establece las convenciones y mejores prácticas para el desarrollo de interfaces de usuario modernas, limpias y reutilizables en un proyecto de Vite con TypeScript, orientadas a un público profesional. Nos enfocamos en la modularidad, la consistencia, la legibilidad y una estética refinada.

1. ESTRUCTURA DE COMPONENTES Y PÁGINAS
Para asegurar la modularidad y el mantenimiento, la estructura de archivos es clave. Los componentes se dividen en categorías según su propósito y nivel de abstracción.

1.1 Estructura de Vistas/Páginas
Las vistas son el nivel más alto de la interfaz. Cada vista debe tener su propia carpeta para encapsular todos sus componentes, hooks, y tipos específicos.

src/pages/
├── [nombre-de-vista]/
│   ├── index.tsx                    # Re-export del componente principal
│   ├── [nombre-de-vista]-view.tsx   # Componente principal de la vista (maneja la lógica)
│   ├── components/                  # Componentes específicos de la vista (presentacionales)
│   └── hooks/                      # Hooks personalizados para la vista
1.2 Estructura de Componentes Reutilizables
Los componentes reutilizables, que se usarán en múltiples vistas, deben organizarse en carpetas lógicas.

src/components/
├── ui/                 # Componentes "tontos" y genéricos. (e.g., button, input, card)
│   ├── button.tsx
│   └── card.tsx
├── layouts/            # Componentes de maquetación. (e.g., header, sidebar, footer)
│   └── sidebar.tsx
├── common/             # Componentes comunes con lógica o estado simple. (e.g., loader, modal)
│   └── modal-confirm.tsx
└── shared/             # Componentes complejos y reutilizables. (e.g., tabla de datos, formulario)
     └── data-table.tsx
2. DISEÑO Y ESTÉTICA PROFESIONAL
El diseño debe transmitir confianza, eficiencia y modernidad. La simplicidad y la atención al detalle son fundamentales.

2.1 Principios clave del Diseño
Espacios en blanco: Utiliza el espacio negativo para crear una sensación de calma y orden. Un buen espaciado mejora la legibilidad y la jerarquía visual.

Jerarquía visual: Usa el tamaño de la fuente, el peso, y el contraste para guiar la vista del usuario a través de la información más importante.

Micro-interacciones: Añade animaciones sutiles y transiciones fluidas a los componentes (al pasar el mouse, al hacer clic) para hacer la interfaz más dinámica y atractiva sin distraer.

2.2 Paleta de Colores Atractiva
Para un público adulto, se recomiendan paletas de colores que sean a la vez profesionales y visualmente agradables.

Colores Principales: Usa un color dominante para botones, enlaces y elementos interactivos que refleje la marca.

Colores Neutrales: Utiliza una gama de grises y blancos cálidos o fríos para fondos, bordes y texto secundario.

Colores de Acento: Selecciona uno o dos colores para destacar información crucial, como errores (rojo), éxitos (verde) o alertas (amarillo).

Ejemplo de Paleta:

Primario: Un azul oscuro o un verde botella.

Acento: Un cian o naranja vibrante.

Neutrales: gray-50, gray-200, gray-700.

2.3 Tipografía
Una tipografía legible y profesional es vital.

Fuentes: Elige una o dos familias de fuentes que sean claras y legibles, como Inter, Roboto o Lato.

Pesos de Fuente: Limita el uso de pesos de fuente a 2-3 variaciones (e.g., font-normal, font-semibold, font-bold) para mantener la consistencia.

Tamaños: Utiliza un sistema de escalado de fuentes consistente para títulos, subtítulos y texto del cuerpo.

3. CONVENCIONES DE CÓDIGO Y ESTILO
Se refuerzan las reglas de código para mantener un estándar de alta calidad.

3.1 Clases de Tailwind
El orden de las clases de Tailwind es crítico para la legibilidad. Usa el siguiente orden.

Layout y Posicionamiento: flex, grid, absolute, relative, block, hidden.

Espaciado: p-, m-, space-x-.

Tamaño: w-, h-, max-w-, min-h-.

Colores y Fondo: bg-, text-, border-.

Tipografía: font-, text-, leading-.

Decoración y Efectos: rounded-, shadow-, hover:, transition-.

Estados: disabled:, group-hover:.

3.2 Componentes React
Los componentes deben ser lo más simples y "tontos" posible. Toda la lógica de negocio y la llamada a APIs deben residir en la capa de la vista o en hooks personalizados.

TypeScript

// ✅ Componente presentacional (dumb component)
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn("px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors", className)}
      {...props}
    />
  );
}

// ✅ Uso en una vista (maneja la lógica)
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MyView() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    // Lógica de API
  };

  return <Button onClick={handleClick} disabled={isLoading}>
    {isLoading ? "Cargando..." : "Guardar"}
  </Button>;
}
4. ACCESIBILIDAD (A11Y) Y USABILIDAD
Una interfaz profesional es también una interfaz accesible y fácil de usar para todos.

Diseño Responsivo: Asegúrate de que la interfaz se vea y funcione bien en todos los dispositivos, desde teléfonos móviles hasta monitores grandes.

Contraste de Color: Utiliza herramientas como el  para garantizar que los colores del texto y el fondo tengan un contraste suficiente para ser legibles.

Etiquetas y Atributos ARIA: Usa etiquetas (<label>) y atributos ARIA para ayudar a los usuarios que usan lectores de pantalla a entender la interfaz.

Estados de Interacción: Los elementos interactivos (botones, enlaces) deben tener estados visuales claros para hover, focus, active y disabled.