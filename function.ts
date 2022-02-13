import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { LcaOutputs, Lci, Traci } from './model';
import { LcaInputs } from './model';

const path = require('path');

const GENERIC_POWER_ONLY = 'GPO';
const COMBINED_HEAT_POWER = 'CHP';
const GASIFICATION_POWER = 'GP';

const GWP_CF = {
  // Global warming potential characterization factors (IPCC AR5 standard)
  CO2: 1,
  CH4: 30, // fossil methane
  N2O: 265,
};

// CI calculation from CA-GREET
const carbonRatioVOC = 0.85;
const carbonRatioCO = 12 / 28;
const carbonRatioCO2 = 12 / 44;
const gwpVOC = carbonRatioVOC / carbonRatioCO2;
const gwpCO = carbonRatioCO / carbonRatioCO2;

export const lifeCycleAnalysis = async (params: LcaInputs): Promise<LcaOutputs> => {
  const lcaOutputs: LcaOutputs = {
    lifeCycleEmissions: {
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
    },
    lifeCycleImpacts: {
      global_warming_air: 0,
      acidification_air: 0,
      hh_particulate_air: 0,
      eutrophication_air: 0,
      smog_air: 0,
    },
    lifeStageCO2: {
      harvest: 0,
      transport: 0,
      conversion: 0,
      construction: 0,
      equipment: 0,
    },
    lifeStageGWP: {
      harvest: 0,
      transport: 0,
      conversion: 0,
      construction: 0,
      equipment: 0,
    },
  };

  let lci: Lci[];
  let traci: Traci[];
  let data: any;

  const lciDataPath = path.join(__dirname, './data/lci.csv');
  let file = readFileSync(lciDataPath, 'utf8');
  parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (result) => (data = result.data),
  });
  lci = data;

  const traciDataPath = path.join(__dirname, './data/traci.csv');
  file = readFileSync(traciDataPath, 'utf8');
  parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (result) => (data = result.data),
  });
  traci = data;

  await computeLifeCycleEmissions(lci, params, lcaOutputs);
  await computeLifeCycleImpacts(traci, lcaOutputs);
  return lcaOutputs;
};

const computeLifeCycleEmissions = async (
  lci: Lci[],
  params: LcaInputs,
  lcaOutputs: LcaOutputs
): Promise<void> => {
  for (let i = 0; i < lci.length; i++) {
    const pollutant = lci[i];
    const pollutantEmission = computePollutantEmission(pollutant, params, lcaOutputs);
    switch (pollutant.name) {
      case 'CO2':
        lcaOutputs.lifeCycleEmissions.CO2 = pollutantEmission;
        break;
      case 'CH4':
        lcaOutputs.lifeCycleEmissions.CH4 = pollutantEmission;
        break;
      case 'N2O':
        lcaOutputs.lifeCycleEmissions.N2O = pollutantEmission;
        break;
      case 'CO':
        lcaOutputs.lifeCycleEmissions.CO = pollutantEmission;
        break;
      case 'NOx':
        lcaOutputs.lifeCycleEmissions.NOx = pollutantEmission;
        break;
      case 'PM10':
        lcaOutputs.lifeCycleEmissions.PM10 = pollutantEmission;
        break;
      case 'PM25':
        lcaOutputs.lifeCycleEmissions.PM25 = pollutantEmission;
        break;
      case 'SOx':
        lcaOutputs.lifeCycleEmissions.SOx = pollutantEmission;
        break;
      case 'VOC':
        lcaOutputs.lifeCycleEmissions.VOC = pollutantEmission;
        break;
    }
  }

  lcaOutputs.lifeCycleEmissions.CI =
    (lcaOutputs.lifeCycleEmissions.CO / 1000) * gwpCO +
    lcaOutputs.lifeCycleEmissions.CO2 +
    (lcaOutputs.lifeCycleEmissions.CH4 / 1000) * GWP_CF.CH4 +
    (lcaOutputs.lifeCycleEmissions.N2O / 1000) * GWP_CF.N2O +
    (lcaOutputs.lifeCycleEmissions.VOC / 1000) * gwpVOC;
};

const computeLifeCycleImpacts = async (traci: Traci[], lcaOutputs: LcaOutputs): Promise<void> => {
  const lifeCycleEmissionsKg = [
    lcaOutputs.lifeCycleEmissions.CO2,
    lcaOutputs.lifeCycleEmissions.CH4 / 1000,
    lcaOutputs.lifeCycleEmissions.N2O / 1000,
    lcaOutputs.lifeCycleEmissions.CO / 1000,
    lcaOutputs.lifeCycleEmissions.NOx / 1000,
    lcaOutputs.lifeCycleEmissions.PM10 / 1000,
    lcaOutputs.lifeCycleEmissions.SOx / 1000,
  ];

  let substanceTotal;
  for (let i = 0; i < lifeCycleEmissionsKg.length; i++) {
    substanceTotal = lifeCycleEmissionsKg[i];
    lcaOutputs.lifeCycleImpacts.global_warming_air += substanceTotal * traci[i].global_warming_air;
    lcaOutputs.lifeCycleImpacts.acidification_air += substanceTotal * traci[i].acidification_air;
    lcaOutputs.lifeCycleImpacts.hh_particulate_air += substanceTotal * traci[i].hh_particulate_air;
    lcaOutputs.lifeCycleImpacts.eutrophication_air += substanceTotal * traci[i].eutrophication_air;
    lcaOutputs.lifeCycleImpacts.smog_air += substanceTotal * traci[i].smog_air;
  }
};

const computePollutantEmission = (pollutant: Lci, params: LcaInputs, lcaOutputs: LcaOutputs) => {
  let pollutantEmission =
    pollutant.diesel * params.harvestDiesel +
    pollutant.diesel * params.unloadDiesel +
    pollutant.gasoline * params.gasoline +
    pollutant.jetfuel * params.jetfuel +
    pollutant.transport * params.distance +
    pollutant.construction * params.construction +
    pollutant.equipment * params.equipment;

  switch (pollutant.name) {
    case 'CO2':
      lcaOutputs.lifeStageCO2.harvest =
        pollutant.diesel * params.harvestDiesel +
        pollutant.gasoline * params.gasoline +
        pollutant.jetfuel * params.jetfuel;
      lcaOutputs.lifeStageCO2.transport =
        pollutant.transport * params.distance + pollutant.diesel * params.unloadDiesel;
      lcaOutputs.lifeStageCO2.construction = pollutant.construction * params.construction;
      lcaOutputs.lifeStageCO2.equipment = pollutant.equipment * params.equipment;

      lcaOutputs.lifeStageGWP.harvest +=
        pollutant.diesel * params.harvestDiesel +
        pollutant.gasoline * params.gasoline +
        pollutant.jetfuel * params.jetfuel;
      lcaOutputs.lifeStageGWP.transport +=
        pollutant.transport * params.distance + pollutant.diesel * params.unloadDiesel;
      lcaOutputs.lifeStageGWP.construction += pollutant.construction * params.construction;
      lcaOutputs.lifeStageGWP.equipment += pollutant.equipment * params.equipment;
      break;
    case 'CH4':
      lcaOutputs.lifeStageGWP.harvest +=
        ((pollutant.diesel * params.harvestDiesel +
          pollutant.gasoline * params.gasoline +
          pollutant.jetfuel * params.jetfuel) /
          1000) *
        GWP_CF.CH4;
      lcaOutputs.lifeStageGWP.transport +=
        ((pollutant.transport * params.distance + pollutant.diesel * params.unloadDiesel) / 1000) *
        GWP_CF.CH4;
      lcaOutputs.lifeStageGWP.construction +=
        ((pollutant.construction * params.construction) / 1000) * GWP_CF.CH4;
      lcaOutputs.lifeStageGWP.equipment +=
        ((pollutant.equipment * params.equipment) / 1000) * GWP_CF.CH4;
      break;
    case 'N2O':
      lcaOutputs.lifeStageGWP.harvest +=
        ((pollutant.diesel * params.harvestDiesel +
          pollutant.gasoline * params.gasoline +
          pollutant.jetfuel * params.jetfuel) /
          1000) *
        GWP_CF.N2O;
      lcaOutputs.lifeStageGWP.transport +=
        ((pollutant.transport * params.distance + pollutant.diesel * params.unloadDiesel) / 1000) *
        GWP_CF.N2O;
      lcaOutputs.lifeStageGWP.construction +=
        ((pollutant.construction * params.construction) / 1000) * GWP_CF.N2O;
      lcaOutputs.lifeStageGWP.equipment +=
        ((pollutant.equipment * params.equipment) / 1000) * GWP_CF.N2O;
      break;
  }

  switch (params.technology) {
    case GENERIC_POWER_ONLY:
      pollutantEmission += pollutant.gpo;
      switch (pollutant.name) {
        case 'CO2':
          lcaOutputs.lifeStageCO2.conversion = pollutant.gpo;
          lcaOutputs.lifeStageGWP.conversion += pollutant.gpo;
          break;
        case 'CH4':
          lcaOutputs.lifeStageGWP.conversion += (pollutant.gpo / 1000) * GWP_CF.CH4;
          break;
        case 'N2O':
          lcaOutputs.lifeStageGWP.conversion += (pollutant.gpo / 1000) * GWP_CF.N2O;
          break;
      }
      break;
    case COMBINED_HEAT_POWER:
      pollutantEmission += pollutant.chp;
      switch (pollutant.name) {
        case 'CO2':
          lcaOutputs.lifeStageCO2.conversion = pollutant.chp;
          lcaOutputs.lifeStageGWP.conversion += pollutant.chp;
          break;
        case 'CH4':
          lcaOutputs.lifeStageGWP.conversion += (pollutant.chp / 1000) * GWP_CF.CH4;
          break;
        case 'N2O':
          lcaOutputs.lifeStageGWP.conversion += (pollutant.chp / 1000) * GWP_CF.N2O;
          break;
      }
      break;
    case GASIFICATION_POWER:
      pollutantEmission += pollutant.gp;
      switch (pollutant.name) {
        case 'CO2':
          lcaOutputs.lifeStageCO2.conversion = pollutant.gp;
          lcaOutputs.lifeStageGWP.conversion += pollutant.gp;
          break;
        case 'CH4':
          lcaOutputs.lifeStageGWP.conversion += (pollutant.gp / 1000) * GWP_CF.CH4;
          break;
        case 'N2O':
          lcaOutputs.lifeStageGWP.conversion += (pollutant.gp / 1000) * GWP_CF.N2O;
          break;
      }
      break;
  }

  return pollutantEmission;
};
