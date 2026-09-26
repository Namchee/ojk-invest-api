import { Context } from 'hono';

import { HTTPCodes } from '@/constant/http';
import { EntityAlias } from '@/entity/base';
import { withErrorHandling } from '@/lib/decorator';
import { getMany, getOne } from '@/lib/service';
import { validateParam, validateQuery } from '@/lib/validator';
import { Env } from '@/types';

const NotFoundMessage: Record<keyof EntityAlias, string> = {
  apps: 'Aplikasi tidak ditemukan',
  illegals: 'Investasi tidak ditemukan',
  products: 'Produk tidak ditemukan',

  blocked: '',
  lending: '',
};

/**
 * Create a reusable route handler for 'list' endpoint
 *
 * @param {Context} c Hono context
 * @param {string} key Entity key
 * @returns A route handler that fetches entity represented by `key`
 */
export async function handleListRoute(c: Context<{ Bindings: Env }>, key: keyof EntityAlias) {
  return withErrorHandling(c, async (c: Context<{ Bindings: Env }>) => {
    const query = validateQuery({
      name: c.req.queries('name'),
      limit: c.req.query('limit'),
      offset: c.req.query('offset'),
    });

    const { data, version, count } = await getMany(key, c.env.TEFIN_DATA, query);

    return c.json({
      data: {
        [key]: data,
        version,
        count,
      },
      error: null,
    });
  });
}

/**
 * Create a reusable route handler for 'get' endpoint
 *
 * @param {Context} c Hono context
 * @param {string} key Entity key
 * @returns A route handler that fetches entity represented by `key`
 */
export async function handleGetRoute(c: Context<{ Bindings: Env }>, key: keyof EntityAlias) {
  return withErrorHandling(c, async (c: Context<{ Bindings: Env }>) => {
    const params = validateParam({
      id: c.req.param('id'),
    });
    const { data, version } = await getOne(key, c.env.TEFIN_DATA, params);

    if (data == null) {
      return c.json(
        {
          data: null,
          error: NotFoundMessage[key],
        },
        HTTPCodes.NOT_FOUND,
      );
    }

    return c.json({
      data: {
        [key]: data,
        version,
      },
      error: null,
    });
  });
}
