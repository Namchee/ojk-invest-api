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
