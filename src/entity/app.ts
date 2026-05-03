import { Entity } from './base';

export interface App extends Entity {
  url: string;
  owner: string;
}
