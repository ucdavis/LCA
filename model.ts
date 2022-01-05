export interface LcaInputs {
  technology: string; // conversion technology
  diesel: number; // gal/kWh electricity
  gasoline: number; // gal/kWh electricity
  jetfuel: number; // gal/kWh electricity
  distance: number; // mile/kWh electricity
  construction: number; // thousand dollars/kWh electricity
  equipment: number; // thousand dollars/kWh electricity
}

export interface LcaOutputs {
  lifeCycleEmissions: LifeCycleEmissions;
  lifeCycleImpacts: LifeCycleImpacts;
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
  jetfuel: number; // 1 gal
  transport: number; // 1 mile
  construction: number; // 1 thousand dollars
  equipment: number; // 1 thousand dollars
}

export interface Traci {
  index: number;
  name: string; // substance name
  global_warming_air: number; // Global Warming Air (kg CO2 eq / kg substance)
  acidification_air: number; // Acidification Air (kg SO2 eq / kg substance)
  hh_particulate_air: number; // HH Particulate Air (PM2.5 eq / kg substance)
  eutrophication_air: number; // Eutrophication Air (kg N eq / kg substance)
  smog_air: number; // Smog Air (kg O3 eq / kg substance)
}

export interface LifeCycleEmissions {
  CO2: number; // kg
  CH4: number; // g
  N2O: number; // g
  CO: number; // g
  NOx: number; // g
  PM10: number; // g PM 10
  PM25: number; // g PM 2.5
  SOx: number; // g
  VOC: number; // g
  CI: number; // Carbon Intensity (kg CO2e)
}

export interface LifeCycleImpacts {
  global_warming_air: number; // Global Warming Air (kg CO2 eq)
  acidification_air: number; // Acidification Air (kg SO2 eq)
  hh_particulate_air: number; // HH Particulate Air (PM2.5 eq)
  eutrophication_air: number; // Eutrophication Air (kg N eq)
  smog_air: number; // Smog Air (kg O3 eq)
}
