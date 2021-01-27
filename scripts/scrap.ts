import { Page, launch, LaunchOptions, Browser } from 'puppeteer';

// base url
const url = 'https://sikapiuangmu.ojk.go.id/FrontEnd/AlertPortal/Negative';
const rowSelector = 'tr.dxgvDataRow_Moderno';
const cellSelector = '.dxgv';

async function launchBrowser(): Promise<Browser> {
  const options: LaunchOptions = {
    headless: false,
    ignoreHTTPSErrors: true,
    devtools: true,
  };

  return launch(options);
}

async function scrapNegativeInvestments(page: Page) {
  await page.waitForSelector(rowSelector);

  const rows = await page.$$eval(rowSelector, (rows) => {
    const investmentRows = rows.filter((row) => row.childElementCount > 1);

    const rowData = investmentRows.map((row) => {
      const children = Array.from(row.children);

      return children[1].textContent;
    });

    return rowData;

    /*
    investmentRows.forEach((row) => {
      row.childNodes.forEach((node) => console.log(node.textContent));
    });
    */
  });

  console.log(rows);
}

(async () => {
  const browser = await launchBrowser();
  const seedPage = await browser.newPage();
  await seedPage.goto(url);

  await scrapNegativeInvestments(seedPage);

  browser.close();
})();
