import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { OJKData, Params, Query } from './api';
import { App } from '../../entity/app';
import { Logger } from '../logger';

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

    throw new Error('Terdapat kesalahan pada sistem.');
  }

  const rawData = readFileSync(dataPath);
  return JSON.parse(rawData.toString('utf-8'));
}

/**
 * Get all authorized shared funds application from OJK data that
 * satisfies the provided query
 *
 * @param {Query} query - query
 * @return {Promise<OJKData<App> >} - list of all authorized shared funds
 * application.
 */
export async function getMany(query: Query): Promise<OJKData<App> > {
  const { name } = query;
  let { limit, offset } = query;

  limit = limit ?? 0;
  offset = offset ?? 0;

  const source = await importData();

  let apps: App[] = source.data;
  const version = source.version;

  if (name) {
    const pattern = new RegExp(name, 'ig');

    apps = apps.filter((app: App) => {
      return pattern.test(app.name);
    });
  }

  if (!isNaN(offset)) {
    apps = apps.slice(offset);
  }

  if (!isNaN(limit)) {
    apps = apps.slice(0, limit);
  }

  return {
    data: apps,
    version,
  };
}

/**
 * Get an authorized app by ID and return it
 *
 * @param {Params} param request parameter
 * @return {Promise<OJKData<App> >} an authorized app
 * with matching ID
 */
export async function getOne({ id }: Params): Promise<OJKData<App> > {
  const source = await importData();

  const app = source.data.find(datum => datum.id === id);

  return {
    data: app ?? null,
    version: source.version,
  };
}
