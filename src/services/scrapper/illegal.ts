import { Browser, Page } from 'puppeteer';
import { benchmark } from '@namchee/decora';
import { Standard, tryFormat } from '@namchee/telepon';
import getUrls from 'get-urls';

import { PAGE_OPTIONS, Scrapper } from './scrapper';
import { capitalize, normalize } from '../../utils';
import { IllegalInvestment } from '../../entity/illegal';
import { writeScrappingResultToFile } from '../writer';

/**
 * Scrapper script to extract illegal investments data
 */
export class IllegalsScrapper extends Scrapper<IllegalInvestment> {
  // row selector
  private static readonly rowSelector = 'tr.dxgvDataRow_Moderno';
  // table navigation selector
  private static readonly nextSelector = '.dxp-button';
  // table page number selector
  private static readonly pageSelector = '.dxp-num';
  // disabled selector
  private static readonly disabledSelector = 'dxp-disabledButton';

  /**
   * Constructor for IllegalScrapper
   * @param {Browser} browser Puppeteer browser instance
   */
  public constructor(browser: Browser) {
    super(
      browser,
      'https://sikapiuangmu.ojk.go.id/FrontEnd/AlertPortal/Negative',
    );
  }

  /**
   * Scrap all ilegal investment data from the current page state
   *
   * @param {Page} page - Puppeteer page instance
   * @return {Promise<IllegalInvestment[]>} - array of illegal
   * investments data
   */
  protected async scrapPage(
    page: Page,
  ): Promise<IllegalInvestment[]> {
    await page.waitForSelector(IllegalsScrapper.rowSelector);

    const rawIllegals = await page.$$eval(
      IllegalsScrapper.rowSelector,
      (rows) => {
        const dataRows = rows.filter(row => row.childElementCount > 1);

        const rowData = dataRows.map((row) => {
          return JSON.stringify({
            id: row.childNodes[1].textContent?.trim(),
            name: row.childNodes[2].textContent?.trim(),
            contacts: row.childNodes[3].textContent?.trim(),
            urls: row.childNodes[4].textContent?.trim(),
            type: row.childNodes[5].textContent?.trim(),
            inputDate: row.childNodes[6].textContent?.trim(),
            details: row.childNodes[7].textContent?.trim(),
          });
        });

        return rowData;
      },
    );

    return rawIllegals.map((illegal: string) => {
      const rawProduct = JSON.parse(illegal);

      const id = Number(rawProduct.id);
      const names = rawProduct.name
        .split(/[/\\]/g)
        .map((str: string) => {
          str = str.replace(/;/, '');
          str = str.trim();

          return str;
        })
        .map((str: string) => {
          const inBraces = str.match(/\((.+?)\)/);

          if (inBraces) {
            return [
              str.slice(0, str.indexOf(inBraces[0])).trim(),
              inBraces[1],
            ];
          }

          return str;
        })
        .flat();

      const name = names[0];
      const alias = names.slice(1);

      const urls = [...getUrls(rawProduct.urls)];

      const contactInfo = rawProduct.contacts
        .split('Tel :');

      const address = normalize(contactInfo[0]);

      const phoneAndMail = normalize(contactInfo[1]);
      const phoneNumbers = phoneAndMail
        .split(/([,;](?= )|(?<= )\/(?= )|(?<= )\-(?= ))/)
        .map((num: string): string | string[] => {
          if (/[\/\\]/g.test(num)) {
            const splitted = num.split(/[\/\\]/);

            splitted[1] = `${splitted[0].slice(
              0,
              splitted[0].length - splitted[1].length,
            )}${splitted[1]}`;

            return splitted;
          }

          return num;
        })
        .flat()
        .map((num: string): string => {
          num = num.trim();

          if (num.startsWith('8')) {
            num = `0${num}`;
          }

          const tokens = num.split(/\s/);

          if (tokens[0] === '+6221' && tokens[1].startsWith('8')) {
            tokens[0] = '0';
            num = tokens.join('');
          }

          try {
            return tryFormat(num, Standard.LOCAL);
          } catch (err) {
            num = num.replace(/\s/g, '');

            // eslint-disable-next-line
            const numberPattern = /\+?(\(\s?[\d\-]+\s?\)\s?)?[\d]+\s?\-?\s?\d{0,}\s?\-?\s?\d{0,}\/?\d{0,}/;
            const numberMatch = num.match(numberPattern);

            return numberMatch && numberMatch[0].length >= 7 ?
              numberMatch[0] :
              '';
          }
        })
        .filter(num => num !== '' && num !== ',');

      const emails: string[] = [];

      const emailMatch = phoneAndMail
        .match(
          // eslint-disable-next-line max-len
          /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        );

      if (emailMatch) {
        emailMatch.forEach(match => emails.push(match));
      }

      return {
        id,
        name,
        alias,
        address,
        number: phoneNumbers,
        email: emails,
        urls,
        type: capitalize(normalize(rawProduct.type)),
        inputDate: this.parseDate(rawProduct.inputDate)
          .toLocaleDateString('en-id'),
        details: normalize(rawProduct.details),
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
    await page.goto(this.url, PAGE_OPTIONS);

    await page.setBypassCSP(true);
    await page.waitForSelector(IllegalsScrapper.pageSelector);

    const investments = [];

    while (true) {
      const pageInvestments = await this.scrapPage(page);

      const lastPageInvestment = pageInvestments[pageInvestments.length - 1];
      const lastInvestment = investments[investments.length - 1];

      // prevent re-scrapping when DOM hasn't finished updating
      if (investments.length === 0 ||
        lastPageInvestment.id !== lastInvestment.id) {
        investments.push(...pageInvestments);

        const isLastPage = await page.$$eval(
          IllegalsScrapper.nextSelector,
          (buttons, selector) => {
            const nextBtn = buttons[1] as HTMLButtonElement;

            const isDisabled = nextBtn.classList.contains(selector);

            // click when the page isn't the last page
            if (!isDisabled) {
              nextBtn.click();
            }

            return isDisabled;
          }, IllegalsScrapper.disabledSelector);

        if (isLastPage) {
          break;
        }

        await page.waitForResponse((res) => {
          return res.url() === this.url && res.request().method() === 'POST';
        }, { timeout: 0 });
      }
    }

    const result = {
      data: investments,
      version: new Date(),
    };

    writeScrappingResultToFile(result, 'illegals');
  }

  /**
   * Parse `Date` object from a date string in OJK page
   *
   * @param {string} dateString date string
   * @return {Date} parsed `Date` object
   */
  private parseDate(dateString: string): Date {
    const monthMap: Record<string, number> = {
      'Jan': 0,
      'Feb': 1,
      'Mar': 2,
      'Apr': 3,
      'Mei': 4,
      'Jun': 5,
      'Jul': 6,
      'Agu': 7,
      'Sep': 8,
      'Okt': 9,
      'Nov': 10,
      'Des': 11,
    };

    const tokens = dateString.split(' ');

    return new Date(
      Number(tokens[2]),
      monthMap[tokens[1]],
      Number(tokens[0]),
    );
  }
}
