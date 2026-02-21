import type { Env } from './types';

import { type RootResolver, graphqlServer } from '@hono/graphql-server';
import { Hono } from 'hono';

import status from './endpoint/status';
import { Logger } from './services/logger';

const app = new Hono<{ Bindings: Env }>();

app.get('/status', status);

app.onError((e, c) => {
  Logger.getInstance().logError(e);

  return c.json(
    {
      message: 'Internal server error',
    },
    500,
  );
});

app.use('/graphql', graphql);

app.get('/api/apps', () => {});
app.get('/api/illegals', () => {});
app.get('/api/products', () => {});
