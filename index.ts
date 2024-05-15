import puppeteer from 'puppeteer';

import { performance } from 'perf_hooks';

import { IllegalsScrapper } from './src/services/scrapper/illegal.js';
import { AppsScrapper } from './src/services/scrapper/app.js';
import { ProductsScrapper } from './src/services/scrapper/product.js';
import { bootstrapOutput } from './src/services/writer.js';

import { ONE_SECOND, ONE_MINUTE } from './src/constant/time.js';

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
    const scrappers = [
      new ProductsScrapper(browser),
      new AppsScrapper(browser),
      new IllegalsScrapper(browser),
    ];

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

    console.log(`All process was executed in ${(delta).toFixed(2)} s`);
  } finally {
    await browser.close();
  }
})();
