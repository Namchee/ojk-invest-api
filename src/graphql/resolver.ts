import {
  GetManyResult,
  GetResult,
  Params,
  Query,
} from '../services/api/const.js';
import { validateQuery, validateParam } from './../services/api/utils.js';

import {
  getMany as getManyApps,
  getOne as getOneApp,
} from '../services/api/app.js';
import {
  getMany as getManyIllegals,
  getOne as getOneIllegal,
} from '../services/api/illegal.js';
import {
  getMany as getManyProducts,
  getOne as getOneProduct,
} from '../services/api/product.js';

import { IllegalInvestment } from '../entity/illegal.js';
import { Product } from '../entity/product.js';
import { App } from '../entity/app.js';

/**
 * Wrapping function for resolver.
 *
 * @param {Function} service service method
 * @param {Record<string, any>} args service arguments
 * @param {Function} validator validation function
 * @return {Promise<T>} requested data
 */
function wrapResolver<T, U>(
  service: (args: U) => T,
  args: Record<string, any>,
  validator: (obj: Record<string, any>) => U,
): T {
  const obj = validator(args);

  return service(obj);
}

export const resolvers = {
  Query: {
    illegalInvestments: (_: any, args: any) => {
      return wrapResolver<GetManyResult<IllegalInvestment>, Query>(
        getManyIllegals,
        args,
        validateQuery,
      );
    },
    illegalInvestment: (_: any, args: any) => {
      return wrapResolver<GetResult<IllegalInvestment>, Params>(
        getOneIllegal,
        args,
        validateParam,
      );
    },
    products: (_: any, args: any) => {
      return wrapResolver<GetManyResult<Product>, Query>(
        getManyProducts,
        args,
        validateQuery,
      );
    },
    product: (_: any, args: any) => {
      return wrapResolver<GetResult<Product>, Params>(
        getOneProduct,
        args,
        validateParam,
      );
    },
    apps: (_: any, args: any) => {
      return wrapResolver<GetManyResult<App>, Query>(
        getManyApps,
        args,
        validateQuery,
      );
    },
    app: (_: any, args: any) => {
      return wrapResolver<GetResult<App>, Params>(
        getOneApp,
        args,
        validateParam,
      );
    },
  },
};
