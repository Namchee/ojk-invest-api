import { VercelRequest, VercelResponse } from '@vercel/node';
import { ValidationError } from '../src/exceptions/validation';

import { HTTPCodes, validateAndTransform } from '../src/services/api/api';
import { getIllegalInvestments } from '../src/services/api/illegal';

/**
 * Search for ilegal investments from OJK's data
 *
 * @param {VercelRequest} req - request object
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

  if (Array.isArray(req.query.name)) {
    return res.status(HTTPCodes.INVALID_PARAMS)
      .json({
        error: 'Nilai `name` hanya boleh ada satu',
      });
  }

  try {
    const query = validateAndTransform(req.query);

    const illegals = await getIllegalInvestments(query);

    return res.status(HTTPCodes.SUCCESS)
      .json(illegals);
  } catch (err) {
    let status = HTTPCodes.SERVER_ERROR;

    if (err instanceof ValidationError) {
      status = HTTPCodes.INVALID_PARAMS;
    }

    return res.status(status)
      .json({
        error: err.message,
      });
  }
}
