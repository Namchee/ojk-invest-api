import type { Params } from '@/services/api/const';

import { ValidationError } from '@/exceptions/validation';

/**
 * Validate user inputs and transform them into Query
 *
 * @param {Record<string, unknown>} query - user input object
 * @return {Query} validated and formatted user input
 */
export function validateQuery(query: Record<string, unknown>): Query {
  let limit: number | undefined = Number(query.limit);
  let offset = Number(query.offset);

  if (query.name && Array.isArray(query.name) && query.name.length > 1) {
    throw new ValidationError('Nilai `name` hanya boleh ada 1');
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
    name: (query.name as string[])[0],
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
