import { UserInputError } from 'apollo-server-errors';

import { GetManyResult, GetResult, Params, Query } from '../services/api/const';
import { validateQuery, validateParam } from './../services/api/utils';

import {
  getMany as getManyApps,
  getOne as getOneApp,
} from '../services/api/app';
import {
  getMany as getManyIllegals,
  getOne as getOneIllegal,
} from '../services/api/illegal';
import {
  getMany as getManyProducts,
  getOne as getOneProduct,
} from '../services/api/product';
import { ValidationError } from '../exceptions/validation';

import { IllegalInvestment } from '../entity/illegal';
import { Product } from '../entity/product';
import { App } from '../entity/app';

/**
 * Wrapping function for resolver.
 *
 * @param {Function} service service method
 * @param {Record<string, any>} args service arguments
 * @param {Function} validator validation function
 * @return {Promise<T>} requested data
 */
async function wrapResolver<T, U>(
  service: (args: U) => Promise<T>,
  args: Record<string, any>,
  validator: (obj: Record<string, any>) => U,
): Promise<T> {
  try {
    const obj = validator(args);

    return service(obj);
  } catch (err) {
    const error = err as Error;

    if (error instanceof ValidationError) {
      throw new UserInputError(error.message);
    }

    throw error;
  }
}

export const resolvers = {
  Query: {
    illegalInvestments: async (_: any, args: any) => {
      return wrapResolver<GetManyResult<IllegalInvestment>, Query>(
        getManyIllegals,
        args,
        validateQuery,
      );
    },
    illegalInvestment: async (_: any, args: any) => {
      return wrapResolver<GetResult<IllegalInvestment>, Params>(
        getOneIllegal,
        args,
        validateParam,
      );
    },
    products: async (_: any, args: any) => {
      return wrapResolver<GetManyResult<Product>, Query>(
        getManyProducts,
        args,
        validateQuery,
      );
    },
    product: async (_: any, args: any) => {
      return wrapResolver<GetResult<Product>, Params>(
        getOneProduct,
        args,
        validateParam,
      );
    },
    apps: async (_: any, args: any) => {
      return wrapResolver<GetManyResult<App>, Query>(
        getManyApps,
        args,
        validateQuery,
      );
    },
    app: async (_: any, args: any) => {
      return wrapResolver<GetResult<App>, Params>(
        getOneApp,
        args,
        validateParam,
      );
    },
  },
};
