import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Ownership & Property Database for Mumbai Buildings
 * 
 * In production, this would connect to:
 * - MyBMC BUID registry (https://portal.mcgm.gov.in)
 * - Mahabhulekh / iGROT land records
 * - MahaBhunakasha GIS portal
 * 
 * For the SIH prototype, we use realistic simulated data
 * respecting DPDP Act compliance (no scraped personal data).
 */

interface OwnershipRecord {
  buildingName: string;
  ownerName: string;
  ownerType: 'Society' | 'Corporate' | 'Trust' | 'Government' | 'Individual' | 'Unknown';
  buid: string; // 15-digit MyBMC Building ID
  ctsNumber: string; // City Survey Number
  ward: string;
  zone: string;
  propertyTaxId: string;
  yearBuilt: number;
  totalFloors: number;
  useType: 'Residential' | 'Commercial' | 'Mixed' | 'Industrial' | 'Institutional';
  registrationDate: string;
  mahabhulekhLink: string;
  source: 'MyBMC_Registry' | 'Mahabhulekh' | 'MahaBhunakasha' | 'Simulated';
}

// Realistic Mumbai building ownership data
// Names sourced from publicly available OSM/Google Maps data
const OWNERSHIP_DB: Record<string, OwnershipRecord> = {
  // Worli Area
  'ashoka towers': {
    buildingName: 'Ashoka Towers',
    ownerName: 'Ashoka Towers Co-operative Housing Society Ltd.',
    ownerType: 'Society',
    buid: '270041800012345',
    ctsNumber: 'CTS 780/A, Worli',
    ward: 'G/South',
    zone: 'Zone 2',
    propertyTaxId: 'GS-WRL-2024-78012',
    yearBuilt: 2010,
    totalFloors: 42,
    useType: 'Residential',
    registrationDate: '2010-06-15',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/worli/780A',
    source: 'Simulated',
  },
  'world one': {
    buildingName: 'World One Tower',
    ownerName: 'Lodha Developers Ltd. (Macrotech)',
    ownerType: 'Corporate',
    buid: '270041800067890',
    ctsNumber: 'CTS 1125/B, Upper Worli',
    ward: 'G/South',
    zone: 'Zone 2',
    propertyTaxId: 'GS-WRL-2023-11250',
    yearBuilt: 2023,
    totalFloors: 117,
    useType: 'Residential',
    registrationDate: '2023-11-01',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/worli/1125B',
    source: 'Simulated',
  },
  'palais royale': {
    buildingName: 'Palais Royale',
    ownerName: 'Shree Ram Urban Infrastructure Ltd.',
    ownerType: 'Corporate',
    buid: '270041800034567',
    ctsNumber: 'CTS 1089, Worli Sea Face',
    ward: 'G/South',
    zone: 'Zone 2',
    propertyTaxId: 'GS-WRL-2018-10890',
    yearBuilt: 2018,
    totalFloors: 88,
    useType: 'Residential',
    registrationDate: '2018-03-20',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/worli/1089',
    source: 'Simulated',
  },
  // BKC Area
  'one bkc': {
    buildingName: 'One BKC',
    ownerName: 'Reliance Industries Ltd.',
    ownerType: 'Corporate',
    buid: '270042400089012',
    ctsNumber: 'Plot C-66, G Block, BKC',
    ward: 'H/East',
    zone: 'Zone 3',
    propertyTaxId: 'HE-BKC-2019-C6601',
    yearBuilt: 2019,
    totalFloors: 53,
    useType: 'Commercial',
    registrationDate: '2019-01-10',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/bkc/C66',
    source: 'Simulated',
  },
  'maker maxity': {
    buildingName: 'Maker Maxity',
    ownerName: 'Maker Group Pvt. Ltd.',
    ownerType: 'Corporate',
    buid: '270042400091234',
    ctsNumber: 'Plot C-62/63, G Block, BKC',
    ward: 'H/East',
    zone: 'Zone 3',
    propertyTaxId: 'HE-BKC-2014-C6201',
    yearBuilt: 2014,
    totalFloors: 33,
    useType: 'Commercial',
    registrationDate: '2014-08-25',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/bkc/C62',
    source: 'Simulated',
  },
  'platina': {
    buildingName: 'Platina (IL&FS Financial Centre)',
    ownerName: 'IL&FS Investment Managers Ltd.',
    ownerType: 'Corporate',
    buid: '270042400056789',
    ctsNumber: 'Plot C-22, G Block, BKC',
    ward: 'H/East',
    zone: 'Zone 3',
    propertyTaxId: 'HE-BKC-2008-C2201',
    yearBuilt: 2008,
    totalFloors: 27,
    useType: 'Commercial',
    registrationDate: '2008-12-10',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/bkc/C22',
    source: 'Simulated',
  },
  // Nariman Point
  'air india building': {
    buildingName: 'Air India Building',
    ownerName: 'Air India Ltd. (Government of India)',
    ownerType: 'Government',
    buid: '270041100023456',
    ctsNumber: 'CTS 218, Nariman Point',
    ward: 'A',
    zone: 'Zone 1',
    propertyTaxId: 'A-NP-1974-21801',
    yearBuilt: 1974,
    totalFloors: 23,
    useType: 'Commercial',
    registrationDate: '1974-01-15',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/nariman/218',
    source: 'Simulated',
  },
  'express towers': {
    buildingName: 'Express Towers',
    ownerName: 'Indian Express Group',
    ownerType: 'Corporate',
    buid: '270041100034567',
    ctsNumber: 'CTS 230, Nariman Point',
    ward: 'A',
    zone: 'Zone 1',
    propertyTaxId: 'A-NP-1972-23001',
    yearBuilt: 1972,
    totalFloors: 28,
    useType: 'Commercial',
    registrationDate: '1972-06-01',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/nariman/230',
    source: 'Simulated',
  },
  'trident hotel': {
    buildingName: 'Trident Nariman Point',
    ownerName: 'EIH Ltd. (Oberoi Group)',
    ownerType: 'Corporate',
    buid: '270041100045678',
    ctsNumber: 'CTS 240, Nariman Point',
    ward: 'A',
    zone: 'Zone 1',
    propertyTaxId: 'A-NP-2003-24001',
    yearBuilt: 2003,
    totalFloors: 35,
    useType: 'Commercial',
    registrationDate: '2003-10-15',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/nariman/240',
    source: 'Simulated',
  },
  // Andheri / Airport
  'phoenix marketcity': {
    buildingName: 'Phoenix Marketcity',
    ownerName: 'Phoenix Mills Ltd.',
    ownerType: 'Corporate',
    buid: '270043500078901',
    ctsNumber: 'CTS 456, Kurla West',
    ward: 'L',
    zone: 'Zone 5',
    propertyTaxId: 'L-KW-2011-45601',
    yearBuilt: 2011,
    totalFloors: 8,
    useType: 'Commercial',
    registrationDate: '2011-04-20',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/kurla/456',
    source: 'Simulated',
  },
  'kohinoor square': {
    buildingName: 'Kohinoor Square',
    ownerName: 'Kohinoor CTNL Infrastructure Co. Pvt. Ltd.',
    ownerType: 'Corporate',
    buid: '270043700045678',
    ctsNumber: 'CTS 890, Dadar TT',
    ward: 'G/North',
    zone: 'Zone 3',
    propertyTaxId: 'GN-DD-2019-89001',
    yearBuilt: 2019,
    totalFloors: 52,
    useType: 'Mixed',
    registrationDate: '2019-09-15',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/dadar/890',
    source: 'Simulated',
  },
  'imperial towers': {
    buildingName: 'Imperial Towers',
    ownerName: 'SD Corp Pvt. Ltd.',
    ownerType: 'Corporate',
    buid: '270041800078901',
    ctsNumber: 'CTS 1050, Tardeo',
    ward: 'D',
    zone: 'Zone 2',
    propertyTaxId: 'D-TD-2010-10500',
    yearBuilt: 2010,
    totalFloors: 60,
    useType: 'Residential',
    registrationDate: '2010-11-30',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/tardeo/1050',
    source: 'Simulated',
  },
  'antilia': {
    buildingName: 'Antilia',
    ownerName: 'Reliance Industries Ltd. (Mukesh Ambani Family Trust)',
    ownerType: 'Individual',
    buid: '270041500012345',
    ctsNumber: 'CTS 1200, Altamount Road, Cumballa Hill',
    ward: 'D',
    zone: 'Zone 1',
    propertyTaxId: 'D-CH-2010-12001',
    yearBuilt: 2010,
    totalFloors: 27,
    useType: 'Residential',
    registrationDate: '2010-10-19',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/cumballa/1200',
    source: 'Simulated',
  },
  'peninsula business park': {
    buildingName: 'Peninsula Business Park',
    ownerName: 'Peninsula Land Ltd.',
    ownerType: 'Corporate',
    buid: '270041800056789',
    ctsNumber: 'CTS 950, Ganpatrao Kadam Marg, Lower Parel',
    ward: 'G/South',
    zone: 'Zone 2',
    propertyTaxId: 'GS-LP-2005-95001',
    yearBuilt: 2005,
    totalFloors: 19,
    useType: 'Commercial',
    registrationDate: '2005-02-28',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/lowerparel/950',
    source: 'Simulated',
  },
  'lodha the park': {
    buildingName: 'Lodha The Park',
    ownerName: 'Lodha Group (Macrotech Developers)',
    ownerType: 'Corporate',
    buid: '270041800090123',
    ctsNumber: 'CTS 1180, Worli',
    ward: 'G/South',
    zone: 'Zone 2',
    propertyTaxId: 'GS-WRL-2018-11800',
    yearBuilt: 2018,
    totalFloors: 75,
    useType: 'Residential',
    registrationDate: '2018-07-15',
    mahabhulekhLink: 'https://bhulekh.mahabhumi.gov.in/mumbai/worli/1180',
    source: 'Simulated',
  },
};

/**
 * GET /api/ownership?building_name=Ashoka+Towers&lng=72.828&lat=18.996
 * 
 * Returns ownership/property record for a building.
 * Falls back to generating a simulated record from coordinates.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const buildingName = searchParams.get('building_name') || '';
  const lng = parseFloat(searchParams.get('lng') || '0');
  const lat = parseFloat(searchParams.get('lat') || '0');

  // Fuzzy match against known buildings
  const normalizedQuery = buildingName.toLowerCase().trim();
  
  // Try exact match first
  let record = OWNERSHIP_DB[normalizedQuery];
  
  // Try partial match
  if (!record) {
    for (const [key, val] of Object.entries(OWNERSHIP_DB)) {
      if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
        record = val;
        break;
      }
    }
  }

  // If still no match, generate a plausible record from coordinates
  if (!record) {
    // Determine ward from coordinates
    let ward = 'H/East';
    let zone = 'Zone 3';
    if (lat < 19.0 && lng < 72.84) { ward = 'G/South'; zone = 'Zone 2'; }
    else if (lat < 18.95) { ward = 'A'; zone = 'Zone 1'; }
    else if (lat > 19.1) { ward = 'K/East'; zone = 'Zone 5'; }
    else if (lat > 19.05 && lng > 72.87) { ward = 'H/East'; zone = 'Zone 3'; }

    const buidNum = Math.floor(100000000 + Math.abs(lng * 1e6 + lat * 1e6) % 900000000);

    record = {
      buildingName: buildingName || `Building at ${lng.toFixed(4)}, ${lat.toFixed(4)}`,
      ownerName: 'Record Available on Mahabhulekh Portal',
      ownerType: 'Unknown',
      buid: `27004${buidNum.toString().slice(0, 10)}`,
      ctsNumber: `CTS ${Math.floor(1000 + Math.random() * 9000)}, Mumbai`,
      ward,
      zone,
      propertyTaxId: `${ward.replace('/', '')}-${Date.now().toString(36).toUpperCase()}`,
      yearBuilt: 0,
      totalFloors: 0,
      useType: 'Mixed',
      registrationDate: '',
      mahabhulekhLink: `https://bhulekh.mahabhumi.gov.in/mumbai/search?q=${encodeURIComponent(buildingName)}`,
      source: 'Simulated',
    };
  }

  return NextResponse.json({
    status: 'ok',
    record,
    disclaimer: 'Data shown is simulated for SIH prototype. For authentic ownership records, consult Mahabhulekh (https://bhulekh.mahabhumi.gov.in) and MyBMC (https://portal.mcgm.gov.in) portals. Systematic scraping of personal ownership data violates the DPDP Act 2023.',
  }, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
