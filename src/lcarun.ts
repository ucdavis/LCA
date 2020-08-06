import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { Lci, Traci } from './lca.model';
import { LCIAresults, LCIresults, RunParams } from './lca.model';

const lcarun = async (params: RunParams) => {
  let lci: Lci[];
  let traci: Traci[];
  let data: any;

  let file = readFileSync('./data/lci.csv', 'utf8');
  parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (result) => (data = result.data),
  });
  lci = data;

  file = readFileSync('./data/traci.csv', 'utf8');
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
    CO2e: 0,
    CO: 0,
    NOx: 0,
    PM10: 0,
    PM25: 0,
    VOCs: 0,
  };
  const lciTotal: number[] = Array(lci.length).fill(0);
  for (let i = 0; i < lci.length; i++) {
    const substance = lci[i];
    const total = processRow(substance, params);
    lciTotal[i] = total;
    switch (substance.name) {
      case 'CO2':
        lciResults.CO2 = total;
        break;
      case 'CH4':
        lciResults.CH4 = total * 1000; // kilograms to grams
        break;
      case 'N2O':
        lciResults.N2O = total * 1000;
        break;
      case 'CO':
        lciResults.CO = total;
        break;
      case 'NOx':
        lciResults.NOx = total * 1000;
        break;
      case 'PM10':
        lciResults.PM10 = total * 1000;
        break;
      case 'PM25':
        lciResults.PM25 = total * 1000;
        break;
      case 'VOCs':
        lciResults.VOCs = total * 1000;
        break;
    }
  }
  lciResults.CO2e =
    lciResults.CO2 +
    (lciResults.CH4 / 1000) * 25 +
    (lciResults.N2O / 1000) * 298;

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
