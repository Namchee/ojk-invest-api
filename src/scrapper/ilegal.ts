import { Browser, Page } from 'puppeteer';
import { benchmark } from '@namchee/decora';
import { PAGE_OPTIONS, Scrapper } from './base';
import { capitalize } from './../utils';

/**
 * Scrapper script to extract ilegal investments data
 */
export class IlegalScrapper extends Scrapper {
  // row selector
  private static readonly rowSelector = 'tr.dxgvDataRow_Moderno';
  // table navigation selector
  private static readonly nextSelector = '.dxp-button';
  // table page number selector
  private static readonly pageSelector = '.dxp-num';
  // disabled selector
  private static readonly disabledSelector = 'dxp-disabledButton';

  /**
   * Constructor for IlegalScrapper
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
   * @return {Promise<Record<string, unknown>[]>} - array of ilegal
   * investments data
   */
  protected async scrapPage(
    page: Page,
  ): Promise<Record<string, unknown>[]> {
    await page.waitForSelector(IlegalScrapper.rowSelector);

    const rows = await page.$$eval(
      IlegalScrapper.rowSelector,
      (rows, capitalize) => {
        const dateParser = (dateString: string): Date => {
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
        };
        // get all information rows
        const dataRows = rows.filter(row => row.childElementCount > 1);

        const stringCleaner = (str: string) => {
          if (str == '-') {
            return '';
          }

          return str.replace(/\\"/g, '');
        };

        const rowData = dataRows.map((row) => {
          const childNodes = Array.from(row.children);
          const contactInformation = (childNodes[2].textContent as string)
            .split('Tel :');

          const numbers = stringCleaner(contactInformation[1]).split(/[;,]+/)
            .map(str => str.trim());
          const urls = stringCleaner(childNodes[3].textContent as string)
            .replace(/\bdan\b/g, '')
            .split(/[;\s]+/).map(str => str.trim());

          if (numbers.length === 1 && numbers[0].length === 0) {
            numbers.pop();
          }

          if (urls.length === 1 && urls[0].length === 0) {
            urls.pop();
          }

          return JSON.stringify({
            id: Number((childNodes[0].textContent as string).trim()),
            name: (childNodes[1].textContent as string).trim(),
            address: stringCleaner(contactInformation[0]),
            number: numbers,
            url: urls,
            type: capitalize(
              stringCleaner(childNodes[4].textContent as string),
            ),
            inputDate: dateParser((childNodes[5].textContent as string).trim())
              .toLocaleDateString('en-id'),
            details: stringCleaner(childNodes[6].textContent as string),
          });
        });

        return rowData;
      }, capitalize);

    return rows.map(row => JSON.parse(row));
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
    await page.waitForSelector(IlegalScrapper.pageSelector);

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
          IlegalScrapper.nextSelector,
          (buttons, selector) => {
            const nextBtn = buttons[1] as HTMLButtonElement;

            const isDisabled = nextBtn.classList.contains(selector);

            // click when the page isn't the last page
            if (!isDisabled) {
              nextBtn.click();
            }

            return isDisabled;
          }, IlegalScrapper.disabledSelector);

        if (isLastPage) {
          break;
        }

        await page.waitForResponse((res) => {
          return res.url() === this.url && res.request().method() === 'POST';
        }, { timeout: 0 });
      }
    }

    // remove the identifier
    investments.forEach(investment => delete investment.id);

    const result = {
      data: investments,
      version: new Date(),
    };

    this.writeResultToFile(result, 'ilegal');
  }
}
