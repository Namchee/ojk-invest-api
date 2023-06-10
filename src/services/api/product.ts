import { GetManyResult, GetResult, Params, Query } from './const.js';

import { Product } from '../../entity/product.js';
import { escapeName, importData } from './utils.js';

interface ProductData {
  data: Product[];
  version: string;
}

/**
 * Get all authorized shared funds product from OJK data
 * that satisfies the provided query
 *
 * @param {Query} query - GET query
 * @return {Promise<GetManyResult<Product> >} - list of authorized
 * mutual funds that satisfies the provided query
 */
export function getMany(
  query: Query,
): GetManyResult<Product> {
  const { name, limit, offset } = query;

  const source = importData<ProductData>('products');

  let products = source.data;
  const version = source.version;

  if (name) {
    const pattern = new RegExp(escapeName(name), 'ig');

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
 * @return {GetResult<Product>} an authorized mutual funds
 * product with matching ID
 */
export function getOne({ id }: Params): GetResult<Product> {
  const source = importData<ProductData>('products');

  const product = source.data.find(datum => datum.id === id);

  return {
    data: product ?? null,
    version: source.version,
  };
}
