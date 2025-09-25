import type { DynamicValuesInterface } from "./dynamic-values";
import type { ExemptionsInterface } from "./exemptions";
import type { TaxPercentageInterface } from "./tax-percentage";

export interface CalculationsInterface {
  dynamicValues: DynamicValuesInterface;

  taxPercentage: TaxPercentageInterface;

  exemptions: ExemptionsInterface;
}
