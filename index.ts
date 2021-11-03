import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { lifeCycleAnalysis } from './lca';
import { LcaInputs } from './lca.model';
const swaggerDocument = require('../swagger.json');
const url = require('url');

const app = express();

const port = process.env.PORT || 3000;

app.get('/lca', async (req, res) => {
  const urlParsed = url.parse(req.url, true);
  const params: LcaInputs = urlParsed.query;
  const result = await lifeCycleAnalysis(params);
  res.status(200).json(result);
});

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => console.log(`Listening on port ${port}!`));
