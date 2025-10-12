export interface FiscalObligationsInterface {
  adValorem: number;

  isc: number;

  igv: number;

  ipm: number;

  antidumping: {
    antidumpingGobierno: number;
    antidumpingCantidad: number;
    antidumpingValor: number;
  };

  percepcion: number;

  totalTaxes: number;
}