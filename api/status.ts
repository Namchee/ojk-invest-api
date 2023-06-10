import { VercelRequest, VercelResponse } from '@vercel/node';

import { getVersion } from '../src/services/api/version.js';
import { HTTPCodes } from '../src/services/api/const.js';

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
    const error = err as Error;

    console.log(error);

    return res.status(HTTPCodes.SERVER_ERROR)
      .json({
        data: null,
        error: error.message,
      });
  }
}
