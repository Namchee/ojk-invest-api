import type { Params, Query } from './const';

import { DataSource } from '@/types';

import { ValidationError } from '../../exceptions/validation.js';
import { Logger } from '../logger.js';

const EntityMap = {
  // legacy data
  apps: 'TEFIN_OLD_APPS',
  illegals: 'TEFIN_OLD_ILLEGALS',
  products: 'TEFIN_OLD_PRODUCTS',

  blocked: 'TEFIN_BLOCKED',
  lendings: 'TEFIN_LENDINGS',
};

/**
 * Import fintech data from a data source in form of a valid JSON.
 *
 * @param {string} key Data key
 * @param {KVNamespace} repository Any valid data source that can be queried
 * @return {T} Requested data in JSON format. Will return `null` if the data
 * is somewhat invalid.
 */
export async function importData<T>(key: keyof typeof EntityMap, repository: DataSource): Promise<T> {
  const rawData = (await repository.get(EntityMap[key])) as string;
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
