import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { RunParams } from './lca.model';
import { lcarun } from './lcarun';
const swaggerDocument = require('../swagger.json');
const url = require('url');

const app = express();

const port = process.env.PORT || 3000;

app.get('/lcarun', async (req, res) => {
  const urlParsed = url.parse(req.url, true);
  const params: RunParams = urlParsed.query;
  const result = await lcarun(params);
  res.status(200).json(result);
});

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => console.log(`Listening on port ${port}!`));
