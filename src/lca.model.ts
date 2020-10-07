export interface RunParams {
  technology: string; // conversion technology
  diesel: number; // gal/kWh electricity
  gasoline: number; // gal/kWh electricity
  jetfuel: number; // gal/kWh electricity
  distance: number; // mile/kWh electricity
}

export interface Lci {
  index: number;
  name: string; // substance name
  unit: string; // substance unit
  gpo: number; // generic power only - 1 kWh electricity
  chp: number; // combined heat and power - 1 kWh electricity
  gp: number; // gasfication power - 1kWh electricity
  diesel: number; // 1 gal
  gasoline: number; // 1 gal
  kerosene: number; // 1 gal
  transport: number; // 1 mile
}

export interface Traci {
  index: number;
  name: string; // substance name
  global_warming_air: number; // Global Warming Air (kg CO2 eq / kg substance)
  acidification_air: number; // Acidification Air (kg SO2 eq / kg substance)
  hh_particulate_air: number; // HH Particulate Air (PM2.5 eq / kg substance)
  eutrophication_air: number; // Eutrophication Air (kg N eq / kg substance)
  eutrophication_water: number; // Eutrophication Water (kg N eq / kg substance)
  smog_air: number; // Smog Air (kg O3 eq / kg substance)
}

export interface LCIresults {
  CO2: number; // kg
  CH4: number; // g
  N2O: number; // g
  CO2e: number; // kg // CO2 equivalent
  CO: number; // kg
  NOx: number; // g
  PM10: number; // g PM 10
  PM25: number; // g PM 2.5
  VOCs: number; // g Volatile Organic Compounds
  CI: number; // Carbon Intensity (g CO2e/MJ)
}

export interface LCIAresults {
  global_warming_air: number; // Global Warming Air (kg CO2 eq)
  acidification_air: number; // Acidification Air (kg SO2 eq)
  hh_particulate_air: number; // HH Particulate Air (PM2.5 eq)
  eutrophication_air: number; // Eutrophication Air (kg N eq)
  eutrophication_water: number; // Eutrophication Water (kg N eq)
  smog_air: number; // Smog Air (kg O3 eq)
}
