fetch('https://mybmcid.mcgm.gov.in/portal/apps/MyBMCID_BMCcitizen/')
  .then(res => res.text())
  .then(html => console.log(html.substring(0, 3000)))
  .catch(console.error);
