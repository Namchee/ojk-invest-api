const puppeteer = require('puppeteer');

// base url
const url = 'https://sikapiuangmu.ojk.go.id/FrontEnd/AlertPortal/Negative';
// row selector
const rowSelector = 'tr.dxgvDataRow_Moderno';

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

    const rowData = investmentRows.map((row) => {
      const childNodes = Array.from(row.children);
      const contactInformation = childNodes[2].textContent.split('Tel :');

      return JSON.stringify({
        name: childNodes[1].textContent.trim(),
        address: contactInformation[0].trim(),
        number: contactInformation[1].trim(),
        url: childNodes[3].textContent.trim(),
        type: childNodes[4].textContent.trim(),
        inputDate: dateParser(childNodes[5].textContent.trim())
          .toLocaleDateString('en-id'),
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
  await page.goto(url, { waitUntil: 'load', timeout: 0 });

  const investments = await scrapPage(page);

  console.log(investments);

  await browser.close();
})();
