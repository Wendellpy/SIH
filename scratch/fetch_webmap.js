fetch('https://mybmcid.mcgm.gov.in/portal/sharing/rest/content/items/1a3114b2ea624cf79f84e80e5c6b0dfd/data?f=json')
  .then(res => res.text())
  .then(text => require('fs').writeFileSync('C:\\Users\\Wendell\\Desktop\\SIH\\scratch\\webmap_data.json', text))
  .catch(console.error);
