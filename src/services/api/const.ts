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

export interface APIResponse {
  version: string;
}

export interface GetManyResult<T> extends APIResponse {
  data: T[];
  count: number;
}

export interface GetResult<T> extends APIResponse {
  data: T | null;
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
}
