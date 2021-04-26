import { ValidationError } from '../../exceptions/validation';

/**
 * GET query definition
 */
export interface Query {
  name?: string;
  limit?: number;
  offset?: number;
}

/**
 * GET param definition
 */
export interface Params {
  id: number;
}

/**
 * Validate user inputs and transform them into Query
 *
 * @param {any} query - user input object
 * @return {Query} validated and formatted user input
 */
export function validateQuery(query: any): Query {
  let limit = Number(query.limit);
  let offset = Number(query.start) - 1;

  if (limit < 0) {
    throw new ValidationError('Nilai `limit` tidak boleh negatif');
  }

  if (offset < 0) {
    throw new ValidationError(
      'Nilai `offset` tidak boleh lebih kecil dari satu',
    );
  }

  limit = limit ?? 0;
  offset = offset ?? 0;

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
 * GET API response format
 */
export interface OJKData<T> {
  data: T | T[] | null;
  version: string;
}

export enum HTTPCodes {
  // HTTP status code when input is invalid
  INVALID_PARAMS = 400,
  // HTTP status code when data is not found
  NOT_FOUND = 404,
  // HTTP status code when JSON files aren't created or unexpected error occurs
  SERVER_ERROR = 500,
  // HTTP status code when the request method isn't GET
  METHOD_NOT_ALLOWED = 405,
  // HTTP status code when request has been successfully handled
  SUCCESS = 200,
};

