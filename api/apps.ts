import { VercelRequest, VercelResponse } from '@vercel/node';

import { HTTPCodes } from './const';
import { getAuthorizedApps } from './../src/services/api/app';

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
  const { query } = req;
  const limit = Number(query.limit);
  const offset = Number(query.start) - 1;

  if (Array.isArray(query.name)) {
    return res.status(HTTPCodes.INVALID_PARAMS)
      .json({
        error: 'Nilai `name` hanya boleh ada satu',
      });
  }

  if (limit < 0) {
    return res.status(HTTPCodes.INVALID_PARAMS)
      .json({
        error: 'Nilai `limit` tidak boleh negatif',
      });
  }

  if (offset < 0) {
    return res.status(HTTPCodes.INVALID_PARAMS)
      .json({
        error: 'Nilai `start` tidak boleh lebih kecil dari satu',
      });
  }

  try {
    const restQuery = {
      name: query.name,
      limit,
      offset,
    };

    const apps = await getAuthorizedApps(restQuery);

    return res.status(HTTPCodes.SUCCESS)
      .json(apps);
  } catch (err) {
    return res.status(HTTPCodes.SERVER_ERROR)
      .json({
        error: err.message,
      });
  }
}
