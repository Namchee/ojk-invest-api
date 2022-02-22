import { Browser, Page } from 'puppeteer';
import { benchmark } from '@namchee/decora';

import { PAGE_OPTIONS, Scrapper } from './scrapper';
import { App } from '../../entity/app';
import { writeScrappingResultToFile } from '../writer';
import { capitalize } from '../../utils';


/**
 * Scrapping script for legal investment applications
 */
export class AppsScrapper extends Scrapper<App> {
  // row selector
  private static readonly rowSelector = '.dxgvDataRow_Youthful';
  // next button selector
  private static readonly nextSelector = '.dxp-button';
  // disabled button selector
  private static readonly disabledSelector = 'dxp-disabledButton';

  /**
   * Constructor for AppScrapper
   * @param {Browser} browser - puppeteer's browser instance
   */
  public constructor(browser: Browser) {
    super(
      browser,
      'https://reksadana.ojk.go.id/Public/PTOPublic.aspx',
    );
  }

  /**
   * Scrap all legal investment app information from the current page state
   *
   * @param {Page} page - Puppeteer page instance
   * @return {Promise<Apps[]>} - array of legal investment
   * application
   */
  protected async scrapPage(page: Page): Promise<App[]> {
    await page.waitForSelector(AppsScrapper.rowSelector);

    const rawApps = await page.$$eval(AppsScrapper.rowSelector, (rows) => {
      const dataRows = rows.filter(row => row.childElementCount > 1);

      const rowData = dataRows.map((row) => {
        const children = Array.from(row.children);
        let cleanUrl = (children[2].textContent as string)
          .replace(/\s+/g, '');

        if (!cleanUrl.startsWith('http')) {
          cleanUrl = `https://${cleanUrl}`;
        }

        return JSON.stringify({
          id: children[0].textContent?.trim(),
          name: children[1].textContent?.trim(),
          url: cleanUrl,
          owner: children[3].textContent?.trim(),
        });
      });

      return rowData;
    });

    return rawApps.map((stringifiedApp: string) => {
      const app = JSON.parse(stringifiedApp);

      app.name = capitalize(this.cleanName(app.name));
      app.id = Number(app.id);

      return app;
    });
  }

  /**
   * Scrap legal investment application data from the supplied URL
   * and write the result to a JSON file.
   *
   * @return {Promise<void>}
   */
  @benchmark('s', 3)
  public async scrapInfo(): Promise<void> {
    const page = await this.browser.newPage();
    await page.goto(this.url, PAGE_OPTIONS);

    await page.setBypassCSP(true);
    await page.waitForSelector(AppsScrapper.nextSelector);

    const apps: App[] = [];

    while (true) {
      const pageApps = await this.scrapPage(page);

      const lastPageApp = pageApps[pageApps.length - 1];
      const lastApp = apps[apps.length - 1];

      if (apps.length === 0 || lastPageApp.id !== lastApp.id) {
        apps.push(...pageApps);

        const isLastPage = await page.$$eval(
          AppsScrapper.nextSelector,
          (buttons, selector) => {
            const nextBtn = buttons[1] as HTMLButtonElement;
            const isDisabled = nextBtn.classList.contains(selector as string);

            if (!isDisabled) {
              nextBtn.click();
            }

            return isDisabled;
          },
          AppsScrapper.disabledSelector,
        );

        if (isLastPage) {
          break;
        }

        await page.waitForResponse((res) => {
          return res.url() === this.url && res.request().method() === 'POST';
        });
      }
    }

    const result = {
      data: apps,
      version: new Date(),
    };

    writeScrappingResultToFile(result, 'apps');
  }

  /**
   * Format and sanitize raw app names from OJK's data
   *
   * @param {string} rawName raw app name
   * @return {string} sanitized app name
   */
  private cleanName(rawName: string): string {
    // TODO: do research about this
    const stopWords = [
      'aplikasi',
      'android',
      'seluler',
      'telepon',
      'fitur',
      'reksa',
      'dana',
      'internet',
      'mobile',
      'banking',
      'bank',
      'pembayaran',
      'widget',
    ];

    const stopPattern = new RegExp(`\\b(${stopWords.join('|')})\\b`, 'ig');

    rawName = rawName.replace(stopPattern, '');
    // remove unnecessary explanations
    rawName = rawName.replace(/\([\w\s,.\-_]+?\)/, '');
    // remove PT from start
    rawName = rawName.replace(/^\s+(PT)/, '');

    const tokens = rawName.split(' - ');

    // pick the first name only
    if (tokens.length === 2) {
      rawName = tokens[0].trim().length ? tokens[0] : tokens[1];
    }

    // remove extrateneous PT from the name
    if (rawName.indexOf('PT') > -1) {
      rawName = rawName.slice(rawName.indexOf('PT') + 2);
    }
    // remove residual ampersand and dash
    rawName = rawName.replace(/^\s+[&\-]+/, '');

    return rawName.trim();
  }
}
