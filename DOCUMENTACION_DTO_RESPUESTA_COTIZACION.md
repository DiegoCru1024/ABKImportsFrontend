# Documentación del DTO: Respuesta de Cotización

**Fecha:** 16 de Octubre, 2025
**Versión:** 2.0
**Para:** Equipo de Backend
**De:** Equipo de Frontend

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estructura Base del DTO](#estructura-base-del-dto)
3. [Tipos de Servicios](#tipos-de-servicios)
4. [DTO para Servicio Pendiente](#dto-para-servicio-pendiente)
5. [DTO para Servicios Completos](#dto-para-servicios-completos)
6. [Detalle de Objetos y Campos](#detalle-de-objetos-y-campos)
7. [Flujo de Cálculos](#flujo-de-cálculos)
8. [Ejemplos Completos](#ejemplos-completos)
9. [Validaciones Requeridas](#validaciones-requeridas)

---

## Introducción

Este documento describe la estructura del DTO (Data Transfer Object) utilizado para enviar respuestas de cotizaciones desde el frontend al backend. El DTO está diseñado siguiendo el patrón **Builder** y **Director** para mantener un código limpio y escalable.

### Propósito

El DTO de respuesta de cotización permite al asesor responder a una solicitud de cotización con:
- Información de productos y precios
- Cálculos de impuestos y obligaciones fiscales
- Gastos de importación detallados
- Configuración logística (incoterms, tipo de servicio, etc.)
- Resumen de inversión total

---

## Estructura Base del DTO

```typescript
interface QuotationResponseBase {
  quotationId: string;              // ID de la cotización original
  response_date: Date;               // Fecha de respuesta
  advisorId: string;                 // ID del asesor que responde
  serviceType: ServiceType;          // Tipo de servicio (PENDING, EXPRESS, MARITIME)
  responseData: ResponseDataPending | ResponseDataComplete;  // Datos específicos según el tipo
  products: PendingProductInterface[] | CompleteProductInterface[];  // Lista de productos
}
```

### Campo: `quotationId`
- **Tipo:** `string` (UUID)
- **Descripción:** Identificador único de la cotización original que se está respondiendo
- **Ejemplo:** `"550e8400-e29b-41d4-a716-446655440000"`

### Campo: `response_date`
- **Tipo:** `Date` (ISO 8601)
- **Descripción:** Fecha y hora en que se genera la respuesta
- **Ejemplo:** `"2025-10-16T14:30:00.000Z"`

### Campo: `advisorId`
- **Tipo:** `string` (UUID)
- **Descripción:** Identificador del asesor que está respondiendo la cotización
- **Ejemplo:** `"75500ef2-e35c-4a77-8074-9104c9d971cb"`

### Campo: `serviceType`
- **Tipo:** `ServiceType` (enum)
- **Valores posibles:**
  - `"PENDING"` - Servicio administrativo pendiente (precios preliminares)
  - `"EXPRESS"` - Servicio de carga consolidada express/aérea
  - `"MARITIME"` - Servicio de carga consolidada marítima
- **Descripción:** Define el tipo de servicio logístico que se está cotizando

---

## Tipos de Servicios

### 1. Servicio PENDING (Administrativo)

**Descripción:** Respuesta preliminar donde el asesor proporciona:
- Precios unitarios de productos en China
- Costos express (envío rápido)
- Datos de packing list (cajas, CBM, peso)
- Comentarios administrativos

**Uso:** Primera etapa de cotización, permite al cliente conocer precios base antes de decidir el tipo de servicio logístico completo.

### 2. Servicio EXPRESS (Consolidado Aéreo)

**Descripción:** Cotización completa para servicios de carga consolidada aérea incluyendo:
- Cálculos completos de impuestos
- Gastos de importación detallados
- Costos de servicios (consolidación, inspección, certificados)
- Resumen de inversión total

**Tipos incluidos:**
- Consolidado Express
- Consolidado Grupal Express
- Almacenaje de mercancías

### 3. Servicio MARITIME (Consolidado Marítimo)

**Descripción:** Cotización completa para servicios de carga marítima incluyendo:
- Todos los elementos del servicio EXPRESS
- Configuración marítima específica (naviera, puertos, tiempos de tránsito)
- Régimen aduanero
- Tipo de contenedor (FCL/LCL)

**Tipos incluidos:**
- Consolidado Marítimo
- Consolidado Grupal Marítimo

---

## DTO para Servicio Pendiente

### Estructura

```typescript
interface ResponseDataPending {
  resumenInfo: ResumenInfoInterface;
  generalInformation: GeneralInformationInterface;
}
```

### Campo: `resumenInfo`

Contiene totales agregados de todos los productos cotizados.

```typescript
interface ResumenInfoInterface {
  totalCBM: number;        // Total de metros cúbicos (m³)
  totalWeight: number;     // Peso total en kilogramos
  totalPrice: number;      // Precio total de productos (USD)
  totalExpress: number;    // Total de costos express (USD)
  totalQuantity: number;   // Cantidad total de items
}
```

**Ejemplo:**
```json
{
  "totalCBM": 5.2,
  "totalWeight": 1250.5,
  "totalPrice": 8500.00,
  "totalExpress": 450.00,
  "totalQuantity": 1500
}
```

### Campo: `generalInformation`

Información básica de configuración logística.

```typescript
interface GeneralInformationInterface {
  serviceLogistic: string;  // Tipo de servicio: "Pendiente"
  incoterm: string;         // Incoterm: "DDP", "FOB", "CIF", etc.
  cargoType: string;        // Tipo de carga: "mixto", "general", "peligrosa"
  courier: string;          // Courier: "ups", "dhl", "fedex", etc.
}
```

**Ejemplo:**
```json
{
  "serviceLogistic": "Pendiente",
  "incoterm": "DDP",
  "cargoType": "mixto",
  "courier": "ups"
}
```

### Productos para Servicio Pendiente

```typescript
interface PendingProductInterface {
  productId: string;              // ID del producto
  isQuoted: boolean;              // Si se cotiza o no
  adminComment: string;           // Comentarios del administrador
  ghostUrl: string;               // URL alternativa del producto
  packingList?: PackingListInterface;  // Datos de empaque
  cargoHandling?: CargoHandlingInterface;  // Manejo de carga
  variants: PendingVariantInterface[];  // Variantes del producto
}
```

#### Sub-objeto: `packingList`

```typescript
interface PackingListInterface {
  nroBoxes: number;   // Número de cajas
  cbm: number;        // Volumen en metros cúbicos
  pesoKg: number;     // Peso en kilogramos
  pesoTn: number;     // Peso en toneladas
}
```

**Descripción de campos:**
- `nroBoxes`: Cantidad de cajas/bultos que contiene el producto
- `cbm`: Volumen total que ocupa el producto (calculado o medido)
- `pesoKg`: Peso bruto total del producto en kilogramos
- `pesoTn`: Peso bruto total del producto en toneladas (pesoKg / 1000)

**Ejemplo:**
```json
{
  "nroBoxes": 50,
  "cbm": 2.5,
  "pesoKg": 500.0,
  "pesoTn": 0.5
}
```

#### Sub-objeto: `cargoHandling`

```typescript
interface CargoHandlingInterface {
  fragileProduct: boolean;  // Si el producto es frágil
  stackProduct: boolean;    // Si se puede apilar
}
```

**Descripción:**
- `fragileProduct`: Indica si requiere manejo especial por ser frágil
- `stackProduct`: Indica si las cajas se pueden apilar durante el transporte

**Ejemplo:**
```json
{
  "fragileProduct": true,
  "stackProduct": false
}
```

#### Variantes para Servicio Pendiente

```typescript
interface PendingVariantInterface {
  variantId: string;          // ID de la variante
  quantity: number;           // Cantidad de esta variante
  isQuoted: boolean;          // Si se cotiza o no
  pendingPricing: {
    unitPrice: number;        // Precio unitario (USD)
    expressPrice: number;     // Precio express unitario (USD)
  };
}
```

**Ejemplo de variante:**
```json
{
  "variantId": "var-001",
  "quantity": 100,
  "isQuoted": true,
  "pendingPricing": {
    "unitPrice": 5.50,
    "expressPrice": 0.80
  }
}
```

---

## DTO para Servicios Completos

### Estructura

```typescript
interface ResponseDataComplete {
  type: string;                                    // Tipo de servicio logístico
  resumenInfo: ResumenInfoInterface;               // Resumen de totales
  generalInformation: GeneralInformationInterface; // Información general
  maritimeConfig?: MaritimeConfigInterface;        // Solo para servicios marítimos
  calculations: CalculationsInterface;             // Cálculos y configuraciones
  serviceCalculations: ServiceCalculationsInterface; // Cálculos de servicios
  fiscalObligations: FiscalObligationsInterface;   // Obligaciones fiscales
  importCosts: ImportCostsInterface;               // Costos de importación
  quoteSummary: QuoteSummaryInterface;             // Resumen de inversión
}
```

### Campo: `type`
- **Tipo:** `string`
- **Valores posibles:**
  - `"Consolidado Express"`
  - `"Consolidado Grupal Express"`
  - `"Almacenaje de mercancías"`
  - `"Consolidado Maritimo"`
  - `"Consolidado Grupal Maritimo"`
- **Descripción:** Tipo específico de servicio logístico cotizado

### Campo: `maritimeConfig` (Solo para servicios marítimos)

```typescript
interface MaritimeConfigInterface {
  regime: string;              // Régimen aduanero
  originCountry: string;       // País de origen
  destinationCountry: string;  // País de destino
  customs: string;             // Aduana de destino
  originPort: string;          // Puerto de salida
  destinationPort: string;     // Puerto de llegada
  serviceTypeDetail: string;   // FCL o LCL
  transitTime: number;         // Días de tránsito
  naviera: string;             // Línea naviera
  proformaValidity: string;    // Vigencia de la proforma
}
```

**Ejemplo:**
```json
{
  "regime": "Importación Definitiva",
  "originCountry": "China",
  "destinationCountry": "Perú",
  "customs": "Callao",
  "originPort": "Shanghai",
  "destinationPort": "Callao",
  "serviceTypeDetail": "FCL",
  "transitTime": 25,
  "naviera": "COSCO",
  "proformaValidity": "30 días"
}
```

### Campo: `calculations`

Contiene valores dinámicos, tasas de impuestos y exoneraciones.

```typescript
interface CalculationsInterface {
  dynamicValues: DynamicValuesInterface;
  taxPercentage: TaxPercentageInterface;
  exemptions: ExemptionsInterface;
}
```

#### Sub-objeto: `dynamicValues`

```typescript
interface DynamicValuesInterface {
  comercialValue: number;                  // Valor comercial FOB (USD)
  flete: number;                          // Flete internacional (USD)
  cajas: number;                          // Número de cajas
  kg: number;                             // Peso en kilogramos
  ton: number;                            // Peso en toneladas
  fob: number;                            // Free On Board (USD)
  seguro: number;                         // Seguro internacional (USD)
  tipoCambio: number;                     // Tipo de cambio USD a PEN
  volumenCBM: number;                     // Volumen en m³
  calculoFlete: number;                   // Tarifa por CBM/TON (USD)
  desaduanaje: number;                    // Desaduanaje (USD)
  antidumpingGobierno: number;            // Tasa antidumping del gobierno (%)
  antidumpingCantidad: number;            // Cantidad sujeta a antidumping
  transporteLocalChinaEnvio: number;      // Transporte local en China (USD)
  transporteLocalClienteEnvio: number;    // Transporte local en destino (USD)
  cif: number;                            // Cost Insurance Freight (USD)
}
```

**Descripción detallada:**

- `comercialValue`: Valor comercial total de la mercancía (suma de precios de productos)
- `flete`: Costo de transporte internacional
  - Para servicios marítimos: calculado como `max(ton, volumenCBM) × calculoFlete`
  - Para servicios express: valor fijo o calculado por peso
- `cajas`: Total de cajas/bultos a transportar
- `kg`: Peso bruto total en kilogramos
- `ton`: Peso bruto total en toneladas (kg / 1000)
- `fob`: Free On Board - Valor de mercancía + costos hasta puerto de salida
- `seguro`: Seguro internacional de transporte (típicamente 1-3% del FOB)
- `tipoCambio`: Tipo de cambio actual USD a moneda local (PEN)
- `volumenCBM`: Volumen total en metros cúbicos
- `calculoFlete`: Tarifa unitaria de flete por CBM o TON
- `desaduanaje`: Costo de trámites aduaneros
- `antidumpingGobierno`: Porcentaje de antidumping aplicado por el gobierno
- `antidumpingCantidad`: Cantidad de productos sujetos a antidumping
- `transporteLocalChinaEnvio`: Transporte desde fábrica a puerto en China
- `transporteLocalClienteEnvio`: Transporte desde puerto/aeropuerto a almacén del cliente
- `cif`: Cost Insurance Freight = FOB + Flete + Seguro (base para impuestos)

**Ejemplo:**
```json
{
  "comercialValue": 10000.00,
  "flete": 2500.00,
  "cajas": 150,
  "kg": 3500.0,
  "ton": 3.5,
  "fob": 10000.00,
  "seguro": 200.00,
  "tipoCambio": 3.75,
  "volumenCBM": 15.5,
  "calculoFlete": 85.00,
  "desaduanaje": 350.00,
  "antidumpingGobierno": 2.0,
  "antidumpingCantidad": 1000,
  "transporteLocalChinaEnvio": 450.00,
  "transporteLocalClienteEnvio": 280.00,
  "cif": 12700.00
}
```

#### Sub-objeto: `taxPercentage`

```typescript
interface TaxPercentageInterface {
  adValoremRate: number;   // Tasa Ad Valorem (%)
  igvRate: number;         // Tasa IGV (%)
  ipmRate: number;         // Tasa IPM (%)
  percepcion: number;      // Tasa Percepción (%)
}
```

**Descripción:**
- `adValoremRate`: Arancel aduanero según partida arancelaria (típicamente 0-20%)
- `igvRate`: Impuesto General a las Ventas (16% en Perú)
- `ipmRate`: Impuesto de Promoción Municipal (2% en Perú)
- `percepcion`: Percepción del IGV para importaciones (3.5-10%)

**Ejemplo:**
```json
{
  "adValoremRate": 4.0,
  "igvRate": 16.0,
  "ipmRate": 2.0,
  "percepcion": 3.5
}
```

#### Sub-objeto: `exemptions`

```typescript
interface ExemptionsInterface {
  servicioConsolidadoAereo: boolean;      // Exonerar servicio aéreo
  servicioConsolidadoMaritimo: boolean;   // Exonerar servicio marítimo
  separacionCarga: boolean;                // Exonerar separación de carga
  inspeccionProductos: boolean;            // Exonerar inspección
  obligacionesFiscales: boolean;           // Exonerar todas las obligaciones
  gestionCertificado: boolean;             // Exonerar gestión de certificados
  servicioInspeccion: boolean;             // Exonerar servicio de inspección
  totalDerechos: boolean;                  // Exonerar derechos totales
  descuentoGrupalExpress: boolean;         // Aplicar descuento grupal
}
```

**Descripción:** Indica qué conceptos están exonerados (sin costo) en esta cotización.

**Ejemplo:**
```json
{
  "servicioConsolidadoAereo": false,
  "servicioConsolidadoMaritimo": false,
  "separacionCarga": false,
  "inspeccionProductos": true,
  "obligacionesFiscales": false,
  "gestionCertificado": false,
  "servicioInspeccion": false,
  "totalDerechos": false,
  "descuentoGrupalExpress": false
}
```

### Campo: `serviceCalculations`

Cálculos relacionados con servicios logísticos adicionales.

```typescript
interface ServiceCalculationsInterface {
  serviceFields: {
    servicioConsolidado: number;        // Servicio de consolidación (USD)
    separacionCarga: number;            // Separación de carga (USD)
    seguroProductos: number;            // Seguro de productos (USD)
    inspeccionProductos: number;        // Inspección de productos (USD)
    gestionCertificado: number;         // Gestión de certificados (USD)
    inspeccionFabrica: number;          // Inspección en fábrica (USD)
    transporteLocalChina: number;       // Transporte local China (USD)
    transporteLocalDestino: number;     // Transporte local destino (USD)
    otrosServicios: number;             // Otros servicios (USD)
  };
  subtotalServices: number;              // Subtotal de servicios (USD)
  igvServices: number;                   // IGV sobre servicios (USD)
  totalServices: number;                 // Total con IGV (USD)
}
```

**Descripción de servicios:**

- `servicioConsolidado`: Costo de consolidación de carga (agrupar productos)
- `separacionCarga`: Costo de separar productos por tipo/cliente
- `seguroProductos`: Seguro de productos durante almacenaje
- `inspeccionProductos`: Inspección de calidad de productos
- `gestionCertificado`: Gestión de certificados sanitarios/técnicos
- `inspeccionFabrica`: Inspección en la fábrica del proveedor
- `transporteLocalChina`: Transporte desde fábrica a puerto/aeropuerto en China
- `transporteLocalDestino`: Transporte desde puerto/aeropuerto a almacén cliente
- `otrosServicios`: Otros servicios adicionales

**Cálculo de totales:**
```
subtotalServices = suma de todos los serviceFields
igvServices = subtotalServices × 0.18 (excluyendo transporteLocalChina)
totalServices = subtotalServices + igvServices
```

**Ejemplo:**
```json
{
  "serviceFields": {
    "servicioConsolidado": 450.00,
    "separacionCarga": 120.00,
    "seguroProductos": 0.00,
    "inspeccionProductos": 200.00,
    "gestionCertificado": 150.00,
    "inspeccionFabrica": 180.00,
    "transporteLocalChina": 350.00,
    "transporteLocalDestino": 250.00,
    "otrosServicios": 100.00
  },
  "subtotalServices": 1800.00,
  "igvServices": 261.00,
  "totalServices": 2061.00
}
```

### Campo: `fiscalObligations`

**⚠️ IMPORTANTE: Este es el objeto que tiene los valores calculados correctos**

```typescript
interface FiscalObligationsInterface {
  adValorem: number;        // Ad Valorem calculado (USD)
  isc: number;              // ISC calculado (USD)
  igv: number;              // IGV calculado (USD)
  ipm: number;              // IPM calculado (USD)
  antidumping: {
    antidumpingGobierno: number;   // Tasa de gobierno (%)
    antidumpingCantidad: number;   // Cantidad afecta
    antidumpingValor: number;      // Valor calculado (USD)
  };
  percepcion: number;       // Percepción calculada (USD)
  totalTaxes: number;       // Total de impuestos (USD)
}
```

**Fórmulas de cálculo (aplicadas en el frontend por use-quotation-calculations):**

1. **Ad Valorem:**
   ```
   adValorem = CIF × (adValoremRate / 100)
   ```

2. **Antidumping:**
   ```
   antidumpingValor = antidumpingGobierno × antidumpingCantidad
   ```

3. **ISC (Impuesto Selectivo al Consumo):**
   ```
   baseISC = CIF + adValorem
   isc = baseISC × (iscRate / 100)
   ```

4. **IGV (Impuesto General a las Ventas):**
   ```
   baseIGV = CIF + adValorem + isc + antidumpingValor
   igv = baseIGV × (igvRate / 100)
   ```

5. **IPM (Impuesto de Promoción Municipal):**
   ```
   baseIPM = CIF + adValorem + isc + antidumpingValor
   ipm = baseIPM × (ipmRate / 100)
   ```

6. **Percepción:**
   ```
   basePERCEPCION = CIF + adValorem + isc + antidumpingValor + igv + ipm
   percepcion = basePERCEPCION × (percepcionRate / 100)
   ```

7. **Total Taxes:**
   ```
   totalTaxes = adValorem + isc + igv + ipm + antidumpingValor + percepcion
   ```

**Ejemplo con CIF = 12700.00 USD:**
```json
{
  "adValorem": 508.00,
  "isc": 0.00,
  "igv": 2113.28,
  "ipm": 264.16,
  "antidumping": {
    "antidumpingGobierno": 2.0,
    "antidumpingCantidad": 100,
    "antidumpingValor": 200.00
  },
  "percepcion": 547.90,
  "totalTaxes": 3633.34
}
```

**🔥 IMPORTANTE PARA BACKEND:**
- Estos valores ya vienen **calculados correctamente** desde el frontend
- **NO** es necesario recalcularlos
- Son los valores que se muestran en la vista del asesor
- Todos los decimales están redondeados a 2 posiciones

### Campo: `importCosts`

Gastos de importación desglosados con IGV incluido.

```typescript
interface ImportCostsInterface {
  expenseFields: {
    servicioConsolidado: number;          // Consolidado con IGV (USD)
    separacionCarga: number;              // Separación con IGV (USD)
    seguroProductos: number;              // Seguro con IGV (USD)
    gestionCertificado: number;           // Certificado con IGV (USD)
    addvaloremigvipm: {
      descuento: boolean;                 // Si está exonerado
      valor: number;                      // Valor total de impuestos (USD)
    };
    desadunajefleteseguro: number;        // Desaduanaje + flete + seguro (USD)
    totalDerechos: number;                // Total de derechos (USD)
    servicioTransporte: number;           // Transporte con IGV (USD)
    servicioInspeccion: number;           // Inspección con IGV (USD)
    otrosServicios: number;               // Otros con IGV (USD)
  };
  totalExpenses: number;                  // Total de gastos (USD)
}
```

**Fórmulas de cálculo:**

1. **Servicios con IGV (1.18):**
   ```
   servicioConsolidado = serviceFields.servicioConsolidado × 1.18
   gestionCertificado = serviceFields.gestionCertificado × 1.18
   servicioInspeccion = (inspeccionProductos + inspeccionFabrica) × 1.18
   otrosServicios = serviceFields.otrosServicios × 1.18
   ```

2. **Servicio Transporte (solo IGV al local en destino):**
   ```
   servicioTransporte = transporteLocalChina + (transporteLocalDestino × 1.18)
   ```

3. **Total Expenses:**
   ```
   totalExpenses = servicioConsolidado + gestionCertificado +
                   servicioInspeccion + servicioTransporte +
                   otrosServicios + totalDerechos
   ```

**Ejemplo:**
```json
{
  "expenseFields": {
    "servicioConsolidado": 531.00,
    "separacionCarga": 141.60,
    "seguroProductos": 0.00,
    "gestionCertificado": 177.00,
    "addvaloremigvipm": {
      "descuento": false,
      "valor": 3633.34
    },
    "desadunajefleteseguro": 350.00,
    "totalDerechos": 3633.34,
    "servicioTransporte": 680.40,
    "servicioInspeccion": 448.40,
    "otrosServicios": 118.00
  },
  "totalExpenses": 5588.14
}
```

### Campo: `quoteSummary`

Resumen final de la inversión total.

```typescript
interface QuoteSummaryInterface {
  comercialValue: number;     // Valor comercial de productos (USD)
  totalExpenses: number;      // Total de gastos de importación (USD)
  totalInvestment: number;    // Inversión total (USD)
}
```

**Fórmula:**
```
totalInvestment = comercialValue + totalExpenses
```

**Ejemplo:**
```json
{
  "comercialValue": 10000.00,
  "totalExpenses": 5588.14,
  "totalInvestment": 15588.14
}
```

### Productos para Servicios Completos

```typescript
interface CompleteProductInterface {
  productId: string;              // ID del producto
  isQuoted: boolean;              // Si se cotiza o no
  pricing: PricingInterface;      // Información de precios
  variants: CompleteVariantInterface[];  // Variantes del producto
}
```

#### Sub-objeto: `pricing`

```typescript
interface PricingInterface {
  unitCost: number;        // Costo unitario final (USD)
  importCosts: number;     // Costos de importación por unidad (USD)
  totalCost: number;       // Costo total (unitCost + importCosts) (USD)
  equivalence: number;     // Equivalencia en moneda local (PEN)
}
```

**Descripción:**
- `unitCost`: Precio del producto + proporción de costos de importación
- `importCosts`: Proporción de gastos de importación asignada a este producto
- `totalCost`: Costo total que debería considerar el cliente
- `equivalence`: Costo total convertido a moneda local

**Ejemplo:**
```json
{
  "unitCost": 6.80,
  "importCosts": 3.72,
  "totalCost": 10.52,
  "equivalence": 39.45
}
```

#### Variantes para Servicios Completos

```typescript
interface CompleteVariantInterface {
  variantId: string;          // ID de la variante
  quantity: number;           // Cantidad
  isQuoted: boolean;          // Si se cotiza
  completePricing: {
    unitCost: number;         // Costo unitario (USD)
  };
}
```

**Ejemplo:**
```json
{
  "variantId": "var-001",
  "quantity": 100,
  "isQuoted": true,
  "completePricing": {
    "unitCost": 5.50
  }
}
```

---

## Flujo de Cálculos

### Diagrama de Flujo de Datos

```
1. Usuario ingresa datos básicos
   ↓
2. Hook use-quotation-calculations calcula impuestos
   ↓
3. Vista construye calculationsData con valores calculados
   ↓
4. Director recibe calculatedTaxes desde el hook
   ↓
5. Builder usa los valores calculados para construir fiscalObligations
   ↓
6. DTO final se envía al backend
```

### Orden de Cálculos

1. **Cálculo de CIF:**
   ```
   CIF = FOB + Flete + Seguro
   ```

2. **Cálculo de Impuestos Fiscales:**
   - Ad Valorem → ISC → IGV + IPM → Percepción
   - Cada impuesto se calcula sobre bases acumulativas

3. **Cálculo de Servicios:**
   - Se suman todos los servicios
   - Se aplica IGV (18%)

4. **Cálculo de Gastos de Importación:**
   - Se suman servicios con IGV + totalDerechos

5. **Cálculo de Inversión Total:**
   - Valor Comercial + Total de Gastos

---

## Ejemplos Completos

### Ejemplo 1: Servicio Pendiente

```json
{
  "quotationId": "550e8400-e29b-41d4-a716-446655440000",
  "response_date": "2025-10-16T14:30:00.000Z",
  "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb",
  "serviceType": "PENDING",
  "responseData": {
    "resumenInfo": {
      "totalCBM": 5.2,
      "totalWeight": 1250.5,
      "totalPrice": 8500.00,
      "totalExpress": 450.00,
      "totalQuantity": 1500
    },
    "generalInformation": {
      "serviceLogistic": "Pendiente",
      "incoterm": "DDP",
      "cargoType": "mixto",
      "courier": "ups"
    }
  },
  "products": [
    {
      "productId": "prod-001",
      "isQuoted": true,
      "adminComment": "Producto verificado, disponible en 15 días",
      "ghostUrl": "https://alibaba.com/product/12345",
      "packingList": {
        "nroBoxes": 50,
        "cbm": 2.5,
        "pesoKg": 500.0,
        "pesoTn": 0.5
      },
      "cargoHandling": {
        "fragileProduct": false,
        "stackProduct": true
      },
      "variants": [
        {
          "variantId": "var-001",
          "quantity": 100,
          "isQuoted": true,
          "pendingPricing": {
            "unitPrice": 5.50,
            "expressPrice": 0.80
          }
        },
        {
          "variantId": "var-002",
          "quantity": 50,
          "isQuoted": true,
          "pendingPricing": {
            "unitPrice": 6.20,
            "expressPrice": 0.90
          }
        }
      ]
    }
  ]
}
```

### Ejemplo 2: Servicio Marítimo Completo

```json
{
  "quotationId": "550e8400-e29b-41d4-a716-446655440000",
  "response_date": "2025-10-16T14:30:00.000Z",
  "advisorId": "75500ef2-e35c-4a77-8074-9104c9d971cb",
  "serviceType": "MARITIME",
  "responseData": {
    "type": "Consolidado Maritimo",
    "resumenInfo": {
      "totalCBM": 15.5,
      "totalWeight": 3500.0,
      "totalPrice": 10000.00,
      "totalExpress": 450.00,
      "totalQuantity": 2000
    },
    "generalInformation": {
      "serviceLogistic": "Consolidado Maritimo",
      "incoterm": "DDP",
      "cargoType": "general",
      "courier": "n/a"
    },
    "maritimeConfig": {
      "regime": "Importación Definitiva",
      "originCountry": "China",
      "destinationCountry": "Perú",
      "customs": "Callao",
      "originPort": "Shanghai",
      "destinationPort": "Callao",
      "serviceTypeDetail": "FCL",
      "transitTime": 25,
      "naviera": "COSCO",
      "proformaValidity": "30 días"
    },
    "calculations": {
      "dynamicValues": {
        "comercialValue": 10000.00,
        "flete": 2500.00,
        "cajas": 150,
        "kg": 3500.0,
        "ton": 3.5,
        "fob": 10000.00,
        "seguro": 200.00,
        "tipoCambio": 3.75,
        "volumenCBM": 15.5,
        "calculoFlete": 85.00,
        "desaduanaje": 350.00,
        "antidumpingGobierno": 2.0,
        "antidumpingCantidad": 100,
        "transporteLocalChinaEnvio": 450.00,
        "transporteLocalClienteEnvio": 280.00,
        "cif": 12700.00
      },
      "taxPercentage": {
        "adValoremRate": 4.0,
        "igvRate": 16.0,
        "ipmRate": 2.0,
        "percepcion": 3.5
      },
      "exemptions": {
        "servicioConsolidadoAereo": false,
        "servicioConsolidadoMaritimo": false,
        "separacionCarga": false,
        "inspeccionProductos": false,
        "obligacionesFiscales": false,
        "gestionCertificado": false,
        "servicioInspeccion": false,
        "totalDerechos": false,
        "descuentoGrupalExpress": false
      }
    },
    "serviceCalculations": {
      "serviceFields": {
        "servicioConsolidado": 450.00,
        "separacionCarga": 120.00,
        "seguroProductos": 0.00,
        "inspeccionProductos": 200.00,
        "gestionCertificado": 150.00,
        "inspeccionFabrica": 180.00,
        "transporteLocalChina": 450.00,
        "transporteLocalDestino": 280.00,
        "otrosServicios": 100.00
      },
      "subtotalServices": 1930.00,
      "igvServices": 261.00,
      "totalServices": 2191.00
    },
    "fiscalObligations": {
      "adValorem": 508.00,
      "isc": 0.00,
      "igv": 2113.28,
      "ipm": 264.16,
      "antidumping": {
        "antidumpingGobierno": 2.0,
        "antidumpingCantidad": 100,
        "antidumpingValor": 200.00
      },
      "percepcion": 547.90,
      "totalTaxes": 3633.34
    },
    "importCosts": {
      "expenseFields": {
        "servicioConsolidado": 531.00,
        "separacionCarga": 141.60,
        "seguroProductos": 0.00,
        "gestionCertificado": 177.00,
        "addvaloremigvipm": {
          "descuento": false,
          "valor": 3633.34
        },
        "desadunajefleteseguro": 350.00,
        "totalDerechos": 3633.34,
        "servicioTransporte": 780.40,
        "servicioInspeccion": 448.40,
        "otrosServicios": 118.00
      },
      "totalExpenses": 5588.14
    },
    "quoteSummary": {
      "comercialValue": 10000.00,
      "totalExpenses": 5588.14,
      "totalInvestment": 15588.14
    }
  },
  "products": [
    {
      "productId": "prod-001",
      "isQuoted": true,
      "pricing": {
        "unitCost": 6.80,
        "importCosts": 3.72,
        "totalCost": 10.52,
        "equivalence": 39.45
      },
      "variants": [
        {
          "variantId": "var-001",
          "quantity": 100,
          "isQuoted": true,
          "completePricing": {
            "unitCost": 6.80
          }
        }
      ]
    }
  ]
}
```

---

## Validaciones Requeridas

### Validaciones Generales

1. **quotationId:**
   - Debe existir en la base de datos
   - Debe estar en estado "pendiente de respuesta"

2. **advisorId:**
   - Debe ser un asesor válido
   - Debe tener permisos para responder cotizaciones

3. **serviceType:**
   - Debe ser uno de: PENDING, EXPRESS, MARITIME

### Validaciones para Servicio Pendiente

1. **Productos:**
   - Al menos 1 producto debe tener `isQuoted = true`
   - Si tiene variantes, al menos 1 variante debe tener `isQuoted = true`

2. **Precios:**
   - `unitPrice` debe ser > 0
   - `expressPrice` debe ser >= 0

3. **PackingList (si existe):**
   - `nroBoxes` debe ser > 0
   - `cbm` debe ser > 0
   - `pesoKg` debe ser > 0
   - `pesoTn` debe ser = `pesoKg / 1000`

### Validaciones para Servicios Completos

1. **CIF:**
   - Debe ser > 0
   - Debe ser igual a `FOB + flete + seguro`

2. **Impuestos Fiscales:**
   - `adValorem` debe ser >= 0
   - `igv` debe ser >= 0
   - `ipm` debe ser >= 0
   - `percepcion` debe ser >= 0
   - `totalTaxes` debe ser >= 0

3. **Total de Gastos:**
   - `totalExpenses` debe ser > 0
   - Debe ser coherente con la suma de conceptos

4. **Inversión Total:**
   - `totalInvestment` debe ser = `comercialValue + totalExpenses`

5. **Servicios Marítimos:**
   - Si `serviceType = MARITIME`, debe existir `maritimeConfig`
   - Todos los campos de `maritimeConfig` son obligatorios

### Reglas de Negocio

1. **Tasas de Impuestos:**
   - `adValoremRate`: 0-20%
   - `igvRate`: 16% (fijo para Perú)
   - `ipmRate`: 2% (fijo para Perú)
   - `percepcion`: 3.5-10%

2. **Tipo de Cambio:**
   - Debe estar entre 3.0 y 4.5 (rango típico USD-PEN)

3. **Exoneraciones:**
   - Si `obligacionesFiscales = true`, entonces todos los impuestos deben ser 0
   - Si un servicio está exonerado, su valor debe ser 0

---

## Notas Finales

### Cambios Importantes en esta Versión

1. **Valores Calculados Correctos:**
   - Los valores en `fiscalObligations` ahora vienen **correctamente calculados** desde el frontend
   - No es necesario recalcularlos en el backend

2. **Nuevo Parámetro:**
   - Se agregó `calculatedTaxes` en el flujo de datos
   - Este parámetro asegura que los valores mostrados en la vista coincidan con los enviados

3. **Fórmulas Documentadas:**
   - Todas las fórmulas de cálculo están documentadas
   - El backend puede validar que los cálculos sean correctos

### Endpoints Esperados

1. **POST** `/api/quotations/:quotationId/response`
   - Body: QuotationResponseBase
   - Response: 201 Created + DTO guardado

2. **GET** `/api/quotations/:quotationId/response`
   - Response: QuotationResponseBase guardado

3. **PUT** `/api/quotations/:quotationId/response`
   - Body: QuotationResponseBase
   - Response: 200 OK + DTO actualizado

---

## Contacto

Para dudas o aclaraciones sobre este DTO, contactar a:
- **Frontend Lead:** [Nombre del desarrollador]
- **Email:** [email@ejemplo.com]

---

**Última actualización:** 16 de Octubre, 2025
**Versión del documento:** 2.0
