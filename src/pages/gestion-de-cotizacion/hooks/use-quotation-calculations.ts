import { useMemo } from "react";

interface Product {
  id: string;
  name: string;
  boxes?: number;
  priceXiaoYi?: number;
  cbmTotal?: number;
  express?: number;
  total?: number;
  cbm?: number;
  weight?: number;
  price?: number;
  variants?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    weight?: number;
    cbm?: number;
    express?: number;
  }>;
}

interface DynamicValues {
  adValoremRate: number;
  igvRate: number;
  ipmRate: number;
  percepcionRate: number;
  tipoCambio: number;
}

interface UseQuotationCalculationsProps {
  products: Product[];
  dynamicValues: DynamicValues;
  cif: number;
  exemptionState: Record<string, boolean>;
  productQuotationState: Record<string, boolean>;
  variantQuotationState: Record<string, Record<string, boolean>>;
}

export function useQuotationCalculations({
  products,
  dynamicValues,
  cif,
  exemptionState,
  productQuotationState,
  variantQuotationState,
}: UseQuotationCalculationsProps) {
  
  // Calcular totales de productos
  const productTotals = useMemo(() => {
    const totals = {
      totalCBM: 0,
      totalWeight: 0,
      totalPrice: 0,
      totalExpress: 0,
      totalGeneral: 0,
      productCount: 0,
    };

    products.forEach((product) => {
      if (productQuotationState[product.id]) {
        totals.productCount++;
        
        // Si tiene variantes, calcular solo las seleccionadas
        if (product.variants && product.variants.length > 0) {
          const productVariants = variantQuotationState[product.id] || {};
          product.variants.forEach((variant) => {
            if (productVariants[variant.id]) {
              totals.totalWeight += variant.weight || 0;
              totals.totalCBM += variant.cbm || 0;
              totals.totalPrice += (variant.price || 0) * variant.quantity;
              totals.totalExpress += variant.express || 0;
            }
          });
        } else {
          // Producto sin variantes
          totals.totalCBM += product.cbmTotal || product.cbm || 0;
          totals.totalWeight += product.weight || 0;
          totals.totalPrice += product.priceXiaoYi || product.price || 0;
          totals.totalExpress += product.express || 0;
        }
      }
    });

    totals.totalGeneral = totals.totalPrice + totals.totalExpress;

    return totals;
  }, [products, productQuotationState, variantQuotationState]);

  // Cálculos de impuestos
  const taxCalculations = useMemo(() => {
    const adValoremAmount = (cif * dynamicValues.adValoremRate) / 100;
    const baseIGV = cif + adValoremAmount;
    const igvAmount = (baseIGV * dynamicValues.igvRate) / 100;
    const ipmAmount = (cif * dynamicValues.ipmRate) / 100;
    const percepcionAmount = (igvAmount * dynamicValues.percepcionRate) / 100;
    
    const totalTaxes = adValoremAmount + igvAmount + ipmAmount + percepcionAmount;
    const totalWithTaxes = cif + totalTaxes;
    const totalInSoles = totalWithTaxes * dynamicValues.tipoCambio;

    return {
      adValoremAmount,
      igvAmount,
      ipmAmount,
      percepcionAmount,
      totalTaxes,
      totalWithTaxes,
      totalInSoles,
      baseIGV,
    };
  }, [cif, dynamicValues]);

  // Aplicar exoneraciones
  const finalCalculations = useMemo(() => {
    const finalTaxes = {
      adValorem: exemptionState.totalDerechos ? 0 : taxCalculations.adValoremAmount,
      igv: exemptionState.obligacionesFiscales ? 0 : taxCalculations.igvAmount,
      ipm: exemptionState.totalDerechos ? 0 : taxCalculations.ipmAmount,
      percepcion: exemptionState.obligacionesFiscales ? 0 : taxCalculations.percepcionAmount,
    };

    const finalTotal = cif + Object.values(finalTaxes).reduce((sum, tax) => sum + tax, 0);
    const finalTotalInSoles = finalTotal * dynamicValues.tipoCambio;

    return {
      ...finalTaxes,
      finalTotal,
      finalTotalInSoles,
      totalTaxesInSoles: Object.values(finalTaxes).reduce((sum, tax) => sum + tax, 0) * dynamicValues.tipoCambio,
      totalExempted: taxCalculations.totalTaxes - Object.values(finalTaxes).reduce((sum, tax) => sum + tax, 0),
    };
  }, [taxCalculations, exemptionState, cif, dynamicValues.tipoCambio]);

  return {
    ...productTotals,
    ...taxCalculations,
    ...finalCalculations,
  };
}