# Campos por Tipo de Servicio - Vista de Gestión de Cotización

Este documento detalla los campos que se muestran en cada componente según el tipo de servicio seleccionado en la vista de gestión de cotización (`quotation-response-view.tsx`).

## Tipos de Servicio Disponibles

La lógica de tipos de servicio está controlada por `use-quotation-response-form.ts`:

1. **Cotización de Origen** - Vista administrativa/pendiente (no muestra cards de cálculo)
2. **Consolidado Express** - Servicio aéreo express
3. **Consolidado Grupal Express** - Servicio aéreo grupal
4. **Consolidado Marítimo** - Servicio marítimo
5. **Consolidado Grupal Marítimo** - Servicio marítimo grupal
6. **Almacenaje de mercancías** - Almacenaje (usa campos aéreos)

---

## 1. ServiceConsolidationCard

Este componente muestra diferentes campos dependiendo si el servicio es marítimo o aéreo.

### A. Servicios Marítimos (Consolidado Marítimo / Consolidado Grupal Marítimo)

**Condición:** `serviceType === "Consolidado Maritimo" || serviceType === "Consolidado Grupal Maritimo"`

**Función del hook:** `getServiceFields()` retorna campos marítimos cuando `isMaritimeService()` es `true`

#### Campos Mostrados:

1. **SERVICIO CONSOLIDADO** (`servicioConsolidado`)
   - Valor editable
   - Afecto a IGV (18%)

2. **GESTIÓN DE CERTIFICADO DE ORIGEN** (`gestionCertificado`)
   - Valor editable
   - Afecto a IGV (18%)

3. **INSPECCIÓN DE PRODUCTOS** (`inspeccionProductos`)
   - Valor editable
   - Afecto a IGV (18%)

4. **INSPECCIÓN DE FÁBRICA** (`inspeccionFabrica`)
   - Valor editable
   - Afecto a IGV (18%)

5. **OTROS SERVICIOS** (`otrosServicios`)
   - Valor editable
   - Afecto a IGV (18%)

6. **TRANSPORTE LOCAL (CHINA)** (`transporteLocalChina`)
   - Valor de solo lectura
   - **NO afecto a IGV** (se excluye del cálculo de IGV)
   - Proviene de `dynamicValues.transporteLocalChinaEnvio`

7. **TRANSPORTE LOCAL (DESTINO)** (`transporteLocalDestino`)
   - Valor de solo lectura
   - Afecto a IGV (18%)
   - Proviene de `dynamicValues.transporteLocalClienteEnvio`

#### Cálculo de Totales:

```typescript
// Subtotal incluye todos los campos (incluyendo transporteLocalChina)
const subtotal = servicioConsolidado + gestionCertificado + inspeccionProductos +
                 inspeccionFabrica + otrosServicios + transporteLocalChina + transporteLocalDestino;

// IGV se calcula EXCLUYENDO transporteLocalChina
const igvBase = servicioConsolidado + gestionCertificado + inspeccionProductos +
                inspeccionFabrica + otrosServicios + transporteLocalDestino;
const igv = igvBase * 0.18;

const total = subtotal + igv;
```

---

### B. Servicios Aéreos (Consolidado Express / Consolidado Grupal Express / Almacenaje)

**Condición:** Servicios que no son marítimos

**Función del hook:** `getServiceFields()` retorna diferentes campos según el tipo específico

#### B.1 Consolidado Express

**Campos retornados por el hook:**
```typescript
{
  servicioConsolidado: dynamicValues.servicioConsolidado,
  separacionCarga: dynamicValues.separacionCarga,
  inspeccionProductos: dynamicValues.inspeccionProductos,
}
```

**Campos Mostrados:**

1. **SERVICIO CONSOLIDADO** (`servicioConsolidado`)
   - Valor editable
   - Afecto a IGV (18%)

2. **SEPARACIÓN DE CARGA** (`separacionCarga`)
   - Valor editable
   - Afecto a IGV (18%)

3. **INSPECCIÓN DE PRODUCTOS** (`inspeccionProductos`)
   - Valor editable
   - Afecto a IGV (18%)

#### B.2 Consolidado Grupal Express

**Campos retornados por el hook:**
```typescript
{
  servicioConsolidado: dynamicValues.servicioConsolidado,
  seguroProductos: dynamicValues.separacionCarga, // NOTA: Reutiliza el valor de separacionCarga
  inspeccionProductos: dynamicValues.inspeccionProductos,
}
```

**Campos Mostrados:**

1. **SERVICIO CONSOLIDADO** (`servicioConsolidado`)
   - Valor editable
   - Afecto a IGV (18%)

2. **SEGURO DE PRODUCTOS** (`seguroProductos`)
   - **NOTA IMPORTANTE:** Usa el valor de `separacionCarga` internamente, pero con label diferente
   - Valor editable
   - Afecto a IGV (18%)

3. **INSPECCIÓN DE PRODUCTOS** (`inspeccionProductos`)
   - Valor editable
   - Afecto a IGV (18%)

#### B.3 Almacenaje de mercancías

**Campos retornados por el hook:**
```typescript
{
  servicioConsolidado: dynamicValues.servicioConsolidado,
  separacionCarga: dynamicValues.separacionCarga,
  inspeccionProductos: dynamicValues.inspeccionProductos,
}
```

Usa los mismos campos que Consolidado Express.

#### Cálculo de Totales (Servicios Aéreos):

```typescript
const subtotal = Object.values(serviceFields).reduce((sum, value) => sum + (value || 0), 0);
const igv = subtotal * 0.18;
const total = subtotal + igv;
```

---

## 2. TaxObligationsCard (Obligaciones Fiscales)

Este componente muestra diferentes impuestos según si el servicio es marítimo o aéreo.

### A. Servicios Marítimos

**Condición:** `isMaritime === true`

**Campos Mostrados:**

1. **AD/VALOREM** (`adValoremRate`)
   - Tasa editable (%)
   - Valor calculado mostrado en USD
   - Por defecto: 4.0%

2. **ANTIDUMPING** (`antidumpingGobierno` × `antidumpingCantidad`)
   - Dos tasas editables (gobierno y cantidad)
   - Valor calculado: tasa1 × tasa2
   - Por defecto: 0.0 × 0.0

3. **ISC** (`iscRate`)
   - Tasa editable (%)
   - Valor calculado mostrado en USD
   - Por defecto: 0.0%

4. **IGV** (`igvRate`)
   - Tasa editable (%)
   - Valor calculado mostrado en USD
   - Por defecto: 16.0%

5. **IPM** (`ipmRate`)
   - Tasa editable (%)
   - Valor calculado mostrado en USD
   - Por defecto: 2.0%

6. **PERCEPCIÓN** (`percepcionRate`)
   - Tasa editable
   - Valor calculado mostrado en USD
   - Por defecto: 3.5

#### Totales:

```typescript
const totalDerechosDolares = adValorem + antidumping + isc + igvFiscal + ipm + percepcion;
const totalDerechosSoles = totalDerechosDolares * tipoCambio;
```

---

### B. Servicios Aéreos

**Condición:** `isMaritime === false`

**Campos Mostrados:**

1. **AD/VALOREM** (`adValoremRate`)
   - Tasa editable (%)
   - Valor calculado mostrado en USD
   - Por defecto: 4.0%

2. **IGV** (`igvRate`)
   - Tasa editable (%)
   - Valor calculado mostrado en USD
   - Por defecto: 16.0%

3. **IPM** (`ipmRate`)
   - Tasa editable (%)
   - Valor calculado mostrado en USD
   - Por defecto: 2.0%

**NOTA:** Los campos de **ANTIDUMPING**, **ISC** y **PERCEPCIÓN** NO se muestran en servicios aéreos.

#### Totales:

```typescript
const totalDerechosDolares = adValorem + igvFiscal + ipm;
const totalDerechosSoles = totalDerechosDolares * tipoCambio;
```

---

## 3. ImportExpensesCard (Gastos de Importación)

Este componente tiene la lógica más compleja, mostrando diferentes campos según el tipo de servicio y el valor comercial.

### A. Servicios Marítimos

**Condición:** `isMaritime === true` (detectado por `isMaritimeConsolidated`)

**Función:** `calculateMaritimeConsolidatedValues()` calcula los valores finales

#### Campos Mostrados:

1. **Servicio Consolidado Marítimo** (`servicioConsolidadoMaritimo`)
   - Valor: `servicioConsolidado × 1.18`
   - Checkbox de exoneración

2. **Gestión de Certificado de Origen** (`gestionCertificado`)
   - Valor: `gestionCertificado × 1.18`
   - Checkbox de exoneración

3. **Servicio de Inspección** (`servicioInspeccion`)
   - Valor: `(inspeccionProductos + inspeccionFabrica) × 1.18`
   - Checkbox de exoneración

4. **Servicio de Transporte** (`servicioTransporte`)
   - Valor: `transporteLocalChina + (transporteLocalDestino × 1.18)`
   - Checkbox de exoneración

5. **Otros Servicios** (`otrosServicios`)
   - Valor: `otrosServicios × 1.18`
   - Checkbox de exoneración

6. **Total de Derechos** (`totalDerechos`)
   - Valor: `totalDerechosDolaresFinal`
   - Checkbox de exoneración

#### Total:

Suma de todos los campos no exonerados.

---

### B. Consolidado Express (< $200)

**Condición:** `serviceType === "Consolidado Express" && comercialValue < 200`

**Variable del componente:** `isExpressConsolidatedPersonal = true`

#### Campos Mostrados:

1. **SERVICIO CONSOLIDADO AÉREO** (`servicioConsolidadoAereo`)
   - Valor: `servicioConsolidado × 1.18`
   - Checkbox de exoneración

2. **SEPARACIÓN DE CARGA** (`separacionCarga`)
   - Valor: `separacionCarga × 1.18`
   - Checkbox de exoneración

3. **SEGURO DE PRODUCTOS** (`seguroProductos`)
   - Valor: `inspeccionProductos × 1.18`
   - Checkbox de exoneración

4. **INSPECCIÓN DE PRODUCTOS** (`inspeccionProductos`)
   - Valor: `inspeccionProductos × 1.18`
   - Checkbox de exoneración

5. **SERVICIO DE TRANSPORTE** (`servicioTransporte`)
   - Valor: `transporteLocalChina + transporteLocalDestino`
   - Checkbox de exoneración

6. **FLETE INTERNACIONAL** (`fleteInternacional`)
   - Valor: `flete`
   - Checkbox de exoneración

7. **DESADUANAJE** (`desaduanaje`)
   - Valor: `desaduanaje`
   - Checkbox de exoneración

#### Total:

Suma de todos los campos no exonerados.

---

### C. Consolidado Express (≥ $200) - Simplificada

**Condición:** `serviceType === "Consolidado Express" && comercialValue >= 200`

**Variable del componente:** `isExpressConsolidatedSimplificada = true`

#### Campos Mostrados:

1. **SERVICIO CONSOLIDADO AÉREO** (`servicioConsolidadoAereo`)
   - Valor: `servicioConsolidado × 1.18`
   - Checkbox de exoneración

2. **SEPARACIÓN DE CARGA** (`separacionCarga`)
   - Valor: `separacionCarga × 1.18`
   - Checkbox de exoneración

3. **SEGURO DE PRODUCTOS** (`seguroProductos`)
   - Valor: `inspeccionProductos × 1.18`
   - Checkbox de exoneración

4. **INSPECCIÓN DE PRODUCTOS** (`inspeccionProductos`)
   - Valor: `inspeccionProductos × 1.18`
   - Checkbox de exoneración

5. **SERVICIO DE TRANSPORTE** (`servicioTransporte`)
   - Valor: `transporteLocalChina + transporteLocalDestino`
   - Checkbox de exoneración

6. **AD/VALOREM + IGV + IPM** (`adValoremIgvIpm`)
   - Valor: `totalDerechosDolaresFinal`
   - Checkbox de exoneración
   - **NOTA:** Agrupa los 3 impuestos principales

7. **DESADUANAJE + FLETE + SEGURO** (`desaduanajeFleteSaguro`)
   - Valor: `desaduanaje + flete + seguro`
   - Checkbox de exoneración

#### Total:

Suma de todos los campos no exonerados.

---

### D. Consolidado Grupal Express

**Condición:** `serviceType === "Consolidado Grupal Express"`

**Variable del componente:** `isExpressConsolidatedGrupal = true`

#### Campos Mostrados:

1. **SERVICIO CONSOLIDADO AÉREO** (`servicioConsolidadoAereo`)
   - Valor: `servicioConsolidado × 1.18`
   - Checkbox de exoneración

2. **SEPARACIÓN DE CARGA** (`separacionCarga`)
   - Valor: `separacionCarga × 1.18`
   - Checkbox de exoneración

3. **SEGURO DE PRODUCTOS** (`seguroProductos`)
   - Valor: `inspeccionProductos × 1.18`
   - Checkbox de exoneración

4. **SERVICIO DE TRANSPORTE** (`servicioTransporte`)
   - Valor: `transporteLocalChina + transporteLocalDestino`
   - Checkbox de exoneración

5. **AD/VALOREM + IGV + IPM (-50%)** (`adValoremIgvIpmDescuento`)
   - Valor: `totalDerechosDolaresFinal × 0.5`
   - Checkbox de exoneración
   - **NOTA IMPORTANTE:** Descuento automático del 50% aplicado

6. **FLETE INTERNACIONAL** (`fleteInternacional`)
   - Valor: `flete`
   - Checkbox de exoneración

**NOTA IMPORTANTE:** El campo **"INSPECCIÓN DE PRODUCTOS"** NO se muestra en Consolidado Grupal Express (se excluye automáticamente del array `airExpenses` en líneas 231-239).

#### Total:

Suma de todos los campos no exonerados.

---

## 4. ImportSummaryCard (Resumen de Gastos)

Este componente muestra siempre los mismos campos base, pero tiene mensajes condicionales según el tipo de servicio.

### Campos Base (Siempre visibles):

1. **VALOR DE COMPRA FACTURA COMERCIAL**
   - Valor: `comercialValue`
   - Icono: FileText (azul)
   - Categoría: Compra

2. **TOTAL GASTOS DE IMPORTACIÓN**
   - Valor: `totalImportCosts`
   - Icono: DollarSign (verde)
   - Categoría: Gastos

3. **INVERSIÓN TOTAL DE IMPORTACIÓN**
   - Valor: `comercialValue + totalImportCosts`
   - Destacado en color morado

---

### Mensajes Condicionales:

#### A. Consolidado Express (< $200) - Exoneración Tributaria Activa

**Condición:** `isExpressConsolidatedPersonal === true` (comercialValue < 200)

**Variable del componente:** Se pasa como prop `isExpressConsolidatedPersonal`

**Mensaje mostrado:**

```
✓ EXONERACIÓN TRIBUTARIA ACTIVA

¡Ahorro en impuestos de importación! El valor comercial es menor a USD $200.00,
lo que significa que esta importación está exonerada de impuestos aduaneros
(Ad Valorem, IGV, IPM). Solo se aplican los costos de desaduanaje y flete internacional.

Beneficio Principal: Sin Ad Valorem, IGV ni IPM
Gastos Aplicables: Solo flete y desaduanaje
```

**Color:** Verde (green-50/green-600)

---

#### B. Consolidado Grupal Express - Descuento Grupal Express Activo

**Condición:** `isExpressConsolidatedGrupal === true`

**Variable del componente:** Se pasa como prop `isExpressConsolidatedGrupal`

**Mensaje mostrado:**

```
✓ DESCUENTO GRUPAL EXPRESS ACTIVO

¡Beneficios del Consolidado Grupal Express! Esta modalidad incluye:

Exoneración Aplicada: Inspección de productos EXONERADA
Descuento en Impuestos: 50% de descuento en AD/VALOREM + IGV + IPM
```

**Color:** Amarillo/Ámbar (amber-50/amber-600)

---

#### C. Exoneración Manual Activa

**Condición:** Algún checkbox de exoneración está activado en el `exemptionState` de ImportExpensesCard

**Variable del componente:** `isAnyExempted = Object.values(exemptionState).some(Boolean)`

**Mensaje mostrado:**

```
✓ EXONERACIÓN AUTOMÁTICA

Los impuestos están exonerados automáticamente porque el valor comercial es menor a USD $200.00.
Esta exoneración aplica a todos los impuestos y aranceles correspondientes.

Beneficio Principal: Ahorro en costos de importación
Gastos Aplicables: Servicios logísticos básicos
```

**Color:** Verde (green-50/green-600)

---

## Resumen de Diferencias Clave por Tipo de Servicio

### 1. Cotización de Origen

- Solo muestra información administrativa básica
- No muestra cards de cálculos (ServiceConsolidation, TaxObligations, ImportExpenses, ImportSummary)
- Muestra solo gestión de productos pendientes

### 2. Consolidado Marítimo / Grupal Marítimo

**ServiceConsolidationCard:**
- 7 campos específicos marítimos
- Incluye transporteLocalChina (sin IGV) y transporteLocalDestino (con IGV)
- IGV calculado excluyendo transporteLocalChina

**TaxObligationsCard:**
- 6 campos de impuestos
- Incluye ANTIDUMPING (doble tasa), ISC y PERCEPCIÓN
- Totales en USD y S/.

**ImportExpensesCard:**
- 6 campos marítimos
- Valores calculados con IGV (18%)
- Total de Derechos incluido

### 3. Consolidado Express (< $200)

**ServiceConsolidationCard:**
- 3 campos: servicioConsolidado, separacionCarga, inspeccionProductos
- Todos afectos a IGV

**TaxObligationsCard:**
- Solo 3 campos: AD/VALOREM, IGV, IPM
- Sin ANTIDUMPING, ISC, PERCEPCIÓN

**ImportExpensesCard:**
- 7 campos incluyendo FLETE INTERNACIONAL y DESADUANAJE separados
- Todos con checkbox de exoneración

**ImportSummaryCard:**
- Muestra mensaje de exoneración tributaria activa (verde)
- Indica ahorro en impuestos

### 4. Consolidado Express (≥ $200)

**ServiceConsolidationCard:**
- 3 campos: servicioConsolidado, separacionCarga, inspeccionProductos

**TaxObligationsCard:**
- Solo 3 campos: AD/VALOREM, IGV, IPM

**ImportExpensesCard:**
- 7 campos con agrupación de impuestos
- AD/VALOREM + IGV + IPM agrupado
- DESADUANAJE + FLETE + SEGURO agrupado

**ImportSummaryCard:**
- Sin mensaje especial (a menos que haya exoneraciones manuales)

### 5. Consolidado Grupal Express

**ServiceConsolidationCard:**
- 3 campos: servicioConsolidado, seguroProductos (usa valor de separacionCarga), inspeccionProductos
- Label de "seguroProductos" en lugar de "separacionCarga"

**TaxObligationsCard:**
- Solo 3 campos: AD/VALOREM, IGV, IPM

**ImportExpensesCard:**
- **6 campos** (INSPECCIÓN DE PRODUCTOS se excluye automáticamente)
- AD/VALOREM + IGV + IPM con descuento del 50%
- FLETE INTERNACIONAL incluido

**ImportSummaryCard:**
- Muestra mensaje de descuento grupal express activo (amarillo/ámbar)
- Indica 50% de descuento en impuestos y exoneración de inspección

### 6. Almacenaje de mercancías

**ServiceConsolidationCard:**
- Usa los mismos campos que Consolidado Express
- 3 campos: servicioConsolidado, separacionCarga, inspeccionProductos

---

## Notas Importantes sobre el Hook `use-quotation-response-form.ts`

### Detección de Servicio Marítimo

```typescript
const isMaritimeService = (serviceType: string) => {
  return (
    serviceType === "Consolidado Maritimo" ||
    serviceType === "Consolidado Grupal Maritimo"
  );
};
```

### Cálculo Automático de Flete Marítimo

Para servicios marítimos, el flete se calcula automáticamente:

```typescript
useEffect(() => {
  if (isMaritimeService(selectedServiceLogistic)) {
    const maxValue = Math.max(dynamicValues.ton, dynamicValues.volumenCBM);
    const calculatedFlete = maxValue * dynamicValues.calculoFlete;

    if (calculatedFlete !== dynamicValues.flete) {
      setDynamicValues(prev => ({
        ...prev,
        flete: calculatedFlete
      }));
    }
  }
}, [selectedServiceLogistic, dynamicValues.ton, dynamicValues.volumenCBM, dynamicValues.calculoFlete]);
```

### Valores por Defecto

Los valores iniciales en `dynamicValues`:

- `tipoCambio`: 3.7
- `adValoremRate`: 4.0%
- `igvRate`: 16.0%
- `ipmRate`: 2.0%
- `percepcionRate`: 3.5
- Todos los demás campos: 0.0

### Función para Obtener Nombre del Servicio

```typescript
const getServiceName = (serviceType: string) => {
  const aereoServices = [
    "Consolidado Express",
    "Consolidado Grupal Express",
    "Almacenaje de mercancías",
  ];
  if (aereoServices.includes(serviceType)) {
    return "Servicio de Carga Consolidada Aérea";
  } else if (isMaritimeService(serviceType)) {
    return "Servicio de Carga Consolidada (CARGA- ADUANA)";
  }
  return "Servicio de Carga Consolidada Aérea";
};
```

---

**Última actualización:** 2025-12-10
