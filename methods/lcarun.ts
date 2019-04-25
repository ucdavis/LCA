import knex from 'knex';

import { Lci } from 'models/schema';
import { RunParams } from './lca.model';
// import { listenerCount } from 'cluster';

const lcarun = async (params: RunParams, db: knex) => {
  const rows: Lci[] = await db
    .table('lci_input')
    .where({ lci_group: 'renewable' });

  // const bigNum = Math.max(...rows.map(r => r.number));
  let sum = 0;
  for (let i = 0; i < rows.length; i++) {
      sum = sum + processRow(rows[i], params);
  }

  return { success: true, params, rows, sum };
};

const processRow = (row: Lci, params: RunParams) => {
    const result = row.diesel * params.grindfuel * params.biomass
    + row.diesel * params.excavatfuel * params.biomass
    + row.transport * params.distance * params.biomass / 1000
    + row.electricity;
    console.log(result);
    return (
    result
  );
};

export { lcarun };
