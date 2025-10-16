# 📋 Cambios en Respuestas de Cotización - Guía para Frontend

**Fecha:** 16 de Octubre, 2025
**Versión:** 1.0
**Autor:** Backend Team

---

## 🎯 Resumen Ejecutivo

Se han realizado cambios importantes en la estructura de los DTOs y endpoints relacionados con las respuestas de cotización. Estos cambios mejoran la consistencia de la API y simplifican la integración frontend-backend.

### Cambios Principales:
1. ✅ Eliminado campo `quotationId` del body de creación/actualización (ahora viene del path)
2. ✅ Cambiado `responseId` por `quotationId` en las respuestas GET
3. ✅ Simplificada la estructura de respuesta del endpoint GET details
4. ✅ Confirmado que el backend NO recalcula valores (confía en los cálculos del frontend)

---

## 🔄 Cambios en Endpoints

### 1. POST - Crear Respuesta de Cotización

**Endpoint:** `POST /quotation-responses/quotation/:quotationId/complete-service`

#### ❌ Estructura ANTERIOR (Incorrecta)

```typescript
// Body Request
{
  "quotationId": "550e8400-e29b-41d4-a716-446655440000",  // ❌ YA NO VA AQUÍ
  "response_date": "2025-10-16T14:30:00.000Z",
  "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb",
  "serviceType": "PENDING",
  "responseData": { /* ... */ },
  "products": [ /* ... */ ]
}
```

#### ✅ Estructura NUEVA (Correcta)

```typescript
// El quotationId viene del path parameter, NO del body
POST /quotation-responses/quotation/550e8400-e29b-41d4-a716-446655440000/complete-service

// Body Request (SIN quotationId)
{
  "response_date": "2025-10-16T14:30:00.000Z",
  "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb",
  "serviceType": "PENDING",
  "responseData": {
    "resumenInfo": {
      "totalCBM": 2.5,
      "totalWeight": 150.0,
      "totalPrice": 1200.0,
      "totalExpress": 180.0,
      "totalQuantity": 25
    },
    "generalInformation": {
      "serviceLogistic": "Pendiente",
      "incoterm": "DDP",
      "cargoType": "general",
      "courier": "fedex"
    }
  },
  "products": [
    {
      "productId": "b5af4d01-610f-48e6-b22e-d492a58a9e93",
      "isQuoted": true,
      "adminComment": "Producto viable",
      "ghostUrl": "https://example.com",
      "packingList": {
        "nroBoxes": 10,
        "cbm": 20.0,
        "pesoKg": 1000,
        "pesoTn": 1
      },
      "cargoHandling": {
        "fragileProduct": true,
        "stackProduct": false
      },
      "variants": [
        {
          "variantId": "variant-uuid",
          "quantity": 10,
          "isQuoted": true,
          "pendingPricing": {
            "unitPrice": 50.0,
            "expressPrice": 8.0
          }
        }
      ]
    }
  ]
}
```

#### 📝 Cambios Necesarios en Frontend:

```typescript
// ❌ ANTES
const createResponse = async (data) => {
  return axios.post('/quotation-responses/quotation/:quotationId/complete-service', {
    quotationId: data.quotationId,  // ❌ Eliminar esto
    response_date: data.response_date,
    advisorId: data.advisorId,
    // ...
  });
};

// ✅ AHORA
const createResponse = async (quotationId: string, data) => {
  return axios.post(
    `/quotation-responses/quotation/${quotationId}/complete-service`,
    {
      response_date: data.response_date,
      advisorId: data.advisorId,
      serviceType: data.serviceType,
      responseData: data.responseData,
      products: data.products
    }
  );
};
```

---

### 2. PATCH - Actualizar Respuesta de Cotización

**Endpoint:** `PATCH /quotation-responses/update-responses/:quotationId/:quotationResponseId`

#### ✅ Estructura NUEVA

```typescript
PATCH /quotation-responses/update-responses/550e8400-e29b-41d4-a716-446655440000/abc-123-def

// Body Request (IGUAL que POST, SIN quotationId en el body)
{
  "response_date": "2025-10-16T14:30:00.000Z",
  "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb",
  "serviceType": "EXPRESS",
  "responseData": {
    "type": "Consolidado Aereo",
    "resumenInfo": { /* ... */ },
    "generalInformation": { /* ... */ },
    "calculations": {
      "dynamicValues": { /* ... */ },
      "exemptions": { /* ... */ },
      "taxPercentage": { /* ... */ }
    },
    "serviceCalculations": { /* ... */ },
    "fiscalObligations": {
      "adValorem": 6.64,
      "isc": 0.0,
      "igv": 26.56,
      "ipm": 3.32,
      "antidumping": {
        "antidumpingGobierno": 2.0,
        "antidumpingCantidad": 10.0,
        "antidumpingValor": 20.0
      },
      "percepcion": 5.25,
      "totalTaxes": 61.77
    },
    "importCosts": { /* ... */ },
    "quoteSummary": { /* ... */ }
  },
  "products": [ /* ... */ ]
}
```

#### 📝 Cambios Necesarios en Frontend:

```typescript
// ❌ ANTES
const updateResponse = async (data) => {
  return axios.patch(
    `/quotation-responses/update-responses/${data.quotationId}/${data.responseId}`,
    {
      quotationId: data.quotationId,  // ❌ Eliminar esto
      // ...
    }
  );
};

// ✅ AHORA
const updateResponse = async (
  quotationId: string,
  quotationResponseId: string,
  data
) => {
  return axios.patch(
    `/quotation-responses/update-responses/${quotationId}/${quotationResponseId}`,
    {
      response_date: data.response_date,
      advisorId: data.advisorId,
      serviceType: data.serviceType,
      responseData: data.responseData,
      products: data.products
    }
  );
};
```

---

### 3. GET - Obtener Detalles de Respuesta Específica

**Endpoint:** `GET /quotation-responses/details/:quotationResponseId/:serviceType`

Este es el cambio MÁS IMPORTANTE para el frontend.

#### ❌ Respuesta ANTERIOR (Incorrecta)

```json
{
  "responseId": "abc-123-def-456",  // ❌ Este campo ya NO existe
  "response_date": "2025-10-16T14:30:00.000Z",
  "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb",
  "serviceType": "PENDING",
  "responseData": { /* ... */ },
  "products": [ /* ... */ ]
}
```

#### ✅ Respuesta NUEVA (Correcta)

```json
{
  "quotationId": "550e8400-e29b-41d4-a716-446655440000",  // ✅ Ahora es quotationId
  "response_date": "2025-10-16T14:30:00.000Z",
  "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb",
  "serviceType": "PENDING",
  "responseData": {
    "resumenInfo": {
      "totalCBM": 2.5,
      "totalWeight": 150.0,
      "totalPrice": 1200.0,
      "totalExpress": 180.0,
      "totalQuantity": 25
    },
    "generalInformation": {
      "serviceLogistic": "Pendiente",
      "incoterm": "DDP",
      "cargoType": "general",
      "courier": "fedex"
    }
  },
  "products": [
    {
      "productId": "b5af4d01-610f-48e6-b22e-d492a58a9e93",
      "isQuoted": true,
      "adminComment": "Producto viable",
      "ghostUrl": "https://example.com",
      "packingList": {
        "nroBoxes": 10,
        "cbm": 20.0,
        "pesoKg": 1000,
        "pesoTn": 1
      },
      "cargoHandling": {
        "fragileProduct": true,
        "stackProduct": false
      },
      "variants": [
        {
          "variantId": "variant-uuid",
          "quantity": 10,
          "isQuoted": true,
          "pendingPricing": {
            "unitPrice": 50.0,
            "expressPrice": 8.0
          }
        }
      ]
    }
  ]
}
```

#### 📝 Cambios Necesarios en Frontend:

```typescript
// ❌ ANTES
interface QuotationResponseDetail {
  responseId: string | null;  // ❌ Cambiar esto
  response_date: Date;
  advisorId: string;
  serviceType: ServiceType;
  responseData: any;
  products: any[];
}

// ✅ AHORA
interface QuotationResponseDetail {
  quotationId: string;  // ✅ Ahora es quotationId (siempre presente)
  response_date: Date;
  advisorId: string;
  serviceType: ServiceType;
  responseData: any;
  products: any[];
}

// Uso en componentes
const { data } = await getResponseDetails(quotationResponseId, serviceType);

// ❌ ANTES
console.log(data.responseId);  // undefined o null muchas veces

// ✅ AHORA
console.log(data.quotationId);  // Siempre presente, ID de la cotización original
```

---

### 4. GET - Listar Respuestas de una Cotización

**Endpoint:** `GET /quotation-responses/get-responses/:quotationId`

#### ✅ Respuesta NUEVA

```json
{
  "quotationId": "550e8400-e29b-41d4-a716-446655440000",
  "correlative": "COT-00022-2025",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "responses": [
    {
      "quotationId": "550e8400-e29b-41d4-a716-446655440000",  // ✅ ID de la cotización
      "response_date": "2025-10-16T14:30:00.000Z",
      "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb",
      "serviceType": "PENDING",
      "responseData": { /* ... */ },
      "products": [ /* ... */ ]
    }
  ]
}
```

---

## 🔥 IMPORTANTE: Cálculos de Impuestos

### El Backend NO Recalcula Valores

Según la documentación implementada, el backend **confía completamente** en los valores calculados por el frontend. Esto es crítico para `fiscalObligations`:

```typescript
// ✅ CORRECTO - El frontend calcula y envía estos valores
const fiscalObligations = {
  adValorem: 6.64,        // Calculado por use-quotation-calculations
  isc: 0.0,               // Calculado por use-quotation-calculations
  igv: 26.56,             // Calculado por use-quotation-calculations
  ipm: 3.32,              // Calculado por use-quotation-calculations
  antidumping: {
    antidumpingGobierno: 2.0,
    antidumpingCantidad: 10.0,
    antidumpingValor: 20.0
  },
  percepcion: 5.25,
  totalTaxes: 61.77       // Suma total calculada en frontend
};

// El backend almacena estos valores TAL CUAL, sin recalcularlos
```

### ⚠️ Responsabilidad del Frontend

El frontend DEBE asegurarse de que:
1. ✅ Todos los cálculos en `fiscalObligations` sean correctos
2. ✅ Todos los cálculos en `serviceCalculations` sean correctos
3. ✅ Todos los cálculos en `importCosts` sean correctos
4. ✅ El `quoteSummary` refleje correctamente la inversión total

El backend NO validará ni recalculará estos valores.

---

## 📊 Tabla Resumen de Cambios

| Aspecto | Antes | Ahora | Acción Frontend |
|---------|-------|-------|-----------------|
| **POST Body** | Incluía `quotationId` | NO incluye `quotationId` | Remover campo del body |
| **PATCH Body** | Incluía `quotationId` | NO incluye `quotationId` | Remover campo del body |
| **GET Response** | `responseId: string \| null` | `quotationId: string` | Cambiar tipo de interface |
| **Validación date** | `@IsString()` | `@IsDateString()` | Enviar fecha en formato ISO 8601 |
| **Cálculos** | Backend recalculaba | Backend NO recalcula | Asegurar cálculos correctos |

---

## 🛠️ Guía de Migración Paso a Paso

### Paso 1: Actualizar Interfaces TypeScript

```typescript
// src/types/quotation-response.types.ts

export interface CreateQuotationResponseDTO {
  // ❌ quotationId: string;  // ELIMINAR ESTA LÍNEA
  response_date: string;  // ISO 8601 format
  advisorId: string;
  serviceType: 'PENDING' | 'EXPRESS' | 'MARITIME';
  responseData: ResponseDataPending | ResponseDataComplete;
  products: Product[];
}

export interface QuotationResponseDetail {
  quotationId: string;  // ✅ Cambiar de responseId a quotationId
  response_date: string;
  advisorId: string;
  serviceType: 'PENDING' | 'EXPRESS' | 'MARITIME';
  responseData: ResponseDataPending | ResponseDataComplete;
  products: Product[];
}
```

### Paso 2: Actualizar Servicios API

```typescript
// src/services/quotation-response.service.ts

export const quotationResponseService = {
  // ✅ Actualizar función de creación
  create: async (quotationId: string, data: CreateQuotationResponseDTO) => {
    return axios.post(
      `/quotation-responses/quotation/${quotationId}/complete-service`,
      data  // Ya no incluye quotationId en el body
    );
  },

  // ✅ Actualizar función de actualización
  update: async (
    quotationId: string,
    quotationResponseId: string,
    data: CreateQuotationResponseDTO
  ) => {
    return axios.patch(
      `/quotation-responses/update-responses/${quotationId}/${quotationResponseId}`,
      data  // Ya no incluye quotationId en el body
    );
  },

  // ✅ Actualizar función de obtener detalles
  getDetails: async (
    quotationResponseId: string,
    serviceType: string
  ): Promise<QuotationResponseDetail> => {
    const response = await axios.get(
      `/quotation-responses/details/${quotationResponseId}/${serviceType}`
    );
    return response.data;  // Ahora tiene quotationId en lugar de responseId
  }
};
```

### Paso 3: Actualizar Componentes React

```typescript
// src/components/QuotationResponseForm.tsx

const QuotationResponseForm = ({ quotationId }: Props) => {
  const handleSubmit = async (values) => {
    // ✅ Estructura correcta del payload
    const payload = {
      // quotationId: quotationId,  // ❌ NO INCLUIR ESTO
      response_date: new Date().toISOString(),
      advisorId: values.advisorId,
      serviceType: values.serviceType,
      responseData: {
        resumenInfo: calculateResumen(values.products),
        generalInformation: values.generalInfo,
        // Para servicios completos:
        calculations: {
          dynamicValues: values.dynamicValues,
          exemptions: values.exemptions,
          taxPercentage: values.taxPercentage
        },
        serviceCalculations: values.serviceCalculations,
        fiscalObligations: values.fiscalObligations,  // ✅ Valores calculados correctamente
        importCosts: values.importCosts,
        quoteSummary: values.quoteSummary
      },
      products: values.products
    };

    // ✅ quotationId va en el path, no en el body
    await quotationResponseService.create(quotationId, payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Paso 4: Actualizar Hooks Personalizados

```typescript
// src/hooks/useQuotationResponse.ts

export const useQuotationResponse = (
  quotationResponseId: string,
  serviceType: string
) => {
  const { data, isLoading, error } = useQuery(
    ['quotationResponse', quotationResponseId, serviceType],
    () => quotationResponseService.getDetails(quotationResponseId, serviceType)
  );

  // ✅ Ahora data tiene quotationId en lugar de responseId
  return {
    response: data,
    quotationId: data?.quotationId,  // ✅ Cambio principal
    responseDate: data?.response_date,
    advisorId: data?.advisorId,
    isLoading,
    error
  };
};
```

---

## ✅ Checklist de Validación

Antes de hacer el merge a producción, verificar:

- [ ] Eliminado `quotationId` de todos los payloads de POST/PATCH
- [ ] Actualizado `responseId` a `quotationId` en todas las interfaces
- [ ] Modificados todos los servicios API para pasar `quotationId` en el path
- [ ] Actualizado el tipo de `response_date` para usar formato ISO 8601
- [ ] Verificado que los cálculos de `fiscalObligations` sean correctos
- [ ] Probado el flujo completo: crear → obtener → actualizar respuesta
- [ ] Actualizada documentación de frontend (si existe)

---

## 🚀 Endpoints Completos - Referencia Rápida

```
POST   /quotation-responses/quotation/:quotationId/complete-service
PATCH  /quotation-responses/update-responses/:quotationId/:quotationResponseId
GET    /quotation-responses/details/:quotationResponseId/:serviceType
GET    /quotation-responses/get-responses/:quotationId
GET    /quotation-responses/list-responses/:quotationId
PATCH  /quotation-responses/:id/status
DELETE /quotation-responses/:id
```

---

## 📞 Contacto

Si tienen dudas sobre estos cambios, contactar a:
- **Backend Team:** [backend@abkimports.com]
- **Documentación Técnica:** `DOCUMENTACION_DTO_RESPUESTA_COTIZACION.md`

---

## 📅 Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-10-16 | 1.0 | Versión inicial con cambios en DTOs y endpoints |

---

**¡Éxito con la implementación! 🎉**
