import { Query } from '../services/api/const';
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

export const resolvers = {
  Query: {
    illegalInvestments: async (_: any, args: any) => {
      try {
        const query = validateQuery(args);

        return getManyIllegals(query);
      } catch (err) {
        throw new Error(err.message);
      }
    },
    illegalInvestment: async (_: any, args: any) => {
      try {
        const param = validateParam(args);

        return getOneIllegal(param);
      } catch (err) {
        throw new Error(err.message);
      }
    },
    products: async (_: any, args: any) => {
      try {
        const query: Query = validateQuery(args);

        return getManyProducts(query);
      } catch (err) {
        throw new Error(err.message);
      }
    },
    product: async (_: any, args: any) => {
      try {
        const param = validateParam(args);

        return getOneProduct(param);
      } catch (err) {
        throw new Error(err.message);
      }
    },
    apps: async (_: any, args: any) => {
      try {
        const query: Query = validateQuery(args);

        return getManyApps(query);
      } catch (err) {
        throw new Error(err.message);
      }
    },
    app: async (_: any, args: any) => {
      try {
        const param = validateParam(args);

        return getOneApp(param);
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
