// analysis table
export interface Lci {
  oid: number;
  flow: string;
  category: string;
  unit: string;
  electricity_gpo: number; // 1 kWh electricity
  electricity_chp: number;
  diesel: number; // 1 m3
  gasoline: number; // 1 m3
  kerosene: number; // 1 m3
  transport_long: number; // t*km
  transport_short: number; // t*km
  total: number;
}

export interface Traci {
  oid: number;
  cas: number;
  global_warming_air: number;
  acidification_air: number;
  hh_particulate_air: number;
  eutrophication_air: number;
  eutrophication_water: number;
  ozone_depletion_air: number;
  smog_air: number;
  ecotox_airu_fresh_water: number;
  ecotox_airc_fresh_water: number;
  ecotox_waterc_fresh_water: number;
  ecotox_seawaterc_fresh_water: number;
  ecotox_natsoilc_fresh_water: number;
  ecotox_agrsoilc_fresh_water: number;
  cf_flag_ecotox: number;
  hh_urban_air_cancer: number;
  hh_urban_air_noncanc: number;
  hh_rural_air_cancer: number;
  hh_rural_air_noncanc: number;
  hh_fresh_water_cancer: number;
  hh_fresh_water_noncanc: number;
  hh_sea_water_cancer: number;
  hh_sea_water_noncanc: number;
  hh_natural_soil_cancer: number;
  hh_natural_soil_noncanc: number;
  hh_agric_soil_cancer: number;
  hh_agric_soil_noncanc: number;
  cf_flag_hh_carcinogenic: number;
  cf_flag_hh_noncarcinogenic: number;
}
