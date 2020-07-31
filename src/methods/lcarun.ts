import knex from 'knex';
import { Lci, Traci } from '../models/schema';
import { LCIAresults, LCIresults, RunParams } from './lca.model';

const lcarun = async (params: RunParams, db: knex) => {
  const schema = process.env.DB_SCHEMA ? process.env.DB_SCHEMA : 'public';
  const lci: Lci[] = await db
    .withSchema(schema)
    .select('*')
    .from('lci')
    .orderBy('index');
  const lciOut = await calculateLCI(lci, params);
  const lciResults = lciOut.results;
  const lciTotal = lciOut.total;
  const lciaResults = await calculateLCIA(lciTotal, db);
  return { lciResults, lciaResults };
};

const calculateLCI = async (lci: Lci[], params: RunParams) => {
  const lciResults: LCIresults = {
    CO2: 0,
    CH4: 0,
    N2O: 0,
    CO2e: 0,
    CO: 0,
    NOx: 0,
    VOCs: 0, // Volatile Organic Compounds
    PM10: 0,
    PM25: 0, // PM 2.5
  };
  const lciTotal: number[] = Array(lci.length).fill(0);
  for (let i = 0; i < lci.length; i++) {
    const substance = lci[i];
    const total = processRow(substance, params);
    lciTotal[i] = total;
    switch (substance.name) {
      case 'CO2':
        lciResults.CO2 = total * 1000; // kilograms to grams
        break;
      case 'CH4':
        lciResults.CH4 = total * 1000;
        break;
      case 'N2O':
        lciResults.N2O = total * 1000;
        break;
      case 'CO':
        lciResults.CO = total * 1000;
        break;
      case 'NOx':
        lciResults.NOx = total * 1000;
        break;
      case 'VOCs':
        lciResults.VOCs = total * 1000;
        break;
      case 'PM10':
        lciResults.PM10 = total * 1000;
        break;
      case 'PM25':
        lciResults.PM25 = total * 1000;
        break;
    }
  }
  lciResults.CO2e = lciResults.CO2 + lciResults.CH4 * 25 + lciResults.N2O * 298;

  return { total: lciTotal, results: lciResults };
};

const calculateLCIA = async (lciTotal: number[], db: knex) => {
  const schema = process.env.DB_SCHEMA ? process.env.DB_SCHEMA : 'public';
  const traci: Traci[] = await db
    .withSchema(schema)
    .select('*')
    .from('traci')
    .orderBy('index');
  const lcia: LCIAresults = {
    global_warming_air: 0,
    acidification_air: 0,
    hh_particulate_air: 0,
    eutrophication_air: 0,
    eutrophication_water: 0,
    smog_air: 0,
  };

  let substanceTotal;
  for (let i = 0; i < lciTotal.length; i++) {
    substanceTotal = lciTotal[i];
    lcia.global_warming_air += substanceTotal * traci[i].global_warming_air;
    lcia.acidification_air += substanceTotal * traci[i].acidification_air;
    lcia.hh_particulate_air += substanceTotal * traci[i].hh_particulate_air;
    lcia.eutrophication_air += substanceTotal * traci[i].eutrophication_air;
    lcia.eutrophication_water += substanceTotal * traci[i].eutrophication_water;
    lcia.smog_air += substanceTotal * traci[i].smog_air;
  }

  return lcia;
};

const processRow = (row: Lci, params: RunParams) => {
  let total =
    row.diesel * params.diesel +
    row.gasoline * params.gasoline +
    row.kerosene * params.jetfuel +
    row.transport * params.distance;

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
