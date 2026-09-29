fetch('https://mybmcid.mcgm.gov.in/portal/apps/MyBMCID_BMCcitizen/config.json')
  .then(res => res.text())
  .then(text => require('fs').writeFileSync('C:\\Users\\Wendell\\Desktop\\SIH\\scratch\\bmc_config.json', text))
  .catch(console.error);
