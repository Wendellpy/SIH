const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Intercept responses to see where the data comes from
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('query') || url.includes('ptax') || url.includes('RESTAdapter')) {
      try {
        const text = await response.text();
        if (text.includes('GS0602680480000') || text.length > 500) {
          console.log(`\n--- Response from ${url} ---`);
          console.log(text.substring(0, 500) + '...');
        }
      } catch (e) {}
    }
  });

  console.log('Navigating to BMC Citizen Portal...');
  await page.goto('https://mybmcid.mcgm.gov.in/portal/apps/MyBMCID_BMCcitizen/', { waitUntil: 'networkidle2' });
  
  console.log('Waiting for search box...');
  // The search box is likely in the Search widget. We can try to type into it.
  try {
    await page.waitForSelector('.searchInput', { timeout: 10000 });
    await page.type('.searchInput', 'GS0602680480000');
    await page.keyboard.press('Enter');
    console.log('Submitted search for GS0602680480000');
    
    // Wait a bit for the query to complete
    await new Promise(r => setTimeout(r, 10000));
  } catch (err) {
    console.log('Error interacting with page:', err.message);
  }

  await browser.close();
})();
