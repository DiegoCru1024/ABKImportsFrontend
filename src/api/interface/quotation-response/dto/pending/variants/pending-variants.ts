import type { PendingPriceInterface } from "./pendig-price";

export interface PendingVariantInterface {
  variantId: string;

  quantity: number;

  isQuoted: boolean;

  pendingPricing: PendingPriceInterface;
}
