import { NowRequest, NowResponse } from '@vercel/node';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Search for negative investments from OJK's data
 *
 * @param {NowRequest} req - request object
 * @param {NowResponse} res - response object
 * @return {NowResponse} - response object, packed with data
 */
export default function(req: NowRequest, res: NowResponse): NowResponse {
  const { query } = req;
  const namePattern = query.name as string;

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

  let investments = source.data;
  const version = source.version;

  if (namePattern) {
    const pattern = new RegExp(namePattern, 'ig');

    investments = investments.filter((investment: Record<string, unknown>) => {
      return pattern.test(investment.name as string);
    });
  }

  return res.status(200)
    .json({
      data: investments,
      version,
    });
}
