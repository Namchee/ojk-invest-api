import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { OJKData, Query } from './api';
import { Product } from '../../entity/product';
import { Logger } from './../logger';

/**
 * Get all authorized shared funds product from OJK data
 * that satisfies the provided query
 *
 * @param {Query} query - GET query
 */
export async function getAuthorizedProducts(
  query: Query,
): Promise<OJKData<Product> > {
  const { name } = query;
  let { limit, offset } = query;

  limit = limit ?? 0;
  offset = offset ?? 0;

  const dataPath = resolve(process.cwd(), 'data', 'products.json');

  const isDataFetched = existsSync(dataPath);

  if (!isDataFetched) {
    await Logger.getInstance().logError(
      'JSON data for `products` endpoint does not exist',
    );

    throw new Error('Terdapat kesalahan pada sistem.');
  }

  const rawData = readFileSync(dataPath);
  const source = JSON.parse(rawData.toString('utf-8'));

  let products: Product[] = source.data;
  const version = source.version;

  if (name) {
    const pattern = new RegExp(name, 'ig');

    products = products.filter((product: Product) => {
      return pattern.test(product.name);
    });
  }

  if (!isNaN(offset)) {
    products = products.slice(offset);
  }

  if (!isNaN(limit)) {
    products = products.slice(0, limit);
  }

  return {
    data: products,
    version,
  };
}
