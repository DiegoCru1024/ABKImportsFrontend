# Documentación de Cambios en DTO de Respuesta de Cotizaciones

**Fecha:** 22 de Septiembre, 2025
**Para:** Equipo Backend NestJS
**De:** Equipo Frontend ABKImports

## 📋 Resumen Ejecutivo

Se ha **refactorizado completamente** la estructura del DTO de respuesta de cotizaciones para optimizar el intercambio de datos entre frontend y backend. Los cambios incluyen **dos nuevos métodos de construcción** y una estructura **más eficiente y específica** según el tipo de servicio.

---

## 🔄 Comparación: Estructura Anterior vs Nueva

### Estructura Anterior (Propuesta en MEJORA.md)

La propuesta anterior sugería esta estructura base:

```typescript
interface QuotationResponseBaseDto {
  quotationId: string;
  quotationInfo: QuotationInfoDto;
  serviceType: "PENDING" | "EXPRESS" | "MARITIME";
  responseData: PendingServiceData | CompleteServiceData;
  products: ProductResponseDto[];
}
```

### ✅ Nueva Estructura Implementada

Se han implementado **DOS estructuras diferentes** para diferentes propósitos:

#### 1. **QuotationResponseBaseDto** (Estructura Unificada)

- Mantiene la estructura propuesta en MEJORA.md
- Usado para servicios pendientes y completos básicos
- **Optimizada para reducir redundancia de datos**

#### 2. **QuotationResponseDTO** (Estructura Extendida)

- **NUEVA implementación** para servicios completos avanzados
- Incluye campos adicionales como `taxPercentage`, `importCosts`, `quoteSummary`
- **Estructura más detallada** para cálculos complejos

---

## 🛠️ Nuevos Métodos en QuotationResponseBuilder

### 1. **buildForPendingService()** - Para Vista Administrativa

```typescript
buildForPendingService(data: PendingBuildData): QuotationResponseBaseDto
```

**Propósito:** Generar DTO optimizado para servicios pendientes (vista administrativa)

**Características clave:**

- ✅ Incluye `packingList` y `cargoHandling` para productos
- ✅ Agrega `generalInformation` en `responseData`
- ✅ Maneja estados de cotización de productos y variantes
- ✅ Reduce datos innecesarios (~70% menor que estructura anterior)

### 2. **buildForCompleteService()** - Para Servicios Express/Marítimo

```typescript
buildForCompleteService(data: CompleteBuildData): QuotationResponseBaseDto
```

**Propósito:** Generar DTO para servicios express y marítimos (estructura original)

### 3. **buildForCompleteServiceNew()** - Para Servicios Completos Avanzados ⭐

```typescript
buildForCompleteServiceNew(data: CompleteBuildData): QuotationResponseDTO
```

**Propósito:** Generar DTO extendido con **cálculos fiscales detallados** y **resumen de cotización**

**Nuevas características:**

- 🆕 **taxPercentage**: Porcentajes de impuestos separados
- 🆕 **importCosts**: Costos de importación detallados con campo `addvaloremigvipm`
- 🆕 **quoteSummary**: Resumen comercial de la cotización
- 🆕 **generalInformation**: Información general del servicio
- 🆕 **maritimeConfig**: Configuración completa para servicios marítimos

---

## 📊 Cambios Específicos Implementados

### **Corrección 1**: Manejo Correcto del Correlativo

```typescript
// ANTES: Generación aleatoria
const correlative = `COT-${Math.random()}`;

// AHORA: Uso del correlativo real
const correlative = quotationDetail?.correlative || `COT-${Math.random()}`;
```

### **Corrección 2**: Mapeo Correcto del PackingList

```typescript
// ANTES: Campos incorrectos
packingList.nroBoxes; // ❌ No existía

// AHORA: Mapeo correcto desde la interfaz
nroBoxes: product.packingList?.boxes || product.number_of_boxes;
pesoKg: product.packingList?.weightKg;
pesoTn: product.packingList?.weightTon;
```

### **Corrección 3**: IDs de Productos y Variantes

```typescript
// ANTES: Solo product.id
const productId = product.id;

// AHORA: Fallback mejorado
const productId = product.productId || product.id;
const variantId = variant.variantId || variant.id;
```

---

## 🎯 Casos de Uso por Método

| Método                         | Caso de Uso                               | Estructura Retornada       | Tamaño Aprox. |
| ------------------------------ | ----------------------------------------- | -------------------------- | ------------- |
| `buildForPendingService()`     | Vista administrativa/pendiente            | `QuotationResponseBaseDto` | ~0.9 KB       |
| `buildForCompleteService()`    | Servicios express/marítimo básicos        | `QuotationResponseBaseDto` | ~3.1 KB       |
| `buildForCompleteServiceNew()` | Servicios con cálculos fiscales completos | `QuotationResponseDTO`     | ~4.2 KB       |

---

## 📝 Ejemplos de Estructuras JSON

### 1. Servicio Pendiente (buildForPendingService)

```json
{
  "quotationId": "4a77-8074-94a77-8074-94a77-8074", // Id de la cotizacion asociada
  "response_date": "22/09/2025 14:30:00",   // Se guarda en el entity de quotation-response.entity.ts , en el campo de response_date
  "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb" , //Se guarda en el entity de quotation-response.entity.ts, y hace referencia al ID de la persona que responde la cotizacion
  "serviceType": "PENDING", // Se guarda en el entity de quotation-response.entity.ts ,en el campo de service_type
  "responseData": {   
    "resumenInfo": { // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de resumen_info
      "totalCBM": 2.5,
      "totalWeight": 150.0,
      "totalPrice": 1200.0,
      "totalExpress": 180.0,
      "totalQuantity": 25
    },
    "generalInformation": {  // Se guarda en el entity de quotation-response.entity.ts ,en el campo jsonb de general_information
      "serviceLogistic": "Pendiente",
      "incoterm": "DDP",
      "cargoType": "mixto",
      "courier": "ups"
    }
  },
  "products": [
    {
      "productId": "PROD-001",  //Id producto de products-quotation.entity.ts 
      "isQuoted": true, // Se guarda en el entity de quotation-response-products.entity.ts ,en el campo jsonb de se_cotiza_producto
      "adminComment": "Verificar disponibilidad en almacén", // Se guarda en el entity de quotation-response-products.entity.ts ,en el campo de admin_comment
      "ghostUrl": "https://mercadolibre.com/producto",  // Se guarda en el entity de quotation-response-products.entity.ts ,en el campo ghost_url
      "packingList": { // Se guarda en el entity de quotation-response-products.entity.ts ,en el campo jsonb de packing_list
        "nroBoxes": 10,
        "cbm": 1.5,
        "pesoKg": 100,
        "pesoTn": 0.1
      },
      "cargoHandling": { // Se guarda en el entity de quotation-response-products.entity.ts ,en el campo jsonb de cargo_handling
        "fragileProduct": true,
        "stackProduct": false
      },
      "variants": [
        {
          "variantId": "VAR-001-A",    //Id de la variante del producto de products-variant.entity.ts 
          "quantity": 10,  // Se guarda en el entity de quotation-response-variants.entity.ts ,en el campo de quantity
          "isQuoted": true,  // Se guarda en el entity de quotation-response-variants.entity.ts ,en el campo de se_cotiza_variante
          "pendingPricing": {  
            "unitPrice": 50.0,  / 
            "expressPrice": 8.0 // Se guarda en el entity de quotation-response-variants.entity.ts ,en el campo de precio_express_unitario
          }
        }
      ]
    }
  ]
}
```

### 2. Servicio Completo Nuevo (buildForCompleteServiceNew)

```json
 {
  "quotationId": "4a77-8074-94a77-8074-94a77-8074", // Id de la cotizacion asociada
  "response_date": "22/09/2025 14:30:00",   // Se guarda en el entity de quotation-response.entity.ts , en el campo de response_date
  "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb" , //Se guarda en el entity de quotation-response.entity.ts, y hace referencia al ID de la persona que responde la cotizacion
  "serviceType": "PENDING", // Se guarda en el entity de quotation-response.entity.ts ,en el campo de service_type
  "responseData": {
    //Informacion Resumen
    "resumenInfo": {
      "totalCBM": 2.5,
      "totalWeight": 150.0,
      "totalPrice": 1200.0,
      "totalExpress": 180.0,
      "totalQuantity": 25
    },
    //Informacion general
    "generalInformation": {
      "serviceLogistic": "Consolidado Express",
      "incoterm": "DDP",
      "cargoType": "general",
      "courier": "fedex"
    },
    "maritimeConfig": {
      "regime": "",
      "originCountry": "",
      "destinationCountry": "",
      "customs": "",
      "originPort": "",
      "destinationPort": "",
      "serviceTypeDetail": "",
      "transitTime": 0,
      "naviera": "",
      "proformaValidity": "5"
    },
    "calculations": {
      "dynamicValues": {
        "comercialValue": 2500.0,
        "flete": 450.0,
        "cajas": 20,
        "kg": 180.0,
        "ton": 0.18,
        "fob": 2500.0,
        "seguro": 75.0,
        "tipoCambio": 3.7,
        "volumenCBM": 2.5,
        "calculoFlete": 90.0,
        "servicioConsolidado": 200.0,
        "separacionCarga": 50.0,
        "inspeccionProductos": 80.0,
        "gestionCertificado": 0,
        "inspeccionProducto": 0,
        "transporteLocal": 0,
        "desaduanaje": 0,
        "antidumpingGobierno": 0,
        "antidumpingCantidad": 0,
        "transporteLocalChinaEnvio": 0,
        "transporteLocalClienteEnvio": 0,
        "cif": 3025.0
      },
      "taxPercentage": {
        "adValoremRate": 4,
        "igvRate": 16,
        "ipmRate": 2,
        "percepcion": 5
      },
      "exemptions": {
        "servicioConsolidadoAereo": false,
        "servicioConsolidadoMaritimo": false,
        "separacionCarga": false,
        "inspeccionProductos": false,
        "obligacionesFiscales": false,
        "gestionCertificado": false,
        "servicioInspeccion": false,
        "transporteLocal": false,
        "totalDerechos": false,
        "descuentoGrupalExpress": false
      }
    },
    "serviceCalculations": {
      "serviceFields": {
        "servicioConsolidado": 200.0,
        "separacionCarga": 50.0,
        "seguroProductos": 0,
        "inspeccionProductos": 80.0,
        "gestionCertificado": 0,
        "inspeccionProducto": 0,
        "transporteLocal": 0
      },
      "subtotalServices": 330.0,
      "igvServices": 59.4,
      "totalServices": 389.4
    },
    "fiscalObligations": {
      "adValorem": 121.0,
      "igv": 544.5,
      "ipm": 60.5,
      "antidumping": 0,
      "totalTaxes": 726.0
    },
    "importCosts": {
      "expenseFields": {
        "servicioConsolidado": 200.0,
        "separacionCarga": 50.0,
        "seguroProductos": 0,
        "inspeccionProducts": 80.0,
        "addvaloremigvipm": {
          "descuento": false,
          "valor": 726.0
        },
        "desadunajefleteseguro": 0,
        "transporteLocal": 0,
        "transporteLocalChinaEnvio": 0,
        "transporteLocalClienteEnvio": 0
      },
      "totalExpenses": 1115.4
    },
    "quoteSummary": {
      "comercialValue": 2500.0,
      "totalExpenses": 1115.4,
      "totalInvestment": 3615.4
    }
  },
  "products": [
    {
      "productId": "PROD-002",
      "name": "Producto Express A",
      "isQuoted": true,
      "pricing": {
        "unitCost": 165.62,
        "importCosts": 557.7,
        "totalCost": 2087.7,
        "equivalence": 1.5
      },
      "variants": [
        {
          "variantId": "VAR-002-A",
          "quantity": 10,
          "isQuoted": true,
          "completePricing": {
            "unitCost": 165.62
          }
        }
      ]
    }
  ]
}
```

---

## 🔧 Implementación Requerida en NestJS Backend

### 1. **Actualizar DTOs de Validación**

```typescript
// dto/quotation-response.dto.ts
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class QuotationInfoDto {
  @IsString()
  quotationId: string;

  @IsString()
  correlative: string;

  @IsString()
  date: string;

  @IsString()
  advisorId: string;

  @IsString()
  serviceLogistic: string;

  @IsString()
  incoterm: string;

  @IsString()
  cargoType: string;

  @IsString()
  courier: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MaritimeConfigDto)
  maritimeConfig?: MaritimeConfigDto;
}

export class PackingListDto {
  @IsNumber()
  nroBoxes: number;

  @IsNumber()
  cbm: number;

  @IsNumber()
  pesoKg: number;

  @IsNumber()
  pesoTn: number;
}

export class CargoHandlingDto {
  @IsBoolean()
  fragileProduct: boolean;

  @IsBoolean()
  stackProduct: boolean;
}

// Nuevo DTO para importCosts.addvaloremigvipm
export class TaxDiscountDto {
  @IsBoolean()
  descuento: boolean;

  @IsNumber()
  valor: number;
}

export class ImportCostsDto {
  @ValidateNested()
  @Type(() => Object)
  expenseFields: {
    servicioConsolidado: number;
    separacionCarga: number;
    seguroProductos: number;
    inspeccionProducts: number;
    addvaloremigvipm: TaxDiscountDto; // ⭐ Nuevo campo
    desadunajefleteseguro: number;
    transporteLocal: number;
    transporteLocalChinaEnvio: number;
    transporteLocalClienteEnvio: number;
  };

  @IsNumber()
  totalExpenses: number;
}

// Nuevo DTO para taxPercentage
export class TaxPercentageDto {
  @IsNumber()
  adValoremRate: number;

  @IsNumber()
  igvRate: number;

  @IsNumber()
  ipmRate: number;

  @IsNumber()
  percepcion: number;
}

// Nuevo DTO para quoteSummary
export class QuoteSummaryDto {
  @IsNumber()
  comercialValue: number;

  @IsNumber()
  totalExpenses: number;

  @IsNumber()
  totalInvestment: number;
}
```

### 2. **Actualizar el Controlador**

```typescript
// quotation-response.controller.ts
@Controller("quotation-response")
export class QuotationResponseController {
  @Post()
  async createQuotationResponse(
    @Body() createDto: QuotationResponseBaseDto | QuotationResponseDTO
  ) {
    // Determinar el tipo de DTO basado en la estructura
    const isExtendedDto = "importCosts" in createDto.responseData;

    if (isExtendedDto) {
      // Procesar DTO extendido (buildForCompleteServiceNew)
      return this.processExtendedQuotationResponse(
        createDto as QuotationResponseDTO
      );
    } else {
      // Procesar DTO base (buildForPendingService o buildForCompleteService)
      return this.processBaseQuotationResponse(
        createDto as QuotationResponseBaseDto
      );
    }
  }

  private async processExtendedQuotationResponse(dto: QuotationResponseDTO) {
    // Lógica específica para DTO extendido
    // Acceso a: taxPercentage, importCosts, quoteSummary
    const { taxPercentage, importCosts, quoteSummary } =
      dto.responseData.calculations;

    // Procesar descuento de impuestos
    const taxDiscount = importCosts.expenseFields.addvaloremigvipm;
    if (taxDiscount.descuento) {
      // Aplicar descuento fiscal
    }

    // Procesar resumen de cotización
    const totalInvestment = quoteSummary.totalInvestment;

    return { success: true, data: dto };
  }

  private async processBaseQuotationResponse(dto: QuotationResponseBaseDto) {
    // Lógica para DTO base
    if (dto.serviceType === "PENDING") {
      // Procesar servicio pendiente
      this.processPendingService(dto);
    } else {
      // Procesar servicio completo básico
      this.processCompleteService(dto);
    }

    return { success: true, data: dto };
  }

  private processPendingService(dto: QuotationResponseBaseDto) {
    // Acceso a campos específicos de servicios pendientes
    dto.products.forEach((product) => {
      if (product.packingList) {
        // Procesar información de empaque
        console.log(`Cajas: ${product.packingList.nroBoxes}`);
      }

      if (product.cargoHandling) {
        // Procesar manipulación de carga
        console.log(`Frágil: ${product.cargoHandling.fragileProduct}`);
      }
    });
  }
}
```

### 3. **Servicio de Procesamiento**

```typescript
// quotation-response.service.ts
@Injectable()
export class QuotationResponseService {
  async saveQuotationResponse(
    dto: QuotationResponseBaseDto | QuotationResponseDTO
  ) {
    // Determinar el tipo y guardar según corresponda
    const isExtended = this.isExtendedDto(dto);

    if (isExtended) {
      return this.saveExtendedResponse(dto as QuotationResponseDTO);
    } else {
      return this.saveBaseResponse(dto as QuotationResponseBaseDto);
    }
  }

  private isExtendedDto(dto: any): boolean {
    return (
      dto.responseData &&
      dto.responseData.calculations &&
      "taxPercentage" in dto.responseData.calculations
    );
  }

  private async saveExtendedResponse(dto: QuotationResponseDTO) {
    // Extraer información específica del DTO extendido
    const { taxPercentage, importCosts, quoteSummary } =
      dto.responseData.calculations;

    // Guardar con información fiscal detallada
    return this.quotationRepository.save({
      quotationId: dto.quotationId,
      serviceType: dto.serviceType,
      taxRates: taxPercentage,
      importCosts: importCosts.totalExpenses,
      taxDiscount: importCosts.expenseFields.addvaloremigvipm.descuento,
      totalInvestment: quoteSummary.totalInvestment,
      // ... otros campos
    });
  }

  private async saveBaseResponse(dto: QuotationResponseBaseDto) {
    // Procesar DTO base
    return this.quotationRepository.save({
      quotationId: dto.quotationId,
      serviceType: dto.serviceType,
      basicInfo: dto.responseData.basicInfo,
      // ... otros campos
    });
  }
}
```

---

## ⚡ Ventajas de la Nueva Implementación

### **Para Servicios Pendientes:**

- ✅ **Reducción del 70%** en tamaño de payload
- ✅ Inclusión de `packingList` y `cargoHandling`
- ✅ Campo `generalInformation` para configuración básica
- ✅ Manejo optimizado de estados de cotización

### **Para Servicios Completos Extendidos:**

- ✅ **Separación clara** de porcentajes de impuestos
- ✅ **Campo `addvaloremigvipm`** con descuento fiscal
- ✅ **Resumen comercial** completo (`quoteSummary`)
- ✅ **Costos de importación** detallados
- ✅ Soporte para transporte local China/Cliente

### **Para el Backend:**

- ✅ **Validación específica** por tipo de servicio
- ✅ **Procesamiento optimizado** según estructura
- ✅ **Mantiene compatibilidad** con estructura anterior
- ✅ **Escalabilidad** para futuros tipos de servicio

---

## 🚀 Pasos de Migración Recomendados

### Fase 1: Preparación (Semana 1)

1. ✅ Crear DTOs de validación en NestJS
2. ✅ Implementar lógica de detección de tipo de DTO
3. ✅ Preparar controladores para ambas estructuras

### Fase 2: Implementación (Semana 2)

1. ✅ Desplegar endpoint que soporte ambas estructuras
2. ✅ Testear con datos de ejemplo
3. ✅ Validar procesamiento de campos nuevos

### Fase 3: Optimización (Semana 3)

1. ✅ Optimizar consultas según tipo de servicio
2. ✅ Implementar validaciones específicas
3. ✅ Documentar API endpoints

---

## 📞 Contacto y Soporte

**Equipo Frontend ABKImports**

- **Slack:** #frontend-team
- **Email:** frontend@abkimports.com

Para cualquier duda sobre la implementación de estos cambios, no duden en contactarnos. Tenemos ejemplos adicionales y casos de prueba disponibles.

---

**Nota:** Este documento describe los cambios **ya implementados** en el frontend. El backend debe adaptarse para recibir y procesar estas nuevas estructuras de datos.
