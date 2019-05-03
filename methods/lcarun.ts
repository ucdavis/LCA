import knex from 'knex';

import { Lci } from 'models/schema';
import { RunParams } from './lca.model';

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
  const rows: Lci[] = await db
    .table('lci_input')
    // .where({ lci_group: 'renewable' });
    .where({ lci_group: 'renewable' }).orWhere({ lci_group: 'nonrenewable' }).orWhere({ lci_group: 'water' });
  // const nonrenewableRows: Lci[] = await db
  //   .table('lci_input')
  //   .where({ lci_group: 'nonrenewable' });
  // const waterRows: Lci[] = await db
  //   .table('lci_input')
  //   .where({ lci_group: 'water' });

  // const bigNum = Math.max(...rows.map(r => r.number));
  let renewableSum = 0;
  let nonrenewableSum = 0;
  let waterSum = 0;
  for (let i = 0; i < rows.length; i++) {
      if (rows[i].lci_group === 'renewable') {
        renewableSum = renewableSum + processRow(rows[i], params);
      }
      if (rows[i].lci_group === 'nonrenewable') {
        nonrenewableSum = nonrenewableSum + processRow(rows[i], params) * unitParams[rows[i].lci_name];
      }
      if (rows[i].lci_group === 'water') {
        waterSum = waterSum + processRow(rows[i], params);
      }
  }

  return { success: true, params, rows, renewableSum, nonrenewableSum, waterSum };
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
