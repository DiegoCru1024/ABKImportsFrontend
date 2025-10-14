import type { TaxPercentageInterface } from "../tax-percentage";
import type { DynamicValuesInterface } from "./dynamic-values";
import type { ExemptionsInterface } from "./exemptions";

export interface CalculationsInterface {
  dynamicValues: DynamicValuesInterface;

  taxPercentage: TaxPercentageInterface;

  exemptions: ExemptionsInterface;
}
