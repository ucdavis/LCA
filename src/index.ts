import knex from 'knex';
import { RunParams } from './methods/lca.model';
import { lcarun } from './methods/lcarun';

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'lca'
  }
});

export const runLCA = (params: RunParams) => {
  return lcarun(params, db);
};
