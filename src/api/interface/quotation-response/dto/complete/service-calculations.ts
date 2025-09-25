import type { ServiceFiledsInterface } from "./service-field";

export interface ServiceCalculationsInterface {
  serviceFields: ServiceFiledsInterface;

  subtotalServices: number;

  igvServices: number;

  totalServices: number;
}
