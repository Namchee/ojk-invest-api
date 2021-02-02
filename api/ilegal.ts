import { NowRequest, NowResponse } from '@vercel/node';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Search for ilegal investments from OJK's data
 *
 * @param {NowRequest} req - request object
 * @param {NowResponse} res - response object
 * @return {NowResponse} - response object, packed with data
 */
export default function(req: NowRequest, res: NowResponse): NowResponse {
  const { query } = req;
  const namePattern = query.name as string;
  const limit = Number(query.limit);
  const offset = Number(query.start) - 1;

  if (limit < 0) {
    return res.status(422)
      .json({
        error: 'Nilai `limit` tidak boleh negatif',
      });
  }

  if (offset < 0) {
    return res.status(422)
      .json({
        error: 'Nilai `start` tidak boleh lebih kecil dari satu',
      });
  }

  const dataPath = resolve(process.cwd(), 'data', 'investments.json');

  const isDataFetched = existsSync(dataPath);

  if (!isDataFetched) {
    return res.status(500)
      .json({
        error: 'Investment data doesn\'t exist',
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

  return res.status(200)
    .json({
      data: investments,
      version,
    });
}
