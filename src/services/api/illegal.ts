import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { IllegalInvestment } from '../../entity/illegal';
import { GetManyResult, GetResult, Params, Query } from './const';
import { Logger } from './../logger';

interface IllegalInvestmentData {
  data: IllegalInvestment[];
  version: string;
}

/**
 * Import illegal investment data from a JSON file
 *
 * @return {Promise<IllegalInvestmentData>} illegal investments data
 */
async function importData(): Promise<IllegalInvestmentData> {
  const dataPath = resolve(process.cwd(), 'data', 'illegals.json');

  const isDataFetched = existsSync(dataPath);

  if (!isDataFetched) {
    await Logger.getInstance().logError(
      'JSON data for `illegal` endpoint does not exist',
    );

    throw new Error('Terdapat kesalahan pada sistem.');
  }

  const rawData = readFileSync(dataPath);
  return JSON.parse(rawData.toString('utf-8'));
}

/**
 * Get all illegal investments that satisfies the provided
 * query.
 *
 * @param {Query} query - GET query
 * @return {Promise<GetManyResult<IllegalInvestment> >} - array of
 * illegal investments that satisfies the provided query.
 */
export async function getMany(
  query: Query,
): Promise<GetManyResult<IllegalInvestment> > {
  const { name } = query;
  let { limit, offset } = query;

  offset = offset ?? 0;
  limit = limit ?? 0;

  const source = await importData();

  let investments: IllegalInvestment[] = source.data;
  const version = source.version;

  if (name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escapedName, 'ig');

    investments = investments.filter((investment: IllegalInvestment) => {
      return pattern.test(investment.name);
    });
  }

  const count = investments.length;

  if (!isNaN(offset)) {
    investments = investments.slice(offset);
  }

  if (!isNaN(limit)) {
    investments = investments.slice(0, limit);
  }

  return {
    data: investments,
    count,
    version,
  };
}

/**
 * Get an illegal investment by ID and return it
 *
 * @param {Params} param request parameter
 * @return {Promise<GetResult<IllegalInvestment> >} an illegal investment
 * with matching ID
 */
export async function getOne(
  { id }: Params,
): Promise<GetResult<IllegalInvestment> > {
  const source = await importData();

  const investment = source.data.find(datum => datum.id === id);

  return {
    data: investment ?? null,
    version: source.version,
  };
}
