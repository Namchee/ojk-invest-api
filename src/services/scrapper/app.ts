import { Browser, Page } from 'puppeteer';
import { benchmark } from '@namchee/decora';

import { writeResult } from '../writer';

import { Scrapper } from './scrapper';
import { App } from '../../entity/app';
import { TextProcessor } from '../processor';


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
      const name = this.cleanName(app.name);

      const processor = new TextProcessor(name);

      app.name = processor.capitalize().getResult();
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
  public async scrapData(): Promise<void> {
    const page = await this.initializePage(AppsScrapper.nextSelector);

    const apps: App[] = [];

    while (true) {
      const pageApps = await this.scrapPage(page);

      const lastPageApp = pageApps[pageApps.length - 1];
      const lastApp = apps[apps.length - 1];

      if (apps.length === 0 || lastPageApp.id !== lastApp.id) {
        apps.push(...pageApps);

        const buttons = await page.$$(AppsScrapper.nextSelector);
        const nextBtn = buttons[1];

        const rawClass = await nextBtn.getProperty('className');
        const classList: string = await rawClass.jsonValue();

        const isDisabled = new RegExp(AppsScrapper.disabledSelector)
          .test(classList);

        if (isDisabled) {
          break;
        }

        await nextBtn.click();
        await page.waitForResponse((res) => {
          return res.url() === this.url && res.request().method() === 'POST';
        });
      }
    }

    const result = {
      data: apps,
      version: new Date(),
    };

    writeResult(result, 'apps');
  }

  /**
   * Format and sanitize raw app names from OJK's data
   *
   * @param {string} rawName raw app name
   * @return {string} sanitized app name
   */
  private cleanName(rawName: string): string {
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
