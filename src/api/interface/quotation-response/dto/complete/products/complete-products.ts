import type { CompleteVariantInterface } from "../variants/complete-variant";
import type { PricingInterface } from "./pricing";



export interface CompleteProductInterface {

  productId: string;

 
  isQuoted: boolean;


  pricing: PricingInterface;

  variants: CompleteVariantInterface[];
}