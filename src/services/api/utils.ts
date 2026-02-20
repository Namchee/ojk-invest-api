import type { Params, Query } from './const.js';

import { ValidationError } from '../../exceptions/validation.js';
import { Logger } from '../logger.js';

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DataKeys = {
  // legacy data
  apps: 'TEFIN_OLD_APPS',
  illegals: 'TEFIN_OLD_ILLEGALS',
  products: 'TEFIN_OLD_PRODUCTS',

  blocked: 'TEFIN_BLOCKED',
  lendings: 'TEFIN_LENDINGS',
};

/**
 * Validate user inputs and transform them into Query
 *
 * @param {Record<string, unknown>} query - user input object
 * @return {Query} validated and formatted user input
 */
export function validateQuery(query: Record<string, unknown>): Query {
  let limit: number | undefined = Number(query.limit);
  let offset = Number(query.offset);

  if (typeof query.name !== 'string') {
    throw new ValidationError('`name` harus merupakan sebuah string');
  }

  if (!Number.isNaN(limit) && limit < 1) {
    throw new ValidationError('Nilai `limit` tidak boleh lebih kecil dari 1');
  }

  if (!Number.isNaN(offset) && offset < 0) {
    throw new ValidationError('Nilai `offset` tidak boleh negatif');
  }

  limit = limit || undefined;
  offset = offset || 0;

  return {
    name: query.name,
    limit,
    offset,
  };
}

/**
 * Validate param input and transform it into a Params object
 *
 * @param {Record<string, unknown>} param ID param
 * @return {Params} validated and formatted param
 */
export function validateParam(param: Record<string, unknown>): Params {
  const { id } = param;
  const convertedValue = Number(id);

  if (Number.isNaN(convertedValue)) {
    throw new ValidationError('Parameter `id` harus merupakan sebuah bilangan');
  }

  if (convertedValue < 1) {
    throw new ValidationError('Parameter `id` harus merupakan sebuah bilangan positif');
  }

  if (!Number.isInteger(convertedValue)) {
    throw new ValidationError('Parameter `id` harus merupakan sebuah bilangan bulat');
  }

  return {
    id: convertedValue,
  };
}

/**
 * Escape name query to avoid regex pattern failures
 *
 * @param {string} query name query
 * @return {string} escaped name query
 */
export function escapeName(query: string): string {
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Import investment data from JSON files.
 *
 * @param {string} key Data key
 * @param {KVNamespace} repository Any valid data source that can be queried
 * @return {T} requested data in JSON format
 */
export async function importData<T>(key: keyof typeof DataKeys, repository: KVNamespace): T {
  const rawData = await repository.get(DataKeys[key]);
  if (!rawData) {
    Logger.getInstance().logError(new Error(`JSON data for '${name}' endpoint does not exist`));

    throw new Error('Terdapat kesalahan pada sistem');
  }

  try {
    return JSON.parse(rawData);
  } catch (err) {}

  const dataPath = resolve(process.cwd(), 'data', `${name}.json`);

  const isDataFetched = existsSync(dataPath);

  const rawData = readFileSync(dataPath);
}
