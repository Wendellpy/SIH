const urls = [
  'https://mybmcid.mcgm.gov.in/server/rest/services/MCGM_UID/MyBMCID_Search/MapServer/8/query',
  'https://mybmcid.mcgm.gov.in/server/rest/services/MCGM_UID/IPVS/MapServer/0/query',
  'https://mybmcid.mcgm.gov.in/server/rest/services/MCGM_UID/IPVS/MapServer/1/query',
];

Promise.all(urls.map(url => 
  fetch(`${url}?where=SAC_NUMBER='RN0408960310000'&outFields=*&f=json`)
    .then(r => r.json())
    .catch(() => ({}))
)).then(results => {
  results.forEach((d, i) => {
    if (d.features && d.features.length > 0) {
      console.log(`Layer ${i}:`, d.features[0].attributes);
    }
  });
});
