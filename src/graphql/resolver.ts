import { Query, validateAndTransform } from '../services/api/api';
import { getAuthorizedApps } from '../services/api/app';
import { getIllegalInvestments } from '../services/api/illegal';
import { getAuthorizedProducts } from '../services/api/product';

export const resolvers = {
  Query: {
    illegalInvestments: async (_: any, args: any) => {
      try {
        const query = validateAndTransform(args);

        const { data } = await getIllegalInvestments(query);

        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    products: async (_: any, args: any) => {
      try {
        const query: Query = validateAndTransform(args);

        const { data } = await getAuthorizedProducts(query);

        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    apps: async (_: any, args: any) => {
      try {
        const query: Query = validateAndTransform(args);

        const { data } = await getAuthorizedApps(query);

        return data;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
