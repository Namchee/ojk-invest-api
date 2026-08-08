import { Context } from 'hono';

import { importData } from '@/lib/service';
import { Env } from '@/types';

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
export async function status(c: Context<{ Bindings: Env }>): Promise<Response> {
  const data = await Promise.all([importData('blocked', c.env.TEFIN_DATA), importData('lending', c.env.TEFIN_DATA)]);

  if (data.some(d => Object.keys(d).length === 0)) {
    return c.json({
      data: {
        status: 'not ok',
        version: null,
      },
      error: null,
    });
  }

  const dates = [...new Set(data.map(d => new Date(d.version)))];
  const ok = dates.length === 1;

  return c.json({
    data: {
      status: ok ? 'ok' : 'not ok',
      version: ok ? dates[0] : null,
    },
    error: null,
  });
}
