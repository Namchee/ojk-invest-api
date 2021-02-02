import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Browser, DirectNavigationOptions } from 'puppeteer';

/**
 * Scrapping result from a scrapping script
 */
export interface ScrappingResult {
  data: Record<string, unknown>[];
  version: Date | string; // `Date` object or locale Date string
}

/**
 * Base scrapping script
 */
export abstract class Scrapper {
  public static readonly PAGE_OPTIONS: DirectNavigationOptions = {
    waitUntil: 'networkidle0',
    timeout: 0,
  };

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

    dataCopy.version = data.version.toLocaleString('en-id');

    writeFileSync(
      target,
      JSON.stringify(dataCopy, null, 2),
      { encoding: 'utf-8' },
    );
  }

  /**
   * Scrap relevant information from the designated URL
   */
  public abstract scrapInfo(): Promise<void>;
}
