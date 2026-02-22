import { RootResolver } from '@hono/graphql-server';
import { Context } from 'hono';

import { getMany, getOne } from '@/lib/service.js';
import { validateParam, validateQuery } from '@/lib/validator.js';
import { Env } from '@/types.js';

export const rootResolver: RootResolver = (c: Context<{ Bindings: Env }>) => {
  return {
    illegalInvestments: (args: Record<string, unknown>) => {
      const query = validateQuery(args);

      return getMany('illegals', c.env.TEFIN_DATA, query);
    },
    illegalInvestment: (args: Record<string, unknown>) => {
      const params = validateParam(args);

      return getOne('illegals', c.env.TEFIN_DATA, params);
    },
    products: (args: Record<string, unknown>) => {
      const query = validateQuery(args);

      return getMany('products', c.env.TEFIN_DATA, query);
    },
    product: (args: Record<string, unknown>) => {
      const params = validateParam(args);

      return getOne('products', c.env.TEFIN_DATA, params);
    },
    apps: (args: Record<string, unknown>) => {
      const query = validateQuery(args);

      return getMany('apps', c.env.TEFIN_DATA, query);
    },
    app: (args: Record<string, unknown>) => {
      const params = validateParam(args);

      return getOne('apps', c.env.TEFIN_DATA, params);
    },
  };
};
