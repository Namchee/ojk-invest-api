import type { Browser, Page, WaitForOptions } from 'puppeteer';

import { ONE_MINUTE } from '../../constant/time.js';

/**
 * Scrapping result from a scrapping script
 */
export interface ScrappingResult<T> {
  data: T[];
  version: Date;
}

export const PAGE_OPTIONS: WaitForOptions = {
  waitUntil: 'networkidle0',
  timeout: ONE_MINUTE,
};

// eslint-disable-next-line max-len
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

/**
 * Base scrapping script
 */
export abstract class Scrapper<T> {
  /**
   * Constructor for basic scrapper
   * @param {Browser} browser Puppeteeer browser instance
   * @param {string} url URL to scrap from
   */
  public constructor(
    protected readonly browser: Browser,
    protected readonly url: string,
  ) {}

  /**
   * Scrap all relevant information from the current page state
   * @param {Page} page - Puppeteer page instance
   * @return {Promise<T>[]} - array of relevant
   * information
   */
  protected abstract scrapPage(page: Page): Promise<T[]>;

  /**
   * Scrap all relevant information from the supplied URL
   * and write the result to a JSON file.
   *
   */
  public abstract scrapData(): Promise<void>;

  /**
   * Initialize webpage for scrapping pages.
   *
   * @param {string} selector selector to indicate the page has finished loading
   * @return {Promise<Page>} the webpage, ready for scrapping
   */
  protected async initializePage(selector: string): Promise<Page> {
    const page = await this.browser.newPage();

    await page.setUserAgent(USER_AGENT);
    await page.setBypassCSP(true);
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        return request.abort();
      }
      
      request.continue();
    });

    await page.goto(this.url, PAGE_OPTIONS);

    await page.waitForSelector(selector, { timeout: ONE_MINUTE });

    return page;
  }

  /**
   * Pause execution for certain period of time.
   * 
   * @param {number} time Duration to stop execution in milleseconds 
   * @returns {Promise<void>} A promise that is guaranteed to resolve after `time`
   * milliseconds.
   */
  protected delay(time: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    })
  }
}
