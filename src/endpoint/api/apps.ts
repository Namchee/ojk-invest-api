import type { Context } from 'hono';

import type { Env } from '@/types';

import { withErrorHandling } from '@/lib/decorators';
import { getMany } from '@/services/api/app';
import { HTTPCodes } from '@/services/api/const';
import { validateQuery } from '@/services/api/utils';

async function _list(c: Context<{ Bindings: Env }>) {
  const query = validateQuery({
    name: c.req.queries('name'),
    limit: c.req.query('limit'),
    offset: c.req.query('offset'),
  });

  const { data, version, count } = await getMany(query, c.env.TEFIN_DATA);

  return c.json({
    data: {
      apps: data,
      version,
      count,
    },
    error: null,
  });
}

async function _get(c: Context<{ Bindings: Env }>) {
  try {
  } catch (err) {}
}

export const list = (c: Context<{ Bindings: Env }>) => withErrorHandling(c, _list);
export const get = (c: Context<{ Bindings: Env }>) => withErrorHandling(c, _get);
