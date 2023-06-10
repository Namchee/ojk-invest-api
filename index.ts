import puppeteer from 'puppeteer';

import { performance } from 'perf_hooks';

import { IllegalsScrapper } from './src/services/scrapper/illegal.js';
import { AppsScrapper } from './src/services/scrapper/app.js';
import { ProductsScrapper } from './src/services/scrapper/product.js';
import { bootstrapOutput } from './src/services/writer.js';

import { ONE_SECOND } from './src/constant/time.js';

(async () => {
  bootstrapOutput();

  const browser = await puppeteer.launch({
    headless: true, // 'new' is much slower while bringing no benefits for now
    ignoreHTTPSErrors: true,
    protocolTimeout: 0,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-site-isolation-trials',
      '--disable-notifications',
      '--no-zygote',
    ],
    devtools: false,
  });

  try {
    const scrappers = [
      new IllegalsScrapper(browser),
      new AppsScrapper(browser),
      new ProductsScrapper(browser),
    ];

    const start = performance.now();

    const scrappingResult = await Promise.allSettled(
      scrappers.map(scrapper => scrapper.scrapData()),
    );

    scrappingResult.forEach(
      (result: PromiseSettledResult<void>, idx: number) => {
        if (result.status === 'fulfilled') {
          // eslint-disable-next-line max-len
          console.log(`✔️ ${scrappers[idx].constructor.name} has successfully scrapped`);
        } else {
          // eslint-disable-next-line max-len
          console.log(`❌ ${scrappers[idx].constructor.name} has failed. Reason: ${result.reason}`);
        }
      },
    );

    const end = performance.now();
    const delta = (end - start) / ONE_SECOND;

    console.log(`All process was executed in ${(delta).toFixed(2)} s`);
  } finally {
    await browser.close();
  }
})();
