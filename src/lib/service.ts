import { App } from '@/entity/app';
import { Entity, EntityAlias } from '@/entity/base';
import { IllegalInvestment } from '@/entity/illegal';
import { Product } from '@/entity/product';
import { GetManyResult, GetResult, Query, Params } from '@/services/api/const';
import { importData } from '@/services/api/utils';
import { DataSource } from '@/types';

/**
 * Escape name query to avoid regex pattern failures
 *
 * @param {string} query name query
 * @return {string} escaped name query
 */
export function escapeName(query: string): string {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// export function createDataService<K extends keyof EntityAlias>(
//   key: K,
//   source: DataSource,
// ): {
//   getMany: (query: Query) => Promise<GetManyResult<EntityAlias[K][]>>;
//   getOne: (params: Params) => Promise<GetResult<EntityAlias[K]>>;
// };

export function createGetManyHandler<Key extends keyof EntityAlias, NamedObject extends Entity[]>(
  key: Key,
  source: DataSource,
) {
  return async (query: Query): Promise<GetManyResult<EntityAlias[Key][]>> => {
    const { name, limit, offset } = query;

    const rawData = await importData<NamedObject>(key, source);

    let data: NamedObject = rawData.data;
    const version = rawData.version;

    if (name) {
      const pattern = new RegExp(escapeName(name), 'ig');

      data = data.filter((item): item is Entity => pattern.test(item.name)) as unknown as NamedObject;
    }

    const count = data.length;
    const slicedData = data.slice(offset).slice(0, limit) as NamedObject;

    return {
      data: slicedData,
      count,
      version,
    };
  };
}

export function createGetOneHandler<Key extends keyof EntityAlias>(key: Key) {}

/**
 * Create a generic service for fetching data and applying user inputs on them.
 *
 * @param {string} key Entity alias
 * @param {DataSource} source A data source than can be queried
 * @returns A data service that supports `getMany` and `getOne` function
//  */
// export function createDataService<K extends keyof EntityAlias, NamedObject extends Entity[]>(
//   key: K,
//   source: DataSource,
// ) {
//   return {
//     getMany: async (query: Query): Promise<GetManyResult<NamedObject>> => {
//       const { name, limit, offset } = query;

//       const rawData = await importData<RepositoryData<NamedObject>>(key, source);

//       let data: NamedObject = rawData.data;
//       const version = rawData.version;

//       if (name) {
//         const pattern = new RegExp(escapeName(name), 'ig');

//         data = data.filter((item): item is Entity => pattern.test(item.name)) as unknown as NamedObject;
//       }

//       const count = data.length;
//       const slicedData = data.slice(offset).slice(0, limit) as NamedObject;

//       return {
//         data: slicedData,
//         count,
//         version,
//       };
//     },
//     getOne: async ({ id }: Params): Promise<GetResult<EntityAlias[K]>> => {
//       const { data, version } = await importData<RepositoryData<EntityAlias[K][]>>(key, source);

//       const entity = data.find(datum => datum.id === id);

//       return {
//         data: entity ?? null,
//         version,
//       };
//     },
//   };
// }
