import type { Context } from 'hono';

import type { Env } from '@/types';

import { getMany } from '@/services/api/app';
import { HTTPCodes } from '@/services/api/const';
import { validateQuery } from '@/services/api/utils';

import { withErrorHandling } from '../utils';

export async function list(c: Context<{ Bindings: Env }>) {
  const nameQuery = c.req.queries('name');
  if (nameQuery && nameQuery.length > 1) {
    return c.json(
      {
        data: null,
        error: 'Nilai `name` hanya boleh ada satu',
      },
      HTTPCodes.INVALID_PARAMS,
    );
  }

  const query = validateQuery({
    limit: c.req.query('limit'),
    offset: c.req.query('offset'),
  });

  const { data, version, count } = getMany(query);

  return c.json({
    data: {
      apps: data,
      version,
      count,
    },
    error: null,
  });
}

const a = (ctx: Context<{ Bindings: Env }>) => withErrorHandling(ctx, list);

export async function get(c: Context<{ Bindings: Env }>) {
  try {
  } catch (err) {}
}
