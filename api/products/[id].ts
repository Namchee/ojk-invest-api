import { VercelRequest, VercelResponse } from '@vercel/node';

import { ValidationError } from '../../src/exceptions/validation.js';
import { HTTPCodes } from '../../src/services/api/const.js';
import { validateParam } from './../../src/services/api/utils.js';
import { getOne } from '../../src/services/api/product.js';

/**
 * Search for a legal mutual funds product from OJK's data
 *
 * @param {NowRequest} req - request object
 * @param {VercelResponse} res - response object
 * @return {VercelResponse} - response object, packed with data
 */
export default function(
  req: VercelRequest,
  res: VercelResponse,
): VercelResponse {
  if (req.method !== 'GET') {
    return res.status(405).json(undefined);
  }

  try {
    const params = validateParam(req.query);
    const { data, version } = getOne(params);

    if (data === null) {
      return res.status(HTTPCodes.NOT_FOUND)
        .json({
          data: null,
          error: 'Produk reksa dana tidak ditemukan',
        });
    }

    return res.status(HTTPCodes.SUCCESS)
      .json({
        data: {
          products: data,
          version,
        },
        error: null,
      });
  } catch (err) {
    let status = HTTPCodes.SERVER_ERROR;

    if (err instanceof ValidationError) {
      status = HTTPCodes.INVALID_PARAMS;
    }

    const error = err as Error;

    return res.status(status)
      .json({
        data: null,
        error: error.message,
      });
  }
}
