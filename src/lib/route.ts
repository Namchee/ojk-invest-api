import { createDataService } from './service';

const NotFoundMessage = {
  apps: 'Aplikasi tidak ditemukan',
  illegals: 'Investasi tidak ditemukan',
  products: 'Produk tidak ditemukan',
};

const service = createDataService('apps');

export function createRouteHandler() {}
