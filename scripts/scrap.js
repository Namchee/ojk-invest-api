const puppeteer = require('puppeteer');

// base url
const url = 'https://sikapiuangmu.ojk.go.id/FrontEnd/AlertPortal/Negative';
// row selector
const rowSelector = 'tr.dxgvDataRow_Moderno';
const nextSelector = '.dxp-button';
const pageSelector = '.dxp-num';

/**
 * Scrap the current page from OJK's investment list.
 * @param {Page} page - Current page
 */
async function scrapPage(page) {
  await page.waitForSelector(rowSelector);

  const rows = await page.$$eval(rowSelector, (rows) => {
    const investmentRows = rows.filter((row) => row.childElementCount > 1);
    const dateParser = (dateString) => {
      const monthMap = {
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

    const processString = (str) => str.replace('-', '').trim();

    const rowData = investmentRows.map((row) => {
      const childNodes = Array.from(row.children);
      const contactInformation = childNodes[2].textContent.split('Tel :');

      return JSON.stringify({
        name: childNodes[1].textContent.trim(),
        address: processString(contactInformation[0]),
        number: processString(contactInformation[1]),
        url: processString(childNodes[3].textContent),
        type: processString(childNodes[4].textContent),
        inputDate: dateParser(childNodes[5].textContent.trim())
          .toLocaleDateString('en-id'),
        details: processString(childNodes[6].textContent),
      });
    });

    return rowData;
  });

  return rows;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
  await page.waitForSelector(nextSelector);
  await page.waitForSelector(pageSelector);

  const lastPage = await page.$$eval(pageSelector, (pages) => {
    return pages.pop().textContent;
  });

  const investments = [];
  let count = 0;

  while (count < Number(lastPage)) {
    const pageInvestment = await scrapPage(page);

    investments.push(...pageInvestment);

    await page.$$eval(nextSelector, async (buttons) => {
      await buttons[1].click();
    });

    await page.waitForResponse((res) => {
      return res.url() === url && res.request().method() === 'POST';
    }, { timeout: 0 });

    count++;
  }

  await browser.close();

  // console.log(investments);
})();
