// analysis table
export interface Lci {
  index: number;
  name: string;
  unit: string;
  electricity_gpo: number; // 1 kWh electricity
  electricity_chp: number;
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
