import { Query, validateParam, validateQuery } from '../services/api/const';

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

        const { data } = await getManyIllegals(query);

        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    illegalInvestment: async (_: any, args: any) => {
      try {
        const param = validateParam(args);

        const { data } = await getOneIllegal(param);

        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    products: async (_: any, args: any) => {
      try {
        const query: Query = validateQuery(args);

        const { data } = await getManyProducts(query);

        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    product: async (_: any, args: any) => {
      try {
        const param = validateParam(args);

        const { data } = await getOneProduct(param);

        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    apps: async (_: any, args: any) => {
      try {
        const query: Query = validateQuery(args);

        const { data } = await getManyApps(query);

        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    app: async (_: any, args: any) => {
      try {
        const param = validateParam(args);

        const { data } = await getOneApp(param);

        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
