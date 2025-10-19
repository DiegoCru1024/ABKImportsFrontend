import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FileText, ArrowLeft, Loader2, Save } from "lucide-react";

import { useGetQuotationById } from "@/hooks/use-quation";
import {
  useGetDetailsResponse,
  usePatchQuatitationResponse,
} from "@/hooks/use-quatitation-response";

import type { ResponseDataComplete } from "@/api/interface/quotation-response/dto/complete/response-data-complete";
import type { ResponseDataPending } from "@/api/interface/quotation-response/dto/pending/response-data-pending";

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
import { useCallback, useMemo } from "react";

function isResponseDataComplete(
  data: ResponseDataPending | ResponseDataComplete
): data is ResponseDataComplete {
  return "calculations" in data;
}

export default function EditQuotationResponseView() {
  const { quotationId, responseId } = useParams<{
    quotationId: string;
    responseId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const serviceType = (location.state as { serviceType?: string })?.serviceType || "PENDING";

  const {
    data: quotationDetail,
    isLoading: isLoadingQuotation,
    isError: isErrorQuotation,
  } = useGetQuotationById(quotationId || "");

  const {
    data: responseDetails,
    isLoading: isLoadingResponse,
    isError: isErrorResponse,
  } = useGetDetailsResponse(responseId || "", serviceType);

  const patchQuotationResponseMutation = usePatchQuatitationResponse(
    quotationId || "",
    responseId || ""
  );

  const quotationForm = useQuotationResponseForm();

  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [isDataInitialized, setIsDataInitialized] = useState<boolean>(false);

  const isPendingView = quotationForm.selectedServiceLogistic === "Pendiente";

  useEffect(() => {
    if (responseDetails && quotationDetail && !isDataInitialized) {
      console.log('Inicializando datos desde responseDetails:', responseDetails);
      const resData = responseDetails.responseData;
      const genInfo = resData.generalInformation;

      // Inicializar configuración general
      quotationForm.setSelectedServiceLogistic(genInfo.serviceLogistic);
      quotationForm.setSelectedIncoterm(genInfo.incoterm);
      quotationForm.setSelectedTypeLoad(genInfo.cargoType);
      quotationForm.setSelectedCourier(genInfo.courier);

      if (responseDetails.serviceType === "MARITIME" && isResponseDataComplete(resData)) {
        const maritime = resData.maritimeConfig;
        if (maritime) {
          quotationForm.setSelectedRegimen(maritime.regime);
          quotationForm.setSelectedPaisOrigen(maritime.originCountry);
          quotationForm.setSelectedPaisDestino(maritime.destinationCountry);
          quotationForm.setSelectedAduana(maritime.customs);
          quotationForm.setSelectedPuertoSalida(maritime.originPort);
          quotationForm.setSelectedPuertoDestino(maritime.destinationPort);
          quotationForm.setSelectedTipoServicio(maritime.serviceTypeDetail);
          quotationForm.setTiempoTransito(maritime.transitTime);
          quotationForm.setNaviera(maritime.naviera);
          quotationForm.setSelectedProformaVigencia(maritime.proformaValidity);
        }
      }

      if (responseDetails.serviceType === "PENDING") {
        const productsWithData = responseDetails.products.map((respProduct: any) => {
          const quotProduct = quotationDetail.products.find(
            (p) => p.productId === respProduct.productId
          );

          return {
            id: respProduct.productId,
            name: quotProduct?.name || "",
            url: quotProduct?.url || "",
            comment: quotProduct?.comment || "",
            quantityTotal: quotProduct?.quantityTotal || 0,
            boxes: respProduct.packingList?.nroBoxes || 0,
            priceXiaoYi: 0,
            cbmTotal: respProduct.packingList?.cbm || 0,
            express: 0,
            total: 0,
            cbm: respProduct.packingList?.cbm || 0,
            weight: respProduct.packingList?.pesoKg || 0,
            price: 0,
            attachments: quotProduct?.attachments || [],
            adminComment: respProduct.adminComment || "",
            ghostUrl: respProduct.ghostUrl || "",
            packingList: {
              boxes: respProduct.packingList?.nroBoxes || 0,
              cbm: respProduct.packingList?.cbm || 0,
              weightKg: respProduct.packingList?.pesoKg || 0,
              weightTon: respProduct.packingList?.pesoTn || 0,
            },
            cargoHandling: {
              fragileProduct: respProduct.cargoHandling?.fragileProduct || false,
              stackProduct: respProduct.cargoHandling?.stackProduct || false,
            },
            variants: respProduct.variants?.map((respVar: any) => {
              const quotVar = quotProduct?.variants?.find(
                (v) => v.variantId === respVar.variantId
              );
              return {
                id: respVar.variantId,
                size: quotVar?.size || "",
                presentation: quotVar?.presentation || "",
                model: quotVar?.model || "",
                color: quotVar?.color || "",
                name: quotVar
                  ? `Nombre: ${quotVar.size} - Presentacion: ${quotVar.presentation} - Modelo: ${quotVar.model} - Color: ${quotVar.color}`
                  : "",
                quantity: respVar.quantity || 0,
                price: respVar.pendingPricing?.unitPrice || 0,
                priceExpress: respVar.pendingPricing?.expressPrice || 0,
                weight: 0,
                cbm: 0,
                express: 0,
              };
            }) || [],
          };
        });

        setPendingProducts(productsWithData);

        // Inicializar aggregated data para cada producto usando calculateProductAggregatedData
        const initialAggregatedData: Record<string, any> = {};
        productsWithData.forEach((product) => {
          // Calcular datos agregados usando la misma lógica que en quotation-response-view
          const priceData = product.variants.reduce(
            (acc: any, variant: any) => ({
              totalPrice: acc.totalPrice + (variant.price || 0) * (variant.quantity || 0),
              totalQuantity: acc.totalQuantity + (variant.quantity || 0),
              totalExpress: acc.totalExpress + (variant.priceExpress || 0) * (variant.quantity || 0),
            }),
            {
              totalPrice: 0,
              totalQuantity: 0,
              totalExpress: 0,
            }
          );

          initialAggregatedData[product.id] = {
            totalPrice: priceData.totalPrice,
            totalWeight: product.packingList?.weightKg || product.weight || 0,
            totalCBM: product.packingList?.cbm || product.cbm || 0,
            totalQuantity: priceData.totalQuantity,
            totalExpress: priceData.totalExpress,
          };
        });
        setProductsAggregatedData(initialAggregatedData);

        responseDetails.products.forEach((respProduct: any) => {
          quotationForm.updateProductQuotationState(
            respProduct.productId,
            respProduct.isQuoted
          );

          respProduct.variants?.forEach((respVar: any) => {
            quotationForm.updateVariantQuotationState(
              respProduct.productId,
              respVar.variantId,
              respVar.isQuoted
            );
          });
        });
      } else {
        if (isResponseDataComplete(resData)) {
          const calc = resData.calculations;
          Object.entries(calc.dynamicValues).forEach(([key, value]) => {
            quotationForm.updateDynamicValue(
              key as keyof typeof quotationForm.dynamicValues,
              value as number
            );
          });

          Object.entries(calc.exemptions).forEach(([key, value]) => {
            quotationForm.updateExemptionState(
              key as keyof typeof quotationForm.exemptionState,
              value as boolean
            );
          });

          Object.entries(calc.taxPercentage).forEach(([key, value]) => {
            quotationForm.updateDynamicValue(
              key as keyof typeof quotationForm.dynamicValues,
              value as number
            );
          });
        }

        const productsForTable = responseDetails.products.map((respProduct: any) => {
          const quotProduct = quotationDetail.products.find(
            (p) => p.productId === respProduct.productId
          );

          return {
            id: respProduct.productId,
            name: quotProduct?.name || "",
            price: 0,
            quantity:
              respProduct.variants?.reduce(
                (sum: number, v: any) => sum + (v.quantity || 0),
                0
              ) || 1,
            total: 0,
            equivalence: respProduct.pricing?.equivalence || 0,
            importCosts: respProduct.pricing?.importCosts || 0,
            totalCost: respProduct.pricing?.totalCost || 0,
            unitCost: respProduct.pricing?.unitCost || 0,
            seCotiza: respProduct.isQuoted,
            attachments: quotProduct?.attachments || [], // Agregar imágenes
            variants:
              respProduct.variants?.map((respVar: any) => {
                const quotVar = quotProduct?.variants?.find(
                  (v) => v.variantId === respVar.variantId
                );
                return {
                  originalVariantId: respVar.variantId,
                  id: respVar.variantId,
                  name: quotVar
                    ? `${quotVar.size} - ${quotVar.presentation} - ${quotVar.model} - ${quotVar.color}`
                    : "",
                  price: 0,
                  size: quotVar?.size || "",
                  presentation: quotVar?.presentation || "",
                  model: quotVar?.model || "", // Agregar modelo
                  color: quotVar?.color || "", // Agregar color
                  quantity: respVar.quantity || 1,
                  total: 0,
                  equivalence: 0,
                  importCosts: 0,
                  totalCost: 0,
                  unitCost: respVar.completePricing?.unitCost || 0,
                  seCotiza: respVar.isQuoted,
                };
              }) || [],
          };
        });

        quotationForm.setEditableUnitCostProducts(productsForTable);

        responseDetails.products.forEach((respProduct: any) => {
          quotationForm.updateProductQuotationState(
            respProduct.productId,
            respProduct.isQuoted
          );

          respProduct.variants?.forEach((respVar: any) => {
            quotationForm.updateVariantQuotationState(
              respProduct.productId,
              respVar.variantId,
              respVar.isQuoted
            );
          });
        });
      }

      setIsDataInitialized(true);
    }
  }, [responseDetails, quotationDetail, isDataInitialized]);

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
            price: 0,
            priceExpress: 0,
            weight: 0,
            cbm: 0,
          })) || [],
      }));

  const editableUnitCostTableProducts = useMemo(() => {
    return (quotationDetail?.products || []).map((product) => ({
      id: product.productId,
      name: product.name,
      price: 0,
      quantity:
        product.variants?.reduce(
          (sum, variant) => sum + (variant.quantity || 0),
          0
        ) ||
        product.number_of_boxes ||
        1,
      total: 0,
      equivalence: 0,
      importCosts: 0,
      totalCost: 0,
      unitCost: 0,
      seCotiza: true,
      attachments: product.attachments || [], // Agregar imágenes del producto
      variants:
        product.variants?.map((variant) => ({
          originalVariantId: variant.variantId,
          id: variant.variantId,
          name: `${variant.size} - ${variant.presentation} - ${variant.model} - ${variant.color}`,
          price: 0,
          size: variant.size,
          presentation: variant.presentation,
          model: variant.model, // Agregar modelo
          color: variant.color, // Agregar color
          quantity: variant.quantity || 1,
          total: 0,
          equivalence: 0,
          importCosts: 0,
          totalCost: 0,
          unitCost: 0,
          seCotiza: true,
        })) || [],
    }));
  }, [quotationDetail?.products]);

  // Inicializar productos en el hook cuando cambien o cuando se cambie de tipo de servicio
  useEffect(() => {
    // Caso 1: Inicialización inicial cuando NO hay datos cargados
    if (
      editableUnitCostTableProducts.length > 0 &&
      !isPendingView &&
      !isDataInitialized &&
      quotationForm.editableUnitCostProducts.length === 0
    ) {
      quotationForm.setEditableUnitCostProducts(editableUnitCostTableProducts);
    }

    // Caso 2: Cuando se cambia de "Pendiente" a otro tipo de servicio DESPUÉS de la inicialización
    // Y los productos no están cargados en editableUnitCostProducts
    if (
      isDataInitialized &&
      !isPendingView &&
      editableUnitCostTableProducts.length > 0 &&
      quotationForm.editableUnitCostProducts.length === 0
    ) {
      quotationForm.setEditableUnitCostProducts(editableUnitCostTableProducts);
    }
  }, [editableUnitCostTableProducts, isPendingView, isDataInitialized]);

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
        const isOnlyPackingListUpdate =
          updates.packingList !== undefined &&
          updates.variants === undefined &&
          updates.cargoHandling === undefined &&
          updates.ghostUrl === undefined &&
          updates.adminComment === undefined;

        const isVariantsUpdate = updates.variants !== undefined;

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

        return updatedProducts;
      });
    },
    [calculateProductAggregatedData, handleAggregatedDataChange]
  );

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

  const buildPendingPayload = useCallback(() => {
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

    return QuotationResponseDirector.buildPendingService({
      quotationId: quotationId!,
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
    quotationId,
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

  const handleUpdateQuotation = async () => {
    setIsSubmitting(true);
    try {
      let dto;

      if (isPendingView) {
        dto = buildPendingPayload();
      } else {
        const isMaritimeService = quotationForm.isMaritimeService();

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
              unitCost: variant.unitCost || 0,
            })),
          })
        );

        const logisticConfig = {
          serviceLogistic: quotationForm.selectedServiceLogistic,
          incoterm: quotationForm.selectedIncoterm,
          cargoType: quotationForm.selectedTypeLoad,
          courier: quotationForm.selectedCourier,
        };

        const calculationsData = {
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
            servicioConsolidado:
              quotationForm.dynamicValues.servicioConsolidado || 0,
            separacionCarga: quotationForm.dynamicValues.separacionCarga || 0,
            inspeccionProductos:
              quotationForm.dynamicValues.inspeccionProductos || 0,
            gestionCertificado:
              quotationForm.dynamicValues.gestionCertificado || 0,
            inspeccionProducto:
              quotationForm.dynamicValues.inspeccionProductos || 0,
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
          taxPercentage: {
            adValoremRate: quotationForm.dynamicValues.adValoremRate || 4,
            igvRate: quotationForm.dynamicValues.igvRate || 18,
            ipmRate: quotationForm.dynamicValues.ipmRate || 2,
            percepcion: quotationForm.dynamicValues.percepcionRate || 5,
          },
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

        const subtotal = Object.values(
          serviceCalculationsData.serviceFields
        ).reduce((sum, value) => sum + (value || 0), 0);
        serviceCalculationsData.subtotalServices = subtotal;
        serviceCalculationsData.igvServices = subtotal * 0.18;
        serviceCalculationsData.totalServices = subtotal * 1.18;

        const importCostsData = {
          expenseFields: {
            servicioConsolidado:
              serviceCalculationsData.serviceFields.servicioConsolidado,
            separacionCarga:
              serviceCalculationsData.serviceFields.separacionCarga,
            seguroProductos:
              serviceCalculationsData.serviceFields.seguroProductos,
            inspeccionProductos:
              serviceCalculationsData.serviceFields.inspeccionProductos,
            addvaloremigvipm: {
              descuento: calculationsData.exemptions.obligacionesFiscales,
              valor: calculations.totalTaxes || 0,
            },
            desadunajefleteseguro: calculationsData.dynamicValues.desaduanaje,
            servicioTransporte:
              serviceCalculationsData.serviceFields.transporteLocalChina +
              serviceCalculationsData.serviceFields.transporteLocalDestino,
            servicioInspeccion:
              serviceCalculationsData.serviceFields.inspeccionProductos +
              serviceCalculationsData.serviceFields.inspeccionFabrica,
            gestionCertificado:
              serviceCalculationsData.serviceFields.gestionCertificado,
            totalDerechos: calculations.totalTaxes || 0,
            otrosServicios: serviceCalculationsData.serviceFields.otrosServicios,
          },
          totalExpenses: calculations.finalTotal || 0,
        };

        const quoteSummaryData = {
          comercialValue: calculationsData.dynamicValues.comercialValue,
          totalExpenses: importCostsData.totalExpenses,
          totalInvestment:
            calculationsData.dynamicValues.comercialValue +
            importCostsData.totalExpenses,
        };

        const taxRates = {
          adValoremRate: calculationsData.taxPercentage.adValoremRate,
          igvRate: calculationsData.taxPercentage.igvRate,
          ipmRate: calculationsData.taxPercentage.ipmRate,
          iscRate: quotationForm.dynamicValues.iscRate || 0,
          percepcion: calculationsData.taxPercentage.percepcion,
          antidumpingAmount: calculationsData.dynamicValues.antidumpingCantidad,
        };

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
            quotationId: quotationId!,
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
          dto = QuotationResponseDirector.buildCompleteExpressService({
            quotationId: quotationId!,
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

      console.log("DTO para actualización:", JSON.stringify(dto, null, 2));

      await patchQuotationResponseMutation.mutateAsync({ data: dto });

      quotationForm.setIsSendingModalOpen(true);

      setTimeout(() => {
        navigate(
          `/dashboard/gestion-de-cotizacion/respuestas/${quotationId}`
        );
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar respuesta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/dashboard/gestion-de-cotizacion`);
  };

  if (isLoadingQuotation || isLoadingResponse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Cargando Respuesta"
          description="Obteniendo detalles de la respuesta..."
        />
        <LoadingState
          message="Cargando detalles de la respuesta..."
          variant="card"
        />
      </div>
    );
  }

  if (
    isErrorQuotation ||
    isErrorResponse ||
    !quotationDetail ||
    !responseDetails
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SectionHeader
          icon={<FileText className="h-6 w-6 text-white" />}
          title="Error"
          description="No se pudo cargar la respuesta"
        />
        <ErrorState
          title="Error al cargar la respuesta"
          message="Por favor, intente recargar la página o contacte al administrador."
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SectionHeader
        icon={<FileText className="h-6 w-6 text-white" />}
        title={
          isPendingView
            ? "Editar Respuesta - Vista Administrativa"
            : "Editar Respuesta - Vista Completa"
        }
        description={`Editando respuesta #${responseId}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <ConfirmDialog
              trigger={
                <Button disabled={isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Actualizando..." : "Guardar Cambios"}
                </Button>
              }
              title="Confirmar Actualización"
              description="¿Está seguro que desea actualizar esta respuesta de cotización?"
              onConfirm={handleUpdateQuotation}
            />
          </div>
        }
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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

        {isPendingView ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400/50 to-blue-400/50 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold">
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
          <div className="space-y-6">
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
                  antidumping: quotationForm.isMaritimeService()
                    ? (quotationForm.dynamicValues.antidumpingGobierno || 0) * (quotationForm.dynamicValues.antidumpingCantidad || 0)
                    : 0,
                  igvFiscal: calculations.igvAmount,
                  ipm: calculations.ipmAmount,
                  isc: calculations.iscAmount || 0,
                  percepcion: calculations.percepcionAmount,
                  totalDerechosDolares: calculations.totalTaxes +
                    (quotationForm.isMaritimeService()
                      ? (quotationForm.dynamicValues.antidumpingGobierno || 0) * (quotationForm.dynamicValues.antidumpingCantidad || 0)
                      : 0),
                  totalDerechosSoles:
                    (calculations.totalTaxesInSoles ||
                    calculations.totalTaxes *
                      quotationForm.dynamicValues.tipoCambio) +
                    (quotationForm.isMaritimeService()
                      ? ((quotationForm.dynamicValues.antidumpingGobierno || 0) * (quotationForm.dynamicValues.antidumpingCantidad || 0)) * quotationForm.dynamicValues.tipoCambio
                      : 0),
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
                    quotationForm.dynamicValues.transporteLocalChinaEnvio +
                    quotationForm.dynamicValues.transporteLocalClienteEnvio,
                  totalDerechosDolaresFinal: calculations.totalTaxes + 
                    (quotationForm.isMaritimeService() 
                      ? (quotationForm.dynamicValues.antidumpingGobierno || 0) * (quotationForm.dynamicValues.antidumpingCantidad || 0)
                      : 0),
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
              />

              <ImportSummaryCard
                exemptionState={{
                  adValorem: quotationForm.exemptionState.totalDerechos,
                  igv: quotationForm.exemptionState.obligacionesFiscales,
                  ipm: quotationForm.exemptionState.totalDerechos,
                  percepcion: quotationForm.exemptionState.obligacionesFiscales,
                }}
                comercialValue={quotationForm.dynamicValues.comercialValue}
                totalImportCosts={
                  calculations.totalTaxes +
                  quotationForm.dynamicValues.servicioConsolidado * 1.18 +
                  quotationForm.dynamicValues.separacionCarga * 1.18 +
                  quotationForm.dynamicValues.inspeccionProductos * 1.18 +
                  quotationForm.dynamicValues.desaduanaje +
                  quotationForm.dynamicValues.flete +
                  quotationForm.dynamicValues.seguro +
                  quotationForm.dynamicValues.transporteLocalChinaEnvio +
                  quotationForm.dynamicValues.transporteLocalClienteEnvio
                }
              />
            </div>

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

      <SendingModal
        isOpen={quotationForm.isSendingModalOpen}
        onClose={() => quotationForm.setIsSendingModalOpen(false)}
      />
    </div>
  );
}
