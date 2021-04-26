import { VercelRequest, VercelResponse } from '@vercel/node';
import { ValidationError } from '../../src/exceptions/validation';

import { HTTPCodes, validateQuery } from '../../src/services/api/api';
import { getMany } from '../../src/services/api/app';

/**
 * Search for legal investments application from OJK's data
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

  if (Array.isArray(req.query.name)) {
    return res.status(HTTPCodes.INVALID_PARAMS)
      .json({
        data: null,
        error: 'Nilai `name` hanya boleh ada satu',
      });
  }

  try {
    const query = validateQuery(req.query);

    const { data, version } = await getMany(query);

    return res.status(HTTPCodes.SUCCESS)
      .json({
        data: {
          apps: data,
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
