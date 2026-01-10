import { App } from '../../entity/app.js';
import { GetManyResult, GetResult, Params, Query } from './const.js';
import { escapeName, importData } from './utils.js';

interface AppsData {
  data: App[];
  version: string;
}

/**
 * Get all authorized shared funds application from OJK data that
 * satisfies the provided query
 *
 * @param {Query} query - query
 * @return {GetManyResult<App>} - list of all authorized shared funds
 * application.
 */
export function getMany(query: Query): GetManyResult<App> {
  const { name, limit, offset } = query;

  const source = importData<AppsData>('apps');

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
 * @return {GetResult<App>} an authorized app
 * with matching ID
 */
export function getOne({ id }: Params): GetResult<App> {
  const source = importData<AppsData>('apps');

  const app = source.data.find(datum => datum.id === id);

  return {
    data: app ?? null,
    version: source.version,
  };
}
