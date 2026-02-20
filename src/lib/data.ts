import { Query } from '@/services/api/const';
import { importData } from '@/services/api/utils';
import { DataSource } from '@/types';

export async function getMany(query: Query, repository: KVNamespace): Promise<GetManyResult<App>> {}

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

export function createDataService<T>(key: string, source: DataSource) {
  return {
    getMany: async (query: Query) => {
      const { name, limit, offset } = query;

      const source = await importData<T>('apps', repositor);

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
    },
  };
}
