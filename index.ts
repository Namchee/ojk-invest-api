import puppeteer from 'puppeteer';
import { performance } from 'perf_hooks';

import { IllegalsScrapper } from './src/services/scrapper/illegal';
import { AppsScrapper } from './src/services/scrapper/app';
import { ProductsScrapper } from './src/services/scrapper/product';
import { bootstrapOutput } from './src/services/writer';

(async () => {
  bootstrapOutput();

  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
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
    const delta = (end - start) / 1000;

    console.log(`All process was executed in ${(delta).toFixed(2)} s`);
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
})();
