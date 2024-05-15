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
    headless: false,
    ignoreHTTPSErrors: true,
    protocolTimeout: 0,
    timeout: 3 * ONE_MINUTE,
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
    const start = performance.now();

    await new IllegalsScrapper(browser).scrapData();
    await new ProductsScrapper(browser).scrapData();
    await new AppsScrapper(browser).scrapData();

    const end = performance.now();
    const delta = (end - start) / ONE_SECOND;

    console.log(`All process was executed in ${(delta).toFixed(2)} s`);

    /*


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
    

    
    */
  } finally {
    await browser.close();
  }
})();
