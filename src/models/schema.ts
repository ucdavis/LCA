// analysis table
export interface Lci {
  index: number;
  name: string;
  unit: string;
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
  name: string;
  global_warming_air: number;
  acidification_air: number;
  hh_particulate_air: number;
  eutrophication_air: number;
  eutrophication_water: number;
  smog_air: number;
}
