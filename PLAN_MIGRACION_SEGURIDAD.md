# Plan de Migración: localStorage a Cookies HttpOnly Encriptadas

## 📋 Problema Actual

Actualmente, la aplicación guarda información sensible en `localStorage` sin encriptación:
- `access_token` - Token JWT de autenticación
- `user.type` - Rol del usuario (admin, temporal, guest, final)
- `user.id_usuario`, `user.name`, `user.email` - Datos del usuario
- `token_expiration` - Fecha de expiración del token

**Riesgos de seguridad:**
- Vulnerable a ataques XSS (Cross-Site Scripting)
- Los tokens son visibles en las DevTools del navegador
- No hay protección contra robo de credenciales mediante scripts maliciosos

## 🎯 Solución Propuesta

Migrar a un sistema híbrido de **cookies HttpOnly** con encriptación:

### Estrategia:
1. **Datos sensibles críticos** → Cookies HttpOnly (no accesibles desde JavaScript)
   - `access_token`
   - `token_expiration`

2. **Datos no sensibles pero privados** → Cookies encriptadas con acceso desde cliente
   - `user.type`
   - `user.id_usuario`
   - `user.name`
   - `user.email`

3. **Backend requerido** → Modificación en el servidor para enviar cookies HttpOnly

## 📐 Arquitectura de la Solución

### Opción 1: Cookies HttpOnly (Recomendada) ⭐
**Requiere cambios en el backend**

```
┌─────────────┐      POST /login       ┌─────────────┐
│   Cliente   │ ───────────────────────>│   Backend   │
│  (React)    │                         │   (API)     │
│             │<───────────────────────│             │
└─────────────┘   Set-Cookie: httpOnly  └─────────────┘
                  access_token=xxx;
                  HttpOnly; Secure;
                  SameSite=Strict
```

**Ventajas:**
- ✅ Máxima seguridad: Las cookies HttpOnly no son accesibles desde JavaScript
- ✅ Protección automática contra XSS
- ✅ El navegador envía automáticamente las cookies en cada request
- ✅ Soporte nativo de CSRF con `SameSite=Strict`

**Desventajas:**
- ⚠️ Requiere modificar el backend para enviar cookies
- ⚠️ Necesita configuración de CORS con `credentials: 'include'`

---

### Opción 2: Encriptación en Cliente (Sin cambios en backend)
**Solo frontend, sin modificar API**

```
┌─────────────┐                        ┌─────────────┐
│   Cliente   │    POST /login         │   Backend   │
│  (React)    │ ──────────────────────>│   (API)     │
│             │<──────────────────────│             │
│ Encriptador │    JSON: access_token  │             │
│     ↓       │                        └─────────────┘
│ localStorage│
│  (encrypted)│
└─────────────┘
```

**Ventajas:**
- ✅ No requiere cambios en el backend
- ✅ Implementación rápida
- ✅ Reduce riesgos de exposición básica

**Desventajas:**
- ⚠️ Aún vulnerable a XSS avanzados (la clave está en el cliente)
- ⚠️ Menor seguridad que HttpOnly
- ⚠️ Requiere manejo manual de la clave de encriptación

---

## 🛠️ Plan de Implementación

### FASE 1: Preparación (Sin cambios en backend)
**Implementar encriptación en cliente como primera capa de seguridad**

#### Paso 1.1: Crear utilidad de encriptación
**Archivo:** `src/lib/secure-storage.ts`

```typescript
import CryptoJS from 'crypto-js';

// Clave secreta (en producción usar variable de entorno)
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-secret-key';

export const secureStorage = {
  // Guardar dato encriptado
  setItem: (key: string, value: string) => {
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
  },

  // Obtener dato desencriptado
  getItem: (key: string): string | null => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error desencriptando:', error);
      return null;
    }
  },

  // Eliminar dato
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },

  // Limpiar todo
  clear: () => {
    localStorage.clear();
  }
};
```

#### Paso 1.2: Actualizar `login.tsx`
Reemplazar `localStorage.setItem` con `secureStorage.setItem`

#### Paso 1.3: Actualizar `apiFetch.ts`
Reemplazar `localStorage.getItem("access_token")` con `secureStorage.getItem("access_token")`

#### Paso 1.4: Actualizar `lib/functions.ts`
Modificar `obtenerUser()` para usar `secureStorage`

#### Paso 1.5: Actualizar todos los archivos que usan localStorage
**Archivos a modificar:**
- `src/hooks/use-token-expiration.ts`
- `src/context/AuthContext.tsx`
- `src/components/nav-user.tsx`
- `src/components/socket-notification.tsx`
- `src/api/notifications.ts`
- `src/api/fileUpload.ts`
- `src/pages/sesion-por-expirar.tsx`

---

### FASE 2: Migración a Cookies HttpOnly (Requiere backend)
**Implementación completa con backend**

#### Paso 2.1: Modificar endpoint de login en backend
**Backend debe enviar cookies HttpOnly:**

```javascript
// Ejemplo Node.js/Express
app.post('/login', async (req, res) => {
  // ... validar credenciales ...

  const access_token = generateToken(user);
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  // Enviar token en cookie HttpOnly
  res.cookie('access_token', access_token, {
    httpOnly: true,      // No accesible desde JavaScript
    secure: true,        // Solo HTTPS (en producción)
    sameSite: 'strict',  // Protección CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 días
  });

  res.cookie('token_expiration', expirationDate.toISOString(), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  // Datos no sensibles en el body (serán encriptados en cliente)
  res.json({
    status: 201,
    data: {
      user: {
        id_usuario: user.id,
        name: user.name,
        email: user.email,
        type: user.type
      }
    }
  });
});
```

#### Paso 2.2: Actualizar `apiFetch.ts`
```typescript
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Ya no necesitamos obtener el token manualmente
  // El navegador lo envía automáticamente en las cookies

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
        credentials: 'include', // ⚠️ IMPORTANTE: Enviar cookies
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}
```

#### Paso 2.3: Actualizar `login.tsx`
```typescript
if (res.status === 201) {
  toast.success("Inicio de sesión exitoso");

  // Solo guardar datos no sensibles (encriptados)
  secureStorage.setItem("user.id_usuario", res.data?.user?.id_usuario);
  secureStorage.setItem("user.name", res.data?.user?.name);
  secureStorage.setItem("user.email", res.data?.user?.email);
  secureStorage.setItem("user.type", res.data?.user?.type);

  // access_token y token_expiration ya vienen en cookies HttpOnly

  setTimeout(() => {
    navigate("/dashboard");
  }, 300);
}
```

#### Paso 2.4: Actualizar verificación de expiración
```typescript
// src/hooks/use-token-expiration.ts
export function useTokenExpiration() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        // Hacer un request al backend para verificar el token
        const response = await apiFetch<{ isExpiringSoon: boolean }>('/auth/check-expiration', {
          credentials: 'include'
        });

        if (response.isExpiringSoon) {
          navigate("/sesion-por-expirar");
        }
      } catch (error) {
        // Si falla, redirigir al login
        localStorage.clear();
        navigate("/login");
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return {};
}
```

#### Paso 2.5: Configurar CORS en backend
```javascript
// Backend: Configurar CORS para permitir cookies
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true,  // Permitir envío de cookies
}));
```

---

## 📊 Comparación de Opciones

| Característica | localStorage Actual | Opción 1: Encriptación Cliente | Opción 2: Cookies HttpOnly |
|---|---|---|---|
| **Seguridad contra XSS** | ❌ Baja | ⚠️ Media | ✅ Alta |
| **Requiere cambios backend** | - | ❌ No | ✅ Sí |
| **Tiempo implementación** | - | 🟢 Rápido (2-3 horas) | 🟡 Medio (1-2 días) |
| **Protección CSRF** | ❌ No | ❌ No | ✅ Sí (con SameSite) |
| **Complejidad** | Baja | Media | Media-Alta |
| **Nivel de seguridad** | ⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Recomendación Final

### Implementación por fases:

1. **Corto plazo (esta semana):**
   - Implementar **FASE 1** (Encriptación en cliente)
   - Mejora inmediata de seguridad sin tocar el backend

2. **Mediano plazo (próximas 2-4 semanas):**
   - Coordinar con el equipo de backend
   - Implementar **FASE 2** (Cookies HttpOnly)
   - Migración gradual y segura

---

## 📦 Dependencias a Instalar

```bash
# Para encriptación (FASE 1)
npm install crypto-js
npm install --save-dev @types/crypto-js
```

---

## ✅ Checklist de Implementación

### FASE 1: Encriptación Cliente
- [ ] Instalar crypto-js
- [ ] Crear `src/lib/secure-storage.ts`
- [ ] Crear variable de entorno `VITE_ENCRYPTION_KEY`
- [ ] Actualizar `login.tsx`
- [ ] Actualizar `apiFetch.ts`
- [ ] Actualizar `lib/functions.ts`
- [ ] Actualizar `use-token-expiration.ts`
- [ ] Actualizar `AuthContext.tsx`
- [ ] Actualizar `nav-user.tsx`
- [ ] Actualizar archivos restantes
- [ ] Probar funcionalidad completa
- [ ] Verificar encriptación en DevTools

### FASE 2: Cookies HttpOnly (Posterior)
- [ ] Reunión con equipo backend
- [ ] Modificar endpoint `/login` en backend
- [ ] Crear endpoint `/auth/check-expiration`
- [ ] Configurar CORS con credentials
- [ ] Actualizar `apiFetch.ts` con credentials
- [ ] Actualizar `login.tsx` para cookies
- [ ] Actualizar `use-token-expiration.ts`
- [ ] Probar en desarrollo
- [ ] Probar en staging
- [ ] Deploy a producción
- [ ] Monitoreo post-deploy

---

## 🔒 Mejoras Adicionales de Seguridad

1. **Content Security Policy (CSP)**
   - Agregar headers CSP en el backend
   - Prevenir inyección de scripts no autorizados

2. **HTTPS Obligatorio**
   - Asegurar que toda la comunicación sea HTTPS
   - Configurar `Secure` flag en cookies

3. **Rate Limiting**
   - Implementar límite de intentos de login
   - Prevenir ataques de fuerza bruta

4. **Refresh Tokens**
   - Implementar tokens de corta duración (access_token: 15min)
   - Usar refresh_token para renovar automáticamente

---

## 📝 Notas Importantes

- La **FASE 1** es completamente independiente y se puede implementar de inmediato
- La **FASE 2** requiere coordinación con backend pero ofrece seguridad máxima
- Ambas fases son compatibles y pueden coexistir durante la transición
- **Nunca commitear** la clave de encriptación al repositorio
- Usar variables de entorno diferentes para dev/staging/production

---

**Última actualización:** 2025-10-07
**Autor:** Claude Code
**Estado:** Pendiente de aprobación
