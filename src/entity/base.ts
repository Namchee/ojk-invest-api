import { App } from './app';
import { IllegalInvestment } from './illegal';
import { Product } from './product';

export interface Entity {
  id: number;
  name: string;
}

export interface EntityAlias {
  // legacy keys
  apps: App;
  products: Product;
  illegals: IllegalInvestment;

  blocked: IllegalInvestment;
  lending: object;
}

export const EntityDataKey: Record<keyof EntityAlias, string> = {
  // legacy data
  apps: 'TEFIN_OLD_APPS',
  illegals: 'TEFIN_OLD_ILLEGALS',
  products: 'TEFIN_OLD_PRODUCTS',

  blocked: 'TEFIN_BLOCKED',
  lending: 'TEFIN_LENDINGS',
};
