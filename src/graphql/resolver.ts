import { Query, validateQuery } from '../services/api/api';
import { getMany as getManyApps } from '../services/api/app';
import { getMany as getManyIllegals } from '../services/api/illegal';
import { getMany as getManyProducts } from '../services/api/product';

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
    products: async (_: any, args: any) => {
      try {
        const query: Query = validateQuery(args);

        const { data } = await getManyProducts(query);

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
  },
};
