export interface RunParams {
  technology: string;
  diesel: number; // m3
  gasoline: number; // m3
  jetfuel: number; // m3
  distance: number; // mile
}

export interface LCIresults {
  CO2: number; // grams
  CH4: number;
  N2O: number;
  CO2e: number;
  CO: number;
  NOx: number;
  VOCs: number; // Volatile Organic Compounds
  PM10: number;
  PM25: number; // PM 2.5
}

export interface LCIAresults {
  global_warming_air: number;
  acidification_air: number;
  hh_particulate_air: number;
  eutrophication_air: number;
  eutrophication_water: number;
  smog_air: number;
}
