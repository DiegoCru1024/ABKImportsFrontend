import type { GeneralInformationInterface } from "../shared/general-information";
import type { ResumenInfoInterface } from "../shared/resume-information";
import type { CalculationsInterface } from "./objects/calculations";
import type { FiscalObligationsInterface } from "./objects/fiscal-obligations";
import type { ImportCostsInterface } from "./objects/import-costs";
import type { MaritimeConfigInterface } from "./objects/maritime-config";
import type { QuoteSummaryInterface } from "./objects/quote-summary";
import type { ServiceCalculationsInterface } from "./objects/service-calculations";


export interface ResponseDataComplete {
  type: string;

  resumenInfo: ResumenInfoInterface;

  generalInformation: GeneralInformationInterface;

  maritimeConfig?: MaritimeConfigInterface;

  calculations: CalculationsInterface;

  serviceCalculations: ServiceCalculationsInterface;

  fiscalObligations: FiscalObligationsInterface;

  importCosts: ImportCostsInterface

  quoteSummary: QuoteSummaryInterface;
}
