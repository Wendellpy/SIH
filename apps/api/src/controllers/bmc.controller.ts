import { Request, Response, Router } from 'express';
import puppeteer from 'puppeteer';

export const bmcRouter = Router();

bmcRouter.get('/bmc/:sacNumber/units', async (req: Request, res: Response) => {
  const { sacNumber } = req.params;
  
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    // We will collect units from intercepted responses.
    let scrapedUnits: string[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('getCsmrInfoAndMeterDetails') || url.includes('query')) {
        try {
          const text = await response.text();
          // The BMC portal usually returns an array of records for a given SAC.
          // We will attempt to parse it. If we find flat numbers, we add them.
          if (text.includes(sacNumber)) {
            const data = JSON.parse(text);
            if (data && data.features) {
              data.features.forEach((f: any) => {
                // GIS FeatureServer format
                if (f.attributes && f.attributes.UNIT_CNT) {
                  // We only get unit count here, not names.
                }
              });
            } else if (Array.isArray(data)) {
               // Property tax array
               data.forEach(item => {
                 if (item.flatNo) scrapedUnits.push(item.flatNo);
                 if (item.unitNo) scrapedUnits.push(item.unitNo);
               });
            }
          }
        } catch (e) {}
      }
    });

    await page.goto('https://mybmcid.mcgm.gov.in/portal/apps/MyBMCID_BMCcitizen/', { waitUntil: 'networkidle2' });
    
    // Attempt to type into the search box
    try {
      await page.waitForSelector('.searchInput', { timeout: 8000 });
      await page.type('.searchInput', sacNumber);
      await page.keyboard.press('Enter');
      // Wait for search results and network requests
      await new Promise(resolve => setTimeout(resolve, 8000));
    } catch (e) {
      console.error('Puppeteer interaction error:', e);
    }
    
    await browser.close();

    // If we failed to intercept real names, return empty so frontend handles fallback
    if (scrapedUnits.length === 0) {
      return res.json({
        success: true,
        data: {},
        isFallback: true
      });
    }
    // Process real scraped units if we caught them
    const uniqueScraped = Array.from(new Set(scrapedUnits));
    const expectedFloors = parseInt(req.query.expectedFloors as string, 10) || 4;
    
    const unitsByFloor: Record<string, string[]> = {};
    const baseUnits = Math.floor(uniqueScraped.length / expectedFloors);
    const remainder = uniqueScraped.length % expectedFloors;
    
    let unitIndex = 0;
    for (let f = 0; f < expectedFloors; f++) {
      const unitsOnThisFloor = baseUnits + (f < remainder ? 1 : 0);
      const floorName = f === 0 ? 'Ground Floor' : `F${f}`;
      
      const floorUnits: string[] = [];
      for (let i = 0; i < unitsOnThisFloor; i++) {
        if (unitIndex < uniqueScraped.length) {
          floorUnits.push(uniqueScraped[unitIndex]);
          unitIndex++;
        }
      }
      unitsByFloor[floorName] = floorUnits;
    }

    res.json({
      success: true,
      sacNumber,
      message: 'Live Scraping successful from MyBMC Citizen Portal',
      totalUnitsScraped: scrapedUnits.length,
      unitsByFloor,
      source: 'Puppeteer Live Scraper'
    });
    
  } catch (error) {
    console.error('Puppeteer Scraper Error:', error);
    res.status(500).json({ success: false, error: 'Failed to scrape BMC Portal' });
  }
});
