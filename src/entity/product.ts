import { Entity } from './base';

export interface Product extends Entity {
  management: string;
  custodian: string;
  type: string;
}
