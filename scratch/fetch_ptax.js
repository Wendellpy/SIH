fetch('https://aquaptax.mcgm.gov.in/MainetService/services/rest/water/waterconnectionservice/getCsmrInfoAndMeterDetails/csCcn/0/propertyNumber/GS0602680480000', {
  headers: {
    'Accept': 'application/json'
  }
})
  .then(res => res.text())
  .then(text => require('fs').writeFileSync('C:\\Users\\Wendell\\Desktop\\SIH\\scratch\\ptax_response.json', text))
  .catch(console.error);
