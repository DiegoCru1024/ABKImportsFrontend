const objeto = {
  quotationInfo: {
    quotationId: "4a77-8074-94a77-8074-94a77-8074-94a77-8074-9",
    correlative: "COT-001-2024", // Correlativo interno del sistema
    date: "12-09-2024 14:30:00", // Fecha y hora de respuesta
    advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb", // ID del asesor que responde
    serviceLogistic: "Pendiente", // Tipo de servicio logístico seleccionado
    incoterm: "DDP", // Término de comercio internacional
    cargoType: "mixto", // Tipo de carga (general, mixto, contenedor)
    courier: "ups", // Empresa courier seleccionada
  },

  user: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "John Doe",
    email: "john.doe@example.com",
  },

  // Información de la respuesta de las cotizaciones
  responseData: [
    //Objeto  cuando el tipo de servicio es pendiente
    {
      // Tipo de servicio para determinar el procesamiento en el backend
      serviceType: "PENDING",
      type: "PENDING",
      // Información agregada básica para vista administrativa
      basicInfo: {
        totalCBM: 2.5, // Volumen total en metros cúbicos
        totalWeight: 150.0, // Peso total en kilogramos
        totalPrice: 1200.0, // Precio total de productos
        totalExpress: 180.0, // Costo total de servicio express
        totalQuantity: 25, // Cantidad total de items
      },

      // Lista de productos con información simplificada para vista pendiente
      products: [
        {
          productId: "PROD-001", // ID único del producto
          name: "Producto Ejemplo A", // Nombre del producto
          url: "https://facturacion.apisperu.com/doc#tag/invoice/operation/sendInvoice", //URL del producto , se obtiene de la tabla de products-quotation.entitys
          comment: "Quiero que sea igualito\n", //Comentario del usuario cliente,  se obtiene de la tabla de products-quotation.entitys
          isQuoted: true, // Indica si el producto será cotizado
          adminComment: "Verificar disponibilidad en almacén", // Comentario administrativo
          ghostUrl: "https://mercadolibre.com", //URL de guia ,

          // Precios y medidas agregadas del producto
          pricing: {
            totalPrice: 800.0, // Precio total del producto
            totalWeight: 100.0, // Peso total del producto
            totalCBM: 1.5, // Volumen total del producto
            totalQuantity: 15, // Cantidad total del producto
            totalExpress: 120.0, // Costo express total del producto
          },

          //Información sobre el packing (Lo obtienes de la entidad de @quotation-response-products.entity)
          packingList: {
            nroBoxes: 10, //Cantidad de cajas
            cbm: 20.0, //CBM
            pesoKg: 1000, //Peso en Kilogramos
            pesoTn: 1, //Peso en toneladas
          },

          //Información sobre la manipulación de carga
          cargoHandling: {
            fragileProduct: true, //Producto fragil
            stackProduct: false, //Producto manipulable
          },

          // Variantes del producto con información básica
          variants: [
            {
              variantId: "VAR-001-A", // ID único de la variante
              size: "7*7*7", //Tamaño, se obtiene de la tabla product-variant.entity.ts
              presentation: "asd", //Presentacion, se obtiene de la tabla product-variant.entity.ts
              model: "asd", //Modelo, se obtiene de la tabla product-variant.entity.ts
              color: "rojo", //Color, se obtiene de la tabla product-variant.entity.ts
              quantity: 10, // Cantidad de esta variante

              isQuoted: true, // Indica si la variante será cotizada

              // Precios específicos para vista pendiente
              pendingPricing: {
                unitPrice: 50.0, // Precio unitario de la variante
                expressPrice: 8.0, // Precio express unitario
              },
              attachments: [
                "https://abk-imports-resources.s3.us-east-1.amazonaws.com/55e4fa56-18a6-42ed-96cc-8d60b7ef3890/images/logo1_1758140099496_5c793700.png",
              ], //Array de imagenes del producto, lo obtienes de la tabla/entity products-quotation.entitys
            },
          ],
        },
      ],
    },

    //Objeto cuando el tipo de servicio es EXPRESS o MARITIMO
    {
      // Tipo de servicio para determinar el procesamiento en el backend
      serviceType: "EXPRESS", // o  serviceType: "MARITIMO" segun corresponda
      type: "EXPRESS", // o type: "MARITIMO" segun corresponda
      basicInfo: {
        totalCBM: 2.5, // Volumen total en metros cúbicos
        totalWeight: 150.0, // Peso total en kilogramos
        totalPrice: 1200.0, // Precio total de productos
        totalExpress: 180.0, // Costo total de servicio express
        totalQuantity: 25, // Cantidad total de items
      },
      // Lista de productos con cálculos detallados para vista completa
      products: [
        {
          productId: "PROD-002", // ID único del producto
          name: "Producto Express A", // Nombre del producto
          url: "https://facturacion.apisperu.com/doc#tag/invoice/operation/sendInvoice", //URL del producto , se obtiene de la tabla de products-quotation.entitys
          comment: "Quiero que sea igualito\n", //Comentario del usuario cliente,  se obtiene de la tabla de products-quotation.entitys
          isQuoted: true, // Indica si el producto será cotizado
          adminComment: "Verificar disponibilidad en almacén", // Comentario administrativo

          // Precios y costos calculados para vista completa
          pricing: {
            unitCost: 165.62, // Costo unitario final (incluye importación)
            importCosts: 557.7, // Costos de importación asignados al producto
            totalCost: 2087.7, // Costo total del producto
            equivalence: 1.5, // Factor de equivalencia para cálculos
          },

          // Variantes del producto con cálculos detallados
          variants: [
            {
              variantId: "VAR-002-A", // ID único de la variante
              quantity: 10, // Cantidad de esta variante, lo obtienes de la tabla de quotation-response-variant.entity.ts
              size: "7*7*7", //Tamaño, se obtiene de la tabla product-variant.entity.ts
              presentation: "asd", //Presentacion, se obtiene de la tabla product-variant.entity.ts
              model: "asd", //Modelo, se obtiene de la tabla product-variant.entity.ts
              color: "rojo", //Color, se obtiene de la tabla product-variant.entity.ts
              isQuoted: true, // Indica si la variante será cotizada

              // Precios detallados para vista completa
              completePricing: {
                unitCost: 165.62, // Costo unitario final
              },
            },
          ],
          attachments: [
            "https://abk-imports-resources.s3.us-east-1.amazonaws.com/55e4fa56-18a6-42ed-96cc-8d60b7ef3890/images/logo1_1758140099496_5c793700.png",
          ], //Array de imagenes del producto, lo obtienes de la tabla/entity products-quotation.entitys
        },
      ],
    },
  ],
};
