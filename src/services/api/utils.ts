import { ValidationError } from '../../exceptions/validation';
import { Query, Params } from './const';

/**
 * Validate user inputs and transform them into Query
 *
 * @param {any} query - user input object
 * @return {Query} validated and formatted user input
 */
export function validateQuery(query: any): Query {
  let limit: number | undefined = Number(query.limit);
  let offset = Number(query.offset);

  if (!isNaN(limit) && limit < 1) {
    throw new ValidationError('Nilai `limit` tidak boleh lebih kecil dari 1');
  }

  if (!isNaN(limit) && offset < 0) {
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
 * @param {string} param ID param
 * @return {Params} validated and formatted param
 */
export function validateParam(param: any): Params {
  const { id } = param;
  const convertedValue = Number(id);

  if (Number.isNaN(convertedValue)) {
    throw new ValidationError(
      'Parameter `id` harus merupakan sebuah bilangan',
    );
  }

  if (convertedValue < 1) {
    throw new ValidationError(
      'Parameter `id` harus merupakan sebuah bilangan positif',
    );
  }

  if (!Number.isInteger(convertedValue)) {
    throw new ValidationError(
      'Parameter `id` harus merupakan sebuah bilangan bulat',
    );
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
