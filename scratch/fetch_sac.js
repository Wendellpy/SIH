fetch("https://mybmcid.mcgm.gov.in/server/rest/services/MCGM_UID/IPVS/FeatureServer/1/query?where=SAC_NUMBER='GS0602680480000'&outFields=*&f=json")
  .then(res => res.json())
  .then(json => {
    if (json.features && json.features.length > 0) {
      console.log(JSON.stringify(json.features[0].attributes, null, 2));
    } else {
      console.log("No features found");
    }
  });
