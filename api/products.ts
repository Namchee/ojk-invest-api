import { VercelRequest, VercelResponse } from '@vercel/node';
import { ValidationError } from '../src/exceptions/validation';

import { HTTPCodes, validateAndTransform } from '../src/services/api/api';
import { getAuthorizedProducts } from './../src/services/api/product';

/**
 * Search for legal shared funds from OJK's data
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
        error: 'Nilai `name` hanya boleh ada satu',
      });
  }

  try {
    const query = validateAndTransform(req.query);

    const products = await getAuthorizedProducts(query);

    return res.status(HTTPCodes.SUCCESS)
      .json(products);
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
