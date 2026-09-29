(async () => {
  const sacNumber = 'AX0104820180000'; 
  const url = `https://aquaptax.mcgm.gov.in/MainetService/services/rest/water/waterconnectionservice/getCsmrInfoAndMeterDetails/csCcn/0/propertyNumber/${sacNumber}`;
  
  console.log('Fetching from aquaptax...', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://mybmcid.mcgm.gov.in',
        'Referer': 'https://mybmcid.mcgm.gov.in/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
      }
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response body:', text);
  } catch (err) {
    console.error(err);
  }
})();
