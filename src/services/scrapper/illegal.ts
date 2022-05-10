import { Browser, Page } from 'puppeteer';

import getUrls from 'get-urls';
import emailRegex from 'email-regex-safe';

import { benchmark } from '@namchee/decora';
import { Standard, tryFormat } from '@namchee/telepon';

import { Scrapper } from './scrapper';
import { IllegalInvestment } from '../../entity/illegal';
import { writeResult } from '../writer';
import { TextProcessor } from '../processor';


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
          web: row.childNodes[9].textContent,
          entityType: row.childNodes[11].textContent,
          activityType: row.childNodes[13].textContent,
          input_date: row.childNodes[15].textContent,
          description: row.childNodes[17].textContent,
        });
      });
    });

    return rawData.map((illegal: string) => {
      const data = JSON.parse(illegal);

      const address = new TextProcessor(data.address);
      const phone = new TextProcessor(data.phone);
      const web = new TextProcessor(data.web);
      const email = new TextProcessor(data.email);
      const entityType = new TextProcessor(data.entityType);
      const activityType = new TextProcessor(data.activityType);
      const description = new TextProcessor(data.description);

      return {
        id: Number(data.id),
        name: data.name.trim(),
        address: address.sanitize().trim().getResult(),
        phone: [phone.sanitize().trim().getResult()],
        web: [...getUrls(web.sanitize().trim().getResult())],
        email: [email.sanitize().trim().getResult()],
        entity_type: entityType.sanitize().capitalize().trim().getResult(),
        activity_type: activityType.sanitize().capitalize().trim().getResult(),
        input_date: data.input_date,
        description: description.sanitize().trim().getResult(),
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
  public async scrapData(): Promise<void> {
    const page = await this.initializePage(IllegalsScrapper.tableSelector);

    const investments: IllegalInvestment[] = [];

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

    writeResult(result, 'illegals');
  }
}
