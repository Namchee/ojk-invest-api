import type { Env } from './types';

import { Hono } from 'hono';

import { Logger } from './services/logger';

const app = new Hono<{ Bindings: Env }>();

app.get('/status', async c => {
  const rawData = await Promise.all([c.env.TEFIN_DATA.get('BLOCKED'), c.env.TEFIN_DATA.get('LENDINGS')]);
  const data = rawData.map(raw => JSON.parse(raw ?? '{}') as { version: string });

  if (data.some(d => Object.keys(d).length === 0)) {
    return c.json({
      data: {
        status: 'not ok',
        version: '',
      },
      error: null,
    });
  }

  const dates = [...new Set(data.map(d => new Date(d.version)))];
  const ok = dates.length === 1;

  return c.json({
    data: {
      status: ok ? 'ok' : 'not ok',
      version: ok ? dates[0] : '',
    },
    error: null,
  });
});

app.onError((e, c) => {
  Logger.getInstance().logError(e);

  return c.json(
    {
      message: 'Internal server error',
    },
    500,
  );
});

app.get('/api/apps', () => {});
app.get('/api/illegals', () => {});
app.get('/api/products', () => {});
