import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { GetManyResult, GetResult, Params, Query } from './const';
import { App } from '../../entity/app';
import { Logger } from '../logger';
import { escapeName } from './utils';

interface AppsData {
  data: App[];
  version: string;
}

/**
 * Import authorized apps data from a JSON file
 *
 * @return {Promise<AppsData>} authorized apps data
 */
async function importData(): Promise<AppsData> {
  const dataPath = resolve(process.cwd(), 'data', 'apps.json');

  const isDataFetched = existsSync(dataPath);

  if (!isDataFetched) {
    await Logger.getInstance().logError(
      'JSON data for `apps` endpoint does not exist',
    );

    throw new Error('Terdapat kesalahan pada sistem');
  }

  const rawData = readFileSync(dataPath);
  return JSON.parse(rawData.toString('utf-8'));
}

/**
 * Get all authorized shared funds application from OJK data that
 * satisfies the provided query
 *
 * @param {Query} query - query
 * @return {Promise<GetManyResult<App> >} - list of all authorized shared funds
 * application.
 */
export async function getMany(query: Query): Promise<GetManyResult<App> > {
  const { name, limit, offset } = query;

  const source = await importData();

  let apps: App[] = source.data;
  const version = source.version;

  if (name) {
    const pattern = new RegExp(escapeName(name), 'ig');

    apps = apps.filter((app: App) => {
      return pattern.test(app.name);
    });
  }

  const count = apps.length;

  apps = apps.slice(offset);
  apps = apps.slice(0, limit);

  return {
    data: apps,
    count,
    version,
  };
}

/**
 * Get an authorized app by ID and return it
 *
 * @param {Params} param request parameter
 * @return {Promise<GetResult<App> >} an authorized app
 * with matching ID
 */
export async function getOne({ id }: Params): Promise<GetResult<App> > {
  const source = await importData();

  const app = source.data.find(datum => datum.id === id);

  return {
    data: app ?? null,
    version: source.version,
  };
}
