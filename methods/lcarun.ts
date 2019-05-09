import knex from 'knex';

import { Lci } from 'models/schema';
import { RunParams } from './lca.model';
// tslint:disable: variable-name

// NonrenewableUnitParams were used to change units for nonrenewable group. Units change is not needed for other groups
interface NonrenewableUnitParams {
  'brownCoal': number;
  'hardCoal': number;
  'crudeOil': number;
  'mineGas': number;
  'naturalGas': number;
  'Uranium': number;
  [key: string]: number;
}
const unitParams: NonrenewableUnitParams = { 'brownCoal': 9.9, 'hardCoal': 19.1, 'crudeOil': 45.8,
                                             'mineGas': 32.45, 'naturalGas': 32.12, 'Uranium': 560000};

const lcarun = async (params: RunParams, db: knex) => {
  const inputRows: Lci[] = await db
    .table('lci_input')
    .where({ lci_group: 'renewable' }).orWhere({ lci_group: 'nonrenewable' }).orWhere({ lci_group: 'water' });

  const outputRows: Lci[] = await db
    .table('lci_output')
    .where({ lci_group: 'CO2' }).orWhere({ lci_group: 'CH4' }).orWhere({ lci_group: 'N2O' })
    .orWhere({ lci_group: 'CO' }).orWhere({ lci_group: 'NOx' }).orWhere({ lci_group: 'NMVOC' })
    .orWhere({ lci_group: 'particulates' });
  // const nonrenewableRows: Lci[] = await db
  //   .table('lci_input')
  //   .where({ lci_group: 'nonrenewable' });
  // const waterRows: Lci[] = await db
  //   .table('lci_input')
  //   .where({ lci_group: 'water' });

  // const bigNum = Math.max(...rows.map(r => r.number));

  let CO2sum = 0;
  let CH4sum = 0;
  let N2Osum = 0;
  let COsum = 0;
  let NOxsum = 0;
  let NMVOCsum = 0;
  let particulatesSum = 0;
  let CO2eSum = 0;


  for (let i = 0; i < outputRows.length; i++) {
    if (outputRows[i].lci_group === 'CO2') {
      CO2sum = CO2sum + processRow(outputRows[i], params) * 1000;
    }
    if (outputRows[i].lci_group === 'CH4') {
      CH4sum = CH4sum + processRow(outputRows[i], params) * 1000;
    }
    if (outputRows[i].lci_group === 'N2O') {
      N2Osum = N2Osum + processRow(outputRows[i], params) * 1000;
    }
    if (outputRows[i].lci_group === 'CO') {
      COsum = COsum + processRow(outputRows[i], params) * 1000;
    }
    if (outputRows[i].lci_group === 'NOx') {
      NOxsum = NOxsum + processRow(outputRows[i], params) * 1000;
    }
    if (outputRows[i].lci_group === 'NMVOC') {
      NMVOCsum = NMVOCsum + processRow(outputRows[i], params) * 1000;
    }
    if (outputRows[i].lci_group === 'particulates') {
      particulatesSum = particulatesSum + processRow(outputRows[i], params) * 1000;
    }
  }
  CO2eSum = CO2sum + CH4sum * 30 + N2Osum * 265;
  return { success: true, params, inputRows, renewableSum, nonrenewableSum, waterSum,
           outputRows, CO2sum, CH4sum, N2Osum, COsum, NOxsum, NMVOCsum, particulatesSum, CO2eSum };
};

const processInput = (inputRows: Lci[], params: RunParams) => {
  let renewableSum = 0;
  let nonrenewableSum = 0;
  let waterSum = 0;

  for (let i = 0; i < inputRows.length; i++) {
    if (inputRows[i].lci_group === 'renewable') {
      renewableSum = renewableSum + processRow(inputRows[i], params);
    }
    if (inputRows[i].lci_group === 'nonrenewable') {
      nonrenewableSum = nonrenewableSum + processRow(inputRows[i], params) * unitParams[inputRows[i].lci_name];
    }
    if (inputRows[i].lci_group === 'water') {
      waterSum = waterSum + processRow(inputRows[i], params);
    }
  }
  return { renewableSum, nonrenewableSum, waterSum }
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
