export interface CompletePricingInterface {

  unitCost: number;
}
export interface CompleteVariantInterface{

  variantId: string;


  quantity: number;


  isQuoted: boolean;


  completePricing: CompletePricingInterface;
}