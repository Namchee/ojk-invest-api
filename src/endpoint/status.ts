import type { Context } from 'hono';

import type { Env } from '@/types';

/**
 * Healthcheck endpoint for TeFin API.
 *
 * It determines the health of the API by checking the freshness of the data and compare
 * them with each other. If all data have the same version, it will response with 'ok'
 * Otherwise, it will response with 'not ok'.
 *
 * @param {Context} c Hono context
 * @returns {Promise<Response>} Response object
 */
export default async function (c: Context<{ Bindings: Env }>): Promise<Response> {
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
}
