import { NowRequest, NowResponse } from '@vercel/node';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { HTTPCodes } from './../src/const';
import { Logger } from './../src/utils';

/**
 * Search for legal investments application from OJK's data
 *
 * @param {NowRequest} req - request object
 * @param {NowResponse} res - response object
 * @return {NowResponse} - response object, packed with data
 */
export default async function(
  req: NowRequest,
  res: NowResponse,
): Promise<NowResponse> {
  const { query } = req;
  const namePattern = query.name as string;
  const limit = Number(query.limit);
  const offset = Number(query.start) - 1;

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

  const dataPath = resolve(process.cwd(), 'data', 'products.json');

  const isDataFetched = existsSync(dataPath);

  if (!isDataFetched) {
    await Logger.getInstance().logError(
      'JSON data for `products` endpoint does not exist',
    );

    return res.status(HTTPCodes.SERVER_ERROR)
      .json({
        error: 'Terdapat kesalahan pada sistem.',
      });
  }

  const rawData = readFileSync(dataPath);
  const source = JSON.parse(rawData.toString('utf-8'));

  let products: Record<string, unknown>[] = source.data;
  const version = source.version;

  if (namePattern) {
    const pattern = new RegExp(namePattern, 'ig');

    products = products.filter((product: Record<string, unknown>) => {
      return pattern.test(product.name as string);
    });
  }

  if (!isNaN(offset)) {
    products = products.slice(offset);
  }

  if (!isNaN(limit)) {
    products = products.slice(0, limit);
  }

  return res.status(HTTPCodes.SUCCESS)
    .json({
      data: products,
      version,
    });
}
