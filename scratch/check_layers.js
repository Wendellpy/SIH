fetch("https://mybmcid.mcgm.gov.in/server/rest/services/MCGM_UID/IPVS/FeatureServer?f=json")
  .then(res => res.json())
  .then(json => {
    console.log(JSON.stringify(json.layers, null, 2));
    console.log(JSON.stringify(json.tables, null, 2));
  });
