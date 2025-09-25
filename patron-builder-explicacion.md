# El Patrón Builder - Guía Completa para Estudiantes

## ¿Qué es el Patrón Builder?

El **Patrón Builder** es un patrón de diseño creacional que nos permite construir objetos complejos paso a paso. Imagina que estás armando un LEGO: no pones todas las piezas de una vez, sino que vas agregando una pieza a la vez hasta completar tu construcción.

### Analogía del Mundo Real

Piensa en ordenar una hamburguesa en un restaurante:
- Empiezas con el pan base
- Agregas la carne (puede ser de res, pollo, vegetariana)
- Añades queso (cheddar, suizo, sin queso)
- Pones vegetales (lechuga, tomate, cebolla)
- Agregas salsas (mayonesa, ketchup, mostaza)
- Terminas con el pan superior

Cada paso es **opcional** y **personalizable**. El patrón Builder funciona de manera similar.

## ¿Por qué usar el Patrón Builder?

### Problemas que resuelve:

1. **Constructor con muchos parámetros**: Evita constructores con 5, 10 o más parámetros
2. **Parámetros opcionales**: Maneja fácilmente propiedades que pueden o no estar presentes
3. **Legibilidad**: Hace que el código sea más fácil de leer y entender
4. **Flexibilidad**: Permite crear diferentes variaciones del mismo objeto

### Ejemplo del problema:

```javascript
// ❌ Problemático: Constructor con muchos parámetros
class Casa {
    constructor(ventanas, puertas, garage, jardin, piscina, sotano, atico, chimenea) {
        this.ventanas = ventanas;
        this.puertas = puertas;
        this.garage = garage;
        this.jardin = jardin;
        this.piscina = piscina;
        this.sotano = sotano;
        this.atico = atico;
        this.chimenea = chimenea;
    }
}

// ¿Cuál parámetro era cuál? 😵‍💫
const casa = new Casa(4, 2, true, false, true, false, true, false);
```

## Estructura del Patrón Builder

### Componentes principales:

1. **Producto**: El objeto complejo que queremos construir
2. **Builder**: Interfaz que define los pasos de construcción
3. **ConcreteBuilder**: Implementación específica del builder
4. **Director** (opcional): Coordina el proceso de construcción

## Implementación Paso a Paso

### Ejemplo 1: Constructor de Computadoras

```javascript
// 1. PRODUCTO: La clase que queremos construir
class Computadora {
    constructor() {
        this.procesador = '';
        this.ram = '';
        this.almacenamiento = '';
        this.tarjetaGrafica = '';
        this.fuente = '';
        this.gabinete = '';
    }

    mostrarEspecificaciones() {
        console.log(`
        === ESPECIFICACIONES DE LA COMPUTADORA ===
        Procesador: ${this.procesador}
        RAM: ${this.ram}
        Almacenamiento: ${this.almacenamiento}
        Tarjeta Gráfica: ${this.tarjetaGrafica}
        Fuente: ${this.fuente}
        Gabinete: ${this.gabinete}
        `);
    }
}

// 2. BUILDER: Define los métodos de construcción
class ComputadoraBuilder {
    constructor() {
        this.computadora = new Computadora();
    }

    // Cada método retorna 'this' para permitir method chaining
    setProcesador(procesador) {
        this.computadora.procesador = procesador;
        return this; // 🔑 Clave para el encadenamiento
    }

    setRAM(ram) {
        this.computadora.ram = ram;
        return this;
    }

    setAlmacenamiento(almacenamiento) {
        this.computadora.almacenamiento = almacenamiento;
        return this;
    }

    setTarjetaGrafica(tarjeta) {
        this.computadora.tarjetaGrafica = tarjeta;
        return this;
    }

    setFuente(fuente) {
        this.computadora.fuente = fuente;
        return this;
    }

    setGabinete(gabinete) {
        this.computadora.gabinete = gabinete;
        return this;
    }

    // Método que devuelve el producto final
    build() {
        return this.computadora;
    }
}

// 3. USO DEL BUILDER
const computadoraGaming = new ComputadoraBuilder()
    .setProcesador('Intel i9-13900K')
    .setRAM('32GB DDR5')
    .setAlmacenamiento('1TB NVMe SSD')
    .setTarjetaGrafica('RTX 4080')
    .setFuente('850W 80+ Gold')
    .setGabinete('Mid Tower RGB')
    .build();

const computadoraOficina = new ComputadoraBuilder()
    .setProcesador('Intel i5-13400')
    .setRAM('16GB DDR4')
    .setAlmacenamiento('512GB SSD')
    .setTarjetaGrafica('Integrada')
    .setFuente('500W 80+ Bronze')
    .setGabinete('Mini ITX')
    .build();

computadoraGaming.mostrarEspecificaciones();
computadoraOficina.mostrarEspecificaciones();
```

### Ejemplo 2: Constructor de URLs (Muy útil en APIs)

```javascript
class URLBuilder {
    constructor(baseURL) {
        this.url = new URL(baseURL);
    }

    addPath(path) {
        this.url.pathname += `/${path}`;
        return this;
    }

    addParam(key, value) {
        this.url.searchParams.set(key, value);
        return this;
    }

    addMultipleParams(params) {
        Object.entries(params).forEach(([key, value]) => {
            this.url.searchParams.set(key, value);
        });
        return this;
    }

    build() {
        return this.url.toString();
    }
}

// Uso práctico
const apiURL = new URLBuilder('https://api.ejemplo.com')
    .addPath('usuarios')
    .addPath('123')
    .addPath('pedidos')
    .addParam('page', 1)
    .addParam('limit', 10)
    .addParam('status', 'active')
    .build();

console.log(apiURL);
// https://api.ejemplo.com/usuarios/123/pedidos?page=1&limit=10&status=active
```

### Ejemplo 3: Builder con Validación

```javascript
class PedidoBuilder {
    constructor() {
        this.pedido = {
            cliente: '',
            productos: [],
            descuento: 0,
            envio: 'standard',
            total: 0
        };
    }

    setCliente(cliente) {
        if (!cliente || cliente.trim() === '') {
            throw new Error('El cliente es requerido');
        }
        this.pedido.cliente = cliente;
        return this;
    }

    agregarProducto(producto, cantidad, precio) {
        if (cantidad <= 0 || precio <= 0) {
            throw new Error('Cantidad y precio deben ser positivos');
        }

        this.pedido.productos.push({
            producto,
            cantidad,
            precio,
            subtotal: cantidad * precio
        });
        return this;
    }

    aplicarDescuento(porcentaje) {
        if (porcentaje < 0 || porcentaje > 100) {
            throw new Error('Descuento debe estar entre 0 y 100%');
        }
        this.pedido.descuento = porcentaje;
        return this;
    }

    setTipoEnvio(tipo) {
        const tiposValidos = ['standard', 'express', 'overnight'];
        if (!tiposValidos.includes(tipo)) {
            throw new Error(`Tipo de envío debe ser: ${tiposValidos.join(', ')}`);
        }
        this.pedido.envio = tipo;
        return this;
    }

    build() {
        if (!this.pedido.cliente) {
            throw new Error('Cliente es requerido para crear el pedido');
        }
        if (this.pedido.productos.length === 0) {
            throw new Error('Debe agregar al menos un producto');
        }

        // Calcular total
        const subtotal = this.pedido.productos.reduce((sum, item) => sum + item.subtotal, 0);
        const descuento = subtotal * (this.pedido.descuento / 100);
        this.pedido.total = subtotal - descuento;

        return { ...this.pedido }; // Retorna una copia
    }
}

// Uso con validación
try {
    const pedido = new PedidoBuilder()
        .setCliente('Juan Pérez')
        .agregarProducto('Laptop', 1, 1200)
        .agregarProducto('Mouse', 2, 25)
        .aplicarDescuento(10)
        .setTipoEnvio('express')
        .build();

    console.log(pedido);
} catch (error) {
    console.error('Error al crear pedido:', error.message);
}
```

## Implementación con TypeScript

```typescript
// Interfaz para el producto
interface IComputadora {
    procesador: string;
    ram: string;
    almacenamiento: string;
    tarjetaGrafica?: string; // Opcional
}

// Builder con tipos
class ComputadoraBuilder {
    private computadora: Partial<IComputadora> = {};

    setProcesador(procesador: string): this {
        this.computadora.procesador = procesador;
        return this;
    }

    setRAM(ram: string): this {
        this.computadora.ram = ram;
        return this;
    }

    setAlmacenamiento(almacenamiento: string): this {
        this.computadora.almacenamiento = almacenamiento;
        return this;
    }

    setTarjetaGrafica(tarjeta: string): this {
        this.computadora.tarjetaGrafica = tarjeta;
        return this;
    }

    build(): IComputadora {
        if (!this.computadora.procesador || !this.computadora.ram || !this.computadora.almacenamiento) {
            throw new Error('Faltan componentes obligatorios');
        }
        return this.computadora as IComputadora;
    }
}
```

## Casos de Uso Comunes

### 1. Configuración de Aplicaciones
```javascript
const config = new AppConfigBuilder()
    .setEnvironment('production')
    .setDatabase('postgresql://...')
    .enableLogging()
    .setMaxConnections(100)
    .build();
```

### 2. Construcción de Consultas SQL
```javascript
const query = new QueryBuilder()
    .select('nombre', 'email')
    .from('usuarios')
    .where('activo', '=', true)
    .orderBy('nombre', 'ASC')
    .limit(10)
    .build();
```

### 3. Generación de HTML/XML
```javascript
const form = new FormBuilder()
    .addTextField('nombre', 'Nombre completo', true)
    .addEmailField('email', 'Correo electrónico', true)
    .addSelectField('pais', 'País', ['México', 'España', 'Argentina'])
    .addSubmitButton('Enviar')
    .build();
```

## Ventajas del Patrón Builder

✅ **Legibilidad**: El código se lee como una oración en inglés
✅ **Flexibilidad**: Fácil agregar o quitar propiedades
✅ **Inmutabilidad**: Cada paso crea una nueva versión
✅ **Validación**: Puedes validar en cada paso o al final
✅ **Reutilización**: El mismo builder puede crear diferentes variaciones

## Desventajas

❌ **Complejidad adicional**: Más código para casos simples
❌ **Memoria**: Puede usar más memoria temporalmente
❌ **Curva de aprendizaje**: Requiere entender el patrón

## ¿Cuándo usar el Patrón Builder?

### ✅ USA Builder cuando:
- Tienes constructores con 4+ parámetros
- Muchos parámetros son opcionales
- Quieres crear diferentes variaciones del mismo objeto
- Necesitas validación compleja durante la construcción
- El proceso de construcción debe ser paso a paso

### ❌ NO uses Builder cuando:
- El objeto es simple (1-3 propiedades)
- Todas las propiedades son requeridas
- No hay variaciones en la construcción
- La simplicidad es más importante que la flexibilidad

## Ejercicios Prácticos

### Ejercicio 1: Builder para Pizza
Crea un PizzaBuilder que permita:
- Elegir tamaño (pequeña, mediana, grande)
- Elegir masa (delgada, gruesa, integral)
- Agregar ingredientes múltiples
- Aplicar promociones

### Ejercicio 2: Builder para Notificaciones
Crea un NotificationBuilder que permita:
- Establecer título y mensaje
- Elegir tipo (info, warning, error, success)
- Configurar duración
- Agregar acciones (botones)

### Ejercicio 3: Builder para Filtros de Búsqueda
Crea un SearchFilterBuilder que permita:
- Filtrar por rango de fechas
- Filtrar por categorías
- Filtrar por precio
- Ordenar resultados

## Conclusión

El patrón Builder es una herramienta poderosa que hace que la construcción de objetos complejos sea elegante y mantenible. Como todo patrón de diseño, úsalo cuando sea apropiado: cuando la flexibilidad y legibilidad sean más importantes que la simplicidad.

Recuerda: **Un buen código es como una buena explicación - debe ser fácil de leer y entender.**

¡Ahora es tu turno de practicar! 🚀