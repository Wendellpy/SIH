async function test() {
  try {
    const res = await fetch('https://mahabhunakasha.mahabhumi.gov.in/27/rest/MapInfo/getPlotInfo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'state=27&giscode=27210001006423&plotno=1&srs=4326'
    });
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.log(e.message);
  }
}
test();
