import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { IllegalInvestment } from '../../entity/illegal';
import { OJKData, Query } from './api';
import { Logger } from './../logger';

/**
 * Get all illegal investments that satisfies the provided
 * query.
 *
 * @param {Query} query - GET query
 * @return {OJKData<IllegalInvestment>} - array of illegal investments
 */
export async function getIllegalInvestments(
  query: Query,
): Promise<OJKData<IllegalInvestment> > {
  const { name } = query;
  let { limit, offset } = query;

  offset = offset ?? 0;
  limit = limit ?? 0;

  const dataPath = resolve(process.cwd(), 'data', 'illegals.json');

  const isDataFetched = existsSync(dataPath);

  if (!isDataFetched) {
    await Logger.getInstance().logError(
      'JSON data for `illegal` endpoint does not exist',
    );

    throw new Error('Terdapat kesalahan pada sistem.');
  }

  const rawData = readFileSync(dataPath);
  const source = JSON.parse(rawData.toString('utf-8'));

  let investments: IllegalInvestment[] = source.data;
  const version = source.version;

  if (name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escapedName, 'ig');

    investments = investments.filter((investment: IllegalInvestment) => {
      return pattern.test(investment.name);
    });
  }

  if (!isNaN(offset)) {
    investments = investments.slice(offset);
  }

  if (!isNaN(limit)) {
    investments = investments.slice(0, limit);
  }

  return {
    data: investments,
    version,
  };
}
