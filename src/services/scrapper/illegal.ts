import { Browser, Page } from 'puppeteer';

import getUrls from 'get-urls';
import emailRegex from 'email-regex-safe';

import { benchmark } from '@namchee/decora';
import { Standard, tryFormat } from '@namchee/telepon';

import { PAGE_OPTIONS, Scrapper } from './scrapper';
import { capitalize, normalize } from '../../utils';
import { IllegalInvestment } from '../../entity/illegal';
import { writeScrappingResultToFile } from '../writer';

import { USER_AGENT } from '../../constant/browser';

/**
 * Scrapper script to extract illegal investments data
 */
export class IllegalsScrapper extends Scrapper<IllegalInvestment> {
  // row selector
  private static readonly rowSelector = 'tbody > tr';
  // table navigation selector
  private static readonly nextSelector = '.next';
  // table selector
  private static readonly tableSelector = '.dataTable';
  // disabled selector
  private static readonly disabledSelector = '.disabled';

  /**
   * Constructor for IllegalScrapper
   * @param {Browser} browser Puppeteer browser instance
   */
  public constructor(browser: Browser) {
    super(
      browser,
      'https://emiten.ojk.go.id/Satgas/AlertPortal/IndexAlertPortal',
    );
  }

  /**
   * Scrap all ilegal investment data from the current page state
   *
   * @param {Page} page - Puppeteer page instance
   * @return {Promise<IllegalInvestment[]>} - array of illegal
   * investments data
   */
  protected async scrapPage(page: Page): Promise<IllegalInvestment[]> {
    await page.waitForSelector(IllegalsScrapper.rowSelector);

    const rawData = await page.$$eval(IllegalsScrapper.rowSelector, (rows) => {
      return rows.map((row) => {
        return JSON.stringify({
          id: 0,
          name: row.childNodes[3].textContent,
          address: row.childNodes[5].textContent,
          phone: row.childNodes[7].textContent,
          urls: row.childNodes[9].textContent,
          entity_type: row.childNodes[11].textContent,
          activity_type: row.childNodes[13].textContent,
          input_date: row.childNodes[15].textContent,
          description: row.childNodes[17].textContent,
        });
      });
    });

    return rawData.map((illegal: string) => {
      const data = JSON.parse(illegal);

      const id = Number(data.id);
      const name = data.name;

      return {
        id,
        name,
        address: data.address,
        phone: data.phone,
        web: [...getUrls(data.urls)],
        email: [data.urls],
        entity_type: capitalize(normalize(data.entity_type)),
        activity_type: capitalize(normalize(data.activity_type)),
        input_date: data.input_date,
        description: normalize(data.description),
      };
    });
  }

  /**
   * Scrap ilegal investment data from the supplied URL
   * and write the result to a JSON file.
   *
   * @return {Promise<void>}
   */
  @benchmark('s', 3)
  public async scrapInfo(): Promise<void> {
    const page = await this.browser.newPage();

    await page.setUserAgent(USER_AGENT);

    await page.setBypassCSP(true);
    await page.goto(this.url, PAGE_OPTIONS);
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      if (['image', 'stylesheet'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.waitForSelector(IllegalsScrapper.tableSelector);

    const investments = [];

    while (true) {
      const pageInvestments = await this.scrapPage(page);

      investments.push(...pageInvestments);

      const buttons = await page.$$(IllegalsScrapper.nextSelector);
      const nextBtn = buttons[0];

      const rawClass = await nextBtn.getProperty('className');
      const classList: string = await rawClass.jsonValue();

      const isDisabled = new RegExp(IllegalsScrapper.disabledSelector).test(
        classList,
      );

      if (isDisabled) {
        break;
      }

      await nextBtn.click();
    }

    const result = {
      data: investments,
      version: new Date(),
    };

    writeScrappingResultToFile(result, 'illegals');
  }
}
