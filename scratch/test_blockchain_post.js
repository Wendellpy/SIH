const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/blockchain/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});
req.on('error', e => console.error(e));
req.write(JSON.stringify({ ulpin: 'MH13BOM04521873', unitId: 'BASE' }));
req.end();
