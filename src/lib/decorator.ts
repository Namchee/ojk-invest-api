import type { Context } from 'hono';

import type { Env } from '@/types';

import { ValidationError } from '@/exceptions/validation';
import { HTTPCodes } from '@/services/api/const';

/**
 * Decorator function for error handling.
 *
 * @param {Context} c Hono context
 * @param {Function} fn Actual function to call
 * @returns {Promise<Response>} W3C response object
 */
export async function withErrorHandling(
  c: Context<{ Bindings: Env }>,
  fn: (c: Context<{ Bindings: Env }>) => Promise<Response>,
): Promise<Response> {
  try {
    return fn(c);
  } catch (err) {
    let status = HTTPCodes.SERVER_ERROR;

    if (err instanceof ValidationError) {
      status = HTTPCodes.INVALID_PARAMS;
    }

    const error = err as Error;

    return c.json(
      {
        data: null,
        error: error.message,
      },
      status,
    );
  }
}
