/**
 * GET query definition
 */
export interface Query {
  name?: string;
  limit?: number;
  offset?: number;
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

