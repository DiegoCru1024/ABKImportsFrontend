const cotizacion = {
  statusResponse: "answered", //Estado de respuesta de la cotizacion
  sendResponse: true, //Booleano para indicar que ya fue respondida la respuesta
  logistics_service: "Express shipping", //Servicio de logistica
  price_information: {
    //Informacion de precios
    international_freight: 123123, //Precio del flete internacional
    customs_clearance: 123, //Precio del desaduanaje
    delivery: 123123, //Precio del delivery
    other_expenses: 123, //Precio de otros gastos
  },
  logistics_information: {
    //Informacion de la logistica
    incoterms: "asdsa", //Incoterms
    weight: "50tn", //Peso
    volume: "100m3", //Volumen
    boxes: 100, //Cantidad de cajas
    load_type: "Electronicos", //Tipo de carga
    shipping_company: "Logistics", //Nombre de la naviera
    express_courier: "DHL", //Nombre del courier express
  },
  observations: {
    //Observaciones
    recommendations: "asdsa", //Recomendaciones
    additional_comments: "asdsa", //Comentarios adicionales
  },
  product_details: [
    //Detalles de los productos
    {
      id_product_quotation: null, //ID del producto de la cotizacion
      product_name: "asdda", //Nombre del producto
      price: 12123, //Precio del producto
      quantity: 12, //Cantidad del producto
      total: 123123, //Total del producto (precio * cantidad)
      files: [
        "https://www.google.com", //URL del archivo, asociado al producto
        "https://www.googleasdasd.com", //URL del archivo, asociado al producto
      ],
    },
    {
      id_product_quotation: null, //ID del producto de la cotizacion
      product_name: "asdda", //Nombre del producto
      price: 12123, //Precio del producto
      quantity: 12, //Cantidad del producto
      total: 123123, //Total del producto (precio * cantidad)
      files: [
        "https://www.google.com", //URL del archivo, asociado al producto
        "https://www.googleasdasd.com", //URL del archivo, asociado al producto
      ],
    },
  ],
  resume: {
    //Resumen de la cotizacion
    total_quotation_price: 123, //Precio total de la cotizacion
    total_express_price: 12312, //Precio total del express
    total_tax_price: 123, //Precio total del impuesto
    total_service_price: 1231, //Precio total de los servicios
    sumatory_price: 123132, //Sumatoria de los precios
  },
};
