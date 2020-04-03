import knex from 'knex';

import { Lci } from 'models/schema';
import { LCIResults, RunParams } from './lca.model';

const lcarun = async (params: RunParams, db: knex) => {
  const lciOut = await calculateLCI(params, db);
  // const lciaOut = await calculateLCIA(lci.rows);
  const lciResults = lciOut.results;
  console.log(lciResults);
  return { lciResults };
};

const calculateLCI = async (params: RunParams, db: knex) => {
  const rows: Lci[] = await db.select('*').from('lci');
  const lciResults: LCIResults = {
    CO2: 0,
    CH4: 0,
    N2O: 0,
    CO2e: 0,
    CO: 0,
    NOx: 0,
    NMVOC: 0,
    Particulates: 0
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    row.total = processRow(row, params);
    if (row.oid === 598) {
      lciResults.CO2 = row.total * 1000; // kilograms to grams
    } else if (row.oid === 1959) {
      lciResults.CH4 = row.total * 1000;
    } else if (row.oid === 2167) {
      lciResults.N2O = row.total * 1000;
    } else if (row.oid === 607) {
      lciResults.CO = row.total * 1000;
    } else if (row.oid === 2160) {
      lciResults.NOx = row.total * 1000;
    } else if (row.oid === 3463) {
      lciResults.NMVOC = row.total * 1000;
    } else if (row.oid === 2293 || row.oid === 2297) {
      lciResults.Particulates += row.total * 1000;
    }
  }
  lciResults.CO2e = lciResults.CO2 + lciResults.CH4 * 25 + lciResults.N2O * 298;

  return { rows: rows, results: lciResults };
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
    case 'Generic Power Only':
      total += row.electricity_gpo;
      break;
    case 'Combined Heat and Power':
      total += row.electricity_chp;
      break;
  }

  return total;
};

export { lcarun };
