export interface Env {
  // One namespace, multiple keys
  TEFIN_DATA: KVNamespace;
}

// Data fetching related types

// Used for bulk get
export interface Query {
  name?: string;
  limit?: number;
  offset?: number;
}

// Used for singular get, which will get deprecated soon
export interface Params {
  id: number;
}

export interface APIResponse {
  version: string;
}

export interface GetManyResult<T extends unknown[]> extends APIResponse {
  data: T;
  count: number;
}

export interface GetResult<T> extends APIResponse {
  data: T | null;
}

export interface DataSource {
  get: (key: string) => Promise<unknown>;
}

export interface VersionedData<T> {
  data: T;
  version: string;
}
