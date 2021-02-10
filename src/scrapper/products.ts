import { Browser, Page } from 'puppeteer';
import { benchmark } from '@namchee/decora';
import { PAGE_OPTIONS, Scrapper } from './base';

/**
 * Scrapper script to extract legal mutual funds products
 */
export class ProductScrapper extends Scrapper {
  // row selector
  private static readonly rowSelector = '.dxgvDataRow_Youthful';
  // next button selector
  private static readonly nextSelector = '.dxp-button';
  // disabled button selector
  private static readonly disabledSelector = 'dxp-disabledButton';

  /**
   * Constructor for ProductsScrapper
   * @param {Browser} browser - puppeteer browser instance
   */
  public constructor(browser: Browser) {
    super(
      browser,
      'https://reksadana.ojk.go.id/Public/ProdukReksadanaPublic.aspx',
    );
  }

  /**
   * Scrap all legal mutual funds product from the current page state
   *
   * @param {Page} page - puppeteer page instance
   * @return {Promise<Record<string, unknown>[]>} - list of legal mutual funds
   * investment.
   */
  protected async scrapPage(page: Page): Promise<Record<string, unknown>[]> {
    await page.waitForSelector(ProductScrapper.rowSelector);

    const rows = await page.$$eval(ProductScrapper.rowSelector, (rows) => {
      const dataRows = rows.filter(row => row.childElementCount > 1);

      const rowData = dataRows.map((row) => {
        const children = Array.from(row.children);

        return JSON.stringify({
          id: children[0].textContent,
          name: children[1].textContent,
          management: children[2].textContent,
          custodian: children[3].textContent,
          type: children[4].textContent,
        });
      });

      return rowData;
    });

    return rows.map(row => JSON.parse(row));
  }

  /**
   * Scrap all legal mutual funds data from the supplied URL
   * and write the result into a JSON file.
   *
   * @return {Promise<void>}
   */
  @benchmark('s', 3)
  public async scrapInfo(): Promise<void> {
    const page = await this.browser.newPage();
    await page.goto(this.url, PAGE_OPTIONS);

    await page.setBypassCSP(true);
    await page.waitForSelector(ProductScrapper.nextSelector);

    const products = [];

    while (true) {
      const pageProducts = await this.scrapPage(page);

      const lastPageProduct = pageProducts[pageProducts.length - 1];
      const lastProduct = products[products.length - 1];

      if (products.length === 0 || lastPageProduct.id !== lastProduct.id) {
        products.push(...pageProducts);

        const isLastPage = await page.$$eval(
          ProductScrapper.nextSelector,
          async (buttons, selector) => {
            const nextButton = buttons[1] as HTMLButtonElement;
            const isDisabled = nextButton.classList.contains(selector);

            if (!isDisabled) {
              await nextButton.click();
            }

            return isDisabled;
          },
          ProductScrapper.disabledSelector,
        );

        if (isLastPage) {
          break;
        }

        await page.waitForResponse((res) => {
          return res.url() === this.url && res.request().method() === 'POST';
        });
      }
    }

    products.forEach(product => delete product.id);

    const result = {
      data: products,
      version: new Date(),
    };

    this.writeResultToFile(result, 'products');
  }
}
