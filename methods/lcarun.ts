import knex from 'knex';

import { Analysis } from 'models/schema';
import { RunParams } from './lca.model';

const lcarun = async (params: RunParams, db: knex) => {

    const rows: Analysis[] = await db.table('analysis').where({ title: 'First' });

    const bigNum = Math.max(...rows.map(r => r.number));

    return { success: true, params, rows, bigNum };
};

export {
    lcarun
};
