import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { OJKData, Query } from './api';
import { App } from '../../entity/app';
import { Logger } from '../logger';

/**
 * Get all authorized shared funds application from OJK data that
 * satisfies the provided query
 *
 * @param {Query} query - query
 * @return {OJKData<App>} - list of all authorized shared funds
 * application.
 */
export async function getAuthorizedApps(query: Query): Promise<OJKData<App> > {
  const { name } = query;
  let { limit, offset } = query;

  limit = limit ?? 0;
  offset = offset ?? 0;

  const dataPath = resolve(process.cwd(), 'data', 'apps.json');

  const isDataFetched = existsSync(dataPath);

  if (!isDataFetched) {
    await Logger.getInstance().logError(
      'JSON data for `apps` endpoint does not exist',
    );

    throw new Error('Terdapat kesalahan pada sistem.');
  }

  const rawData = readFileSync(dataPath);
  const source = JSON.parse(rawData.toString('utf-8'));

  let apps: App[] = source.data;
  const version = source.version;

  if (name) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escapedName, 'ig');

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
