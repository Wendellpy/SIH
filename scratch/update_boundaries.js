const fs = require('fs');

const geojsonStr = fs.readFileSync('scratch/sgnp.geojson', 'utf8');
const sgnpData = JSON.parse(geojsonStr);
// Need to stringify coordinates compactly
const sgnpCoords = JSON.stringify(sgnpData.coordinates);

const indexTsPath = 'packages/sample-data/src/index.ts';
let content = fs.readFileSync(indexTsPath, 'utf8');

const sgnpReplacement = `  {
    id: 'reg-sgnp-esz',
    boundaryType: 'eco_sensitive_zone',
    name: 'Sanjay Gandhi National Park',
    notifyingAuthority: 'MoEFCC',
    notificationDate: '2016-12-05',
    restrictions: 'Prohibits commercial mining, saw mills, and polluting industries. Regulates tree felling and major construction.',
    geometry: {
      type: 'MultiPolygon',
      coordinates: ${sgnpCoords}
    },
    dataSource: 'verified',
    sourceName: 'OpenStreetMap (boundary=national_park)'
  },`;

// Replace the old SGNP object
const sgnpRegex = /\{\s*id:\s*'reg-sgnp-esz'[\s\S]*?sourceName:\s*'Proxy Digitization'\s*\},/g;
content = content.replace(sgnpRegex, sgnpReplacement);

// Add the Mahul CRZ object
const crzRegex = /(\{\s*id:\s*'reg-bandra-crz2'[\s\S]*?sourceName:\s*'Proxy CZMP Map'\s*\})/;

const easternCrz = `  {
    id: 'reg-mahul-crz1',
    boundaryType: 'crz',
    name: 'Mahul Creek CRZ-I',
    crzCategory: 'CRZ-IA',
    notifyingAuthority: 'MCZMA',
    restrictions: 'No new construction shall be permitted in CRZ-I areas except for foreshore facilities.',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [72.8833, 19.0142], [72.8885, 19.0119], [72.8941, 19.0185], [72.8872, 19.0206], [72.8833, 19.0142]
      ]]
    },
    dataSource: 'demo',
    sourceName: 'Manual Digitization (Proxy)',
    notificationReference: 'MCZMA CZMP Sheet MH102'
  }`;

content = content.replace(crzRegex, `$1,\n${easternCrz}`);

fs.writeFileSync(indexTsPath, content);
console.log('Updated index.ts');
