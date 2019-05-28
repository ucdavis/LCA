import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import knex from 'knex';
import pg from 'pg';
import { RunParams } from './methods/lca.model';
import { lcarun } from './methods/lcarun';

// https://github.com/tgriesser/knex/issues/927
// to handle high precision numerics
// otherwise js converts them to strings
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);

dotenv.config();

const app = express();
app.use(express.static('docs'));

app.use(bodyParser.json());

const port = 3000;

// https://knexjs.org/
const db = knex({
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
  const result = await lcarun(params, db);
  res.json(result);
});

app.get('/', (req, res) => res.sendFile('./docs/index.html'));

app.listen(port);
