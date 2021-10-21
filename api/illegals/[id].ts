import { VercelRequest, VercelResponse } from '@vercel/node';

import { ValidationError } from '../../src/exceptions/validation';
import { HTTPCodes } from '../../src/services/api/const';
import { validateParam } from './../../src/services/api/utils';
import { getOne } from '../../src/services/api/illegal';

/**
 * Search for an illegal investment from OJK's data
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
          error: 'Investasi tidak ditemukan',
        });
    }

    return res.status(HTTPCodes.SUCCESS)
      .json({
        data: {
          illegals: data,
          version,
        },
        error: null,
      });
  } catch (err) {
    let status = HTTPCodes.SERVER_ERROR;

    if (err instanceof ValidationError) {
      status = HTTPCodes.INVALID_PARAMS;
    }

    return res.status(status)
      .json({
        data: null,
        error: err.message,
      });
  }
}
