import { VercelRequest, VercelResponse } from '@vercel/node';
import { ValidationError } from 'apollo-server-errors';
import { HTTPCodes } from '../src/services/api/const';
import { getOne } from '../src/services/api/product';
import { validateParam } from '../src/services/api/utils';

/**
 * Search for a legal mutual funds product from OJK's data
 *
 * @param {NowRequest} req - request object
 * @param {VercelResponse} res - response object
 * @return {VercelResponse} - response object, packed with data
 */
export default async function(
  req: VercelRequest,
  res: VercelResponse,
): Promise<VercelResponse> {
  if (req.method !== 'GET') {
    return res.status(405).json(undefined);
  }

  try {
    
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
