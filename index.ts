import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import knex from 'knex';

import { RunParams } from './methods/lca.model';
import { lcarun } from './methods/lcarun';

dotenv.config();

const app = express();

app.use(bodyParser.json());

const port = 3000;

// https://knexjs.org/
const pg = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'lca'
  }
});

console.log('connecting to db', process.env.DB_HOST);

app.post('/lcarun', async (req, res) => {
  const params: RunParams = req.body;
  console.log(req.body);
  console.log(params);
  const result = await lcarun(params, pg);
  res.json(result);
});

app.get('/', (req, res) => res.send('Hello World!!!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
