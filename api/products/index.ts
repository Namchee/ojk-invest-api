import { VercelRequest, VercelResponse } from '@vercel/node';
import { ValidationError } from '../../src/exceptions/validation.js';

import { HTTPCodes } from '../../src/services/api/const.js';
import { validateQuery } from './../../src/services/api/utils.js';
import { getMany } from '../../src/services/api/product.js';

/**
 * Search for legal shared funds from OJK's data
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

  if (Array.isArray(req.query.name)) {
    return res.status(HTTPCodes.INVALID_PARAMS)
      .json({
        data: null,
        error: 'Nilai `name` hanya boleh ada satu',
      });
  }

  try {
    const query = validateQuery(req.query);
    const { data, version, count } = getMany(query);

    return res.status(HTTPCodes.SUCCESS)
      .json({
        data: {
          products: data,
          version,
          count,
        },
        error: '',
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
