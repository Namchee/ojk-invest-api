import { Browser, Page } from 'puppeteer';
import { benchmark } from '@namchee/decora';
import { PAGE_OPTIONS, Scrapper } from './base';

export interface Apps {
  id: number;
  name: string;
  url: string;
  owner: string;
}

/**
 * Scrapping script for legal investment applications
 */
export class AppScrapper extends Scrapper<Apps> {
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
  protected async scrapPage(page: Page): Promise<Apps[]> {
    await page.waitForSelector(AppScrapper.rowSelector);

    const rawApps = await page.$$eval(AppScrapper.rowSelector, (rows) => {
      const dataRows = rows.filter(row => row.childElementCount > 1);

      const rowData = dataRows.map((row) => {
        const children = Array.from(row.children);
        const cleanUrl = (children[2].textContent as string)
          .replace(/\s+/g, '');

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
    await page.waitForSelector(AppScrapper.nextSelector);

    const apps: Apps[] = [];

    while (true) {
      const pageApps = await this.scrapPage(page);

      const lastPageApp = pageApps[pageApps.length - 1];
      const lastApp = apps[apps.length - 1];

      if (apps.length === 0 || lastPageApp.id !== lastApp.id) {
        apps.push(...pageApps);

        const isLastPage = await page.$$eval(
          AppScrapper.nextSelector,
          (buttons, selector) => {
            const nextBtn = buttons[1] as HTMLButtonElement;
            const isDisabled = nextBtn.classList.contains(selector);

            if (!isDisabled) {
              nextBtn.click();
            }

            return isDisabled;
          },
          AppScrapper.disabledSelector,
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

    this.writeResultToFile(result, 'apps');
  }
}
