export interface Env {
  // One namespace, multiple keys
  TEFIN_DATA: KVNamespace;
}

export interface DataSource {
  get: (key: string) => Promise<unknown>;
}
