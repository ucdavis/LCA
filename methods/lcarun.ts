import knex from 'knex';

import { Lci } from 'models/schema';
import { RunParams } from './lca.model';

// NonrenewableUnitParams were used to change units for nonrenewable group. Units change is not needed for other groups
interface NonrenewableUnitParams {
  brownCoal: number;
  hardCoal: number;
  crudeOil: number;
  mineGas: number;
  naturalGas: number;
  Uranium: number;
  [key: string]: number;
}
const unitParams: NonrenewableUnitParams = { brownCoal: 9.9, hardCoal: 19.1, crudeOil: 45.8,
                                             mineGas: 32.45, naturalGas: 32.12, Uranium: 560000};

const lcarun = async (params: RunParams, db: knex) => {
  const consumptions = await processInput(params, db);
  const pollutions = await processOutput(params, db);

  return { success: true, params, consumptions, pollutions };
};

const processInput = async (params: RunParams, db: knex) => {
  const consumptionRows: Lci[] = await db
  .table('lci_input')
  .where({ lci_group: 'renewable' }).orWhere({ lci_group: 'nonrenewable' }).orWhere({ lci_group: 'water' });

  let renewableSum = 0;
  let nonrenewableSum = 0;
  let waterSum = 0;

  for (let i = 0; i < consumptionRows.length; i++) {
    if (consumptionRows[i].lci_group === 'renewable') {
      renewableSum = renewableSum + processRow(consumptionRows[i], params);
    }
    if (consumptionRows[i].lci_group === 'nonrenewable') {
      nonrenewableSum = nonrenewableSum + processRow(consumptionRows[i], params)
      * unitParams[consumptionRows[i].lci_name];
    }
    if (consumptionRows[i].lci_group === 'water') {
      waterSum = waterSum + processRow(consumptionRows[i], params);
    }
  }
  return { renewableSum, nonrenewableSum, waterSum };
};

const processOutput = async (params: RunParams, db: knex) => {
  const pollutionRows: Lci[] = await db
    .table('lci_output')
    .where({ lci_group: 'CO2' }).orWhere({ lci_group: 'CH4' }).orWhere({ lci_group: 'N2O' })
    .orWhere({ lci_group: 'CO' }).orWhere({ lci_group: 'NOx' }).orWhere({ lci_group: 'NMVOC' })
    .orWhere({ lci_group: 'particulates' });

  let co2Sum = 0; // CO2
  let ch4Sum = 0; // CH4
  let n2oSum = 0; // N2O
  let coSum = 0; // CO
  let noxSum = 0; // NOx
  let nmvocSum = 0; // NMVOC
  let particulatesSum = 0;
  let co2eSum = 0; // CO2 equivalent

  for (let i = 0; i < pollutionRows.length; i++) {
    if (pollutionRows[i].lci_group === 'CO2') {
      co2Sum = co2Sum + processRow(pollutionRows[i], params) * 1000;
    }
    if (pollutionRows[i].lci_group === 'CH4') {
      ch4Sum = ch4Sum + processRow(pollutionRows[i], params) * 1000;
    }
    if (pollutionRows[i].lci_group === 'N2O') {
      n2oSum = n2oSum + processRow(pollutionRows[i], params) * 1000;
    }
    if (pollutionRows[i].lci_group === 'CO') {
      coSum = coSum + processRow(pollutionRows[i], params) * 1000;
    }
    if (pollutionRows[i].lci_group === 'NOx') {
      noxSum = noxSum + processRow(pollutionRows[i], params) * 1000;
    }
    if (pollutionRows[i].lci_group === 'NMVOC') {
      nmvocSum = nmvocSum + processRow(pollutionRows[i], params) * 1000;
    }
    if (pollutionRows[i].lci_group === 'particulates') {
      particulatesSum = particulatesSum + processRow(pollutionRows[i], params) * 1000;
    }
  }
  co2eSum = co2Sum + ch4Sum * 30 + n2oSum * 265;
  return { co2Sum, ch4Sum, n2oSum, coSum, noxSum, nmvocSum, particulatesSum, co2eSum };
};

const processRow = (row: Lci, params: RunParams) => {
    const result = row.diesel * params.grindfuel * params.biomass
    + row.diesel * params.excavatfuel * params.biomass
    + row.transport * params.distance * params.biomass / 1000
    + row.electricity;
    // console.log(result);
    return (
    result
  );
};

export { lcarun };
