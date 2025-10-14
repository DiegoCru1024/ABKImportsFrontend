import type { PendingVariantInterface } from "../variants/pending-variants";
import type { CargoHandlingInterface } from "./cargo-handling";
import type { PackingListInterface } from "./packing-list";

export interface PendingProductInterface {
  productId: string;

  isQuoted: boolean;

  adminComment?: string;

  ghostUrl?: string;

  packingList?: PackingListInterface;

  cargoHandling?: CargoHandlingInterface;

  variants: PendingVariantInterface[];
}
