import { IllegalInvestment } from '../../entity/illegal';
import { GetManyResult, GetResult, Params, Query } from './const';
import { escapeName, importData } from './utils';

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
  const { name, limit, offset } = query;

  const source = importData<IllegalInvestmentData>('illegals');

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
 * @return {GetResult<IllegalInvestment>} an illegal investment
 * with matching ID
 */
export function getOne(
  { id }: Params,
): GetResult<IllegalInvestment> {
  const source = importData<IllegalInvestmentData>('illegals');

  const investment = source.data.find(datum => datum.id === id);

  return {
    data: investment ?? null,
    version: source.version,
  };
}
