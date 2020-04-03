export interface RunParams {
  technology: string;
  diesel: number; // m3
  gasoline: number; // m3
  jetfuel: number; // m3
  distance: number; // km
  biomass: number; // tons
}

export interface LCIResults {
  CO2: number; // grams
  CH4: number;
  N2O: number;
  CO2e: number;
  CO: number;
  NOx: number;
  NMVOC: number;
  Particulates: number;
}
