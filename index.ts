import { performance } from 'perf_hooks';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { launch } from 'puppeteer';
import { Scrapper } from './src/scrapper/base';
import { IlegalScrapper } from './src/scrapper/ilegal';
import { AppScrapper } from './src/scrapper/apps';

(async () => {
  const dirPath = resolve(process.cwd(), 'data');

  const dirExist = existsSync(dirPath);

  if (!dirExist) {
    mkdirSync(dirPath);
  }

  try {
    const start = performance.now();

    const browser = await launch({
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const scrappers: Scrapper[] = [
      new IlegalScrapper(browser),
      new AppScrapper(browser),
    ];

    await Promise.all(scrappers.map(scrapper => scrapper.scrapInfo()));

    const end = performance.now();

    console.log(`All process was executed in ${(end - start).toFixed(3)} ms`);

    await browser.close();
  } catch (err) {
    throw err;
  }
})();
