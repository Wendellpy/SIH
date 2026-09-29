// Test different ULPIN decodings
const examples = [
  'MH1BGJ1H17DF17',  // possible from one building
  'MH1B9Z4017DF0Y',  // another building
  'MH1BGQCI17FZ99',  // another
  'MH1BGJ1817DF0Y',  // the test one
];

examples.forEach(u => {
  const latStr = u.substring(3, 8);
  const lngStr = u.substring(8, 14);
  const lat = parseInt(latStr, 36) / 1000000;
  const lng = parseInt(lngStr, 36) / 1000000;
  const inMumbai = lat > 18 && lat < 20 && lng > 72 && lng < 73;
  console.log(`${u} -> lat: ${lat}, lng: ${lng}, inMumbai: ${inMumbai}`);
});

// Now test with the full 3D ULPIN, decoded via .split('.')[0]
const full3D_examples = [
  'MH1BGJ1817DF0Y.G00-01',
  'MH1BGJ1817DF0Y.A+02-201',
  'MH1B9Z4017DF0Y.A+01-101',
];

console.log('\n--- Full 3D ULPIN decoding ---');
full3D_examples.forEach(full => {
  const q = full.toLowerCase();
  const cleanUlpin = q.toUpperCase().split('.')[0];
  const latStr = cleanUlpin.substring(3, 8);
  const lngStr = cleanUlpin.substring(8, 14);
  const lat = parseInt(latStr, 36) / 1000000;
  const lng = parseInt(lngStr, 36) / 1000000;
  const inMumbai = lat > 18 && lat < 20 && lng > 72 && lng < 73;
  console.log(`${full} -> cleanUlpin: ${cleanUlpin}, lat: ${lat}, lng: ${lng}, inMumbai: ${inMumbai}`);
});

// Test edge case: what if padStart produced shorter string?
console.log('\n--- Edge case: encoding short coords ---');
const testCoords = [
  { lat: 19.0001, lng: 72.0001 },
  { lat: 19.99999, lng: 72.99999 },
  { lat: 18.9, lng: 72.8 },
];
testCoords.forEach(({ lat, lng }) => {
  const latStr = Math.round(lat * 1000000).toString(36).padStart(5, '0');
  const lngStr = Math.round(lng * 1000000).toString(36).padStart(6, '0');
  const base = `MH1${latStr}${lngStr}`.toUpperCase();
  console.log(`(${lat}, ${lng}) -> base: ${base} (len: ${base.length})`);
  
  // Decode back
  const dLatStr = base.substring(3, 8);
  const dLngStr = base.substring(8, 14);
  const dLat = parseInt(dLatStr, 36) / 1000000;
  const dLng = parseInt(dLngStr, 36) / 1000000;
  console.log(`  decoded: lat=${dLat}, lng=${dLng}`);
});
