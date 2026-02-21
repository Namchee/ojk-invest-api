import { App } from './app';
import { IllegalInvestment } from './illegal';
import { Product } from './product';

export interface Entity {
  id: number;
  name: string;
}

export interface EntityAlias {
  // legacy data
  app: App;
  product: Product;

  illegal: IllegalInvestment;
}

export const EntityDataKey: Record<keyof EntityAlias, string> = {
  // legacy data
  app: 'TEFIN_OLD_APPS',
  illegal: 'TEFIN_OLD_ILLEGALS',
  product: 'TEFIN_OLD_PRODUCTS',

  // blocked: 'TEFIN_BLOCKED',
  // lending: 'TEFIN_LENDINGS',
};
