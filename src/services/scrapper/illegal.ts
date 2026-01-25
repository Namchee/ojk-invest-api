import type { Browser, Page } from 'puppeteer';

import { benchmark } from '@namchee/decora';

import { ONE_SECOND } from '../../constant/time.js';
import { type IllegalInvestment, parseInvestmentData } from '../../entity/illegal.js';
import { writeResult } from '../writer.js';
import { Scrapper } from './scrapper.js';

/**
 * Scrapper script to extract illegal investments data
 */
export class IllegalsScrapper extends Scrapper<IllegalInvestment> {
  // row selector
  private static readonly rowSelector = 'tbody > tr';
  // table navigation selector
  private static readonly nextSelector = '.next';
  // table selector
  private static readonly tableSelector = '#datatable';
  // disabled selector
  private static readonly disabledSelector = '.disabled';
  // page size selector, mainly used to show all items at once
  private static readonly pageSizeSelector = 'select[name="datatable_length"]';
  // Most items selector
  private static readonly pageSize = 100;

  private static downloadSelector = '.dt-button.buttons-csv';

  /**
   * Constructor for IllegalScrapper
   * @param {Browser} browser Puppeteer browser instance
   */
  public constructor(browser: Browser) {
    super(browser, 'https://emiten.ojk.go.id/Satgas/AlertPortal/IndexAlertPortal');
  }

  /**
   * Scrap all ilegal investment data from the current page state
   *
   * @param {Page} page - Puppeteer page instance
   * @return {Promise<IllegalInvestment[]>} - array of illegal
   * investments data
   */
  protected async scrapPage(page: Page): Promise<IllegalInvestment[]> {
    await page.waitForSelector(IllegalsScrapper.downloadSelector);

    const buttons = await page.$$(IllegalsScrapper.downloadSelector);

    const rawData = await page.$$eval(IllegalsScrapper.rowSelector, rows => {
      return rows.map(row => {
        return JSON.stringify({
          id: 0,
          name: row.childNodes[3].textContent,
          address: row.childNodes[5].textContent,
          phone: row.childNodes[7].textContent,
          web: row.childNodes[9].textContent,
          entityType: row.childNodes[11].textContent,
          activityType: row.childNodes[13].textContent,
          input_date: row.childNodes[15].textContent,
          description: row.childNodes[17].textContent,
        });
      });
    });

    return rawData.map((illegal: string) => parseInvestmentData(JSON.parse(illegal)));
  }

  /**
   * Scrap ilegal investment data from the supplied URL
   * and write the result to a JSON file.
   *
   * @return {Promise<void>}
   */
  @benchmark('s', 3)
  public async scrapData(): Promise<void> {
    const page = await this.initializePage(IllegalsScrapper.tableSelector);

    await page.waitForSelector(IllegalsScrapper.pageSizeSelector);
    await page.select(IllegalsScrapper.pageSizeSelector, `${IllegalsScrapper.pageSize}`);

    // wait for a period of time, for ASP to response
    await this.delay(ONE_SECOND);
    await page.waitForNetworkIdle();

    const investments: IllegalInvestment[] = [];

    while (true) {
      const pageInvestments = await this.scrapPage(page);

      investments.push(...pageInvestments);

      const buttons = await page.$$(IllegalsScrapper.nextSelector);
      const nextBtn = buttons[0];

      const rawClass = await nextBtn.getProperty('className');
      const classList: string = await rawClass.jsonValue();

      const isDisabled = new RegExp(IllegalsScrapper.disabledSelector).test(classList);

      if (isDisabled) {
        break;
      }

      await nextBtn.click();
    }

    for (let i = 0; i < investments.length; i++) {
      investments[i].id = i + 1;
    }

    const result = {
      data: investments,
      version: new Date(),
    };

    writeResult(result, 'illegals');
  }
}
