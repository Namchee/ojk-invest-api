import type { Context } from 'hono';

import type { Env } from '@/types';

import { withErrorHandling } from '@/lib/decorator';
import { validateParam, validateQuery } from '@/lib/validator';
import { getMany, getOne } from '@/services/api/app';
import { HTTPCodes } from '@/services/api/const';

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
  const params = validateParam({
    id: c.req.param('id'),
  });
  const { data, version } = getOne(params);

  if (data == null) {
    return c.json(
      {
        data: null,
        error: 'Aplikasi tidak ditemukan',
      },
      HTTPCodes.NOT_FOUND,
    );
  }

  return c.json({
    data: {
      apps: data,
      version,
    },
    error: null,
  });
}

export const list = (c: Context<{ Bindings: Env }>) => withErrorHandling(c, _list);
export const get = (c: Context<{ Bindings: Env }>) => withErrorHandling(c, _get);
