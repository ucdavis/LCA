import knex from 'knex';

import { Lci, Traci } from '../models/schema';
import { LCIAresults, LCIresults, RunParams } from './lca.model';

const lcarun = async (params: RunParams, db: knex) => {
  const lciOut = await calculateLCI(params, db);
  const lci = lciOut.lci;
  const lciResults = lciOut.results;
  const lciaResults = await calculateLCIA(lci, db);
  return { lciResults, lciaResults };
};

const calculateLCI = async (params: RunParams, db: knex) => {
  const schema = process.env.DB_SCHEMA ? process.env.DB_SCHEMA : 'public';
  console.log('schema: ' + schema);
  const lci: Lci[] = await db.withSchema(schema).select('*').from('lci').orderBy('index');
  const lciResults: LCIresults = {
    CO2: 0,
    CH4: 0,
    N2O: 0,
    CO2e: 0,
    CO: 0,
    NOx: 0,
    NMVOC: 0,
    Particulates: 0,
  };

  for (let i = 0; i < lci.length; i++) {
    const row = lci[i];
    row.total = processRow(row, params);
    if (row.index === 598) {
      lciResults.CO2 = row.total * 1000; // kilograms to grams
    } else if (row.index === 1959) {
      lciResults.CH4 = row.total * 1000;
    } else if (row.index === 2167) {
      lciResults.N2O = row.total * 1000;
    } else if (row.index === 607) {
      lciResults.CO = row.total * 1000;
    } else if (row.index === 2160) {
      lciResults.NOx = row.total * 1000;
    } else if (row.index === 3463) {
      lciResults.NMVOC = row.total * 1000;
    } else if (row.index === 2293 || row.index === 2297) {
      lciResults.Particulates += row.total * 1000;
    }
  }
  lciResults.CO2e = lciResults.CO2 + lciResults.CH4 * 25 + lciResults.N2O * 298;

  return { lci: lci, results: lciResults };
};

const calculateLCIA = async (lci: Lci[], db: knex) => {
  const schema = process.env.DB_SCHEMA ? process.env.DB_SCHEMA : 'public';
  const traci: Traci[] = await db.withSchema(schema).select('*').from('traci').orderBy('index');
  const lcia: LCIAresults = {
    global_warming_air: 0,
    acidification_air: 0,
    hh_particulate_air: 0,
    eutrophication_air: 0,
    eutrophication_water: 0,
    ozone_depletion_air: 0,
    smog_air: 0,
    ecotox_airu_fresh_water: 0,
    ecotox_airc_fresh_water: 0,
    ecotox_waterc_fresh_water: 0,
    ecotox_seawaterc_fresh_water: 0,
    ecotox_natsoilc_fresh_water: 0,
    ecotox_agrsoilc_fresh_water: 0,
    hh_urban_air_cancer: 0,
    hh_urban_air_noncanc: 0,
    hh_rural_air_cancer: 0,
    hh_rural_air_noncanc: 0,
    hh_fresh_water_cancer: 0,
    hh_fresh_water_noncanc: 0,
    hh_sea_water_cancer: 0,
    hh_sea_water_noncanc: 0,
    hh_natural_soil_cancer: 0,
    hh_natural_soil_noncanc: 0,
    hh_agric_soil_cancer: 0,
    hh_agric_soil_noncanc: 0,
  };

  for (let i = 0; i < lci.length; i++) {
    lcia.global_warming_air += lci[i].total * traci[i].global_warming_air;
    lcia.acidification_air += lci[i].total * traci[i].acidification_air;
    lcia.hh_particulate_air += lci[i].total * traci[i].hh_particulate_air;
    lcia.eutrophication_air += lci[i].total * traci[i].eutrophication_air;
    lcia.eutrophication_water += lci[i].total * traci[i].eutrophication_water;
    lcia.ozone_depletion_air += lci[i].total * traci[i].ozone_depletion_air;
    lcia.smog_air += lci[i].total * traci[i].smog_air;
    lcia.ecotox_airu_fresh_water +=
      lci[i].total * traci[i].ecotox_airu_fresh_water;
    lcia.ecotox_airc_fresh_water +=
      lci[i].total * traci[i].ecotox_airc_fresh_water;
    lcia.ecotox_waterc_fresh_water +=
      lci[i].total * traci[i].ecotox_waterc_fresh_water;
    lcia.ecotox_seawaterc_fresh_water +=
      lci[i].total * traci[i].ecotox_seawaterc_fresh_water;
    lcia.ecotox_natsoilc_fresh_water +=
      lci[i].total * traci[i].ecotox_natsoilc_fresh_water;
    lcia.ecotox_agrsoilc_fresh_water +=
      lci[i].total * traci[i].ecotox_agrsoilc_fresh_water;
    lcia.hh_urban_air_cancer += lci[i].total * traci[i].hh_urban_air_cancer;
    lcia.hh_urban_air_noncanc += lci[i].total * traci[i].hh_urban_air_noncanc;
    lcia.hh_rural_air_cancer += lci[i].total * traci[i].hh_rural_air_cancer;
    lcia.hh_rural_air_noncanc += lci[i].total * traci[i].hh_rural_air_noncanc;
    lcia.hh_fresh_water_cancer += lci[i].total * traci[i].hh_fresh_water_cancer;
    lcia.hh_fresh_water_noncanc +=
      lci[i].total * traci[i].hh_fresh_water_noncanc;
    lcia.hh_sea_water_cancer += lci[i].total * traci[i].hh_sea_water_cancer;
    lcia.hh_sea_water_noncanc += lci[i].total * traci[i].hh_sea_water_noncanc;
    lcia.hh_natural_soil_cancer +=
      lci[i].total * traci[i].hh_natural_soil_cancer;
    lcia.hh_natural_soil_noncanc +=
      lci[i].total * traci[i].hh_natural_soil_noncanc;
    lcia.hh_agric_soil_cancer += lci[i].total * traci[i].hh_agric_soil_cancer;
    lcia.hh_agric_soil_noncanc += lci[i].total * traci[i].hh_agric_soil_noncanc;
  }

  return lcia;
};

const processRow = (row: Lci, params: RunParams) => {
  let total =
    row.diesel * params.diesel +
    row.gasoline * params.gasoline +
    row.kerosene * params.jetfuel;
  if (params.distance <= 322) {
    total += row.transport_short * params.biomass * params.distance;
  } else {
    total += row.transport_long * params.biomass * params.distance;
  }
  switch (params.technology) {
    case 'GPO': // Generic Power Only
      total += row.electricity_gpo;
      break;
    case 'CHP': // Combined Heat and Power
      total += row.electricity_chp;
      break;
  }

  return total;
};

export { lcarun };
