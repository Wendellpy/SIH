import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  console.log('Navigating to portal...');
  await page.goto('https://mybmcid.mcgm.gov.in/portal/apps/MyBMCID_BMCcitizen/', { waitUntil: 'networkidle2' });
  
  console.log('Fetching property tax inside page context...');
  const sacNumber = 'RN0408960310000';
  const units = await page.evaluate(async (sac) => {
    const url = `https://aquaptax.mcgm.gov.in/MainetService/services/rest/water/waterconnectionservice/getCsmrInfoAndMeterDetails/csCcn/0/propertyNumber/${sac}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({}) // Or maybe it doesn't need a body
      });
      return await res.text();
    } catch (err) {
      return String(err);
    }
  }, sacNumber);
  
  console.log('Result:', units.substring(0, 500));
  await browser.close();
})();
