import type { PendingPriceInterface } from "./pendig-price";

export interface PendingVariantInterface {
  variantId: string;

  quantity: number;

  isQuoted: boolean;

  pendingPricing: PendingPriceInterface;

  id_profit_percentage:string|null;

  value_profit_porcentage:number|null;
}
