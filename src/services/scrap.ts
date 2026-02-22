import puppeteer from 'puppeteer';

import { ONE_MINUTE, ONE_SECOND } from '@/constant/time';
import { AppsScrapper } from '@/services/scrapper/app';
import { IllegalsScrapper } from '@/services/scrapper/illegal';
import { ProductsScrapper } from '@/services/scrapper/product';
import { bootstrapOutput } from '@/services/writer';
import { DataSource } from '@/types';

import { performance } from 'node:perf_hooks';

export async function refreshData(source: DataSource): Promise<void> {}

(async () => {
  bootstrapOutput();

  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    protocolTimeout: 0,
    timeout: 3 * ONE_MINUTE,
    args: [
      '--no-sandbox',
      '--disable-set  uid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-site-isolation-trials',
      '--disable-notifications',
      '--no-zygote',
    ],
    devtools: false,
  });

  try {
    const start = performance.now();
    const scrappers = [new ProductsScrapper(browser), new AppsScrapper(browser), new IllegalsScrapper(browser)];

    // currently, it's not possible to simulate `click` event at the same time
    for (const scrapper of scrappers) {
      try {
        await scrapper.scrapData();

        console.log(`✔️ ${scrapper.constructor.name} has successfully scrapped`);
      } catch (err) {
        const error = err as Error;

        console.log(`❌ ${scrapper.constructor.name} has failed. Reason: ${error.message}`);
      }
    }

    const end = performance.now();
    const delta = (end - start) / ONE_SECOND;

    console.log(`All process was executed in ${delta.toFixed(2)} s`);
  } finally {
    await browser.close();
  }
})();
