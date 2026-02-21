import { EntityDataKey } from '@/entity/base';
import { DataSource } from '@/types';

import { Logger } from '../logger.js';

interface RepositoryData<T> {
  data: T;
  version: string;
}

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
): Promise<RepositoryData<T>> {
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
