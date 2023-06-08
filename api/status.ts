import { VercelRequest, VercelResponse } from '@vercel/node';
import { ValidationError } from 'apollo-server-errors';

import { getVersion } from '../src/services/api/version';
import { HTTPCodes } from '../src/services/api/const';


/**
 * Get data version from the API
 *
 * @param {NowRequest} req - request object
 * @param {VercelResponse} res - response object
 * @return {Promise<VercelResponse>} - response object, packed with data
 */
export default async function(
  req: VercelRequest,
  res: VercelResponse,
): Promise<VercelResponse> {
  if (req.method !== 'GET') {
    return res.status(405).json(undefined);
  }

  try {
    const version = await getVersion();

    return res.status(200)
      .json({
        data: {
          status: version ? 'ok' : 'not ok',
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
