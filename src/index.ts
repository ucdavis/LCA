import { RunParams } from './lca.model';
import { lcarun } from './lcarun';

export const runLCA = (params: RunParams) => {
  return lcarun(params);
};
