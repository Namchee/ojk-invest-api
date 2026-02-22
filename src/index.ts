import type { Env } from './types';

import { graphqlServer } from '@hono/graphql-server';
import { Hono } from 'hono';

import { HTTPCodes } from './constant/http';
import { handleGetRoute, handleListRoute } from './endpoint/base';
import { status } from './endpoint/status';
import { rootResolver } from './graphql/resolver';
import { schema } from './graphql/schema';
import { Logger } from './services/logger';
import { refreshData } from './services/scrap';

const app = new Hono<{ Bindings: Env }>();

app.onError((e, c) => {
  Logger.getInstance().logError(e);

  return c.json(
    {
      message: 'Internal server error',
    },
    HTTPCodes.SERVER_ERROR,
  );
});

app.get('/status', status);

app.get('/api/apps', c => handleListRoute(c, 'apps'));
app.get('/api/illegals', c => handleListRoute(c, 'illegals'));
app.get('/api/products', c => handleListRoute(c, 'products'));

app.get('/api/apps/:id', c => handleGetRoute(c, 'apps'));
app.get('/api/products/:id', c => handleGetRoute(c, 'products'));
app.get('/api/illegals/:id', c => handleGetRoute(c, 'illegals'));

app.use(
  '/graphql',
  graphqlServer({
    rootResolver,
    schema,
    graphiql: true,
  }),
);

export default {
  fetch: app.fetch,
  scheduled: async (_: ScheduledController, env: Env, ctx: ExecutionContext) => {
    ctx.waitUntil(refreshData(env.TEFIN_DATA));
  },
};
