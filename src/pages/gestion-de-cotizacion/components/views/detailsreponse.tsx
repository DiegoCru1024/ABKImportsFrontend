import React, { useState, useEffect } from "react";
import {
  Calendar,
  Calculator,
  FileText,
  Clock,
  Receipt,
  Settings,
  User,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Truck,
  MessageSquare,
  Package,
  PackageIcon,
  Send,
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
  ListIcon,
  MessageCircleMore,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useGetQuotationById } from "@/hooks/use-quation";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, obtenerUser } from "@/lib/functions";

// Tabs removidos: ahora todo se muestra en una sola vista

import type { DetailsResponseProps } from "../utils/interface";

// Importar datos estáticos
import {
  incotermsOptions,
  serviciosLogisticos,
  typeLoad,
  typeLoadMaritime,
  regimenOptions,
  puertosSalida,
  puertosDestino,
  tipoServicio,
  proformaVigencia,
  courier,
  paisesOrigen,
  paisesDestino,
  aduana,
} from "../utils/static";

import EditableUnitCostTable from "./editableunitcosttable";
import type { ProductRow as UnitCostProductRow } from "./editableunitcosttable";
import { EditableNumericField } from "@/components/ui/editableNumberFieldProps";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/format-time";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCreateQuatitationResponse } from "@/hooks/use-quatitation-response";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import SendingModal from "@/components/sending-modal";

import ServiceConsolidationCard from "./partials/ServiceConsolidationCard";
import ImportExpensesCard from "./partials/ImportExpensesCard";
import ImportSummaryCard from "./partials/ImportSummaryCard";
import TaxObligationsCard from "./partials/TaxObligationsCard";
import ProductRow from "./ProductRow";

const DetailsResponse: React.FC<DetailsResponseProps> = ({
  selectedQuotationId,
}) => {
  //* Hook para obtener los detalles de la cotización - DEBE IR PRIMERO
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  useEffect(() => {
    //Obtener id_usuario del usuario logueado
    const id_usuario = obtenerUser().id_usuario;
    setId_asesor(id_usuario);
  }, []);

  //* Hook para crear respuesta de cotización
  const createQuotationResponseMutation = useCreateQuatitationResponse();

  //* Estado para la fecha de la cotización
  const [quotationDate, setQuotationDate] = useState<string>("");

  //* Estado para el modal de envío
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);

  //* Estados para los selectores
  const [selectedTypeLoad, setSelectedTypeLoad] = useState<string>("mixto");
  const [selectedCourier, setSelectedCourier] = useState<string>("ups");
  const [selectedIncoterm, setSelectedIncoterm] = useState<string>("DDP");
  const [selectedServiceLogistic, setSelectedServiceLogistic] =
    useState<string>("Pendiente");

  //* Estados específicos para servicios marítimos
  const [selectedRegimen, setSelectedRegimen] = useState<string>("");
  const [selectedPaisOrigen, setSelectedPaisOrigen] = useState<string>("");
  const [selectedPaisDestino, setSelectedPaisDestino] = useState<string>("");
  const [selectedAduana, setSelectedAduana] = useState<string>("");
  const [selectedPuertoSalida, setSelectedPuertoSalida] = useState<string>("");
  const [selectedPuertoDestino, setSelectedPuertoDestino] =
    useState<string>("");
  const [selectedTipoServicio, setSelectedTipoServicio] = useState<string>("");
  const [tiempoTransito, setTiempoTransito] = useState<number>(0);
  const [selectedProformaVigencia, setSelectedProformaVigencia] =
    useState<string>("5");
  const [naviera, setNaviera] = useState<string>("");

  //* Estados para valores dinámicos editables
  const [dynamicValues, setDynamicValues] = useState({
    // Valores principales
    comercialValue: 0.0,
    flete: 0.0,
    cajas: 0.0,
    desaduanaje: 0.0,
    kg: 0.0,
    ton: 0.0,
    kv: 0.0,
    fob: 0.0,
    seguro: 0.0,
    tipoCambio: 3.7,

    // Campos específicos marítimos
    nroBultos: 0.0,
    volumenCBM: 0.0,
    calculoFlete: 0.0,

    // Servicios de consolidación aérea
    servicioConsolidado: 0.0,
    separacionCarga: 0.0,
    inspeccionProductos: 0.0,

    // Servicios de consolidación marítima (cuando aplique)
    gestionCertificado: 0.0,
    inspeccionProducto: 0.0,
    inspeccionFabrica: 0.0,
    transporteLocal: 0.0,
    otrosServicios: 0.0,

    // Porcentajes de impuestos (actualizados para marítimo)
    adValoremRate: 4.0,
    antidumpingGobierno: 0.0,
    antidumpingCantidad: 0.0,
    iscRate: 0.0,
    igvRate: 16.0,
    ipmRate: 2.0,
    percepcionRate: 5.0,

    // Campos específicos para transporte local china
    transporteLocalChinaEnvio: 0.0,
    transporteLocalClienteEnvio: 0.0,
  });

  //* Estado para primera compra
  const [isFirstPurchase, setIsFirstPurchase] = useState(false);
  const [id_asesor, setId_asesor] = useState<string | null>(null);
  const [nombre_asesor, setNombre_asesor] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  //* Estados para exoneración de conceptos de gastos de importación
  const [exemptionState, setExemptionState] = useState({
    // Servicios Aéreos
    servicioConsolidadoAereo: false,
    separacionCarga: false,
    inspeccionProductos: false,
    obligacionesFiscales: false,
    desaduanajeFleteSaguro: false,
    transporteLocalChina: false,
    transporteLocalCliente: false,
    // Servicios Marítimos
    servicioConsolidadoMaritimo: false,
    gestionCertificado: false,
    servicioInspeccion: false,
    transporteLocal: false,
    totalDerechos: false,
  });

  //* Estado para productos editables de la tabla de costeo unitario
  const [editableUnitCostProducts, setEditableUnitCostProducts] = useState<
    UnitCostProductRow[]
  >([]);

  //* Estado para productos editables del tipo "Pendiente"
  const [editablePendingProducts, setEditablePendingProducts] = useState<
    Array<{
      id: string;
      name: string;
      quantity: number;
      boxes: number;
      priceXiaoYi: number;
      cbmTotal: number;
      express: number;
      total: number;
      cbm: number;
      weight: number;
      price: number;
    }>
  >([]);

  //* Estado para productos con variantes editables
  const [editableProductsWithVariants, setEditableProductsWithVariants] =
    useState<any[]>([]);

  //* Estado para controlar qué productos se cotizan
  const [productQuotationState, setProductQuotationState] = useState<
    Record<string, boolean>
  >({});

  //* Estado para controlar qué variantes se cotizan
  const [variantQuotationState, setVariantQuotationState] = useState<
    Record<string, Record<string, boolean>>
  >({});

  //* Función para detectar si es servicio marítimo
  const isMaritimeService = (serviceType: string) => {
    return (
      serviceType === "Consolidado Maritimo" ||
      serviceType === "Consolidado Grupal Maritimo"
    );
  };

  //* Calcular flete dinámicamente para servicios marítimos
  const calculateMaritimeFlete = () => {
    if (isMaritimeService(selectedServiceLogistic)) {
      const maxValue = Math.max(dynamicValues.ton, dynamicValues.volumenCBM);
      return maxValue * dynamicValues.calculoFlete;
    }
    return dynamicValues.flete;
  };

  //* Lógica automática para conversión KG a TON
  const handleKgChange = (value: number) => {
    updateDynamicValue("kg", value);
    // Convertir automáticamente KG a TON
    updateDynamicValue("ton", value / 1000);
  };

  //* Calcular CIF dinámicamente
  const maritimeFlete = calculateMaritimeFlete();
  const cif = dynamicValues.fob + maritimeFlete + dynamicValues.seguro;

  //* Función para obtener el nombre del servicio según el tipo
  const getServiceName = (serviceType: string) => {
    const aereoServices = [
      "Consolidado Express",
      "Consolidado Grupal Express",
      "Almacenaje de mercancías",
    ];
    if (aereoServices.includes(serviceType)) {
      return "Servicio de Carga Consolidada Aérea";
    } else if (
      serviceType === "Consolidado Maritimo" ||
      serviceType === "Consolidado Grupal Maritimo"
    ) {
      return "Servicio de Carga Consolidada (CARGA- ADUANA)";
    }
    return "Servicio de Carga Consolidada Aérea"; // Por defecto
  };

  //* Función para obtener los campos del servicio según el tipo
  const getServiceFields = (serviceType: string) => {
    const aereoServices = [
      "Consolidado Express",
      "Consolidado Grupal Express",
      "Almacenaje de mercancías",
    ];
    if (aereoServices.includes(serviceType)) {
      return {
        servicioConsolidado: dynamicValues.servicioConsolidado,
        separacionCarga: dynamicValues.separacionCarga,
        inspeccionProductos: dynamicValues.inspeccionProductos,
      };
    } else if (
      serviceType === "Consolidado Maritimo" ||
      serviceType === "Consolidado Grupal Maritimo"
    ) {
      return {
        servicioConsolidado: dynamicValues.servicioConsolidado,
        gestionCertificado: dynamicValues.gestionCertificado,
        inspeccionProducto: dynamicValues.inspeccionProducto,
        inspeccionFabrica: dynamicValues.inspeccionFabrica,
        transporteLocal: dynamicValues.transporteLocal,
        otrosServicios: dynamicValues.otrosServicios,
      };
    }
    return {
      servicioConsolidado: dynamicValues.servicioConsolidado,
      separacionCarga: dynamicValues.separacionCarga,
      inspeccionProductos: dynamicValues.inspeccionProductos,
    };
  };

  //* Calcular valores dinámicos
  const serviceFields = getServiceFields(selectedServiceLogistic);
  const subtotalServices = Object.values(serviceFields).reduce(
    (sum, value) => sum + value,
    0
  );

  //* Calcular sumatorias para tipo "Pendiente"
  const totalExpressAirFreight = editablePendingProducts.reduce(
    (sum, product) => sum + product.express,
    0
  );
  const totalAgenteXiaoYi = editablePendingProducts.reduce(
    (sum, product) => sum + product.priceXiaoYi * product.quantity,
    0
  );
  const totalPrecioTotal = totalExpressAirFreight + totalAgenteXiaoYi;

  //* Calcular totales dinámicos para productos con variantes
  const calculateDynamicTotals = () => {
    if (!quotationDetail?.products)
      return { totalCBM: 0, totalWeight: 0, totalExpress: 0, totalPrice: 0 };

    let totalCBM = 0;
    let totalWeight = 0;
    let totalExpress = 0;
    let totalPrice = 0;

    // Usar productos editables si están disponibles, sino usar los originales
    const productsToCalculate =
      editableProductsWithVariants.length > 0
        ? editableProductsWithVariants
        : quotationDetail.products;

    productsToCalculate.forEach((product: any) => {
      // Verificar si el producto está marcado para cotizar (por defecto true si no está definido)
      const isProductQuoted = productQuotationState[product.id] !== false;

      if (isProductQuoted) {
        // Sumar CBM y peso del producto desde los campos editables
        const editableProduct = editablePendingProducts.find(
          (p) => p.id === product.id
        );
        if (editableProduct) {
          totalCBM += Number(editableProduct.cbm) || 0;
          totalWeight += Number(editableProduct.weight) || 0;
        } else {
          // Fallback a los valores originales si no hay producto editable
          totalCBM += Number(product.volume) || 0;
          totalWeight += Number(product.weight) || 0;
        }

        // Calcular totales de precio y express basado en variantes
        const variants = product.variants || [];
        if (variants.length === 1) {
          // Producto con una sola variante
          const variant = variants[0];
          // Verificar si la variante está marcada para cotizar
          const isVariantQuoted =
            variantQuotationState[product.id]?.[variant.id] !== false;
          if (isVariantQuoted) {
            totalExpress += Number(variant.express) || 0;
            totalPrice +=
              (Number(variant.price) || 0) * (Number(variant.quantity) || 0);
          }
        } else if (variants.length > 1) {
          // Producto con múltiples variantes
          variants.forEach((variant: any) => {
            // Verificar si la variante está marcada para cotizar
            const isVariantQuoted =
              variantQuotationState[product.id]?.[variant.id] !== false;
            if (isVariantQuoted) {
              totalExpress += Number(variant.express) || 0;
              totalPrice +=
                (Number(variant.price) || 0) * (Number(variant.quantity) || 0);
            }
          });
        }
      }
    });

    return { totalCBM, totalWeight, totalExpress, totalPrice };
  };

  const { totalCBM, totalWeight, totalExpress, totalPrice } =
    calculateDynamicTotals();
  const totalGeneral = totalPrice + totalExpress;
  //* Calcular IGV de los servicios
  const igvServices = subtotalServices * 0.18;
  const totalServices = subtotalServices + igvServices;

  //* Función para verificar si se deben exonerar impuestos automáticamente
  const shouldExemptTaxes = dynamicValues.comercialValue < 200;

  //* Función para manejar cambios en el estado de exoneración
  const handleExemptionChange = (
    field: keyof typeof exemptionState,
    checked: boolean
  ) => {
    setExemptionState((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  //* Función para aplicar exoneración a un valor
  const applyExemption = (value: number, isExempted: boolean) => {
    return isExempted ? 0 : value;
  };

  //* Cálculos de obligaciones fiscales
  const adValorem = cif * (dynamicValues.adValoremRate / 100);

  // Para servicios marítimos
  const antidumping = isMaritimeService(selectedServiceLogistic)
    ? dynamicValues.antidumpingGobierno * dynamicValues.antidumpingCantidad
    : 0;

  const isc = isMaritimeService(selectedServiceLogistic)
    ? (cif + adValorem) * (dynamicValues.iscRate / 100)
    : 0;

  const baseIgvIpm = isMaritimeService(selectedServiceLogistic)
    ? cif + adValorem + antidumping + isc
    : cif + adValorem;

  const igvFiscal = baseIgvIpm * (dynamicValues.igvRate / 100);
  const ipm = baseIgvIpm * (dynamicValues.ipmRate / 100);

  const percepcion = isMaritimeService(selectedServiceLogistic)
    ? (cif + adValorem + antidumping + isc + igvFiscal + ipm) *
      (dynamicValues.percepcionRate / 100)
    : 0;

  const totalDerechosDolares = isMaritimeService(selectedServiceLogistic)
    ? adValorem + antidumping + isc + igvFiscal + ipm + percepcion
    : adValorem + igvFiscal + ipm;

  const totalDerechosSoles = totalDerechosDolares * dynamicValues.tipoCambio;

  //* Cálculos de gastos de importación con lógica de primera compra
  const servicioConsolidadoFinal = isFirstPurchase
    ? 0
    : dynamicValues.servicioConsolidado * 1.18;
  const separacionCargaFinal = isFirstPurchase
    ? 0
    : dynamicValues.separacionCarga * 1.18;
  const inspeccionProductosFinal = isFirstPurchase
    ? 0
    : dynamicValues.inspeccionProductos * 1.18;
  const desaduanajeFleteSaguro =
    dynamicValues.desaduanaje + maritimeFlete + dynamicValues.seguro;

  // Aplicar 50% de descuento a impuestos si es primera compra
  // Aplicar exoneración total si valor comercial < $200 o si está marcado para exoneración
  const totalDerechosDolaresFinal =
    shouldExemptTaxes ||
    exemptionState.obligacionesFiscales ||
    exemptionState.totalDerechos
      ? 0
      : isFirstPurchase
      ? totalDerechosDolares * 0.5
      : totalDerechosDolares;

  // Cálculos específicos para servicios marítimos
  const servicioConsolidadoMaritimoFinal = isMaritimeService(
    selectedServiceLogistic
  )
    ? isFirstPurchase
      ? 0
      : dynamicValues.servicioConsolidado * 1.18
    : 0;

  const gestionCertificadoFinal = isMaritimeService(selectedServiceLogistic)
    ? isFirstPurchase
      ? 0
      : dynamicValues.gestionCertificado * 1.18
    : 0;

  const servicioInspeccionFinal = isMaritimeService(selectedServiceLogistic)
    ? isFirstPurchase
      ? 0
      : (dynamicValues.inspeccionProducto + dynamicValues.inspeccionFabrica) *
        1.18
    : 0;

  const transporteLocalFinal = isMaritimeService(selectedServiceLogistic)
    ? isFirstPurchase
      ? 0
      : dynamicValues.transporteLocal * 1.18
    : 0;

  const totalGastosImportacion = isMaritimeService(selectedServiceLogistic)
    ? applyExemption(
        servicioConsolidadoMaritimoFinal,
        exemptionState.servicioConsolidadoMaritimo
      ) +
      applyExemption(
        gestionCertificadoFinal,
        exemptionState.gestionCertificado
      ) +
      applyExemption(
        servicioInspeccionFinal,
        exemptionState.servicioInspeccion
      ) +
      applyExemption(transporteLocalFinal, exemptionState.transporteLocal) +
      totalDerechosDolaresFinal +
      applyExemption(
        dynamicValues.transporteLocalChinaEnvio,
        exemptionState.transporteLocalChina
      ) +
      applyExemption(
        dynamicValues.transporteLocalClienteEnvio,
        exemptionState.transporteLocalCliente
      )
    : applyExemption(
        servicioConsolidadoFinal,
        exemptionState.servicioConsolidadoAereo
      ) +
      applyExemption(separacionCargaFinal, exemptionState.separacionCarga) +
      applyExemption(
        inspeccionProductosFinal,
        exemptionState.inspeccionProductos
      ) +
      totalDerechosDolaresFinal +
      applyExemption(
        desaduanajeFleteSaguro,
        exemptionState.desaduanajeFleteSaguro
      ) +
      applyExemption(
        dynamicValues.transporteLocalChinaEnvio,
        exemptionState.transporteLocalChina
      ) +
      applyExemption(
        dynamicValues.transporteLocalClienteEnvio,
        exemptionState.transporteLocalCliente
      );

  //* Inversión total
  const inversionTotal = dynamicValues.comercialValue + totalGastosImportacion;

  //* Función para actualizar valores dinámicos
  const updateDynamicValue = (
    key: keyof typeof dynamicValues,
    value: number
  ) => {
    setDynamicValues((prev) => ({ ...prev, [key]: value }));
  };

  //* Función para manejar cambios del valor comercial desde las tablas
  const handleCommercialValueChange = (value: number) => {
    console.log("Estamos en el handleCommercialValueChange", value);
    updateDynamicValue("comercialValue", value);
  };

  //* Función para manejar cambios de primera compra
  const handleFirstPurchaseChange = (checked: boolean) => {
    setIsFirstPurchase(checked);
  };

  //* Función para manejar cambios en los productos de la tabla de costeo unitario
  const handleUnitCostProductsChange = (products: UnitCostProductRow[]) => {
    setEditableUnitCostProducts(products);
  };

  //* Función para manejar cambios en el estado de cotización de productos
  const handleProductQuotationChange = (
    productId: string,
    checked: boolean
  ) => {
    setProductQuotationState((prev) => ({
      ...prev,
      [productId]: checked,
    }));
  };

  //* Función para manejar cambios en el estado de cotización de variantes
  const handleVariantQuotationChange = (
    productId: string,
    variantId: string,
    checked: boolean
  ) => {
    setVariantQuotationState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [variantId]: checked,
      },
    }));
  };

  //* Función para manejar cambios en los productos del tipo "Pendiente"
  const handlePendingProductChange = (
    productId: string,
    field: string,
    value: number | string
  ) => {
    console.log("handlePendingProductChange:", { productId, field, value });

    setEditablePendingProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const updatedProduct = { ...product, [field]: value };

          // Calcular el total: (precioXiaoYi * quantity) + express
          if (
            (field === "priceXiaoYi" ||
              field === "quantity" ||
              field === "express") &&
            typeof value === "number"
          ) {
            updatedProduct.total =
              updatedProduct.priceXiaoYi * updatedProduct.quantity +
              updatedProduct.express;
          }

          return updatedProduct;
        }
        return product;
      })
    );

    // Manejar cambios en variantes para actualizar el estado local
    if (field.startsWith("variant_")) {
      const parts = field.split("_");
      const variantIndex = parseInt(parts[1]);
      const variantField = parts[2];

      setEditableProductsWithVariants((prev) => {
        console.log("handlePendingProductChange - current editableProductsWithVariants:", JSON.stringify(prev, null, 2));
        
        const newState = prev.map((product) => {
          if (product.id === productId || product.productId === productId) {
            console.log("handlePendingProductChange - product before update:", {
              productId: product.productId,
              id: product.id,
              variants: product.variants,
              variantsLength: product.variants?.length
            });

            const updatedVariants = [...(product.variants || [])];
            if (updatedVariants[variantIndex]) {
              updatedVariants[variantIndex] = {
                ...updatedVariants[variantIndex],
                [variantField]: value,
              };
            }

            const updatedProduct = {
              ...product,
              variants: updatedVariants,
            };
            console.log("handlePendingProductChange - updated product (variant change):", updatedProduct);
            return updatedProduct;
          }
          return product;
        });
        
        console.log("handlePendingProductChange - new editableProductsWithVariants state:", JSON.stringify(newState, null, 2));
        return newState;
      });
    } else if (field === "adminComment") {
      // Manejar comentarios del administrador
      setEditableProductsWithVariants((prev) => {
        const newState = prev.map((product) => {
          if (product.id === productId || product.productId === productId) {
            const updatedProduct = {
              ...product,
              adminComment: value as string,
            };
            console.log("handlePendingProductChange - updated product (adminComment):", updatedProduct);
            return updatedProduct;
          }
          return product;
        });
        console.log("handlePendingProductChange - new editableProductsWithVariants state (adminComment):", JSON.stringify(newState, null, 2));
        return newState;
      });
    } else if (["boxes", "cbm", "weight"].includes(field)) {
      // Manejar campos de packing list (boxes, cbm, weight)
      setEditableProductsWithVariants((prev) => {
        const newState = prev.map((product) => {
          if (product.id === productId || product.productId === productId) {
            const updatedProduct = {
              ...product,
              [field]: value,
            };
            console.log("handlePendingProductChange - updated product (packing list):", updatedProduct);
            return updatedProduct;
          }
          return product;
        });
        console.log("handlePendingProductChange - new editableProductsWithVariants state (packing list):", JSON.stringify(newState, null, 2));
        return newState;
      });
    }
  };

  //********llamado a funcion para obtener datos del asesor */
  useEffect(() => {
    const user = obtenerUser();
    if (user) {
      setId_asesor(user?.id_usuario);
      setNombre_asesor(user?.name);
    }
  }, []);

  //* Función para renderizar la tabla de productos
  const renderProductsTable = () => (
    <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Gestión de Productos
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Administre los productos de la cotización con sus variantes y
                configuraciones
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {quotationDetail?.products?.length || 0} productos
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Header con indicadores mejorado */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200/60 rounded-xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Resumen de Cotización
            </h2>
            <p className="text-slate-600 text-sm">
              Información general de la cotización actual
            </p>
          </div>

          {/* Indicadores principales con mejor diseño */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-center justify-center max-w-4xl mx-auto">
            {/* Primer indicador - N° de Items*/}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {quotationDetail?.products?.length || 0}
              </div>
              <div className="text-xs font-medium text-slate-600">
                N° de Items
              </div>
            </div>
            {/* Segundo indicador - N° de Productos */}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {quotationDetail?.products?.length || 0}
              </div>
              <div className="text-xs font-medium text-slate-600">
                N° PRODUCTOS
              </div>
            </div>
            {/* Tercer indicador - CBM Total*/}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {totalCBM.toFixed(2)}
              </div>
              <div className="text-xs font-medium text-slate-600">
                CBM TOTAL
              </div>
            </div>
            {/* Cuarto indicador - Peso Total */}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-slate-800 mb-1">
                {totalWeight.toFixed(1)}
              </div>
              <div className="text-xs font-medium text-slate-600">
                PESO (KG)
              </div>
            </div>
            {/* Quinto indicador - Precio total */}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-emerald-600 mb-1">
                ${totalPrice.toFixed(2)}
              </div>
              <div className="text-xs font-medium text-slate-600">P. TOTAL</div>
            </div>
            {/* Sexto indicador - Express total */}
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-emerald-600 mb-1">
                ${totalExpress.toFixed(2)}
              </div>
              <div className="text-xs font-medium text-slate-600">EXPRESS</div>
            </div>
            {/* Sexto indicador - Express total */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
              <div className="text-xl font-bold text-white mb-1">
                ${totalGeneral.toFixed(2)}
              </div>
              <div className="text-xs font-medium text-emerald-100">TOTAL</div>
            </div>
          </div>
        </div>
      </CardContent>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-16">
                Nro.
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-40">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-600" />
                  Imagen & URL
                </div>
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-72">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-600" />
                  Producto & Variantes
                </div>
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-48">
                <div className="flex items-center gap-2">
                  <ListIcon className="h-4 w-4 text-emerald-600" />
                  Packing List
                </div>
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-52">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-indigo-600" />
                  Manipulación de Carga
                </div>
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-44">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-amber-600" />
                  URL Fantasma
                </div>
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-32">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Precio
                </div>
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-32">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-orange-600" />
                  Express
                </div>
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-40">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Total
                </div>
              </th>
              <th className="text-left p-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-24">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Cotizar
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {editableProductsWithVariants.length > 0
              ? editableProductsWithVariants.map((product, index) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    index={index}
                    quotationDetail={quotationDetail}
                    onProductChange={handlePendingProductChange}
                    editableProducts={editableProductsWithVariants}
                    productQuotationState={productQuotationState}
                    variantQuotationState={variantQuotationState}
                    onProductQuotationChange={handleProductQuotationChange}
                    onVariantQuotationChange={handleVariantQuotationChange}
                  />
                ))
              : quotationDetail?.products?.map((product, index) => (
                  <ProductRow
                    key={product.productId}
                    product={product}
                    index={index}
                    quotationDetail={quotationDetail}
                    onProductChange={handlePendingProductChange}
                    editableProducts={editableProductsWithVariants}
                    productQuotationState={productQuotationState}
                    variantQuotationState={variantQuotationState}
                    onProductQuotationChange={handleProductQuotationChange}
                    onVariantQuotationChange={handleVariantQuotationChange}
                  />
                ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  //* Función para generar el DTO de respuesta según la interfaz QuotationCreateUpdateResponseDTO
  const generateQuotationResponseDTO = () => {
    console.log("generateQuotationResponseDTO - editableProductsWithVariants state:", JSON.stringify(editableProductsWithVariants, null, 2));
    console.log("generateQuotationResponseDTO - selectedServiceLogistic:", selectedServiceLogistic);
    
    // Determinar si es servicio marítimo
    const isMaritime = isMaritimeService(selectedServiceLogistic);

    // Extraer número de días de proformaValidity (ej: "15 días" -> 15)
    const proformaDays = parseInt(selectedProformaVigencia) || 0;

    return {
      quotationInfo: {
        quotationId: selectedQuotationId,
        status: "ANSWERED",
        correlative: quotationDetail?.correlative || "",
        date: quotationDate,
        serviceType: selectedServiceLogistic,
        cargoType: selectedTypeLoad,
        courier: selectedCourier,
        incoterm: selectedIncoterm,
        isFirstPurchase: isFirstPurchase,
        regime: isMaritime ? selectedRegimen : "",
        originCountry: isMaritime ? selectedPaisOrigen : "",
        destinationCountry: isMaritime ? selectedPaisDestino : "",
        customs: isMaritime ? selectedAduana : "",
        originPort: isMaritime ? selectedPuertoSalida : "",
        destinationPort: isMaritime ? selectedPuertoDestino : "",
        serviceTypeDetail: isMaritime ? selectedTipoServicio : "",
        transitTime: isMaritime ? tiempoTransito : 0,
        naviera: isMaritime ? naviera : "",
        proformaValidity: selectedProformaVigencia,
        id_asesor: id_asesor || "",
      },
      calculations: {
        serviceCalculations: {
          serviceFields: {
            servicioConsolidado: serviceFields.servicioConsolidado || 0,
            separacionCarga: serviceFields.separacionCarga || 0,
            inspeccionProductos: serviceFields.inspeccionProductos || 0,
          },
          subtotalServices: subtotalServices,
          igvServices: igvServices,
          totalServices: totalServices,
          fiscalObligations: {
            adValorem: adValorem,
            totalDerechosDolares: totalDerechosDolares,
          },
          importExpenses: {
            servicioConsolidadoFinal: servicioConsolidadoFinal,
            separacionCargaFinal: separacionCargaFinal,
            inspeccionProductosFinal: inspeccionProductosFinal,
            servicioConsolidadoMaritimoFinal: servicioConsolidadoMaritimoFinal,
            gestionCertificadoFinal: gestionCertificadoFinal,
            servicioInspeccionFinal: servicioInspeccionFinal,
            transporteLocalFinal: transporteLocalFinal,
            desaduanajeFleteSaguro: desaduanajeFleteSaguro,
            finalValues: {
              servicioConsolidado: servicioConsolidadoFinal,
              gestionCertificado: gestionCertificadoFinal,
              servicioInspeccion: servicioInspeccionFinal,
              transporteLocal: transporteLocalFinal,
              separacionCarga: separacionCargaFinal,
              inspeccionProductos: inspeccionProductosFinal,
              desaduanajeFleteSaguro: desaduanajeFleteSaguro,
              transporteLocalChina: dynamicValues.transporteLocalChinaEnvio,
              transporteLocalCliente: dynamicValues.transporteLocalClienteEnvio,
            },
            totalGastosImportacion: totalGastosImportacion,
          },
          totals: {
            inversionTotal: inversionTotal,
          },
        },
        exemptions: {
          servicioConsolidadoAereo: exemptionState.servicioConsolidadoAereo,
          servicioConsolidadoMaritimo:
            exemptionState.servicioConsolidadoMaritimo,
          separacionCarga: exemptionState.separacionCarga,
          inspeccionProductos: exemptionState.inspeccionProductos,
          obligacionesFiscales: exemptionState.obligacionesFiscales,
          desaduanajeFleteSaguro: exemptionState.desaduanajeFleteSaguro,
          transporteLocalChina: exemptionState.transporteLocalChina,
          transporteLocalCliente: exemptionState.transporteLocalCliente,
          gestionCertificado: exemptionState.gestionCertificado,
          servicioInspeccion: exemptionState.servicioInspeccion,
          transporteLocal: exemptionState.transporteLocal,
          totalDerechos: exemptionState.totalDerechos,
        },
        dynamicValues: {
          comercialValue: dynamicValues.comercialValue,
          flete: dynamicValues.flete,
          cajas: dynamicValues.cajas,
          desaduanaje: dynamicValues.desaduanaje,
          kg: dynamicValues.kg,
          ton: dynamicValues.ton,
          kv: dynamicValues.kv,
          fob: dynamicValues.fob,
          seguro: dynamicValues.seguro,
          tipoCambio: dynamicValues.tipoCambio,
          nroBultos: dynamicValues.nroBultos,
          volumenCBM: dynamicValues.volumenCBM,
          calculoFlete: dynamicValues.calculoFlete,
          servicioConsolidado: dynamicValues.servicioConsolidado,
          separacionCarga: dynamicValues.separacionCarga,
          inspeccionProductos: dynamicValues.inspeccionProductos,
          gestionCertificado: dynamicValues.gestionCertificado,
          inspeccionProducto: dynamicValues.inspeccionProducto,
          inspeccionFabrica: dynamicValues.inspeccionFabrica,
          transporteLocal: dynamicValues.transporteLocal,
          otrosServicios: dynamicValues.otrosServicios,
          adValoremRate: dynamicValues.adValoremRate,
          antidumpingGobierno: dynamicValues.antidumpingGobierno,
          antidumpingCantidad: dynamicValues.antidumpingCantidad,
          iscRate: dynamicValues.iscRate,
          igvRate: dynamicValues.igvRate,
          ipmRate: dynamicValues.ipmRate,
          percepcionRate: dynamicValues.percepcionRate,
          transporteLocalChinaEnvio: dynamicValues.transporteLocalChinaEnvio,
          transporteLocalClienteEnvio:
            dynamicValues.transporteLocalClienteEnvio,
          cif: cif,
          shouldExemptTaxes: shouldExemptTaxes,
        },
      },
      products:
        quotationDetail?.products?.map((product: any, index: number) => {
          // Para el tipo de servicio "Pendiente", usar editableProductsWithVariants
          // Para otros tipos, usar editableUnitCostProducts
          const isPendingService = selectedServiceLogistic === "Pendiente";
          const editableProduct = isPendingService
            ? editableProductsWithVariants.find((ep) => ep.id === product.productId)
            : editableUnitCostProducts.find((ep) => ep.id === product.productId);

          return {
            productId: product.productId,
            name: product.name,
            adminComment:
              editableProduct?.adminComment || product.adminComment || "",
            seCotizaProducto: productQuotationState[product.productId] !== false,
            variants: (product.variants || []).map((variant: any) => {
              // Buscar la variante editable correspondiente
              const editableVariant = editableProduct?.variants?.find(
                (ev: any) => ev.variantId === variant.variantId || ev.id === variant.variantId
              );

              console.log("Variant matching debug:", {
                productName: product.name,
                variantId: variant.variantId,
                editableProductVariants: editableProduct?.variants?.map((ev: any) => ({
                  evId: ev.id,
                  evVariantId: ev.variantId,
                  evPrice: ev.price,
                  evUnitCost: ev.unitCost,
                  evImportCosts: ev.importCosts,
                  evExpress: ev.express
                })),
                foundEditableVariant: editableVariant ? {
                  price: editableVariant.price,
                  unitCost: editableVariant.unitCost,
                  importCosts: editableVariant.importCosts,
                  express: editableVariant.express
                } : null,
                finalValues: {
                  price: editableVariant?.price || 0,
                  unitCost: editableVariant?.unitCost || 0,
                  importCosts: editableVariant?.importCosts || 0,
                  express: editableVariant?.express || 0
                }
              });

              const quantity = Number(variant.quantity) || 0;
              const express = editableVariant?.express || 0;

              // Para el tipo "Pendiente", usar el precio ingresado por el usuario
              const price = editableVariant?.price || 0;

              console.log("Final values for DTO:", {
                productName: product.name,
                variantId: variant.variantId,
                price,
                unitCost: editableVariant?.unitCost || 0,
                importCosts: editableVariant?.importCosts || 0,
                express
              });

              return {
                variantId: variant.variantId,
                size: variant.size || "N/A",
                presentation: variant.presentation || "Unidad",
                model: variant.model || "",
                color: variant.color || "",
                quantity: quantity,
                price: price,
                unitCost: editableVariant?.unitCost || 0,
                importCosts: editableVariant?.importCosts || 0,
                seCotizaVariante:
                  variantQuotationState[product.productId]?.[variant.variantId] !== false,
              };
            }),
          };
        }) || [],
    };
  };

  //* Función para enviar la respuesta al backend usando el hook
  const handleSaveResponse = async () => {
    try {
      // Mostrar modal de envío
      setIsSendingModalOpen(true);

      const dto = generateQuotationResponseDTO();

      console.log(
        "Enviando respuesta al backend:",
        JSON.stringify(dto, null, 2)
      );

      console.log("Estado de productos editables:", {
        editableProductsWithVariants: editableProductsWithVariants.map(p => ({
          id: p.id,
          name: p.name,
          variants: p.variants?.map((v: any) => ({
            id: v.id,
            variantId: v.variantId,
            price: v.price,
            unitCost: v.unitCost,
            importCosts: v.importCosts,
            express: v.express
          }))
        })),
        editableUnitCostProducts,
        selectedServiceLogistic,
      });

      // Llamada al backend usando el hook
      await createQuotationResponseMutation.mutateAsync({
        data: dto,
        quotationId: selectedQuotationId,
      });

      // Notificar y regresar a listado
      // Usamos toast del sistema de notificaciones (ya importado en hooks) o un alert simple
      console.log("Respuesta enviada correctamente");
      window.history.back();
    } catch (error) {
      console.error("Error al guardar la respuesta:", error);
    } finally {
      // El modal se cerrará automáticamente después del progreso
      setIsSendingModalOpen(false);
    }
  };

  //* Obtener fecha actual de hoy
  useEffect(() => {
    const today = new Date();
    setQuotationDate(formatDate(today.toISOString()));
  }, []);

  //* Inicializar productos de la tabla de costeo unitario cuando se cargan los datos
  useEffect(() => {
    if (quotationDetail?.products && editableUnitCostProducts.length === 0) {
      console.log(
        "quotationDetail.products",
        JSON.stringify(quotationDetail.products, null, 2)
      );
      const initialProducts = quotationDetail.products.map((product: any) => ({
        id: product.productId,
        name: product.name,
        price: 0,
        quantity: Number(product.quantity) || 0,
        total: 0,
        equivalence: 0,
        importCosts: 0,
        totalCost: 0,
        unitCost: 0,
        seCotiza: true, // Por defecto todos los productos se cotizan
        // Incluir variantes si existen
        variants:
          product.variants?.map((variant: any) => ({
            id: variant.variantId,
            name: variant.name,
            price: 0,
            quantity: Number(variant.quantity) || 0,
            total: 0,
            equivalence: 0,
            importCosts: 0,
            totalCost: 0,
            unitCost: 0,
            seCotiza: true, // Por defecto todas las variantes se cotizan
          })) || [],
      }));
      setEditableUnitCostProducts(initialProducts);
    }
  }, [quotationDetail, editableUnitCostProducts.length]);

  //* Inicializar productos editables del tipo "Pendiente"
  useEffect(() => {
    if (quotationDetail?.products && editablePendingProducts.length === 0) {
      const initialPendingProducts = quotationDetail.products.map(
        (product) => ({
          id: product.productId,
          name: product.name,
          quantity: product.quantity || 0,
          boxes: product.quantity || 0,
          priceXiaoYi: 0,
          cbmTotal: 0,
          express: 0,
          total: 0,
          cbm: Number(product.volume) || 0,
          weight: Number(product.weight) || 0,
          price: 0,
        })
      );
      setEditablePendingProducts(initialPendingProducts);
    }
  }, [quotationDetail, editablePendingProducts.length]);

  //* Inicializar productos con variantes editables
  useEffect(() => {
    if (
      quotationDetail?.products &&
      editableProductsWithVariants.length === 0
    ) {
      const initialProductsWithVariants = quotationDetail.products.map(
        (product: any) => ({
          ...product,
          id: product.productId, // Explicitly set id for consistency
          adminComment: product.adminComment || "",
          // Agregar campos necesarios para la tabla
          boxes: product.quantity || 0,
          cbm: Number(product.volume) || 0,
          weight: Number(product.weight) || 0,
          variants:
            product.variants?.map((variant: any) => ({
              ...variant,
              variantId: variant.variantId || variant.id,
              price: variant.price || 0,
              express: variant.express || 0,
              unitCost: variant.unitCost || 0,
              importCosts: variant.importCosts || 0,
            })) || [],
        })
      );
      setEditableProductsWithVariants(initialProductsWithVariants);

      // Inicializar estados de cotización
      const initialProductQuotationState: Record<string, boolean> = {};
      const initialVariantQuotationState: Record<
        string,
        Record<string, boolean>
      > = {};

      quotationDetail.products.forEach((product: any) => {
        // Por defecto, todos los productos se cotizan
        initialProductQuotationState[product.productId] = true;

        // Inicializar estado de cotización para variantes
        if (product.variants && product.variants.length > 0) {
          initialVariantQuotationState[product.productId] = {};
          product.variants.forEach((variant: any) => {
            // Por defecto, todas las variantes se cotizan
            initialVariantQuotationState[product.productId][variant.variantId] = true;
          });
        }
      });

      setProductQuotationState(initialProductQuotationState);
      setVariantQuotationState(initialVariantQuotationState);
    }
  }, [quotationDetail, editableProductsWithVariants.length]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 min-h-screen">
      {/* Header Principal */}
      <div className="relative h-full w-full grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          {/* Header con información de la cotización */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
                <PackageIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Cotización {quotationDetail?.correlative || "EJEMPLO-001"}
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Gestión de respuesta y configuración de servicios
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {selectedServiceLogistic === "Pendiente"
                  ? "Vista Administrativa"
                  : "Vista Completa"}
              </Badge>
            </div>
          </div>

          <div className="w-full">
            {selectedServiceLogistic === "Pendiente" ? (
              <div className="space-y-8">
                {/* Sección de Información del Cliente - Homologada */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Información del Cliente */}
                  <div className="xl:col-span-2">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl text-green-800">
                          <FileText className="h-6 w-6" />
                          Información del Cliente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                          <div className="space-y-4">
                            {/* Nombres */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="nombre_cliente"
                                className="text-sm font-semibold text-gray-700"
                              >
                                Nombres
                              </Label>
                              <Input
                                id="nombre_cliente"
                                className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Ingrese nombres"
                              />
                            </div>
                            {/* Apellidos */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="apellidos_cliente"
                                className="text-sm font-semibold text-gray-700"
                              >
                                Apellidos
                              </Label>
                              <Input
                                id="apellidos_cliente"
                                className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Ingrese apellidos"
                              />
                            </div>
                            {/* DNI */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="dni_cliente"
                                className="text-sm font-semibold text-gray-700"
                              >
                                DNI
                              </Label>
                              <Input
                                id="dni_cliente"
                                className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="12345678"
                              />
                            </div>
                            {/* Razón Social */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="razon_social_cliente"
                                className="text-sm font-semibold text-gray-700"
                              >
                                Razón Social
                              </Label>
                              <Input
                                id="razon_social_cliente"
                                className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Empresa S.A.C."
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            {/* RUC */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="ruc_cliente"
                                className="text-sm font-semibold text-gray-700"
                              >
                                RUC
                              </Label>
                              <Input
                                id="ruc_cliente"
                                className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="20123456789"
                              />
                            </div>
                            {/* Contacto */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="contacto_cliente"
                                className="text-sm font-semibold text-gray-700"
                              >
                                Contacto
                              </Label>
                              <Input
                                id="contacto_cliente"
                                className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="+51 999 999 999"
                              />
                            </div>
                            {/* Asesor */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="advisor"
                                className="text-sm font-semibold text-gray-700"
                              >
                                Asesor(a)
                              </Label>
                              <Input
                                id="advisor"
                                value={nombre_asesor || ""}
                                readOnly
                                className="font-medium bg-gray-50 border-gray-300"
                              />
                            </div>
                            {/* Fecha de Respuesta */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="date"
                                className="text-sm font-semibold text-gray-700"
                              >
                                Fecha de Respuesta
                              </Label>
                              <Input
                                id="date"
                                value={quotationDate}
                                readOnly
                                className="font-medium bg-gray-50 border-gray-300"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Panel de información del admin mejorado */}
                  <div className="xl:col-span-1">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                          <User className="h-5 w-5" />
                          Panel Administrativo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
                          <div className="text-blue-700 text-sm font-medium mb-3">
                            💡 El administrador puede editar y agregar más
                            productos si el cliente desea mejorar la cotización
                          </div>
                          <div className="text-amber-600 text-sm font-medium mb-3">
                            ⚠️ Solo aplica para productos individuales
                          </div>
                          <div className="text-green-600 text-sm font-bold">
                            👨‍💼 Vista Administrativa
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="service"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Tipo de Servicio
                          </Label>
                          <Select
                            value={selectedServiceLogistic}
                            onValueChange={setSelectedServiceLogistic}
                          >
                            <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {serviciosLogisticos.map((servicio) => (
                                <SelectItem
                                  key={servicio.value}
                                  value={servicio.value}
                                >
                                  {servicio.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Tabla de productos mejorada */}
                {renderProductsTable()}
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  {/* Sección de Información del Cliente - Homologada */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Información del Cliente */}
                    <div className="xl:col-span-2">
                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-xl text-green-800">
                            <FileText className="h-6 w-6" />
                            Información del Cliente
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            <div className="space-y-4">
                              {/* Nombre  */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor="nombre_cliente"
                                  className="text-sm font-semibold text-gray-700"
                                >
                                  Nombres
                                </Label>
                                <Input
                                  id="nombre_cliente"
                                  className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Ingrese nombres"
                                />
                              </div>
                              {/* Apellido */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor="apellidos_cliente"
                                  className="text-sm font-semibold text-gray-700"
                                >
                                  Apellidos
                                </Label>
                                <Input
                                  id="apellidos_cliente"
                                  className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Ingrese apellidos"
                                />
                              </div>
                              {/* DNI */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor="dni_cliente"
                                  className="text-sm font-semibold text-gray-700"
                                >
                                  DNI
                                </Label>
                                <Input
                                  id="dni_cliente"
                                  className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="12345678"
                                />
                              </div>
                              {/* Razón Social */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor="razon_social_cliente"
                                  className="text-sm font-semibold text-gray-700"
                                >
                                  Razón Social
                                </Label>
                                <Input
                                  id="razon_social_cliente"
                                  className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Empresa S.A.C."
                                />
                              </div>
                            </div>
                            <div className="space-y-4">
                              {/* RUC */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor="ruc_cliente"
                                  className="text-sm font-semibold text-gray-700"
                                >
                                  RUC
                                </Label>
                                <Input
                                  id="ruc_cliente"
                                  className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="20123456789"
                                />
                              </div>
                              {/* Contacto */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor="contacto_cliente"
                                  className="text-sm font-semibold text-gray-700"
                                >
                                  Contacto
                                </Label>
                                <Input
                                  id="contacto_cliente"
                                  className="font-medium border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="+51 999 999 999"
                                />
                              </div>
                              {/* Asesor */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor="advisor"
                                  className="text-sm font-semibold text-gray-700"
                                >
                                  Asesor(a)
                                </Label>
                                <Input
                                  id="advisor"
                                  value={nombre_asesor || ""}
                                  readOnly
                                  className="font-medium bg-gray-50 border-gray-300"
                                />
                              </div>
                              {/* Fecha de Respuesta */}
                              <div className="space-y-2">
                                <Label
                                  htmlFor="date"
                                  className="text-sm font-semibold text-gray-700"
                                >
                                  Fecha de Respuesta
                                </Label>
                                <Input
                                  id="date"
                                  value={quotationDate}
                                  readOnly
                                  className="font-medium bg-gray-50 border-gray-300"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Panel de configuración de servicio */}
                    <div className="xl:col-span-1">
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                            <Settings className="h-5 w-5" />
                            Configuración de Servicio
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
                            <div className="text-blue-700 text-sm font-medium mb-3">
                              ⚙️ Configure los parámetros del servicio logístico
                            </div>
                            <div className="text-emerald-600 text-sm font-medium mb-3">
                              📊 Vista completa con todos los cálculos
                            </div>
                            <div className="text-purple-600 text-sm font-bold">
                              🚢 Servicios Aéreos y Marítimos
                            </div>
                          </div>

                          {/* Tipo de Servicio */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="service"
                              className="text-sm font-semibold text-gray-700"
                            >
                              Tipo de Servicio
                            </Label>
                            <Select
                              value={selectedServiceLogistic}
                              onValueChange={setSelectedServiceLogistic}
                            >
                              <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {serviciosLogisticos.map((servicio) => (
                                  <SelectItem
                                    key={servicio.value}
                                    value={servicio.value}
                                  >
                                    {servicio.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Segunda columna */}
                  <div className="space-y-6 gap-4 grid grid-cols-1 lg:grid-cols-2">
                    {/* Detalles de Carga */}
                    <Card className="shadow-lg border-1 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-green-200 rounded-lg">
                            <Package className="h-6 w-6 text-green-700" />
                          </div>
                          <div>
                            <div>Detalles de Carga</div>
                            <div className="text-sm font-normal text-green-700">
                              Información de la mercancía
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        {/* Tipo de Carga */}
                        <div className="flex items-center gap-2 mb-4">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            CARGA
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Especificaciones de la mercancía
                          </span>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                          {/* Tipo de Carga */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="cargoType"
                              className="text-sm font-medium text-gray-700"
                            >
                              Tipo de Carga
                            </Label>
                            <Select
                              value={selectedTypeLoad}
                              onValueChange={setSelectedTypeLoad}
                            >
                              <SelectTrigger className="w-full bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white w-full h-full">
                                {(isMaritimeService(selectedServiceLogistic)
                                  ? typeLoadMaritime
                                  : typeLoad
                                ).map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Valor Comercial */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="commercialValue"
                              className="text-sm font-medium text-gray-700"
                            >
                              Valor Comercial
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                id="commercialValue"
                                value={Number(
                                  dynamicValues.comercialValue.toFixed(2)
                                )}
                                onChange={(e) =>
                                  updateDynamicValue(
                                    "comercialValue",
                                    Number(e.target.value)
                                  )
                                }
                                className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
                                placeholder="0"
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                USD
                              </span>
                            </div>
                          </div>
                          {/* Nro Bultos */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="boxes"
                              className="text-sm font-medium text-gray-700"
                            >
                              {isMaritimeService(selectedServiceLogistic)
                                ? "Nro Bultos"
                                : "Cajas"}
                            </Label>
                            <Input
                              type="number"
                              id="boxes"
                              value={
                                isMaritimeService(selectedServiceLogistic)
                                  ? dynamicValues.nroBultos
                                  : dynamicValues.cajas
                              }
                              onChange={(e) =>
                                updateDynamicValue(
                                  isMaritimeService(selectedServiceLogistic)
                                    ? "nroBultos"
                                    : "cajas",
                                  Number(e.target.value)
                                )
                              }
                              className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                          {/* Peso (KG) */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="kg"
                              className="text-sm font-medium text-gray-700"
                            >
                              Peso (KG)
                            </Label>
                            <Input
                              type="number"
                              id="kg"
                              value={dynamicValues.kg}
                              onChange={(e) =>
                                handleKgChange(Number(e.target.value))
                              }
                              className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
                              placeholder="0"
                            />
                          </div>
                          {/* Peso (TON) */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="ton"
                              className="text-sm font-medium text-gray-700"
                            >
                              Peso (TON)
                            </Label>
                            <Input
                              type="number"
                              id="ton"
                              value={dynamicValues.ton}
                              onChange={(e) =>
                                isMaritimeService(selectedServiceLogistic)
                                  ? () => {}
                                  : updateDynamicValue(
                                      "ton",
                                      Number(e.target.value)
                                    )
                              }
                              className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
                              placeholder="0"
                            />
                          </div>
                          {/* K/V */}
                          {!isMaritimeService(selectedServiceLogistic) && (
                            <div className="space-y-2">
                              <Label
                                htmlFor="kv"
                                className="text-sm font-medium text-gray-700"
                              >
                                K/V
                              </Label>
                              <Input
                                type="number"
                                id="kv"
                                value={dynamicValues.kv}
                                onChange={(e) =>
                                  updateDynamicValue(
                                    "kv",
                                    Number(e.target.value)
                                  )
                                }
                                className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
                                placeholder="0"
                              />
                            </div>
                          )}
                          {/* Volumen (CBM) */}
                          {isMaritimeService(selectedServiceLogistic) && (
                            <div className="space-y-2">
                              <Label
                                htmlFor="volumenCBM"
                                className="text-sm font-medium text-gray-700"
                              >
                                Volumen (CBM)
                              </Label>
                              <Input
                                type="number"
                                id="volumenCBM"
                                value={dynamicValues.volumenCBM}
                                onChange={(e) =>
                                  updateDynamicValue(
                                    "volumenCBM",
                                    Number(e.target.value)
                                  )
                                }
                                className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors"
                                placeholder="0"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <div className="space-y-2">
                            {/* Regimen */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div className="space-y-2">
                                <Label
                                  htmlFor="regimen"
                                  className="text-sm font-medium text-gray-700"
                                >
                                  Régimen
                                </Label>
                                <Select
                                  value={selectedRegimen}
                                  onValueChange={setSelectedRegimen}
                                >
                                  <SelectTrigger className="w-full bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {regimenOptions.map((regimen) => (
                                      <SelectItem
                                        key={regimen.value}
                                        value={regimen.value}
                                      >
                                        {regimen.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Pais de Origen */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div className="space-y-2">
                                <Label
                                  htmlFor="paisOrigen"
                                  className="text-sm font-medium text-gray-700"
                                >
                                  País de Origen
                                </Label>
                                <Select
                                  value={selectedPaisOrigen}
                                  onValueChange={setSelectedPaisOrigen}
                                >
                                  <SelectTrigger className="w-full bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {paisesOrigen.map((pais) => (
                                      <SelectItem
                                        key={pais.value}
                                        value={pais.value}
                                      >
                                        {pais.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Pais de Destino */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div className="space-y-2">
                                <Label
                                  htmlFor="paisDestino"
                                  className="text-sm font-medium text-gray-700"
                                >
                                  País de Destino
                                </Label>
                                <Select
                                  value={selectedPaisDestino}
                                  onValueChange={setSelectedPaisDestino}
                                >
                                  <SelectTrigger className="w-full bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {paisesDestino.map((pais) => (
                                      <SelectItem
                                        key={pais.value}
                                        value={pais.value}
                                      >
                                        {pais.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Aduana */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div className="space-y-2">
                                <Label
                                  htmlFor="aduana"
                                  className="text-sm font-medium text-gray-700"
                                >
                                  Aduana
                                </Label>
                                <Select
                                  value={selectedAduana}
                                  onValueChange={setSelectedAduana}
                                >
                                  <SelectTrigger className="w-full bg-white border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {aduana.map((aduan) => (
                                      <SelectItem
                                        key={aduan.value}
                                        value={aduan.value}
                                      >
                                        {aduan.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Naviera */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="naviera">Naviera</Label>
                                <Input
                                  id="naviera"
                                  value={naviera}
                                  onChange={(e) => setNaviera(e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {/* Puerto de salida */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="puertoSalida">
                                  Puerto de Salida
                                </Label>
                                <Select
                                  value={selectedPuertoSalida}
                                  onValueChange={setSelectedPuertoSalida}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white w-full h-full">
                                    {puertosSalida.map((puerto) => (
                                      <SelectItem
                                        key={puerto.value}
                                        value={puerto.value}
                                      >
                                        {puerto.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Puerto de destino */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="puertoDestino">
                                  Puerto de Destino
                                </Label>
                                <Select
                                  value={selectedPuertoDestino}
                                  onValueChange={setSelectedPuertoDestino}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {puertosDestino.map((puerto) => (
                                      <SelectItem
                                        key={puerto.value}
                                        value={puerto.value}
                                      >
                                        {puerto.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* T. Servicio */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="tipoServicio">
                                  T. Servicio
                                </Label>
                                <Select
                                  value={selectedTipoServicio}
                                  onValueChange={setSelectedTipoServicio}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tipoServicio.map((tipo) => (
                                      <SelectItem
                                        key={tipo.value}
                                        value={tipo.value}
                                      >
                                        {tipo.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Tiempo Transito */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="tiempoTransito">
                                  T. Tránsito
                                </Label>
                                <Input
                                  type="number"
                                  id="tiempoTransito"
                                  value={tiempoTransito}
                                  onChange={(e) =>
                                    setTiempoTransito(Number(e.target.value))
                                  }
                                  className="text-center font-semibold px-3 py-1 w-full h-9 text-sm"
                                  placeholder="0"
                                />
                              </div>
                            )}

                            {/* Proforma Vigencia */}
                            {isMaritimeService(selectedServiceLogistic) && (
                              <div>
                                <Label htmlFor="proformaVigencia">
                                  Proforma Vigencia
                                </Label>
                                <Select
                                  value={selectedProformaVigencia}
                                  onValueChange={setSelectedProformaVigencia}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {proformaVigencia.map((vigencia) => (
                                      <SelectItem
                                        key={vigencia.value}
                                        value={vigencia.value}
                                      >
                                        {vigencia.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Primera Compra */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="firstPurchase"
                              checked={isFirstPurchase}
                              onCheckedChange={handleFirstPurchaseChange}
                            />
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700"
                            >
                              Es Primera Compra
                            </Badge>
                            {isFirstPurchase && (
                              <span className="text-xs text-green-600 font-semibold ml-2">
                                (Servicios exonerados y 50% descuento en
                                impuestos)
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Shipping Details */}
                    <Card className="shadow-lg border-1 bg-gradient-to-br border-purple-200 from-purple-50 to-indigo-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-bold">
                          <div className="p-2 bg-purple-200 rounded-lg">
                            <Truck className="h-6 w-6 text-purple-700" />
                          </div>
                          <div>
                            <div>Detalles de Envío</div>
                            <div className="text-sm font-normal text-purple-700">
                              Información logística
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 border-purple-200"
                          >
                            ENVÍO
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Configuración logística
                          </span>
                        </div>

                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          {/* Primera columna */}
                          <div className="space-y-3">
                            {/* Courier */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="courier"
                                className="text-sm font-medium text-gray-700"
                              >
                                Courier
                              </Label>
                              <Select
                                value={selectedCourier}
                                onValueChange={setSelectedCourier}
                              >
                                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white w-full h-full">
                                  {courier.map((courierOption) => (
                                    <SelectItem
                                      key={courierOption.value}
                                      value={courierOption.value}
                                    >
                                      {courierOption.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Incoterm */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="incoterm"
                                className="text-sm font-medium text-gray-700"
                              >
                                Incoterm
                              </Label>
                              <Select
                                value={selectedIncoterm}
                                onValueChange={setSelectedIncoterm}
                              >
                                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {incotermsOptions.map((incoterm) => (
                                    <SelectItem
                                      key={incoterm.value}
                                      value={incoterm.value}
                                    >
                                      {incoterm.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Flete / Cálculo Flete */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="freight"
                                className="text-sm font-medium text-gray-700"
                              >
                                {isMaritimeService(selectedServiceLogistic)
                                  ? "Cálculo Flete"
                                  : "Flete"}
                              </Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  id="freight"
                                  value={
                                    isMaritimeService(selectedServiceLogistic)
                                      ? dynamicValues.calculoFlete
                                      : dynamicValues.flete
                                  }
                                  onChange={(e) =>
                                    updateDynamicValue(
                                      isMaritimeService(selectedServiceLogistic)
                                        ? "calculoFlete"
                                        : "flete",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                  placeholder="0"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                  USD
                                </span>
                              </div>
                            </div>
                            {/* Desaduanaje */}

                            {!isMaritimeService(selectedServiceLogistic) && (
                              <div className="space-y-2">
                                <Label
                                  htmlFor="customs"
                                  className="text-sm font-medium text-gray-700"
                                >
                                  Desaduanaje
                                </Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    id="customs"
                                    value={dynamicValues.desaduanaje}
                                    onChange={(e) =>
                                      updateDynamicValue(
                                        "desaduanaje",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                    placeholder="0"
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                    USD
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Moneda */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="currency"
                                className="text-sm font-medium text-gray-700"
                              >
                                Moneda
                              </Label>
                              <Select defaultValue="usd">
                                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="usd">DÓLARES</SelectItem>
                                  <SelectItem value="pen">SOLES</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Tipo de Cambio */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="exchangeRate"
                                className="text-sm font-medium text-gray-700"
                              >
                                Tipo de Cambio
                              </Label>
                              <Input
                                type="number"
                                id="exchangeRate"
                                value={dynamicValues.tipoCambio}
                                onChange={(e) =>
                                  updateDynamicValue(
                                    "tipoCambio",
                                    Number(e.target.value)
                                  )
                                }
                                className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Tercera columna */}
                          <div className="space-y-2">
                            {/* Servicio de Carga Consolidada */}

                            <div className="grid grid-cols-2 gap-4 text-sm justify-between items-center py-2">
                              <div className="flex flex-col gap-2">
                                <Label
                                  htmlFor="transporteLocalChina"
                                  className="text-sm font-medium text-gray-700"
                                >
                                  Transporte Local China
                                </Label>
                                <Input
                                  type="number"
                                  id="transporteLocalChina"
                                  value={
                                    dynamicValues.transporteLocalChinaEnvio
                                  }
                                  onChange={(e) =>
                                    updateDynamicValue(
                                      "transporteLocalChinaEnvio",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                  placeholder="0"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label
                                  htmlFor="transporteLocalCliente"
                                  className="text-sm font-medium text-gray-700"
                                >
                                  Transporte Local Cliente
                                </Label>
                                <Input
                                  type="number"
                                  id="transporteLocalCliente"
                                  value={
                                    dynamicValues.transporteLocalClienteEnvio
                                  }
                                  onChange={(e) =>
                                    updateDynamicValue(
                                      "transporteLocalClienteEnvio",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                              {/* FOB */}
                              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-200">
                                <div className="font-medium text-gray-900">
                                  FOB
                                </div>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    id="fob"
                                    value={dynamicValues.fob}
                                    onChange={(e) =>
                                      updateDynamicValue(
                                        "fob" as keyof typeof dynamicValues,
                                        Number(e.target.value)
                                      )
                                    }
                                    className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                    placeholder="0"
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                    USD
                                  </span>
                                </div>
                              </div>
                              {/* Flete */}
                              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-200">
                                <div className="font-medium text-gray-900">
                                  FLETE
                                </div>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    id="flete"
                                    value={
                                      isMaritimeService(selectedServiceLogistic)
                                        ? maritimeFlete
                                        : dynamicValues.flete
                                    }
                                    onChange={(e) =>
                                      updateDynamicValue(
                                        isMaritimeService(
                                          selectedServiceLogistic
                                        )
                                          ? "calculoFlete"
                                          : "flete",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                    placeholder="0"
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                    USD
                                  </span>
                                </div>
                              </div>
                              {/* Seguro */}
                              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-purple-200 transition-all duration-200">
                                <div className="font-medium text-gray-900">
                                  SEGURO
                                </div>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    id="seguro"
                                    value={dynamicValues.seguro}
                                    onChange={(e) =>
                                      updateDynamicValue(
                                        "seguro" as keyof typeof dynamicValues,
                                        Number(e.target.value)
                                      )
                                    }
                                    className="text-center font-semibold px-3 py-2 w-full h-10 text-sm bg-white border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                                    placeholder="0"
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                                    USD
                                  </span>
                                </div>
                              </div>

                              <Separator />

                              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-200 to-emerald-200 text-green-900 rounded-lg shadow-md">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-green-300 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-green-800" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-lg">CIF</div>
                                    <div className="text-sm opacity-90">
                                      Costo, Seguro y Flete
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-2xl">
                                    USD {cif.toFixed(2)}
                                  </div>
                                  <div className="text-sm opacity-90">
                                    Total CIF
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-6 p-6 bg-white grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Servicio de Carga Consolidada */}
                  <div className="space-y-4">
                    <ServiceConsolidationCard
                      title={getServiceName(selectedServiceLogistic)}
                      serviceFields={
                        Object.fromEntries(
                          Object.entries(
                            getServiceFields(selectedServiceLogistic)
                          ).map(([k, v]) => [k, v ?? 0])
                        ) as Record<string, number>
                      }
                      updateDynamicValue={(key, v) =>
                        updateDynamicValue(key as keyof typeof dynamicValues, v)
                      }
                      igvServices={igvServices}
                      totalServices={totalServices}
                    />
                  </div>
                  <div className="space-y-4">
                    {/* Tax Obligations */}
                    <TaxObligationsCard
                      adValoremRate={dynamicValues.adValoremRate}
                      setAdValoremRate={(v) =>
                        updateDynamicValue("adValoremRate", v)
                      }
                      igvRate={dynamicValues.igvRate}
                      setIgvRate={(v) => updateDynamicValue("igvRate", v)}
                      ipmRate={dynamicValues.ipmRate}
                      setIpmRate={(v) => updateDynamicValue("ipmRate", v)}
                      isMaritime={isMaritimeService(selectedServiceLogistic)}
                      antidumpingGobierno={dynamicValues.antidumpingGobierno}
                      setAntidumpingGobierno={(v) =>
                        updateDynamicValue("antidumpingGobierno", v)
                      }
                      antidumpingCantidad={dynamicValues.antidumpingCantidad}
                      setAntidumpingCantidad={(v) =>
                        updateDynamicValue("antidumpingCantidad", v)
                      }
                      iscRate={dynamicValues.iscRate}
                      setIscRate={(v) => updateDynamicValue("iscRate", v)}
                      values={{
                        adValorem,
                        igvFiscal,
                        ipm,
                        isc,
                        percepcion,
                        totalDerechosDolares,
                        totalDerechosSoles,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-6 p-6 bg-white">
                  {/* Segunda sección - Gastos de Importación */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Import Expenses */}
                    <ImportExpensesCard
                      isMaritime={isMaritimeService(selectedServiceLogistic)}
                      values={{
                        servicioConsolidadoMaritimoFinal,
                        gestionCertificadoFinal,
                        servicioInspeccionFinal,
                        transporteLocalFinal,
                        totalDerechosDolaresFinal,
                        desaduanajeFleteSaguro,
                        transporteLocalChinaEnvio:
                          dynamicValues.transporteLocalChinaEnvio,
                        transporteLocalClienteEnvio:
                          dynamicValues.transporteLocalClienteEnvio,
                      }}
                      exemptionState={
                        exemptionState as unknown as Record<string, boolean>
                      }
                      handleExemptionChange={(f, c) =>
                        handleExemptionChange(f as any, c)
                      }
                      applyExemption={applyExemption}
                      servicioConsolidadoFinal={servicioConsolidadoFinal}
                      separacionCargaFinal={separacionCargaFinal}
                      inspeccionProductosFinal={inspeccionProductosFinal}
                      shouldExemptTaxes={shouldExemptTaxes}
                      totalGastosImportacion={totalGastosImportacion}
                    />

                    {/* Resumen de Gastos de Importación */}
                    <ImportSummaryCard
                      selectedIncoterm={selectedIncoterm}
                      comercialValue={dynamicValues.comercialValue}
                      totalGastosImportacion={totalGastosImportacion}
                      inversionTotal={inversionTotal}
                      shouldExemptTaxes={shouldExemptTaxes}
                    />
                  </div>
                </div>

                {/* Sección de Costeo Unitario integrada en la misma vista */}
                <div className="min-h-screen">
                  <div className="grid grid-cols-1 gap-6">
                    <EditableUnitCostTable
                      initialProducts={editableUnitCostProducts}
                      totalImportCosts={totalGastosImportacion}
                      onCommercialValueChange={handleCommercialValueChange}
                      isFirstPurchase={isFirstPurchase}
                      onProductsChange={handleUnitCostProductsChange}
                      productQuotationState={productQuotationState}
                      variantQuotationState={variantQuotationState}
                      onProductQuotationChange={handleProductQuotationChange}
                      onVariantQuotationChange={handleVariantQuotationChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <div className="flex gap-3">
              {/* Botón Enviar */}
              <div className="flex justify-end ">
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isLoading}
                      className="bg-orange-500 hover:bg-orange-600  text-white px-8 py-2 rounded-sm shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      Enviar
                    </Button>
                  }
                  title="Confirmar envío de cotización"
                  description={`¿Está seguro de enviar la cotización?`}
                  confirmText="Enviar"
                  cancelText="Cancelar"
                  onConfirm={handleSaveResponse}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de carga */}
      <SendingModal
        isOpen={isSendingModalOpen}
        onClose={() => setIsSendingModalOpen(false)}
      />
    </div>
  );
};

export default DetailsResponse;
