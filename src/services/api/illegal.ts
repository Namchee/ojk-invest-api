import { IllegalInvestment } from '../../entity/illegal.js';

import { GetManyResult, GetResult, Params, Query } from './const.js';
import { escapeName, importData } from './utils.js';

interface IllegalInvestmentData {
  data: IllegalInvestment[];
  version: string;
}

/**
 * Get all illegal investments that satisfies the provided
 * query.
 *
 * @param {Query} query - GET query
 * @return {GetManyResult<IllegalInvestment>} - array of
 * illegal investments that satisfies the provided query.
 */
export function getMany(
  query: Query,
): GetManyResult<IllegalInvestment> {
  const { name, limit, offset, version: dataVersion } = query;

  const source = importData<IllegalInvestmentData>(
    dataVersion === 2 ? 'illegals' : 'illegals_v1',
  );

  let investments: IllegalInvestment[] = source.data;
  const version = source.version;

  if (name) {
    const pattern = new RegExp(escapeName(name), 'ig');

    investments = investments.filter((investment: IllegalInvestment) => {
      return pattern.test(investment.name);
    });
  }

  const count = investments.length;

  investments = investments.slice(offset);
  investments = investments.slice(0, limit);

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
 * @param {number} dataVersion - data version
 * @return {GetResult<IllegalInvestment>} an illegal investment
 * with matching ID
 */
export function getOne(
  { id, version: dataVersion }: Params,
): GetResult<IllegalInvestment> {
  const source = importData<IllegalInvestmentData>(
    dataVersion === 2 ? 'illegals' : 'illegals_v1',
  );

  const investment = source.data.find(datum => datum.id === id);

  return {
    data: investment ?? null,
    version: source.version,
  };
}
