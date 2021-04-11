import { ValidationError } from "../../exceptions/validation";

/**
 * GET query definition
 */
export interface Query {
  name?: string;
  limit?: number;
  offset?: number;
}

/**
 * Validate user inputs and transform them into Query
 *
 * @param {any} query - user input object
 * @return {Query} validated and formatted user input
 */
export function validateAndTransform(query: any): Query {
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
 * GET API response format
 */
export interface OJKData<T> {
  data: T[];
  version: string;
}

export enum HTTPCodes {
  // HTTP status code when input is invalid
  INVALID_PARAMS = 400,
  // HTTP status code when JSON files aren't created or unexpected error occurs
  SERVER_ERROR = 500,
  // HTTP status code when the request method isn't GET
  METHOD_NOT_ALLOWED = 405,
  // HTTP status code when request has been successfully handled
  SUCCESS = 200,
};

