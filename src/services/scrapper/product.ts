import type { Browser, Page } from 'puppeteer';
import { benchmark } from '@namchee/decora';

import { Scrapper } from './scrapper.js';
import { Product } from '../../entity/product.js';
import { writeResult } from '../writer.js';
import { TextProcessor } from '../processor.js';

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

    return rawProducts.map((rawProduct: string) => {
      const product = JSON.parse(rawProduct);

      const name = new TextProcessor(product.name);
      const type = new TextProcessor(product.type);

      product.id = Number(product.id);
      product.name = name.capitalize().trim().getResult();
      product.type = type.capitalize().trim().getResult();

      return product;
    });
  }

  /**
   * Scrap all legal mutual funds data from the supplied URL
   * and write the result into a JSON file.
   *
   * @return {Promise<void>}
   */
  @benchmark('s', 3)
  public async scrapData(): Promise<void> {
    const page = await this.initializePage(ProductsScrapper.nextSelector);

    const products: Product[] = [];

    while (true) {
      const pageProducts = await this.scrapPage(page);

      const lastPageProduct = pageProducts[pageProducts.length - 1];
      const lastProduct = products[products.length - 1];

      if (products.length === 0 || lastPageProduct.id !== lastProduct.id) {
        products.push(...pageProducts);

        const buttons = await page.$$(ProductsScrapper.nextSelector);
        const nextBtn = buttons[1];

        const rawClass = await nextBtn.getProperty('className');
        const classList: string = await rawClass.jsonValue();

        const isDisabled = new RegExp(ProductsScrapper.disabledSelector)
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
      data: products,
      version: new Date(),
    };

    writeResult(result, 'products');
  }
}
