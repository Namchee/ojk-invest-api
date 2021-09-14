import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { GetManyResult, GetResult, Params, Query } from './const';
import { Product } from '../../entity/product';
import { Logger } from './../logger';

interface ProductData {
  data: Product[];
  version: string;
}

/**
 * Import illegal investment data from a JSON file
 *
 * @return {Promise<ProductData>} illegal investments data
 */
async function importData(): Promise<ProductData> {
  const dataPath = resolve(process.cwd(), 'data', 'products.json');

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
 * Get all authorized shared funds product from OJK data
 * that satisfies the provided query
 *
 * @param {Query} query - GET query
 * @return {Promise<GetManyResult<Product> >} - list of authorized
 * mutual funds that satisfies the provided query
 */
export async function getMany(
  query: Query,
): Promise<GetManyResult<Product> > {
  const { name, limit, offset } = query;

  const source = await importData();

  let products = source.data;
  const version = source.version;

  if (name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escapedName, 'ig');

    products = products.filter((product: Product) => {
      return pattern.test(product.name);
    });
  }

  const count = products.length;

  products = products.slice(offset);
  products = products.slice(0, limit);

  return {
    data: products,
    count,
    version,
  };
}

/**
 * Get an authorized mutual funds product by ID and return it
 *
 * @param {Params} param request parameter
 * @return {Promise<GetResult<Product> >} an authorized mutual funds
 * product with matching ID
 */
export async function getOne({ id }: Params): Promise<GetResult<Product> > {
  const source = await importData();

  const product = source.data.find(datum => datum.id === id);

  return {
    data: product ?? null,
    version: source.version,
  };
}
