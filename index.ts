import { performance } from 'perf_hooks';
import { launch } from 'puppeteer';

import { IllegalsScrapper } from './src/services/scrapper/illegal';
import { AppsScrapper } from './src/services/scrapper/app';
import { ProductsScrapper } from './src/services/scrapper/product';
import { bootstrapOutput } from './src/services/writer';

(async () => {
  bootstrapOutput();

  const browser = await launch({
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
      scrappers.map(scrapper => scrapper.scrapInfo()),
    );

    scrappingResult.forEach(
      (result: PromiseSettledResult<void>, idx: number) => {
        if (result.status === 'fulfilled') {
          // eslint-disable-next-line max-len
          console.log(`✔️ ${scrappers[idx].constructor.name} has successfully scrapped`);
        } else {
          // eslint-disable-next-line max-len
          console.log(`❌ ${scrappers[idx].constructor.name} has failed`);
        }
      },
    );

    const end = performance.now();

    console.log(`All process was executed in ${(end - start).toFixed(3)} ms`);
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
})();
