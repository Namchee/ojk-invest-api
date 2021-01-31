import { launch, Page } from 'puppeteer';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { performance } from 'perf_hooks';

// base url
const url = 'https://sikapiuangmu.ojk.go.id/FrontEnd/AlertPortal/Negative';
// row selector
const rowSelector = 'tr.dxgvDataRow_Moderno';
// table navigation selector
const nextSelector = '.dxp-button';
// table page number selector
const pageSelector = '.dxp-num';

/**
 * Scrap the current page from OJK's investment list.
 * @param {Page} page - Current page
 */
async function scrapPage(page: Page) {
  await page.waitForSelector(rowSelector);

  const rows = await page.$$eval(rowSelector, (rows) => {
    // get all information rows
    const investmentRows = rows.filter(row => row.childElementCount > 1);

    // parser function
    const dateParser = (dateString: string) => {
      const monthMap: Record<string, number> = {
        'Jan': 0,
        'Feb': 1,
        'Mar': 2,
        'Apr': 3,
        'Mei': 4,
        'Jun': 5,
        'Jul': 6,
        'Agu': 7,
        'Sep': 8,
        'Okt': 9,
        'Nov': 10,
        'Des': 11,
      };

      const tokens = dateString.split(' ');

      return new Date(
        Number(tokens[2]),
        monthMap[tokens[1]],
        Number(tokens[0]),
      );
    };

    const processString = (str: string) => str.replace('-', '').trim();

    const rowData = investmentRows.map((row) => {
      const childNodes = Array.from(row.children);
      const contactInformation = (childNodes[2].textContent as string)
        .split('Tel :');

      return JSON.stringify({
        id: Number((childNodes[0].textContent as string).trim()),
        name: (childNodes[1].textContent as string).trim(),
        address: processString(contactInformation[0]),
        number: processString(contactInformation[1]),
        url: processString(childNodes[3].textContent as string),
        type: processString(childNodes[4].textContent as string),
        inputDate: dateParser((childNodes[5].textContent as string).trim())
          .toLocaleDateString('en-id'),
        details: processString(childNodes[6].textContent as string),
      });
    });

    return rowData;
  });

  return rows;
}

(async () => {
  const start = performance.now();

  const browser = await launch({
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  // make sure that the network is 100% idle
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });

  await page.setBypassCSP(true);
  await page.waitForSelector(nextSelector);
  await page.waitForSelector(pageSelector);

  const investments = [];

  while (true) {
    const pageInvestment = (await scrapPage(page))
      .map(investment => JSON.parse(investment));

    const lastPageInvestment = pageInvestment[pageInvestment.length - 1];
    const lastScrapedInvestment = investments[investments.length - 1];

    // prevent re-scrapping when DOM hasn't finished updating
    if (investments.length === 0 ||
      lastPageInvestment.id !== lastScrapedInvestment.id) {
      investments.push(...pageInvestment);

      const last = await page.$$eval(nextSelector, (buttons) => {
        const nextBtn = buttons[1] as HTMLButtonElement;

        const isDisabled = nextBtn.classList.contains('dxp-disabledButton');

        if (!isDisabled) { // click when the page isn't the last page
          nextBtn.click();
        }

        return isDisabled;
      });

      if (last) {
        break;
      }

      await page.waitForResponse((res) => {
        return res.url() === url && res.request().method() === 'POST';
      }, { timeout: 0 });
    }
  }

  // close the browser
  await browser.close();

  // remove the identifier
  investments.forEach(investment => delete investment.id);

  const end = performance.now();

  const data = {
    investments,
    version: new Date().toLocaleDateString('en-id'),
  };

  // write to file
  writeFileSync(
    resolve(process.cwd(), 'investments.json'),
    JSON.stringify(data, null, 2),
  );

  console.log(
    `Finished scrapping OJK's data in: ${((end - start) / 1000).toFixed(3)} ms`,
  );
})();
