import type { Browser, Page } from 'puppeteer';

import { benchmark } from '@namchee/decora';

import { ONE_SECOND } from '../../constant/time.js';
import { Product } from '../../entity/product.js';
import { TextProcessor } from '../processor.js';
import { writeResult } from '../writer.js';
import { Scrapper } from './scrapper.js';

/**
 * Scrapper script to extract legal mutual funds products
 */
export class ProductsScrapper extends Scrapper<Product> {
  // row selector
  private static readonly rowSelector = '.dxgvDataRow_Youthful';
  // next button selector
  private static readonly nextSelector = '.dxp-button';
  // page size selector, mainly used to show all items at once
  private static readonly pageSizeSelector = 'input#cpContent_grdProdukReksadana_DXPagerBottom_PSI';
  // `All` items selector
  private static readonly allItemSelector = '#cpContent_grdProdukReksadana_DXPagerBottom_PSP_DXI3_';

  /**
   * Constructor for ProductsScrapper
   * @param {Browser} browser - puppeteer browser instance
   */
  public constructor(browser: Browser) {
    super(browser, 'https://reksadana.ojk.go.id/Public/ProdukReksadanaPublic.aspx');
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

    const rawProducts = await page.$$eval(ProductsScrapper.rowSelector, rows => {
      const dataRows = rows.filter(row => row.childElementCount > 1);

      const rowData = dataRows.map(row => {
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

    return rawProducts
      .map((rawProduct: string) => {
        const product = JSON.parse(rawProduct);

        const name = new TextProcessor(product.name);
        const type = new TextProcessor(product.type);

        product.id = Number(product.id);
        product.name = name.capitalize().trim().getResult();
        product.type = type.capitalize().trim().getResult();

        return product;
      })
      .filter(this.filterTestData);
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

    const pageSizeSelector = await page.$(ProductsScrapper.pageSizeSelector);
    await pageSizeSelector?.click();

    const allSelector = await page.$(ProductsScrapper.allItemSelector);
    await allSelector?.click();

    // wait for a period of time, for ASP to response
    await this.delay(ONE_SECOND * 5);
    await page.waitForNetworkIdle();

    const products: Product[] = await this.scrapPage(page);

    const result = {
      data: products,
      version: new Date(),
    };

    writeResult(result, 'products');
  }

  private filterTestData(product: { name: string; management: string }): boolean {
    const testDataPattern = /tes/gi;

    return !testDataPattern.test(product.name) && !testDataPattern.test(product.management);
  }
}
