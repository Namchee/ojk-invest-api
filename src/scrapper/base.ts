import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Browser, DirectNavigationOptions, Page } from 'puppeteer';

/**
 * Scrapping result from a scrapping script
 */
export interface ScrappingResult {
  data: Record<string, unknown>[];
  version: Date;
}

export const PAGE_OPTIONS: DirectNavigationOptions = {
  waitUntil: 'networkidle0',
  timeout: 0,
};

/**
 * Base scrapping script
 */
export abstract class Scrapper {
  /**
   * Constructor for basic scrapper
   * @param {Browser} browser Puppeteeer browser instance
   * @param {string} url URL to scrap from
   */
  public constructor(
    protected readonly browser: Browser,
    protected readonly url: string,
  ) { }

  /**
   * Write scrapping result to the `data` directory
   *
   * @param {ScrappingResult} data - scrapping result and
   * data version
   * @param {string} filename - name for the file
   */
  protected writeResultToFile(
    data: ScrappingResult,
    filename: string,
  ): void {
    const target = resolve(process.cwd(), 'data', `${filename}.json`);
    // preserve immutability to the data
    const dataCopy = JSON.parse(JSON.stringify(data));

    dataCopy.version = data.version.toLocaleDateString('en-id');

    writeFileSync(
      target,
      JSON.stringify(dataCopy, null, 2),
      { encoding: 'utf-8' },
    );
  }

  /**
   * Scrap all relevant information from the current page state
   * @param {Page} page - Puppeteer page instance
   * @return {Promise<Record<string, unknown>[]>} - array of relevant
   * information
   */
  protected abstract scrapPage(page: Page): Promise<Record<string, unknown>[]>;

  /**
   * Scrap all relevant information from the supplied URL
   * and write the result to a JSON file
   */
  public abstract scrapInfo(): Promise<void>;
}
