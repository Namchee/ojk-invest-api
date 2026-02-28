import type { Browser, Page } from 'puppeteer';

import { Scrapper } from '../scrapper';

export class V2IllegalScrapper extends Scrapper<unknown> {
  private static readonly searchSelector = '[name=ctl00$PlaceHolderMain$ctl01$TextBoxSearch]';
  private static readonly filenamePattern = /Daftar Pinjol/;

  public constructor(
    protected readonly browser: Browser,
    protected readonly url: string,
  ) {
    super(browser, 'https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Default.aspx');
  }

  public async scrapPage(page: Page): Promise<unknown[]> {
    await page.waitForSelector(V2IllegalScrapper.searchSelector);
  }
}
