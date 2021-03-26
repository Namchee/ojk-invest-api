import { performance } from 'perf_hooks';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { launch } from 'puppeteer';
import { IllegalScrapper } from './src/scrapper/illegal';
import { AppScrapper } from './src/scrapper/apps';
import { ProductScrapper } from './src/scrapper/products';

(async () => {
  const dirPath = resolve(process.cwd(), 'data');

  const dirExist = existsSync(dirPath);

  if (!dirExist) {
    mkdirSync(dirPath);
  }

  const browser = await launch({
    headless: true,
    ignoreHTTPSErrors: true,
  });

  try {
    const scrappers = [
      new IllegalScrapper(browser),
      new AppScrapper(browser),
      new ProductScrapper(browser),
    ];

    const start = performance.now();

    await Promise.all(scrappers.map(scrapper => scrapper.scrapInfo()));

    const end = performance.now();

    console.log(`All process was executed in ${(end - start).toFixed(3)} ms`);
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
})();
