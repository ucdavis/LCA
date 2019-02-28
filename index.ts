import dotenv from 'dotenv';
import express from 'express';
import knex from 'knex';

dotenv.config();

const app = express();

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

interface AnalysisResult {
  number: number;
  title: string;
}

const getRows = async (): Promise<AnalysisResult[]> => {
  return await pg.table('analysis').where({ title: 'First' });
};

app.post('/lcarun', async (req, res) => {
  const params = req.body;

  const rows = await getRows();

  const bigNum = Math.max(...rows.map(r => r.number));

  console.log(rows);

  // analysis

  res.json({ success: true, params, rows, bigNum });
});

app.get('/', (req, res) => res.send('Hello World!!!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
