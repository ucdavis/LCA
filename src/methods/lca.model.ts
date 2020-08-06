export interface RunParams {
  technology: string;
  diesel: number; // m3
  gasoline: number; // m3
  jetfuel: number; // m3
  distance: number; // mile
}

export interface LCIresults {
  CO2: number; // kg
  CH4: number; // g
  N2O: number; // g
  CO2e: number; // kg
  CO: number; // kg
  NOx: number; // g
  PM10: number; // g
  PM25: number; // g PM 2.5
  VOCs: number; // g Volatile Organic Compounds
}

export interface LCIAresults {
  global_warming_air: number;
  acidification_air: number;
  hh_particulate_air: number;
  eutrophication_air: number;
  eutrophication_water: number;
  smog_air: number;
}
