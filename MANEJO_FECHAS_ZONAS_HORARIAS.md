# Guía de Manejo de Fechas y Zonas Horarias

## Introducción

Este proyecto sigue la **mejor práctica internacional** de almacenar todas las fechas en **UTC** en el backend y convertirlas a la zona horaria local (**Lima, Perú - America/Lima, UTC-5**) en el frontend.

## ¿Por qué UTC en el backend?

- **Consistencia**: UTC no tiene horario de verano, evitando problemas de ambigüedad
- **Escalabilidad**: Si el proyecto crece a otros países, las fechas ya están en formato universal
- **Trazabilidad**: Logs y registros tienen timestamps consistentes
- **Integridad**: Evita problemas al comparar fechas de diferentes zonas horarias

## Arquitectura de Fechas

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE FECHAS                          │
└─────────────────────────────────────────────────────────────┘

FRONTEND → BACKEND:
┌──────────────┐   toISOString()   ┌──────────────┐
│   Usuario    │ ──────────────→   │   MySQL DB   │
│  (Lima, -5)  │   UTC Format      │   (UTC 00)   │
└──────────────┘                   └──────────────┘
    Fecha local                    "2025-01-15T23:30:00.000Z"


BACKEND → FRONTEND:
┌──────────────┐                   ┌──────────────┐
│   MySQL DB   │   ISO 8601        │   Usuario    │
│   (UTC 00)   │ ──────────────→   │  (Lima, -5)  │
└──────────────┘   formatDate()    └──────────────┘
"2025-01-15T23:30:00.000Z"        "15/01/2025 18:30:00"
```

## Funciones Centralizadas

Todas las funciones de manejo de fechas están centralizadas en:

**`src/lib/format-time.ts`**

### Funciones Principales

#### 1. Para **MOSTRAR** fechas al usuario (Backend → Frontend)

```typescript
import { formatDate, formatTime, formatDateTime, formatDateLong, formatDateShort } from "@/lib/format-time";

// Fecha corta: "15/01/2025"
formatDate("2025-01-15T23:30:00.000Z");

// Solo hora: "18:30:00" (UTC-5)
formatTime("2025-01-15T23:30:00.000Z");

// Fecha y hora completa: "15/01/2025 18:30:00"
formatDateTime("2025-01-15T23:30:00.000Z");

// Formato largo: "15 de enero de 2025, 18:30"
formatDateLong("2025-01-15T23:30:00.000Z");

// Formato corto para tablas: "15 ene 2025"
formatDateShort("2025-01-15T23:30:00.000Z");
```

#### 2. Para **ENVIAR** fechas al backend (Frontend → Backend)

```typescript
import { getNowUTC, getFutureDateUTC } from "@/lib/format-time";

// Obtener fecha actual en UTC para enviar al backend
const now = getNowUTC();
// Resultado: "2025-01-15T23:30:00.000Z"

// Calcular fecha futura (ej: expiración en 7 días)
const expiration = getFutureDateUTC(7);
// Resultado: "2025-01-22T23:30:00.000Z"
```

#### 3. Para **VALIDAR** y **COMPARAR** fechas

```typescript
import { isExpired, getTimeUntil } from "@/lib/format-time";

// Verificar si una fecha ya pasó
const tokenExpiration = "2025-01-15T23:30:00.000Z";
if (isExpired(tokenExpiration)) {
  // Token expirado
}

// Obtener tiempo restante en milisegundos
const msRemaining = getTimeUntil(tokenExpiration);
const hoursRemaining = msRemaining / (1000 * 60 * 60);
```

## Ejemplos de Uso Real

### Ejemplo 1: Crear una cotización

```typescript
// ❌ INCORRECTO
const quotation = {
  response_date: new Date().toISOString(), // NO hacer esto directamente
  // ...
};

// ✅ CORRECTO
import { getNowUTC } from "@/lib/format-time";

const quotation = {
  response_date: getNowUTC(), // Usa la función centralizada
  // ...
};
```

### Ejemplo 2: Mostrar fecha en una tabla

```typescript
// ❌ INCORRECTO
const formattedDate = new Date(item.createdAt).toLocaleDateString("es-ES");

// ✅ CORRECTO
import { formatDate } from "@/lib/format-time";

const formattedDate = formatDate(item.createdAt);
```

### Ejemplo 3: Login y expiración de token

```typescript
// ❌ INCORRECTO
const expirationDate = new Date();
expirationDate.setDate(expirationDate.getDate() + 7);
localStorage.setItem("token_expiration", expirationDate.toISOString());

// ✅ CORRECTO
import { getFutureDateUTC } from "@/lib/format-time";

localStorage.setItem("token_expiration", getFutureDateUTC(7));
```

### Ejemplo 4: Verificar expiración de token

```typescript
// ❌ INCORRECTO
const tokenExpiration = localStorage.getItem("token_expiration");
const expirationDate = new Date(tokenExpiration);
const now = new Date();
if (expirationDate.getTime() < now.getTime()) {
  // Token expirado
}

// ✅ CORRECTO
import { isExpired } from "@/lib/format-time";

const tokenExpiration = localStorage.getItem("token_expiration");
if (isExpired(tokenExpiration)) {
  // Token expirado
}
```

## Patrones de Formateo

### Para Tablas

```typescript
import { formatDateShort } from "@/lib/format-time";

// En columnas de tabla
{
  accessorKey: "created_at",
  header: "Fecha Creación",
  cell: ({ row }) => formatDateShort(row.getValue("created_at")),
}
// Resultado: "15 ene 2025"
```

### Para Cards y Detalles

```typescript
import { formatDate, formatTime } from "@/lib/format-time";

<div className="flex items-center gap-2">
  <Calendar className="h-4 w-4" />
  <span>{formatDate(quotation.createdAt)}</span>
</div>

<div className="flex items-center gap-2">
  <Clock className="h-4 w-4" />
  <span>{formatTime(quotation.createdAt)}</span>
</div>
// Resultado: "15/01/2025" y "18:30:45"
```

### Para Historial y Logs

```typescript
import { formatDateLong } from "@/lib/format-time";

<div className="text-sm text-muted-foreground">
  {formatDateLong(entry.timestamp)}
</div>
// Resultado: "15 de enero de 2025, 18:30"
```

## Personalización de Formatos

Todas las funciones de formato aceptan un parámetro opcional `pattern` para personalizar el formato:

```typescript
import { formatDate, formatTime } from "@/lib/format-time";

// Personalizar formato de fecha
formatDate(dateString, "dd 'de' MMMM, yyyy");
// Resultado: "15 de enero, 2025"

// Personalizar formato de hora
formatTime(dateString, "hh:mm a");
// Resultado: "06:30 PM"

// Ver documentación de date-fns para más patrones:
// https://date-fns.org/docs/format
```

## Migración de Código Legacy

Si encuentras código usando `new Date()` directamente:

### Paso 1: Identificar el uso

```typescript
// Código antiguo
const date = new Date(dateString);
const formatted = date.toLocaleDateString("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
```

### Paso 2: Reemplazar con función centralizada

```typescript
// Código nuevo
import { formatDate } from "@/lib/format-time";

const formatted = formatDate(dateString);
```

### Paso 3: Verificar el resultado

Asegúrate de que la zona horaria se esté convirtiendo correctamente verificando:
- Las fechas mostradas coinciden con la hora de Lima
- No hay desfase de horas al comparar con el backend

## Zona Horaria de Lima

### Características

- **Código IANA**: `America/Lima`
- **Offset UTC**: `-05:00` (UTC-5)
- **Horario de Verano**: No aplica (Perú no usa DST)

### Conversión Ejemplo

```
UTC:  2025-01-15 23:30:00
Lima: 2025-01-15 18:30:00 (UTC-5)
```

## Checklist para Nuevos Desarrolladores

Cuando trabajes con fechas, verifica:

- [ ] ¿Estoy **mostrando** una fecha al usuario? → Usar `formatDate()`, `formatTime()`, etc.
- [ ] ¿Estoy **enviando** una fecha al backend? → Usar `getNowUTC()` o `getFutureDateUTC()`
- [ ] ¿Estoy **comparando** fechas? → Usar `isExpired()` o `getTimeUntil()`
- [ ] ¿Necesito un formato personalizado? → Usar el parámetro `pattern`
- [ ] ¿Estoy importando desde `@/lib/format-time`? → Siempre importar funciones centralizadas

## Debugging de Fechas

### Verificar conversión de zona horaria

```typescript
import { utcToLima } from "@/lib/format-time";

const utcString = "2025-01-15T23:30:00.000Z";
const limaDate = utcToLima(utcString);

console.log("UTC:", utcString);
console.log("Lima Date Object:", limaDate);
console.log("Lima String:", limaDate.toLocaleString("es-PE"));
```

### Verificar formato de salida

```typescript
import { formatDateTime } from "@/lib/format-time";

const utcString = "2025-01-15T23:30:00.000Z";
console.log("Formato estándar:", formatDateTime(utcString));
console.log("Formato custom:", formatDateTime(utcString, "dd/MM/yyyy 'a las' HH:mm"));
```

## Preguntas Frecuentes

### ¿Por qué no usar `toLocaleDateString()` directamente?

`toLocaleDateString()` usa la zona horaria del navegador del usuario, no la zona horaria del servidor. Si un usuario está en otro país, verá fechas en su zona horaria local, no en Lima.

### ¿Cómo pruebo las fechas localmente?

Las funciones siempre convierten a Lima (UTC-5), sin importar la zona horaria de tu computadora. Esto asegura consistencia.

### ¿Qué pasa si el usuario está en otro país?

Actualmente el sistema está diseñado para usuarios en Lima, Perú. Si en el futuro se requiere soporte multi-zona horaria, las funciones ya están preparadas para ese cambio.

### ¿Necesito cambiar algo en el backend?

**No**. El backend debe continuar almacenando fechas en UTC. Toda la conversión a Lima se hace en el frontend.

### ¿Cómo manejo fechas en formularios?

```typescript
// Al enviar al backend
import { getNowUTC } from "@/lib/format-time";

const formData = {
  created_at: getNowUTC(),
  // ...
};

// Al recibir del backend para mostrar
import { formatDate } from "@/lib/format-time";

<input value={formatDate(data.created_at)} readOnly />
```

## Recursos Adicionales

- **date-fns documentation**: https://date-fns.org/
- **date-fns-tz documentation**: https://github.com/marnusw/date-fns-tz
- **IANA Time Zone Database**: https://www.iana.org/time-zones
- **ISO 8601 Format**: https://www.iso.org/iso-8601-date-and-time-format.html

## Contacto y Soporte

Si encuentras problemas con el manejo de fechas, verifica primero:
1. Que estés importando las funciones correctas de `@/lib/format-time`
2. Que el backend esté enviando fechas en formato ISO 8601 UTC
3. Que no estés usando `new Date()` directamente para formatear

Para reportar bugs o sugerencias, crea un issue en el repositorio del proyecto.
