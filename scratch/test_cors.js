const https = require('https');
https.get('https://img.staticmb.com/mbimages/project/2023/11/08/Master-Plan-25-Wadhwa-Aquaria-Grande-Mumbai-5029949_462_700.jpg', (res) => {
  console.log(res.headers);
});
