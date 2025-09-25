import type { GeneralInformationInterface } from "../shared/general-information"
import type { ResumenInfoInterface } from "../shared/resume-information"

export interface ResponseDataPending{
  resumenInfo:ResumenInfoInterface
  generalInformation:GeneralInformationInterface
}