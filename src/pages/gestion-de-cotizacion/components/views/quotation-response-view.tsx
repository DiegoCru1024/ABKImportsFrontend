import { useState, useEffect, useMemo, useCallback } from "react";
import { FileText, Send, Loader2 } from "lucide-react";

import { useGetQuotationById } from "@/hooks/use-quation";
import { useCreateQuatitationResponse } from "@/hooks/use-quatitation-response";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import SendingModal from "@/components/sending-modal";

import { QuotationSummaryCard } from "../forms/quotation-summary-card";
import { QuotationConfigurationForm } from "../forms/quotation-configuration-form";
import { MaritimeServiceForm } from "../forms/maritime-service-form";
import { UnifiedConfigurationForm } from "../forms/unified-configuration-form";

import { useQuotationResponseForm } from "../../hooks/use-quotation-response-form";
import { useQuotationCalculations } from "../../hooks/use-quotation-calculations";
import type { DetailsResponseProps } from "../utils/interface";
import { QuotationResponseDirector } from "../../utils/quotation-response-director";
import {
  aduana,
  courier,
  incotermsOptions,
  paisesDestino,
  paisesOrigen,
  proformaVigencia,
  puertosDestino,
  puertosSalida,
  regimenOptions,
  serviciosLogisticos,
  tipoServicio,
  typeLoad,
} from "../utils/static";
import ServiceConsolidationCard from "./partials/ServiceConsolidationCard";
import ImportExpensesCard from "./partials/ImportExpensesCard";
import ImportSummaryCard from "./partials/ImportSummaryCard";
import TaxObligationsCard from "./partials/TaxObligationsCard";
import EditableUnitCostTable from "./tables/editable-unit-cost-table";
import QuotationProductRow from "./tables/quotation-product-row";

export default function QuotationResponseView({
  selectedQuotationId,
}: DetailsResponseProps) {
  const {
    data: quotationDetail,
    isLoading,
    isError,
  } = useGetQuotationById(selectedQuotationId);

  const createQuotationResponseMutation = useCreateQuatitationResponse();

  const quotationForm = useQuotationResponseForm();

  // Estado local para productos pendientes con precios actualizables
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);

  // Detectar si es vista "Pendiente" (administrativa) vs vista completa
  const isPendingView = quotationForm.selectedServiceLogistic === "Pendiente";

  // Detectar si es servicio marítimo consolidado
  const isMaritimeConsolidated =
    quotationForm.selectedServiceLogistic === "Consolidado Maritimo" ||
    quotationForm.selectedServiceLogistic === "Consolidado Grupal Maritimo";

  // Inicializar productos pendientes cuando quotationDetail esté disponible
  useEffect(() => {
    if (quotationDetail?.products && pendingProducts.length === 0) {
      setPendingProducts(
        quotationDetail.products.map((product) => ({
          id: product.productId,
          name: product.name,
          url: product.url || "",
          comment: product.comment || "",
          quantityTotal: product.quantityTotal || 0,
          boxes: product.number_of_boxes,
          priceXiaoYi: 0, // Valor por defecto
          cbmTotal: parseFloat(product.volume) || 0,
          express: 0, // Valor por defecto
          total: 0, // Valor por defecto
          cbm: parseFloat(product.volume) || 0,
          weight: parseFloat(product.weight) || 0,
          price: 0, // Valor por defecto
          attachments: product.attachments || [], // Imágenes del producto
          adminComment: product.adminComment || "",
          // Agregar packingList para que calculateProductAggregatedData lo encuentre
          packingList: {
            boxes: product.number_of_boxes || 0,
            cbm: parseFloat(product.volume) || 0,
            weightKg: parseFloat(product.weight) || 0,
            weightTon: (parseFloat(product.weight) || 0) / 1000,
          },
          variants:
            product.variants?.map((variant) => ({
              id: variant.variantId,
              size: variant.size || "",
              presentation: variant.presentation || "",
              model: variant.model || "",
              color: variant.color || "",
              name: `Nombre: ${variant.size} - Presentacion: ${variant.presentation} - Modelo: ${variant.model} - Color: ${variant.color}`,
              quantity: variant.quantity || 1,
              price: 0, // Valor por defecto
              priceExpress: 0, // Valor por defecto para express
              weight: 0, // Valor por defecto
              cbm: 0, // Valor por defecto
              express: 0, // Valor por defecto
            })) || [],
        }))
      );
    }
  }, [quotationDetail]);

  // Mapear productos de la API al formato esperado por los cálculos
  const mappedProducts = isPendingView
    ? pendingProducts
    : (quotationDetail?.products || []).map((product) => ({
        id: product.productId,
        name: product.name,
        boxes: product.number_of_boxes,
        cbmTotal: parseFloat(product.volume) || 0,
        cbm: parseFloat(product.volume) || 0,
        weight: parseFloat(product.weight) || 0,
        attachments: product.attachments || [],
        variants:
          product.variants?.map((variant) => ({
            id: variant.variantId,
            size: variant.size,
            presentation: variant.presentation,
            model: variant.model,
            color: variant.color,
            quantity: variant.quantity || 1,
            price: 0, // Se ingresará en el formulario
            priceExpress: 0, // Se ingresará en el formulario
            weight: 0, // Se calculará si es necesario
            cbm: 0, // Se calculará si es necesario
          })) || [],
      }));

  // Mapear productos para EditableUnitCostTable (servicios no pendientes)
  const editableUnitCostTableProducts = useMemo(() => {
    return (quotationDetail?.products || []).map((product) => ({
      id: product.productId,
      name: product.name,
      price: 0, // El usuario ingresará el precio
      quantity:
        product.variants?.reduce(
          (sum, variant) => sum + (variant.quantity || 0),
          0
        ) ||
        product.number_of_boxes ||
        1,
      total: 0, // Se calculará automáticamente
      equivalence: 0,
      importCosts: 0,
      totalCost: 0,
      unitCost: 0,
      seCotiza: true, // Por defecto seleccionado
      attachments: product.attachments || [], // Agregar imágenes del producto
      variants:
        product.variants?.map((variant) => ({
          originalVariantId: variant.variantId,
          id: variant.variantId,
          name: `${variant.size} - ${variant.presentation} - ${variant.model} - ${variant.color}`,
          price: 0, // El usuario ingresará el precio
          size: variant.size,
          presentation: variant.presentation,
          model: variant.model, // Agregar modelo
          color: variant.color, // Agregar color
          quantity: variant.quantity || 1,
          total: 0, // Se calculará automáticamente
          equivalence: 0,
          importCosts: 0,
          totalCost: 0,
          unitCost: 0,
          seCotiza: true, // Por defecto seleccionado
        })) || [],
    }));
  }, [quotationDetail?.products]);

  // Inicializar productos en el hook cuando cambien
  useEffect(() => {
    if (editableUnitCostTableProducts.length > 0 && !isPendingView) {
      quotationForm.setEditableUnitCostProducts(editableUnitCostTableProducts);
    }
  }, [editableUnitCostTableProducts, isPendingView]);

  // Inicializar estados de cotización como true por defecto
  useEffect(() => {
    if (mappedProducts && mappedProducts.length > 0) {
      const initialProductStates: Record<string, boolean> = {};
      const initialVariantStates: Record<string, Record<string, boolean>> = {};

      mappedProducts.forEach((product) => {
        // Producto por defecto en true
        if (quotationForm.productQuotationState[product.id] === undefined) {
          initialProductStates[product.id] = true;
        }

        // Variantes por defecto en true
        if (product.variants && product.variants.length > 0) {
          const variantStates: Record<string, boolean> = {};
          product.variants.forEach((variant: any) => {
            if (
              !quotationForm.variantQuotationState[product.id]?.[variant.id]
            ) {
              variantStates[variant.id] = true;
            }
          });
          if (Object.keys(variantStates).length > 0) {
            initialVariantStates[product.id] = variantStates;
          }
        }
      });

      // Actualizar estados si hay cambios
      if (Object.keys(initialProductStates).length > 0) {
        Object.entries(initialProductStates).forEach(([productId, value]) => {
          quotationForm.updateProductQuotationState(productId, value);
        });
      }

      if (Object.keys(initialVariantStates).length > 0) {
        Object.entries(initialVariantStates).forEach(
          ([productId, variants]) => {
            Object.entries(variants).forEach(([variantId, value]) => {
              quotationForm.updateVariantQuotationState(
                productId,
                variantId,
                value
              );
            });
          }
        );
      }
    }
  }, [mappedProducts]);

  const calculations = useQuotationCalculations({
    products: mappedProducts,
    dynamicValues: quotationForm.dynamicValues,
    cif: quotationForm.cif,
    exemptionState: quotationForm.exemptionState as unknown as Record<
      string,
      boolean
    >,
    productQuotationState: quotationForm.productQuotationState,
    variantQuotationState: quotationForm.variantQuotationState,
  });

  useEffect(() => {
    if (calculations.totalTaxes !== quotationForm.dynamicValues.totalDerechos) {
      quotationForm.updateDynamicValue("totalDerechos", calculations.totalTaxes);
    }
  }, [calculations.totalTaxes]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para los datos agregados de cada producto (para vista pendiente)
  const [productsAggregatedData, setProductsAggregatedData] = useState<
    Record<
      string,
      {
        totalPrice: number;
        totalWeight: number;
        totalCBM: number;
        totalQuantity: number;
        totalExpress: number;
      }
    >
  >({});

  // Función para manejar cambios en datos agregados de productos
  const handleAggregatedDataChange = useCallback(
    (
      productId: string,
      aggregatedData: {
        totalPrice: number;
        totalWeight: number;
        totalCBM: number;
        totalQuantity: number;
        totalExpress: number;
      }
    ) => {
      setProductsAggregatedData((prev) => ({
        ...prev,
        [productId]: aggregatedData,
      }));
    },
    []
  );

  // Función helper para calcular datos agregados de un producto
  const calculateProductAggregatedData = useCallback(
    (product: any) => {
      if (!product.variants || product.variants.length === 0) {
        return {
          totalPrice: 0,
          totalWeight:
            product.packingList?.weightKg || parseFloat(product.weight) || 0,
          totalCBM: product.packingList?.cbm || parseFloat(product.volume) || 0,
          totalQuantity: product.quantityTotal || 0,
          totalExpress: 0,
        };
      }

      const selectedVariants = product.variants.filter((variant: any) => {
        const variantStates =
          quotationForm.variantQuotationState[product.id] || {};
        return variantStates[variant.id] !== false;
      });

      // IMPORTANTE: En la vista Pendiente, los totales de CBM y Peso vienen del packingList del producto
      // Solo los precios (price y priceExpress) y cantidades deben sumarse desde las variantes
      const priceData = selectedVariants.reduce(
        (acc: any, variant: any) => ({
          totalPrice:
            acc.totalPrice + (variant.price || 0) * (variant.quantity || 0),
          totalQuantity: acc.totalQuantity + (variant.quantity || 0),
          totalExpress:
            acc.totalExpress +
            (variant.priceExpress || 0) * (variant.quantity || 0),
        }),
        {
          totalPrice: 0,
          totalQuantity: 0,
          totalExpress: 0,
        }
      );

      // Retornar con los valores del packingList para CBM y Weight (no se calculan desde variantes)
      return {
        totalPrice: priceData.totalPrice,
        totalWeight:
          product.packingList?.weightKg || parseFloat(product.weight) || 0,
        totalCBM: product.packingList?.cbm || parseFloat(product.volume) || 0,
        totalQuantity: priceData.totalQuantity,
        totalExpress: priceData.totalExpress,
      };
    },
    [quotationForm.variantQuotationState]
  );

  // Función para actualizar productos pendientes con estado optimizado
  const handlePendingProductUpdate = useCallback(
    (productId: string, updates: any) => {
      setPendingProducts((prev) => {
        const updatedProducts = prev.map((product) => {
          if (product.id === productId) {
            // Sincronizar packingList con cbm y weight - BIDIRECCIONAL
            const syncedUpdates = { ...updates };

            // Si viene packingList desde el hijo, sincronizar con cbm/weight del padre
            if (updates.packingList) {
              syncedUpdates.cbm = updates.packingList.cbm;
              syncedUpdates.weight = updates.packingList.weightKg;
              syncedUpdates.boxes = updates.packingList.boxes;
            }

            // Siempre mantener packingList actualizado
            const updatedProduct = { ...product, ...syncedUpdates };

            // Asegurar que packingList esté sincronizado con los valores finales
            updatedProduct.packingList = {
              boxes: updatedProduct.boxes,
              cbm: updatedProduct.cbm,
              weightKg: updatedProduct.weight,
              weightTon: updatedProduct.weight / 1000,
            };

            return updatedProduct;
          }
          return product;
        });

        // CRÍTICO: Manejo diferenciado de actualizaciones para evitar recálculos innecesarios
        // Caso 1: Si SOLO se actualiza packingList, actualizar SOLO CBM y Peso en aggregatedData (sin tocar precios)
        // Caso 2: Si se actualizan variants, recalcular TODO el aggregatedData (incluyendo precios)
        // Caso 3: Si se actualizan cargoHandling, ghostUrl o adminComment, NO recalcular nada

        const isOnlyPackingListUpdate =
          updates.packingList !== undefined &&
          updates.variants === undefined &&
          updates.cargoHandling === undefined &&
          updates.ghostUrl === undefined &&
          updates.adminComment === undefined;

        const isVariantsUpdate = updates.variants !== undefined;

        const isNonAggregatedFieldUpdate =
          updates.cargoHandling !== undefined ||
          updates.ghostUrl !== undefined ||
          updates.adminComment !== undefined;

        if (isOnlyPackingListUpdate) {
          // SOLO actualizar CBM y Peso en aggregatedData, preservar precios
          setProductsAggregatedData((prevData) => {
            const currentData = prevData[productId] || {
              totalPrice: 0,
              totalWeight: 0,
              totalCBM: 0,
              totalQuantity: 0,
              totalExpress: 0,
            };

            return {
              ...prevData,
              [productId]: {
                ...currentData, // Preservar totalPrice, totalExpress, totalQuantity
                totalCBM: updates.packingList.cbm, // Actualizar SOLO CBM
                totalWeight: updates.packingList.weightKg, // Actualizar SOLO Peso
              },
            };
          });
        } else if (isVariantsUpdate) {
          // Recalcular TODO el aggregatedData porque los precios cambiaron
          const updatedProduct = updatedProducts.find((p) => p.id === productId);
          if (updatedProduct) {
            const aggregatedData = calculateProductAggregatedData(updatedProduct);
            handleAggregatedDataChange(productId, aggregatedData);
          }
        }
        // Si es isNonAggregatedFieldUpdate, no hacer nada (no recalcular)

        return updatedProducts;
      });
    },
    [calculateProductAggregatedData, handleAggregatedDataChange]
  );

  // Función para actualizar variantes de productos pendientes
  const handlePendingVariantUpdate = useCallback(
    (productId: string, variantId: string, updates: any) => {
      setPendingProducts((prev) => {
        const updatedProducts = prev.map((product) =>
          product.id === productId
            ? {
                ...product,
                variants: product.variants?.map((variant: any) =>
                  variant.id === variantId
                    ? { ...variant, ...updates }
                    : variant
                ),
              }
            : product
        );

        // Notificar cambios para recálculos en tiempo real
        const updatedProduct = updatedProducts.find((p) => p.id === productId);
        if (updatedProduct) {
          const aggregatedData = calculateProductAggregatedData(updatedProduct);
          handleAggregatedDataChange(productId, aggregatedData);
        }

        return updatedProducts;
      });
    },
    [calculateProductAggregatedData, handleAggregatedDataChange]
  );

  // Calcular totales generales para vista pendiente
  const pendingViewTotals = useMemo(() => {
    const selectedProducts = Object.entries(productsAggregatedData).filter(
      ([productId]) => {
        const isSelected =
          quotationForm.productQuotationState[productId] !== undefined
            ? quotationForm.productQuotationState[productId]
            : true;
        return isSelected;
      }
    );

    return selectedProducts.reduce(
      (totals, [, data]) => ({
        totalItems: totals.totalItems + data.totalQuantity,
        totalProducts: totals.totalProducts + 1,
        totalCBM: totals.totalCBM + data.totalCBM,
        totalWeight: totals.totalWeight + data.totalWeight,
        totalPrice: totals.totalPrice + data.totalPrice,
        totalExpress: totals.totalExpress + data.totalExpress,
        grandTotal: totals.grandTotal + data.totalPrice + data.totalExpress,
      }),
      {
        totalItems: 0,
        totalProducts: 0,
        totalCBM: 0,
        totalWeight: 0,
        totalPrice: 0,
        totalExpress: 0,
        grandTotal: 0,
      }
    );
  }, [productsAggregatedData, quotationForm.productQuotationState]);

  // Función para construir el DTO de servicio pendiente usando Director Pattern
  const buildPendingPayload = useCallback(() => {
    // Preparar productos en el formato esperado por el Director
    const directorProducts = pendingProducts.map((product) => ({
      productId: product.id,
      isQuoted: quotationForm.productQuotationState[product.id] !== false,
      adminComment: product.adminComment || "",
      ghostUrl: product.ghostUrl || product.url || "",
      packingList: product.packingList || {
        boxes: product.number_of_boxes || 0,
        cbm: parseFloat(product.volume) || 0,
        weightKg: parseFloat(product.weight) || 0,
        weightTon: (parseFloat(product.weight) || 0) / 1000,
      },
      cargoHandling: product.cargoHandling || {
        fragileProduct: false,
        stackProduct: false,
      },
      variants: (product.variants || []).map((variant: any) => ({
        variantId: variant.id,
        quantity: variant.quantity || 1,
        isQuoted:
          quotationForm.variantQuotationState[product.id]?.[variant.id] !==
          false,
        unitPrice: variant.price || 0,
        expressPrice: variant.priceExpress || variant.express || 0,
      })),
    }));

    // Usar Director Pattern para construir la respuesta
    return QuotationResponseDirector.buildPendingService({
      quotationId: selectedQuotationId,
      advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb",
      logisticConfig: {
        serviceLogistic: quotationForm.selectedServiceLogistic,
        incoterm: quotationForm.selectedIncoterm,
        cargoType: quotationForm.selectedTypeLoad,
        courier: quotationForm.selectedCourier,
      },
      products: directorProducts,
      aggregatedTotals: pendingViewTotals,
      quotationStates: {
        products: quotationForm.productQuotationState,
        variants: quotationForm.variantQuotationState,
      },
      quotationDetail,
    });
  }, [
    selectedQuotationId,
    quotationDetail,
    pendingProducts,
    pendingViewTotals,
    quotationForm.productQuotationState,
    quotationForm.variantQuotationState,
    quotationForm.selectedServiceLogistic,
    quotationForm.selectedIncoterm,
    quotationForm.selectedTypeLoad,
    quotationForm.selectedCourier,
  ]);

  // Calcular totales para vista no pendiente (basado en API data)
  const nonPendingViewTotals = useMemo(() => {
    const totalItems = (quotationDetail?.products || []).reduce(
      (sum, product) => {
        return (
          sum +
          (product.variants?.reduce(
            (variantSum, variant) => variantSum + (variant.quantity || 0),
            0
          ) ||
            product.number_of_boxes ||
            1)
        );
      },
      0
    );

    const totalProducts = (quotationDetail?.products || []).length;

    return {
      totalItems,
      totalProducts,
    };
  }, [quotationDetail?.products]);

  // Calcular totalImportCosts correctamente
  const totalImportCosts = useMemo(() => {
    const serviceFields = quotationForm.getServiceFields();

    // Calcular valores con IGV (1.18)
    const servicioConsolidado = (serviceFields.servicioConsolidado || 0) * 1.18;
    const gestionCertificado = (serviceFields.gestionCertificado || 0) * 1.18;

    // servicioInspeccion = (inspeccionProductos + inspeccionFabrica) × 1.18
    const servicioInspeccion = (
      (serviceFields.inspeccionProductos || 0) +
      (serviceFields.inspeccionFabrica || 0)
    ) * 1.18;

    // servicioTransporte = (transporteLocalChina × 1.18) + transporteLocalDestino
    const servicioTransporte =
      (quotationForm.dynamicValues.transporteLocalChinaEnvio || 0) * 1.18 +
      (quotationForm.dynamicValues.transporteLocalClienteEnvio || 0);

    const otrosServicios = (serviceFields.otrosServicios || 0) * 1.18;

    // totalDerechos viene de fiscalObligations.totalTaxes
    const totalDerechos = calculations.totalTaxes || 0;

    // totalExpenses es la suma de los conceptos especificados
    return parseFloat((
      servicioConsolidado +
      gestionCertificado +
      servicioInspeccion +
      servicioTransporte +
      otrosServicios +
      totalDerechos
    ).toFixed(2));
  }, [
    quotationForm.getServiceFields,
    quotationForm.dynamicValues.transporteLocalChinaEnvio,
    quotationForm.dynamicValues.transporteLocalClienteEnvio,
    calculations.totalTaxes,
  ]);

  const handleSubmitQuotation = async () => {
    setIsSubmitting(true);
    try {
      let dto;

      // ✅ IMPLEMENTACIÓN CON DIRECTOR PATTERN
      // Se utiliza QuotationResponseDirector para orquestar la construcción
      // de las respuestas de cotización de manera más organizada y mantenible

      if (isPendingView) {
        // Usar la función optimizada para construir el payload pendiente
        dto = buildPendingPayload();
      } else {
        // Construir DTO para servicios completos usando Director Pattern
        const isMaritimeService = quotationForm.isMaritimeService();

        // Preparar productos en el formato esperado por el Director
        const directorProducts = quotationForm.editableUnitCostProducts.map(
          (product: any) => ({
            productId: product.id,
            isQuoted: product.seCotiza !== false,
            unitCost: product.unitCost || 0,
            importCosts: product.importCosts || 0,
            totalCost: product.totalCost || 0,
            equivalence: product.equivalence || 0,
            variants: (product.variants || []).map((variant: any) => ({
              variantId: variant.originalVariantId || variant.id,
              quantity: variant.quantity || 1,
              isQuoted: variant.seCotiza !== false,
              unitCost: variant.price || 0,
            })),
          })
        );

        // Preparar configuraciones comunes
        const logisticConfig = {
          serviceLogistic: quotationForm.selectedServiceLogistic,
          incoterm: quotationForm.selectedIncoterm,
          cargoType: quotationForm.selectedTypeLoad,
          courier: quotationForm.selectedCourier,
        };

        const calculationsData = {
          //? Valores dinamicos
          dynamicValues: {
            comercialValue: quotationForm.dynamicValues.comercialValue || 0,
            flete: quotationForm.dynamicValues.flete || 0,
            cajas: quotationForm.dynamicValues.cajas || 0,
            kg: quotationForm.dynamicValues.kg || 0,
            ton: quotationForm.dynamicValues.ton || 0,
            fob: quotationForm.dynamicValues.fob || 0,
            seguro: quotationForm.dynamicValues.seguro || 0,
            tipoCambio: quotationForm.dynamicValues.tipoCambio || 3.7,
            volumenCBM: quotationForm.dynamicValues.volumenCBM || 0,
            calculoFlete: quotationForm.dynamicValues.calculoFlete || 0,
            desaduanaje: quotationForm.dynamicValues.desaduanaje || 0,
            antidumpingGobierno:
              quotationForm.dynamicValues.antidumpingGobierno || 0,
            antidumpingCantidad:
              quotationForm.dynamicValues.antidumpingCantidad || 0,
            transporteLocalChinaEnvio:
              quotationForm.dynamicValues.transporteLocalChinaEnvio || 0,
            transporteLocalClienteEnvio:
              quotationForm.dynamicValues.transporteLocalClienteEnvio || 0,
            cif: quotationForm.cif || 0,
          },
          //? Tasa de Porcentaje
          taxPercentage: {
            adValoremRate: quotationForm.dynamicValues.adValoremRate || 4,
            igvRate: quotationForm.dynamicValues.igvRate || 18,
            ipmRate: quotationForm.dynamicValues.ipmRate || 2,
            percepcion: quotationForm.dynamicValues.percepcionRate || 5,
          },
          //? Excepción
          exemptions: {
            obligacionesFiscales:
              quotationForm.exemptionState.obligacionesFiscales || false,
            separacionCarga:
              quotationForm.exemptionState.separacionCarga || false,
            inspeccionProductos:
              quotationForm.exemptionState.inspeccionProductos || false,
            servicioConsolidadoAereo:
              quotationForm.exemptionState.servicioConsolidadoAereo || false,
            servicioConsolidadoMaritimo:
              quotationForm.exemptionState.servicioConsolidadoMaritimo || false,
            gestionCertificado:
              quotationForm.exemptionState.gestionCertificado || false,
            servicioInspeccion:
              quotationForm.exemptionState.servicioInspeccion || false,
            totalDerechos: quotationForm.exemptionState.totalDerechos || false,
            descuentoGrupalExpress:
              quotationForm.exemptionState.descuentoGrupalExpress || false,
          },
        };

        //? Costo de Servicio de Carga Consolidada
        const serviceCalculationsData = {
          serviceFields: {
            servicioConsolidado:
              quotationForm.getServiceFields().servicioConsolidado || 0,
            separacionCarga:
              quotationForm.getServiceFields().separacionCarga || 0,
            seguroProductos:
              quotationForm.getServiceFields().seguroProductos || 0,
            inspeccionProductos:
              quotationForm.getServiceFields().inspeccionProductos || 0,
            gestionCertificado:
              quotationForm.getServiceFields().gestionCertificado || 0,
            inspeccionFabrica:
              quotationForm.getServiceFields().inspeccionFabrica || 0,
            transporteLocalChina:
              quotationForm.dynamicValues.transporteLocalChinaEnvio || 0,
            transporteLocalDestino:
              quotationForm.dynamicValues.transporteLocalClienteEnvio || 0,
            otrosServicios:
              quotationForm.getServiceFields().otrosServicios || 0,
          },
          subtotalServices: 0,
          igvServices: 0,
          totalServices: 0,
        };

        // Calcular subtotales
        const subtotal = Object.values(
          serviceCalculationsData.serviceFields
        ).reduce((sum, value) => sum + (value || 0), 0);
        serviceCalculationsData.subtotalServices = subtotal;
        serviceCalculationsData.igvServices = subtotal * 0.18;
        serviceCalculationsData.totalServices = subtotal * 1.18;

        //? Gastos de importación
        const importCostsData = {
          expenseFields: {
            servicioConsolidado:
              serviceCalculationsData.serviceFields.servicioConsolidado,
            separacionCarga:
              serviceCalculationsData.serviceFields.separacionCarga,
            seguroProductos:
              serviceCalculationsData.serviceFields.seguroProductos,
            gestionCertificado:
              serviceCalculationsData.serviceFields.gestionCertificado,
            inspeccionProductos:
              serviceCalculationsData.serviceFields.inspeccionProductos,
            addvaloremigvipm: {
              descuento: calculationsData.exemptions.obligacionesFiscales,
              valor: calculations.totalTaxes || 0,
            },
            desadunajefleteseguro: calculationsData.dynamicValues.desaduanaje,
            totalDerechos:
              calculations.totalTaxes || 0,
            servicioTransporte:
              (quotationForm.dynamicValues.transporteLocalChinaEnvio || 0) +
              (quotationForm.dynamicValues.transporteLocalClienteEnvio || 0)* 1.18 ,
            servicioInspeccion:
              (serviceCalculationsData.serviceFields.inspeccionProductos || 0) +
              (serviceCalculationsData.serviceFields.inspeccionFabrica || 0),
            otrosServicios:
              serviceCalculationsData.serviceFields.otrosServicios || 0,
          },
          totalExpenses: calculations.finalTotal || 0,
        };

        //? Resumen de importación
        const quoteSummaryData = {
          comercialValue: calculationsData.dynamicValues.comercialValue,
          totalExpenses: importCostsData.totalExpenses,
          totalInvestment:
            calculationsData.dynamicValues.comercialValue +
            importCostsData.totalExpenses,
        };

        //? Tasa de porcentajes
        const taxRates = {
          adValoremRate: calculationsData.taxPercentage.adValoremRate,
          igvRate: calculationsData.taxPercentage.igvRate,
          ipmRate: calculationsData.taxPercentage.ipmRate,
          iscRate: quotationForm.dynamicValues.iscRate || 0,
          antidumpingAmount: calculationsData.dynamicValues.antidumpingCantidad,
          percepcion: quotationForm.dynamicValues.percepcionRate || 5,
        };

        //? Valores calculados de impuestos desde el hook use-quotation-calculations
        const calculatedTaxes = {
          adValoremAmount: calculations.adValoremAmount || 0,
          iscAmount: calculations.iscAmount || 0,
          igvAmount: calculations.igvAmount || 0,
          ipmAmount: calculations.ipmAmount || 0,
          antidumpingAmount: calculations.antidumpingAmount || 0,
          percepcionAmount: calculations.percepcionAmount || 0,
          totalTaxes: calculations.totalTaxes || 0,
        };

        if (isMaritimeService) {
          // Usar Director para servicio marítimo
          const maritimeConfig =
            QuotationResponseDirector.createDefaultMaritimeConfig({
              regime: quotationForm.selectedRegimen || "Importación Definitiva",
              originCountry: quotationForm.selectedPaisOrigen || "China",
              destinationCountry: quotationForm.selectedPaisDestino || "Perú",
              customs: quotationForm.selectedAduana || "Callao",
              originPort: quotationForm.selectedPuertoSalida || "Shanghai",
              destinationPort: quotationForm.selectedPuertoDestino || "Callao",
              serviceTypeDetail: quotationForm.selectedTipoServicio || "FCL",
              transitTime: quotationForm.tiempoTransito || 25,
              naviera: quotationForm.naviera || "COSCO",
              proformaValidity:
                quotationForm.selectedProformaVigencia || "30 días",
            });

          dto = QuotationResponseDirector.buildCompleteMaritimeService({
            quotationId: selectedQuotationId,
            advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb",
            logisticConfig,
            maritimeConfig,
            products: directorProducts,
            calculations: calculationsData,
            serviceCalculations: serviceCalculationsData,
            importCosts: importCostsData,
            quoteSummary: quoteSummaryData,
            cifValue: quotationForm.cif || 0,
            taxRates,
            calculatedTaxes,
            quotationDetail,
          });
        } else {
          // Usar Director para servicio express
          dto = QuotationResponseDirector.buildCompleteExpressService({
            quotationId: selectedQuotationId,
            advisorId: "75500ef2-e35c-4a77-8074-9104c9d971cb",
            logisticConfig,
            products: directorProducts,
            calculations: calculationsData,
            serviceCalculations: serviceCalculationsData,
            importCosts: importCostsData,
            quoteSummary: quoteSummaryData,
            cifValue: quotationForm.cif || 0,
            taxRates,
            calculatedTaxes,
            quotationDetail,
          });
        }
      }

      console.log(
        `DTO ${isPendingView ? "Pendiente" : "Completo"} construido:`,
        JSON.stringify(dto, null, 2)
      );

      // Enviar la cotización usando el hook

      await createQuotationResponseMutation.mutateAsync({
        data: dto,
        quotationId: selectedQuotationId,
      });

      // Mostrar modal de éxito
      quotationForm.setIsSendingModalOpen(true);
    } catch (error) {
      console.error(
        `Error al enviar cotización ${
          isPendingView ? "pendiente" : "completa"
        }:`,
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Cargando Cotización"
          description="Obteniendo detalles de la cotización..."
        />
        <LoadingState
          message="Cargando detalles de la cotización..."
          variant="card"
        />
      </div>
    );
  }

  if (isError || !quotationDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Error"
          description="No se pudo cargar la cotización"
        />
        <ErrorState
          title="Error al cargar la cotización"
          message="Por favor, intente recargar la página o contacte al administrador."
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-full bg-gray-50 overflow-x-hidden grid grid-cols-1">
      <SectionHeader
        icon={<FileText className="h-6 w-6 text-white" />}
        title={
          isPendingView
            ? "Responder Cotización - Vista Administrativa"
            : "Responder Cotización - Vista Completa"
        }
        description={`Respondiendo cotización #${selectedQuotationId}`}
        actions={
          <ConfirmDialog
            trigger={
              <Button
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? "Enviando..." : "Enviar Respuesta"}
              </Button>
            }
            title="Confirmar Envío"
            description="¿Está seguro que desea enviar esta respuesta de cotización?"
            onConfirm={handleSubmitQuotation}
          />
        }
      />

      <div className=" min-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Resumen de productos */}
        <QuotationSummaryCard
          productCount={
            isPendingView
              ? pendingViewTotals.totalProducts
              : nonPendingViewTotals.totalProducts
          }
          totalCBM={
            isPendingView
              ? pendingViewTotals.totalCBM
              : isMaritimeConsolidated
                ? quotationForm.dynamicValues.volumenCBM
                : calculations.totalCBM
          }
          totalWeight={
            isPendingView
              ? pendingViewTotals.totalWeight
              : isMaritimeConsolidated
                ? quotationForm.dynamicValues.kg
                : calculations.totalWeight
          }
          totalPrice={
            isPendingView
              ? pendingViewTotals.totalPrice
              : isMaritimeConsolidated
                ? quotationForm.dynamicValues.comercialValue
                : calculations.totalPrice
          }
          totalExpress={
            isPendingView
              ? pendingViewTotals.totalExpress
              : isMaritimeConsolidated
                ? quotationForm.dynamicValues.transporteLocalChinaEnvio
                : calculations.totalExpress
          }
          totalGeneral={
            isPendingView
              ? pendingViewTotals.grandTotal
              : calculations.totalGeneral
          }
          itemCount={
            isPendingView
              ? pendingViewTotals.totalItems
              : nonPendingViewTotals.totalItems
          }
        />

        {/* Configuración general */}
        <QuotationConfigurationForm
          selectedServiceLogistic={quotationForm.selectedServiceLogistic}
          onServiceLogisticChange={quotationForm.setSelectedServiceLogistic}
          selectedIncoterm={quotationForm.selectedIncoterm}
          onIncotermChange={quotationForm.setSelectedIncoterm}
          selectedTypeLoad={quotationForm.selectedTypeLoad}
          onTypeLoadChange={quotationForm.setSelectedTypeLoad}
          selectedCourier={quotationForm.selectedCourier}
          onCourierChange={quotationForm.setSelectedCourier}
          serviciosLogisticos={serviciosLogisticos}
          incotermsOptions={incotermsOptions}
          typeLoad={typeLoad}
          courier={courier}
        />

        {/* Configuración marítima (solo si es servicio marítimo) */}
        {quotationForm.isMaritimeService() && (
          <MaritimeServiceForm
            selectedRegimen={quotationForm.selectedRegimen}
            onRegimenChange={quotationForm.setSelectedRegimen}
            selectedPaisOrigen={quotationForm.selectedPaisOrigen}
            onPaisOrigenChange={quotationForm.setSelectedPaisOrigen}
            selectedPaisDestino={quotationForm.selectedPaisDestino}
            onPaisDestinoChange={quotationForm.setSelectedPaisDestino}
            selectedAduana={quotationForm.selectedAduana}
            onAduanaChange={quotationForm.setSelectedAduana}
            selectedPuertoSalida={quotationForm.selectedPuertoSalida}
            onPuertoSalidaChange={quotationForm.setSelectedPuertoSalida}
            selectedPuertoDestino={quotationForm.selectedPuertoDestino}
            onPuertoDestinoChange={quotationForm.setSelectedPuertoDestino}
            selectedTipoServicio={quotationForm.selectedTipoServicio}
            onTipoServicioChange={quotationForm.setSelectedTipoServicio}
            tiempoTransito={quotationForm.tiempoTransito}
            onTiempoTransitoChange={quotationForm.setTiempoTransito}
            selectedProformaVigencia={quotationForm.selectedProformaVigencia}
            onProformaVigenciaChange={quotationForm.setSelectedProformaVigencia}
            naviera={quotationForm.naviera}
            onNavieraChange={quotationForm.setNaviera}
            regimenOptions={regimenOptions}
            paisesOrigen={paisesOrigen}
            paisesDestino={paisesDestino}
            aduana={aduana}
            puertosSalida={puertosSalida}
            puertosDestino={puertosDestino}
            tipoServicio={tipoServicio}
            proformaVigencia={proformaVigencia}
          />
        )}

        {/* Vista específica según el tipo de servicio */}
        {isPendingView ? (
          /* Vista administrativa simplificada */
          <div className="space-y-6">
            {/* Sección de productos con QuotationProductRow para vista pendiente */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400/50 to-blue-400/50 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold ">
                  Productos de la Cotización - Vista Administrativa
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {pendingProducts.map((product, index) => (
                  <QuotationProductRow
                    key={product.id}
                    product={{
                      productId: product.id,
                      name: product.name,
                      url: product.url || "",
                      comment: product.comment || "",
                      quantityTotal: product.quantityTotal,
                      weight: product.weight,
                      volume: product.cbm,
                      number_of_boxes: product.boxes,
                      attachments: product.attachments || [],
                      variants:
                        product.variants?.map((variant: any) => ({
                          variantId: variant.id,
                          size: variant.size || "",
                          presentation: variant.presentation || "",
                          model: variant.model || "",
                          color: variant.color || "",
                          quantity: variant.quantity || 1,
                          price: variant.price || 0,
                          priceExpress: variant.priceExpress || 0,
                          weight: variant.weight || 0,
                          cbm: variant.cbm || 0,
                        })) || [],
                      adminComment: product.adminComment || "",
                    }}
                    index={index}
                    quotationDetail={quotationDetail}
                    productQuotationState={quotationForm.productQuotationState}
                    variantQuotationState={quotationForm.variantQuotationState}
                    onProductQuotationToggle={(productId, checked) => {
                      quotationForm.updateProductQuotationState(
                        productId,
                        checked
                      );
                    }}
                    onVariantQuotationToggle={(
                      productId,
                      variantId,
                      checked
                    ) => {
                      quotationForm.updateVariantQuotationState(
                        productId,
                        variantId,
                        checked
                      );
                    }}
                    onProductUpdate={handlePendingProductUpdate}
                    onVariantUpdate={handlePendingVariantUpdate}
                    onAggregatedDataChange={handleAggregatedDataChange}
                  />
                ))}
                {pendingProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay productos disponibles para cotizar</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Vista completa con componentes detallados para Express/Marítimo */
          <div className="space-y-6">
            {/* Componente unificado de configuración */}
            <UnifiedConfigurationForm
              dynamicValues={quotationForm.dynamicValues}
              onUpdateValue={quotationForm.updateDynamicValue}
              onKgChange={quotationForm.handleKgChange}
              exemptionState={quotationForm.exemptionState}
              onExemptionChange={quotationForm.updateExemptionState}
              isMaritimeService={quotationForm.isMaritimeService()}
              cif={quotationForm.cif}
              serviceType={quotationForm.selectedServiceLogistic}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <ServiceConsolidationCard
                title={quotationForm.getServiceName()}
                serviceFields={quotationForm.getServiceFields()}
                updateDynamicValue={(key, value) =>
                  quotationForm.updateDynamicValue(
                    key as keyof typeof quotationForm.dynamicValues,
                    value
                  )
                }
                igvServices={
                  Object.values(quotationForm.getServiceFields()).reduce(
                    (sum, value) => sum + (value || 0),
                    0
                  ) * 0.18
                }
                totalServices={
                  Object.values(quotationForm.getServiceFields()).reduce(
                    (sum, value) => sum + (value || 0),
                    0
                  ) * 1.18
                }
                serviceType={quotationForm.selectedServiceLogistic}
                transporteLocalChina={
                  quotationForm.dynamicValues.transporteLocalChinaEnvio
                }
                transporteLocalDestino={
                  quotationForm.dynamicValues.transporteLocalClienteEnvio
                }
              />

              <TaxObligationsCard
                adValoremRate={quotationForm.dynamicValues.adValoremRate}
                setAdValoremRate={(v) =>
                  quotationForm.updateDynamicValue("adValoremRate", v)
                }
                igvRate={quotationForm.dynamicValues.igvRate}
                setIgvRate={(v) =>
                  quotationForm.updateDynamicValue("igvRate", v)
                }
                ipmRate={quotationForm.dynamicValues.ipmRate}
                setIpmRate={(v) =>
                  quotationForm.updateDynamicValue("ipmRate", v)
                }
                isMaritime={quotationForm.isMaritimeService()}
                antidumpingGobierno={
                  quotationForm.dynamicValues.antidumpingGobierno
                }
                setAntidumpingGobierno={(v) =>
                  quotationForm.updateDynamicValue("antidumpingGobierno", v)
                }
                antidumpingCantidad={
                  quotationForm.dynamicValues.antidumpingCantidad
                }
                setAntidumpingCantidad={(v) =>
                  quotationForm.updateDynamicValue("antidumpingCantidad", v)
                }
                iscRate={quotationForm.dynamicValues.iscRate}
                setIscRate={(v) =>
                  quotationForm.updateDynamicValue("iscRate", v)
                }
                values={{
                  adValorem: calculations.adValoremAmount,
                  antidumping: calculations.antidumpingAmount || 0,
                  igvFiscal: calculations.igvAmount,
                  ipm: calculations.ipmAmount,
                  isc: calculations.iscAmount || 0,
                  percepcion: calculations.percepcionAmount,
                  totalDerechosDolares: calculations.totalTaxes,
                  totalDerechosSoles: calculations.totalTaxesInSoles || calculations.totalTaxes * quotationForm.dynamicValues.tipoCambio,
                }}
              />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <ImportExpensesCard
                isMaritime={quotationForm.isMaritimeService()}
                values={{
                  servicioConsolidadoMaritimoFinal:
                    quotationForm.dynamicValues.servicioConsolidado,
                  gestionCertificadoFinal:
                    quotationForm.dynamicValues.gestionCertificado,
                  servicioInspeccionFinal:
                    quotationForm.dynamicValues.inspeccionProductos,
                  transporteLocalFinal: 0,
                  totalDerechosDolaresFinal: calculations.totalTaxes,
                  desaduanajeFleteSaguro:
                    quotationForm.dynamicValues.desaduanaje +
                    quotationForm.dynamicValues.flete +
                    quotationForm.dynamicValues.seguro,
                  transporteLocalChinaEnvio:
                    quotationForm.dynamicValues.transporteLocalChinaEnvio,
                  transporteLocalClienteEnvio:
                    quotationForm.dynamicValues.transporteLocalClienteEnvio,
                }}
                exemptionState={
                  quotationForm.exemptionState as unknown as Record<
                    string,
                    boolean
                  >
                }
                handleExemptionChange={(field, checked) =>
                  quotationForm.updateExemptionState(
                    field as keyof typeof quotationForm.exemptionState,
                    checked
                  )
                }
                applyExemption={(value, exempted) => (exempted ? 0 : value)}
                servicioConsolidadoFinal={
                  quotationForm.dynamicValues.servicioConsolidado
                }
                separacionCargaFinal={
                  quotationForm.dynamicValues.separacionCarga
                }
                inspeccionProductosFinal={
                  quotationForm.dynamicValues.inspeccionProductos
                }
                shouldExemptTaxes={
                  quotationForm.exemptionState.obligacionesFiscales
                }
                serviceType={quotationForm.selectedServiceLogistic}
                serviceFieldsFromConsolidation={{
                  servicioConsolidado:
                    quotationForm.dynamicValues.servicioConsolidado,
                  gestionCertificado:
                    quotationForm.dynamicValues.gestionCertificado,
                  inspeccionProductos:
                    quotationForm.dynamicValues.inspeccionProductos,
                  inspeccionFabrica:
                    quotationForm.dynamicValues.inspeccionFabrica,
                  otrosServicios: quotationForm.dynamicValues.otrosServicios,
                  transporteLocalChina:
                    quotationForm.dynamicValues.transporteLocalChinaEnvio,
                  transporteLocalDestino:
                    quotationForm.dynamicValues.transporteLocalClienteEnvio,
                }}
              />

              <ImportSummaryCard
                exemptionState={{
                  adValorem: quotationForm.exemptionState.totalDerechos,
                  igv: quotationForm.exemptionState.obligacionesFiscales,
                  ipm: quotationForm.exemptionState.totalDerechos,
                  percepcion: quotationForm.exemptionState.obligacionesFiscales,
                }}
                comercialValue={quotationForm.dynamicValues.comercialValue}
                totalImportCosts={totalImportCosts}
              />
            </div>

            {/* Tabla de productos con cálculos detallados para servicios completos */}
            <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30   rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 border border-slate-200/60 overflow-hidden p-4 sm:p-6 ">
                <h3 className="text-lg sm:text-xl font-bold">
                  Gestión de Productos - Vista Completa
                </h3>
                <p className="text-green-800 text-sm mt-1">
                  Cálculos detallados para servicios Express/Marítimo
                </p>
              </div>
              <div className="p-4 sm:p-6 overflow-x-auto">
                <div className="min-w-full">
                  <EditableUnitCostTable
                    products={quotationForm.editableUnitCostProducts}
                    onProductsChange={quotationForm.setEditableUnitCostProducts}
                    totalImportCosts={calculations.finalTotal || 0}
                    totalInvestmentImport={calculations.finalTotal || 0}
                    onCommercialValueChange={(value) => {
                      quotationForm.updateDynamicValue("comercialValue", value);
                    }}
                    productQuotationState={quotationForm.productQuotationState}
                    variantQuotationState={quotationForm.variantQuotationState}
                    onProductQuotationChange={
                      quotationForm.updateProductQuotationState
                    }
                    onVariantQuotationChange={
                      quotationForm.updateVariantQuotationState
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <SendingModal
        isOpen={quotationForm.isSendingModalOpen}
        onClose={() => quotationForm.setIsSendingModalOpen(false)}
      />
    </div>
  );
}
