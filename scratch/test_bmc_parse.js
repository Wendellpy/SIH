const url = 'https://mybmcid.mcgm.gov.in/server/rest/services/MCGM_UID/IPVS/MapServer/1/query?where=UNIT_CNT>5&outFields=SAC_NUMBER,UNIT_CNT,NO_OF_FLOO&f=json&resultRecordCount=20';

fetch(url)
  .then(r => r.json())
  .then(data => {
    console.log("Features from BMC:");
    data.features.forEach(f => console.log(f.attributes));
  });
