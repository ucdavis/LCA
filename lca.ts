import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { Lci, LifeCycleEmissions, LifeCycleImpacts, Traci } from './lca.model';
import { LcaInputs } from './lca.model';
const path = require('path');

const GENERIC_POWER_ONLY = 'GPO';
const COMBINED_HEAT_POWER = 'CHP';
const GASIFICATION_POWER = 'GP';

export const lifeCycleAnalysis = async (params: LcaInputs) => {
  let lci: Lci[];
  let traci: Traci[];
  let data: any;

  const lciData = path.join(__dirname, './data/lci.csv');
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

  const lifeCycleEmissions = await computeLifeCycleEmissions(lci, params);
  const lifeCycleImpacts = await computeLifeCycleImpacts(
    traci,
    lifeCycleEmissions
  );
  return { lifeCycleEmissions, lifeCycleImpacts };
};

const computeLifeCycleEmissions = async (lci: Lci[], params: LcaInputs) => {
  const lifeCycleEmissions: LifeCycleEmissions = {
    CO2: 0,
    CH4: 0,
    N2O: 0,
    CO: 0,
    NOx: 0,
    PM10: 0,
    PM25: 0,
    SOx: 0,
    VOC: 0,
    CI: 0,
  };
  for (let i = 0; i < lci.length; i++) {
    const pollutant = lci[i];
    const pollutantEmission = computePollutantEmission(pollutant, params);
    switch (pollutant.name) {
      case 'CO2':
        lifeCycleEmissions.CO2 = pollutantEmission;
        break;
      case 'CH4':
        lifeCycleEmissions.CH4 = pollutantEmission;
        break;
      case 'N2O':
        lifeCycleEmissions.N2O = pollutantEmission;
        break;
      case 'CO':
        lifeCycleEmissions.CO = pollutantEmission;
        break;
      case 'NOx':
        lifeCycleEmissions.NOx = pollutantEmission;
        break;
      case 'PM10':
        lifeCycleEmissions.PM10 = pollutantEmission;
        break;
      case 'PM25':
        lifeCycleEmissions.PM25 = pollutantEmission;
        break;
      case 'SOx':
        lifeCycleEmissions.SOx = pollutantEmission;
        break;
      case 'VOC':
        lifeCycleEmissions.VOC = pollutantEmission;
        break;
    }
  }

  const carbonRatioVOC = 0.85;
  const carbonRatioCO = 12 / 28;
  const carbonRatioCO2 = 12 / 44;
  const gwpVOC = carbonRatioVOC / carbonRatioCO2;
  const gwpCO = carbonRatioCO / carbonRatioCO2;
  const gwpCH4 = 25;
  const gwpN2O = 298;

  lifeCycleEmissions.CI =
    (lifeCycleEmissions.CO / 1000) * gwpCO +
    lifeCycleEmissions.CO2 +
    (lifeCycleEmissions.CH4 / 1000) * gwpCH4 +
    (lifeCycleEmissions.N2O / 1000) * gwpN2O +
    (lifeCycleEmissions.VOC / 1000) * gwpVOC;
  return lifeCycleEmissions;
};

const computeLifeCycleImpacts = async (
  traci: Traci[],
  lifeCycleEmissions: LifeCycleEmissions
) => {
  const lifeCycleImpacts: LifeCycleImpacts = {
    global_warming_air: 0,
    acidification_air: 0,
    hh_particulate_air: 0,
    eutrophication_air: 0,
    eutrophication_water: 0,
    smog_air: 0,
  };

  const lifeCycleEmissionsKg = [
    lifeCycleEmissions.CO2,
    lifeCycleEmissions.CH4 / 1000,
    lifeCycleEmissions.N2O / 1000,
    lifeCycleEmissions.CO / 1000,
    lifeCycleEmissions.NOx / 1000,
    lifeCycleEmissions.PM10 / 1000,
    lifeCycleEmissions.PM25 / 1000,
    lifeCycleEmissions.SOx / 1000,
    lifeCycleEmissions.VOC / 1000,
  ];

  let substanceTotal;
  for (let i = 0; i < lifeCycleEmissionsKg.length; i++) {
    substanceTotal = lifeCycleEmissionsKg[i];
    lifeCycleImpacts.global_warming_air +=
      substanceTotal * traci[i].global_warming_air;
    lifeCycleImpacts.acidification_air +=
      substanceTotal * traci[i].acidification_air;
    lifeCycleImpacts.hh_particulate_air +=
      substanceTotal * traci[i].hh_particulate_air;
    lifeCycleImpacts.eutrophication_air +=
      substanceTotal * traci[i].eutrophication_air;
    lifeCycleImpacts.eutrophication_water +=
      substanceTotal * traci[i].eutrophication_water;
    lifeCycleImpacts.smog_air += substanceTotal * traci[i].smog_air;
  }

  return lifeCycleImpacts;
};

const computePollutantEmission = (pollutant: Lci, params: LcaInputs) => {
  let pollutantEmission =
    pollutant.diesel * params.diesel +
    pollutant.gasoline * params.gasoline +
    pollutant.kerosene * params.jetfuel +
    pollutant.transport * params.distance;

  switch (params.technology) {
    case GENERIC_POWER_ONLY:
      pollutantEmission += pollutant.gpo;
      break;
    case COMBINED_HEAT_POWER:
      pollutantEmission += pollutant.chp;
      break;
    case GASIFICATION_POWER:
      pollutantEmission += pollutant.gp;
      break;
  }

  return pollutantEmission;
};
