import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import knex from 'knex';
import pg from 'pg';
import swaggerUi from 'swagger-ui-express';
import { RunParams } from './methods/lca.model';
import { lcarun } from './methods/lcarun';
// tslint:disable-next-line: no-var-requires
const swaggerDocument = require('../swagger.json');

// https://github.com/tgriesser/knex/issues/927
// to handle high precision numerics
// otherwise js converts them to strings
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);
dotenv.config();

const app = express();

app.use(bodyParser.json());

const port = process.env.PORT || 3000;

// https://knexjs.org/
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  },
});

console.log('connecting to db', process.env.DB_HOST);

app.get('/lcarun', async (req, res) => {
  const params: RunParams = req.query;
  const result = await lcarun(params, db);
  res.status(200).json(result);
});

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => console.log(`Listening on port ${port}!`));
