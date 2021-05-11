import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { Lci, Traci } from './lca.model';
import { LCIAresults, LCIresults, RunParams } from './lca.model';
const path = require('path');

const lcarun = async (params: RunParams) => {
  let lci: Lci[];
  let traci: Traci[];
  let data: any;

  const lciData = path.join(__dirname, '../data/lci.csv');
  let file = readFileSync(lciData, 'utf8');
  parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (result) => (data = result.data),
  });
  lci = data;

  const traciData = path.join(__dirname, '../data/traci.csv');
  file = readFileSync(traciData, 'utf8');
  parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (result) => (data = result.data),
  });
  traci = data;

  const lciOut = await calculateLCI(lci, params);
  const lciResults = lciOut.results;
  const lciTotal = lciOut.total;
  const lciaResults = await calculateLCIA(traci, lciTotal);
  return { lciResults, lciaResults };
};

const calculateLCI = async (lci: Lci[], params: RunParams) => {
  const lciResults: LCIresults = {
    CO2: 0,
    CH4: 0,
    N2O: 0,
    CO: 0,
    NOx: 0,
    PM10: 0,
    PM25: 0,
    SOx: 0,
    CO2e: 0,
    CI: 0
  };
  const lciTotal: number[] = Array(lci.length).fill(0);
  for (let i = 0; i < lci.length; i++) {
    const substance = lci[i];
    const total = processRow(substance, params);
    // lciTotal[i] = total;
    switch (substance.name) {
      case 'CO2':
        lciResults.CO2 = total;
        lciTotal[i] = total;
        break;
      case 'CH4':
        lciResults.CH4 = total;
        lciTotal[i] = total / 1000; // g to kg
        break;
      case 'N2O':
        lciResults.N2O = total;
        lciTotal[i] = total / 1000; // g to kg
        break;
      case 'CO':
        lciResults.CO = total;
        lciTotal[i] = total / 1000; // g to kg
        break;
      case 'NOx':
        lciResults.NOx = total;
        lciTotal[i] = total / 1000; // g to kg
        break;
      case 'PM10':
        lciResults.PM10 = total;
        lciTotal[i] = total / 1000; // g to kg
        break;
      case 'PM25':
        lciResults.PM25 = total;
        lciTotal[i] = total / 1000; // g to kg
        break;
      case 'SOx':
        lciResults.SOx = total;
        lciTotal[i] = total / 1000; // g to kg
        break;
    }
  }
  lciResults.CO2e =
    lciResults.CO2 +
    (lciResults.CH4 / 1000) * 25 +
    (lciResults.N2O / 1000) * 298;

  const carbonRatioVOC = 0.85;
  const carbonRatioCO = 12 / 28;
  const carbonRatioCO2 = 12 / 44;
  const gwpVOC = carbonRatioVOC / carbonRatioCO2;
  const gwpCO = carbonRatioCO / carbonRatioCO2;

  lciResults.CI = lciResults.CO / 1000 * gwpCO + lciResults.CO2e; // g CO2e/kWh

  return { total: lciTotal, results: lciResults };
};

const calculateLCIA = async (traci: Traci[], lciTotal: number[]) => {
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

const processRow = (substance: Lci, params: RunParams) => {
  let total =
    substance.diesel * params.diesel +
    substance.gasoline * params.gasoline +
    substance.kerosene * params.jetfuel +
    substance.transport * params.distance;

  switch (params.technology) {
    case 'GPO': // Generic Power Only
      total += substance.gpo;
      break;
    case 'CHP': // Combined Heat and Power
      total += substance.chp;
      break;
    case 'GP': // Gasification Power
      total += substance.gp;
      break;
  }

  return total;
};

export { lcarun };
