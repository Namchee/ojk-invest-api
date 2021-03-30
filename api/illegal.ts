import { VercelRequest, VercelResponse } from '@vercel/node';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { HTTPCodes } from '../src/const';
import { Logger } from '../src/utils';

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

  const dataPath = resolve(process.cwd(), 'data', 'illegal.json');

  const isDataFetched = existsSync(dataPath);

  if (!isDataFetched) {
    await Logger.getInstance().logError(
      'JSON data for `illegal` endpoint does not exist',
    );

    return res.status(HTTPCodes.SERVER_ERROR)
      .json({
        error: 'Terdapat kesalahan pada sistem.',
      });
  }

  const rawData = readFileSync(dataPath);
  const source = JSON.parse(rawData.toString('utf-8'));

  let investments: Record<string, unknown>[] = source.data;
  const version = source.version;

  if (namePattern) {
    const pattern = new RegExp(namePattern, 'ig');

    investments = investments.filter((investment: Record<string, unknown>) => {
      return pattern.test(investment.name as string);
    });
  }

  if (!isNaN(offset)) {
    investments = investments.slice(offset);
  }

  if (!isNaN(limit)) {
    investments = investments.slice(0, limit);
  }

  return res.status(HTTPCodes.SUCCESS)
    .json({
      data: investments,
      version,
    });
}
