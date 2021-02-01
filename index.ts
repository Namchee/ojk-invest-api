import { performance } from 'perf_hooks';
import { launch } from 'puppeteer';
import { Scrapper } from './src/scrapper/base';
import { IlegalScrapper } from './src/scrapper/ilegal';

(async () => {
  const start = performance.now();

  const browser = await launch({
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const scrappers: Scrapper[] = [
    new IlegalScrapper(browser),
  ];

  await Promise.all(scrappers.map(scrapper => scrapper.scrapInfo()));

  const end = performance.now();

  console.log(`All process was executed in ${(end - start).toFixed(3)} ms`);

  await browser.close();
})();
