import { EntityAlias, EntityDataKey } from '@/entity/base';
import { GetManyResult, GetResult, Query, Params } from '@/services/api/const';
import { Logger } from '@/services/logger';
import { DataSource, VersionedData } from '@/types';

/**
 * Import fintech data from a data source in form of a valid JSON.
 *
 * @param {string} key Key to be used to fetch data from the data source.
 * @param {KVNamespace} repository Any valid data source that can be queried
 * @return {T} Requested data in JSON format. Will return `null` if the data
 * is somewhat invalid.
 */
export async function importData<T>(
  key: keyof typeof EntityDataKey,
  repository: DataSource,
): Promise<VersionedData<T>> {
  const rawData = (await repository.get(EntityDataKey[key])) as string;
  if (!rawData) {
    Logger.getInstance().logError(new Error(`JSON data for '${key}' endpoint does not exist`));

    throw new Error('Terdapat kesalahan pada sistem');
  }

  try {
    return JSON.parse(rawData);
  } catch {
    Logger.getInstance().logError(new Error(`'JSON data inside '${key}' is not a valid JSON`));

    throw new Error('Terdapat kesalahan pada sistem');
  }
}

/**
 * Escape name query to avoid regex pattern failures
 *
 * @param {string} query name query
 * @return {string} escaped name query
 */
function escapeName(query: string): string {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generic function for retrieving entities in bulk, performing filtering,
 * and returning the result.
 *
 * @param {string} key Entity key, which can be translated into it's own data namespace
 * @param {DataSource} source A source of data that can be queried
 * @param {Query} query Request query, including pagination
 * @returns {Promise<GetManyResult<EntityAlias[Key]>>} A promise that resolves into
 * requested data, number of matched data, and version.
 */
export async function getMany<Key extends keyof EntityAlias, NamedObject extends EntityAlias[Key][]>(
  key: Key,
  source: DataSource,
  query: Query,
): Promise<GetManyResult<EntityAlias[Key][]>> {
  const { name, limit, offset } = query;

  const rawData = await importData<NamedObject>(key, source);

  let data: NamedObject = rawData.data;
  const version = rawData.version;

  if (name) {
    const pattern = new RegExp(escapeName(name), 'ig');

    data = data.filter((item): item is EntityAlias[Key] => pattern.test(item.name)) as unknown as NamedObject;
  }

  const count = data.length;
  const slicedData = data.slice(offset).slice(0, limit) as NamedObject;

  return {
    data: slicedData,
    count,
    version,
  };
}

/**
 * Generic function for retrieving an entity that fulfills a criteria.
 *
 * @param {string} key Entity key, which can be translated into it's own data namespace
 * @param {DataSource} source A source of data that can be queried
 * @param {Params} params Request parameter, usually an ID
 * @returns {Promise<GetManyResult<EntityAlias[Key]>>} A promise that resolves into
 * requested data and version.
 */
export async function getOne<Key extends keyof EntityAlias>(
  key: Key,
  source: DataSource,
  params: Params,
): Promise<GetResult<EntityAlias[Key]>> {
  const { data, version } = await importData<EntityAlias[Key][]>(key, source);

  const entity = data.find(datum => datum.id === params.id);

  return {
    data: entity ?? null,
    version,
  };
}
