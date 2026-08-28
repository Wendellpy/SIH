import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Fetching Master Services...');
  try {
    const res = await fetch('https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers/MapServer?f=pjson');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    if (data.layers) {
      console.log(`Discovered ${data.layers.length} layers.`);
      
      const undergroundKeywords = ['water', 'sewer', 'drainage', 'storm', 'elec', 'cable', 'gas', 'duct', 'underground', 'tunnel', 'excavation', 'pipe', 'pipeline', 'trench'];
      
      const candidates = data.layers.filter((l: any) => {
         const name = l.name.toLowerCase();
         return undergroundKeywords.some(kw => name.includes(kw));
      });
      
      console.log(`\nFound ${candidates.length} candidate underground layers:\n`);
      for (const l of candidates) {
         console.log(`${l.id} | ${l.name}`);
      }
      
      const outPath = path.join(__dirname, 'discovered.json');
      fs.writeFileSync(outPath, JSON.stringify(candidates, null, 2));
      console.log(`\nSaved candidate list to ${outPath}`);
    }
  } catch (e) {
    console.error('Error fetching data:', e);
  }
}

run();
