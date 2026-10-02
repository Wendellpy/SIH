export interface DistrictGeoInfo {
  id: string;
  lgdCode?: string;
  code: string;
  name: string;
  marathiName?: string;
  lat: number;
  lng: number;
}

export const MAHARASHTRA_DISTRICTS: DistrictGeoInfo[] = [
  { id: '31', lgdCode: '470', code: 'MH-MUM-SUB', name: 'Mumbai Suburban', marathiName: 'मुंबई उपनगर', lat: 19.1136, lng: 72.8697 },
  { id: '32', lgdCode: '471', code: 'MH-MUM-CIT', name: 'Mumbai City', marathiName: 'मुंबई शहर', lat: 18.9388, lng: 72.8354 },
  { id: '21', lgdCode: '492', code: 'MH-THA', name: 'Thane', marathiName: 'ठाणे', lat: 19.2183, lng: 72.9781 },
  { id: '22', lgdCode: '665', code: 'MH-PAL', name: 'Palghar', marathiName: 'पालघर', lat: 19.6967, lng: 72.7699 },
  { id: '33', lgdCode: '487', code: 'MH-RAI', name: 'Raigad', marathiName: 'रायगड', lat: 18.5158, lng: 73.0297 },
  { id: '30', lgdCode: '488', code: 'MH-RAT', name: 'Ratnagiri', marathiName: 'रत्नागिरी', lat: 16.9902, lng: 73.3120 },
  { id: '34', lgdCode: '490', code: 'MH-SIN', name: 'Sindhudurg', marathiName: 'सिंधुदुर्ग', lat: 16.1219, lng: 73.7042 },
  { id: '25', lgdCode: '486', code: 'MH-PUN', name: 'Pune', marathiName: 'पुणे', lat: 18.5204, lng: 73.8567 },
  { id: '26', lgdCode: '489', code: 'MH-SAT', name: 'Satara', marathiName: 'सातारा', lat: 17.6805, lng: 74.0183 },
  { id: '27', lgdCode: '485', code: 'MH-SAN', name: 'Sangli', marathiName: 'सांगली', lat: 16.8524, lng: 74.5815 },
  { id: '28', lgdCode: '491', code: 'MH-SOL', name: 'Solapur', marathiName: 'सोलापूर', lat: 17.6599, lng: 75.9064 },
  { id: '29', lgdCode: '480', code: 'MH-KOL', name: 'Kolhapur', marathiName: 'कोल्हापूर', lat: 16.7050, lng: 74.2433 },
  { id: '10', lgdCode: '483', code: 'MH-NAS', name: 'Nashik', marathiName: 'नाशिक', lat: 19.9975, lng: 73.7898 },
  { id: '11', lgdCode: '467', code: 'MH-AHM', name: 'Ahmednagar', marathiName: 'अहमदनगर', lat: 19.0948, lng: 74.7480 },
  { id: '12', lgdCode: '476', code: 'MH-DHU', name: 'Dhule', marathiName: 'धुळे', lat: 20.9042, lng: 74.7749 },
  { id: '13', lgdCode: '477', code: 'MH-JAL-DHU', name: 'Jalgaon', marathiName: 'जळगाव', lat: 21.0077, lng: 75.5626 },
  { id: '15', lgdCode: '482', code: 'MH-NAN', name: 'Nandurbar', marathiName: 'नंदुरबार', lat: 21.3705, lng: 74.2405 },
  { id: '14', lgdCode: '469', code: 'MH-AUR', name: 'Aurangabad', marathiName: 'छत्रपती संभाजीनगर', lat: 19.8762, lng: 75.3433 },
  { id: '16', lgdCode: '478', code: 'MH-JAL', name: 'Jalna', marathiName: 'जालना', lat: 19.8410, lng: 75.8864 },
  { id: '17', lgdCode: '484', code: 'MH-PAR', name: 'Parbhani', marathiName: 'परभणी', lat: 19.2612, lng: 76.7767 },
  { id: '18', lgdCode: '475', code: 'MH-HIN', name: 'Hingoli', marathiName: 'हिंगोली', lat: 19.7196, lng: 77.1477 },
  { id: '19', lgdCode: '481', code: 'MH-NDE', name: 'Nanded', marathiName: 'नांदेड', lat: 19.1383, lng: 77.3210 },
  { id: '20', lgdCode: '472', code: 'MH-BEE', name: 'Beed', marathiName: 'बीड', lat: 18.9891, lng: 75.7601 },
  { id: '23', lgdCode: '480', code: 'MH-LAT', name: 'Latur', marathiName: 'लातूर', lat: 18.4088, lng: 76.5604 },
  { id: '24', lgdCode: '484', code: 'MH-OSM', name: 'Osmanabad', marathiName: 'धाराशिव', lat: 18.1861, lng: 76.0419 },
  { id: '08', lgdCode: '473', code: 'MH-BUL', name: 'Buldhana', marathiName: 'बुलढाणा', lat: 20.5310, lng: 76.1847 },
  { id: '07', lgdCode: '468', code: 'MH-AKO', name: 'Akola', marathiName: 'अकोला', lat: 20.7002, lng: 77.0082 },
  { id: '05', lgdCode: '493', code: 'MH-WAS', name: 'Washim', marathiName: 'वाशिम', lat: 20.1111, lng: 77.1333 },
  { id: '09', lgdCode: '466', code: 'MH-AMR', name: 'Amravati', marathiName: 'अमरावती', lat: 20.9374, lng: 77.7796 },
  { id: '04', lgdCode: '494', code: 'MH-YAV', name: 'Yavatmal', marathiName: 'यवतमाळ', lat: 20.3888, lng: 78.1204 },
  { id: '03', lgdCode: '495', code: 'MH-WAR', name: 'Wardha', marathiName: 'वर्धा', lat: 20.7453, lng: 78.6022 },
  { id: '06', lgdCode: '479', code: 'MH-NAG', name: 'Nagpur', marathiName: 'नागपूर', lat: 21.1458, lng: 79.0882 },
  { id: '02', lgdCode: '474', code: 'MH-BHA', name: 'Bhandara', marathiName: 'भंडारा', lat: 21.1714, lng: 79.6517 },
  { id: '01', lgdCode: '477', code: 'MH-GON', name: 'Gondia', marathiName: 'गोंदिया', lat: 21.4602, lng: 80.1961 },
  { id: '35', lgdCode: '475', code: 'MH-CHA', name: 'Chandrapur', marathiName: 'चंद्रपूर', lat: 19.9615, lng: 79.2961 },
  { id: '36', lgdCode: '478', code: 'MH-GAD', name: 'Gadchiroli', marathiName: 'गडचिरोली', lat: 20.1849, lng: 80.0030 }
];

export function findDistrict(query: string): DistrictGeoInfo | null {
  if (!query) return null;
  const clean = query.trim().toLowerCase();
  
  // Try exact match on ID, LGD code, or sourceId code
  const exactMatch = MAHARASHTRA_DISTRICTS.find(d => 
    d.id === query || 
    d.id === clean ||
    d.lgdCode === query ||
    d.code.toLowerCase() === clean
  );
  if (exactMatch) return exactMatch;

  // Try substring / fuzzy match on name or marathiName
  const nameMatch = MAHARASHTRA_DISTRICTS.find(d => {
    const dName = d.name.toLowerCase();
    const dMarathi = d.marathiName?.toLowerCase() || '';
    return clean.includes(dName) || dName.includes(clean) || (dMarathi && clean.includes(dMarathi));
  });

  return nameMatch || null;
}

export function getDistrictCoordinates(districtQuery: string): { lat: number; lng: number } {
  const match = findDistrict(districtQuery);
  if (match) {
    return { lat: match.lat, lng: match.lng };
  }
  // Default fallback center of Maharashtra (near Aurangabad / Ahmednagar)
  return { lat: 19.5, lng: 75.5 };
}

export function generateLocationAnchoredPolygon(
  districtQuery: string,
  taluka: string = '',
  village: string = '',
  surveyOrCts: string = ''
): { geometry: any; lat: number; lng: number; ulpin: string } {
  const center = getDistrictCoordinates(districtQuery);
  
  // Generate deterministic jitter within that district/taluka region
  const key = `${districtQuery}-${taluka}-${village}-${surveyOrCts}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }

  // Jitter +/- 0.05 degrees (~5km radius within the district)
  const latOffset = ((Math.abs(hash % 1000) - 500) / 10000); // +/- 0.05
  const lngOffset = ((Math.abs((hash >> 3) % 1000) - 500) / 10000); // +/- 0.05

  const parcelLat = parseFloat((center.lat + latOffset).toFixed(6));
  const parcelLng = parseFloat((center.lng + lngOffset).toFixed(6));

  // Synthesize standard 14-character ULPIN anchored to actual coordinates
  const latStr = Math.floor(parcelLat * 1000000).toString(36).padStart(5, '0').toUpperCase();
  const lngStr = Math.floor(parcelLng * 1000000).toString(36).padStart(6, '0').toUpperCase();
  const ulpin = `MH1${latStr}${lngStr}`;

  // Polygon footprint (~40m x ~40m)
  const d = 0.00025;
  const coordinates = [[
    [parseFloat((parcelLng - d).toFixed(6)), parseFloat((parcelLat - d).toFixed(6))],
    [parseFloat((parcelLng + d).toFixed(6)), parseFloat((parcelLat - d).toFixed(6))],
    [parseFloat((parcelLng + d).toFixed(6)), parseFloat((parcelLat + d).toFixed(6))],
    [parseFloat((parcelLng - d).toFixed(6)), parseFloat((parcelLat + d).toFixed(6))],
    [parseFloat((parcelLng - d).toFixed(6)), parseFloat((parcelLat - d).toFixed(6))]
  ]];

  const geometry = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: coordinates
    },
    properties: {
      surveyNo: surveyOrCts || 'PARCEL',
      ulpin: ulpin,
      district: districtQuery,
      taluka: taluka,
      village: village
    }
  };

  return { geometry, lat: parcelLat, lng: parcelLng, ulpin };
}
