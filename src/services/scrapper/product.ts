import { Browser, Page } from 'puppeteer';
import { benchmark } from '@namchee/decora';

import { PAGE_OPTIONS, Scrapper } from './scrapper';
import { capitalize } from '../../utils';
import { Product } from '../../entity/product';
import { writeScrappingResultToFile } from '../writer';

/**
 * Scrapper script to extract legal mutual funds products
 */
export class ProductsScrapper extends Scrapper<Product> {
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
   * @return {Promise<Product[]>} - list of legal mutual funds
   * investment.
   */
  protected async scrapPage(page: Page): Promise<Product[]> {
    await page.waitForSelector(ProductsScrapper.rowSelector);

    const rawProducts = await page.$$eval(
      ProductsScrapper.rowSelector,
      (rows) => {
        const dataRows = rows.filter(row => row.childElementCount > 1);

        const rowData = dataRows.map((row) => {
          const children = Array.from(row.children);

          return JSON.stringify({
            id: children[0].textContent?.trim(),
            name: children[1].textContent?.trim(),
            management: children[2].textContent?.trim(),
            custodian: children[3].textContent?.trim(),
            type: children[4].textContent?.trim(),
          });
        });

        return rowData;
      });

    return rawProducts.map((product: string) => {
      const prod = JSON.parse(product);

      prod.id = Number(prod.id);
      prod.name = capitalize(prod.name);
      prod.type = capitalize(prod.type);

      return prod;
    });
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

    await page.waitForSelector(ProductsScrapper.nextSelector);

    const products: Product[] = [];

    while (true) {
      const pageProducts = await this.scrapPage(page);

      const lastPageProduct = pageProducts[pageProducts.length - 1];
      const lastProduct = products[products.length - 1];

      if (products.length === 0 || lastPageProduct.id !== lastProduct.id) {
        products.push(...pageProducts);

        const isLastPage = await page.$$eval(
          ProductsScrapper.nextSelector,
          (buttons, selector) => {
            const nextButton = buttons[1] as HTMLButtonElement;
            const isDisabled = nextButton.classList.contains(
              selector as string,
            );

            if (!isDisabled) {
              nextButton.click();
            }

            return isDisabled;
          },
          ProductsScrapper.disabledSelector,
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
      data: products,
      version: new Date(),
    };

    writeScrappingResultToFile(result, 'products');
  }
}
