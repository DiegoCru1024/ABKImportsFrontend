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
import { QuotationResponseBuilder } from "../../utils/quotation-response-builder";
import type {
  PendingBuildData,
  CompleteBuildData,
} from "../../types/quotation-response-dto";
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

  // Inicializar productos pendientes cuando quotationDetail esté disponible
  useEffect(() => {
    if (quotationDetail?.products && pendingProducts.length === 0) {
      setPendingProducts(
        quotationDetail.products.map((product) => ({
          id: product.productId,
          name: product.name,
          boxes: product.number_of_boxes,
          priceXiaoYi: 0, // Valor por defecto
          cbmTotal: parseFloat(product.volume) || 0,
          express: 0, // Valor por defecto
          total: 0, // Valor por defecto
          cbm: parseFloat(product.volume) || 0,
          weight: parseFloat(product.weight) || 0,
          price: 0, // Valor por defecto
          attachments: product.attachments || [], // Imágenes del producto
          variants:
            product.variants?.map((variant) => ({
              id: variant.variantId,
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
      variants:
        product.variants?.map((variant) => ({
          originalVariantId: variant.variantId,
          id: variant.variantId,
          name: `${variant.size} - ${variant.presentation} - ${variant.model} - ${variant.color}`,
          price: 0, // El usuario ingresará el precio
          size: variant.size,
          presentation: variant.presentation,
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

      return selectedVariants.reduce(
        (acc: any, variant: any) => ({
          totalPrice:
            acc.totalPrice + (variant.price || 0) * (variant.quantity || 0),
          totalWeight: acc.totalWeight + (variant.weight || 0),
          totalCBM: acc.totalCBM + (variant.cbm || 0),
          totalQuantity: acc.totalQuantity + (variant.quantity || 0),
          totalExpress:
            acc.totalExpress +
            (variant.priceExpress || 0) * (variant.quantity || 0),
        }),
        {
          totalPrice: 0,
          totalWeight: 0,
          totalCBM: 0,
          totalQuantity: 0,
          totalExpress: 0,
        }
      );
    },
    [quotationForm.variantQuotationState]
  );

  // Función para actualizar productos pendientes con estado optimizado
  const handlePendingProductUpdate = useCallback(
    (productId: string, updates: any) => {
      setPendingProducts((prev) => {
        const updatedProducts = prev.map((product) =>
          product.id === productId ? { ...product, ...updates } : product
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

  // Función para construir el DTO de servicio pendiente con configuración actualizada
  const buildPendingPayload = useCallback(() => {
    // **CORRECCIÓN 1 & 2**: Pasar quotationDetail al builder para mapear correlativo correcto
    const builder = new QuotationResponseBuilder(
      selectedQuotationId,
      "PENDING",
      quotationDetail // Pasar quotationDetail para acceder al correlativo real
    );

    // Preparar datos de productos con información completa
    const pendingData = {
      products: pendingProducts.map((product) => ({
        ...product,
        // **CORRECCIÓN 2**: Asegurar mapeo correcto del packingList con campos actualizados
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
        ghostUrl: product.ghostUrl || product.url || "",
        adminComment: product.adminComment || "",
      })),
      aggregatedTotals: pendingViewTotals,
      quotationStates: {
        products: quotationForm.productQuotationState,
        variants: quotationForm.variantQuotationState,
      },
      // Incluir datos de configuración
      configuration: {
        serviceLogistic: quotationForm.selectedServiceLogistic,
        incoterm: quotationForm.selectedIncoterm,
        cargoType: quotationForm.selectedTypeLoad,
        courier: quotationForm.selectedCourier,
      },
      // Pasar quotationDetail para acceso al correlativo y otros datos
      quotationDetail,
    };

    return builder.buildForPendingService(pendingData);
  }, [
    selectedQuotationId,
    quotationDetail, // Incluir quotationDetail en dependencias
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

  const handleSubmitQuotation = async () => {
    setIsSubmitting(true);
    try {
      let dto;

      if (isPendingView) {
        // Usar la función optimizada para construir el payload pendiente
        dto = buildPendingPayload();
      } else {
        // Construir DTO para servicios completos
        const builder = new QuotationResponseBuilder(
          selectedQuotationId,
          quotationForm.isMaritimeService() ? "MARITIME" : "EXPRESS",
          quotationDetail // También pasar quotationDetail para servicios completos
        );

        dto = builder.buildForCompleteServiceNew({
          quotationForm,
          calculations,
          products: quotationForm.editableUnitCostProducts,
          quotationDetail,
        } as CompleteBuildData);
      }

      console.log(
        `DTO ${isPendingView ? "Pendiente" : "Completo"} construido:`,
        JSON.stringify(dto, null, 2)
      );


      // Enviar la cotización usando el hook
      
      /*await createQuotationResponseMutation.mutateAsync({
        data: dto,
        quotationId: selectedQuotationId,
      });*/

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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden grid grid-cols-1">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Resumen de productos */}
        <QuotationSummaryCard
          productCount={
            isPendingView
              ? pendingViewTotals.totalProducts
              : nonPendingViewTotals.totalProducts
          }
          totalCBM={
            isPendingView ? pendingViewTotals.totalCBM : calculations.totalCBM
          }
          totalWeight={
            isPendingView
              ? pendingViewTotals.totalWeight
              : calculations.totalWeight
          }
          totalPrice={
            isPendingView
              ? pendingViewTotals.totalPrice
              : calculations.totalPrice
          }
          totalExpress={
            isPendingView
              ? pendingViewTotals.totalExpress
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
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Productos de la Cotización - Vista Administrativa
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Gestión simplificada para servicios pendientes
                </p>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {(quotationDetail?.products || []).map((product, index) => (
                  <QuotationProductRow
                    key={product.productId}
                    product={{
                      productId: product.productId,
                      name: product.name,
                      url: product.url || "",
                      comment: product.comment || "",
                      quantityTotal: product.quantityTotal,
                      weight: product.weight,
                      volume: product.volume,
                      number_of_boxes: product.number_of_boxes,
                      attachments: product.attachments || [],
                      variants:
                        product.variants?.map((variant: any) => ({
                          variantId: variant.variantId,
                          size: variant.size || "",
                          presentation: variant.presentation || "",
                          model: variant.model || "",
                          color: variant.color || "",
                          quantity: variant.quantity || 1,
                          price: 0, // Se ingresará en el formulario
                          priceExpress: 0, // Se ingresará en el formulario
                          weight: 0, // Se calculará si es necesario
                          cbm: 0, // Se calculará si es necesario
                        })) || [],
                      adminComment: "",
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
                {(quotationDetail?.products || []).length === 0 && (
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
                  igvFiscal: calculations.igvAmount,
                  ipm: calculations.ipmAmount,
                  isc: 0, // ISC no está calculado en este contexto
                  percepcion: calculations.percepcionAmount,
                  totalDerechosDolares: calculations.totalTaxes,
                  totalDerechosSoles: calculations.totalTaxesInSoles || (calculations.totalTaxes * quotationForm.dynamicValues.tipoCambio),
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
                    quotationForm.dynamicValues.inspeccionProducto,
                  transporteLocalFinal:
                    quotationForm.dynamicValues.transporteLocal,
                  totalDerechosDolaresFinal: calculations.totalTaxes,
                  desaduanajeFleteSaguro:
                    quotationForm.dynamicValues.desaduanaje + quotationForm.dynamicValues.flete + quotationForm.dynamicValues.seguro,
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
              />

              <ImportSummaryCard
                exemptionState={{
                  adValorem: quotationForm.exemptionState.totalDerechos,
                  igv: quotationForm.exemptionState.obligacionesFiscales,
                  ipm: quotationForm.exemptionState.totalDerechos,
                  percepcion: quotationForm.exemptionState.obligacionesFiscales,
                }}
                comercialValue={quotationForm.dynamicValues.comercialValue}
                totalImportCosts={calculations.totalTaxes + (quotationForm.dynamicValues.servicioConsolidado * 1.18) + (quotationForm.dynamicValues.separacionCarga * 1.18) + (quotationForm.dynamicValues.inspeccionProductos * 1.18) + quotationForm.dynamicValues.desaduanaje + quotationForm.dynamicValues.flete + quotationForm.dynamicValues.seguro + quotationForm.dynamicValues.transporteLocalChinaEnvio + quotationForm.dynamicValues.transporteLocalClienteEnvio}
              />
            </div>

            {/* Tabla de productos con cálculos detallados para servicios completos */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Gestión de Productos - Vista Completa
                </h3>
                <p className="text-green-100 text-sm mt-1">
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
