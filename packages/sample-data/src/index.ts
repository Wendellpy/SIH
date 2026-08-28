import { 
  Parcel, 
  Building, 
  VerticalUnit, 
  UndergroundAsset, 
  TopologyValidationLog, 
  AuditLog, 
  formatUlpin3D 
} from '@sih/shared-types';

/**
 * Real Mumbai City Cadastral Dataset (BMC MCGM / DP2034 Wards)
 * Georeferenced coordinates across South Mumbai, Midtown Worli/Lower Parel, BKC, Andheri, and Powai.
 */
export const SAMPLE_PARCELS: Parcel[] = [
  // --- 1. Bandra Kurla Complex (Ward H/East) ---
  {
    id: 'parcel-bkc-fintech',
    ulpin: 'MH13BOM04521873',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    tehsil: 'Kurla',
    village: 'Bandra Kurla Complex (BKC)',
    surveyNumber: 'CS-482/1A',
    areaSqm: 4250.8,
    centroid: [72.8688, 19.0607],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8683, 19.0602], [72.8694, 19.0603], [72.8693, 19.0612], [72.8682, 19.0611], [72.8683, 19.0602]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Leasehold',
    simulated: true,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z'
  },
  {
    id: 'parcel-bkc-diamond-bourse',
    ulpin: 'MH13BOM04521901',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    tehsil: 'Kurla',
    village: 'Bandra Kurla Complex (BKC)',
    surveyNumber: 'CS-483/BDB',
    areaSqm: 8500.0,
    centroid: [72.8710, 19.0620],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8702, 19.0615], [72.8718, 19.0616], [72.8716, 19.0626], [72.8700, 19.0624], [72.8702, 19.0615]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Leasehold',
    simulated: true,
    createdAt: '2026-01-18T11:00:00Z',
    updatedAt: '2026-08-21T10:00:00Z'
  },
  {
    id: 'parcel-bkc-jio-convention',
    ulpin: 'MH13BOM04522045',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    tehsil: 'Kurla',
    village: 'Bandra Kurla Complex (BKC)',
    surveyNumber: 'CS-484/JWC',
    areaSqm: 12400.0,
    centroid: [72.8660, 19.0635],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8650, 19.0628], [72.8672, 19.0630], [72.8669, 19.0642], [72.8648, 19.0640], [72.8650, 19.0628]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Leasehold',
    simulated: true,
    createdAt: '2026-01-22T09:30:00Z',
    updatedAt: '2026-08-22T14:00:00Z'
  },
  {
    id: 'parcel-bkc-nse-bhavan',
    ulpin: 'MH13BOM04522110',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    tehsil: 'Kurla',
    village: 'Bandra Kurla Complex (BKC)',
    surveyNumber: 'CS-485/NSE',
    areaSqm: 5100.0,
    centroid: [72.8640, 19.0585],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8632, 19.0580], [72.8648, 19.0581], [72.8646, 19.0590], [72.8630, 19.0589], [72.8632, 19.0580]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Leasehold',
    simulated: true,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z'
  },

  // --- 2. Nariman Point & South Mumbai (Ward A) ---
  {
    id: 'parcel-nariman-marine-hub',
    ulpin: 'MH13BOM09841120',
    state: 'Maharashtra',
    district: 'Mumbai City',
    tehsil: 'Colaba',
    village: 'Nariman Point',
    surveyNumber: 'FP-109/B',
    areaSqm: 3120.4,
    centroid: [72.8236, 18.9256],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8231, 18.9251], [72.8242, 18.9252], [72.8240, 18.9261], [72.8229, 18.9260], [72.8231, 18.9251]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Private',
    simulated: true,
    createdAt: '2026-02-10T10:15:00Z',
    updatedAt: '2026-08-22T11:00:00Z'
  },
  {
    id: 'parcel-nariman-express-towers',
    ulpin: 'MH13BOM09841135',
    state: 'Maharashtra',
    district: 'Mumbai City',
    tehsil: 'Colaba',
    village: 'Nariman Point',
    surveyNumber: 'FP-110/EXT',
    areaSqm: 4100.0,
    centroid: [72.8245, 18.9280],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8239, 18.9275], [72.8251, 18.9276], [72.8249, 18.9286], [72.8237, 18.9284], [72.8239, 18.9275]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Private',
    simulated: true,
    createdAt: '2026-02-12T14:20:00Z',
    updatedAt: '2026-08-23T16:00:00Z'
  },
  {
    id: 'parcel-cuffe-parade-wtc',
    ulpin: 'MH13BOM09841280',
    state: 'Maharashtra',
    district: 'Mumbai City',
    tehsil: 'Colaba',
    village: 'Cuffe Parade',
    surveyNumber: 'CS-88/WTC',
    areaSqm: 7200.0,
    centroid: [72.8180, 18.9160],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8172, 18.9152], [72.8188, 18.9154], [72.8186, 18.9168], [72.8170, 18.9166], [72.8172, 18.9152]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Leasehold',
    simulated: true,
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-08-24T09:00:00Z'
  },
  {
    id: 'parcel-mantralaya-gov',
    ulpin: 'MH13BOM09841350',
    state: 'Maharashtra',
    district: 'Mumbai City',
    tehsil: 'Colaba',
    village: 'Nariman Point',
    surveyNumber: 'CS-101/MNT',
    areaSqm: 9800.0,
    centroid: [72.8270, 18.9285],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8260, 18.9278], [72.8280, 18.9280], [72.8278, 18.9292], [72.8258, 18.9290], [72.8260, 18.9278]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Government',
    simulated: true,
    createdAt: '2026-02-18T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  },

  // --- 3. Worli & Lower Parel Midtown Skyscraper Row (Ward G/South) ---
  {
    id: 'parcel-worli-lodha-grandeur',
    ulpin: 'MH13BOM07732915',
    state: 'Maharashtra',
    district: 'Mumbai City',
    tehsil: 'Worli',
    village: 'Lower Parel',
    surveyNumber: 'CTS-884/2',
    areaSqm: 5600.0,
    centroid: [72.8312, 19.0018],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8305, 19.0012], [72.8320, 19.0014], [72.8318, 19.0025], [72.8303, 19.0023], [72.8305, 19.0012]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Private',
    simulated: true,
    createdAt: '2026-03-01T08:30:00Z',
    updatedAt: '2026-08-25T16:45:00Z'
  },
  {
    id: 'parcel-worli-world-one',
    ulpin: 'MH13BOM07733020',
    state: 'Maharashtra',
    district: 'Mumbai City',
    tehsil: 'Worli',
    village: 'Worli Naka',
    surveyNumber: 'CTS-890/W1',
    areaSqm: 11200.0,
    centroid: [72.8280, 18.9960],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8270, 18.9950], [72.8290, 18.9952], [72.8288, 18.9970], [72.8268, 18.9968], [72.8270, 18.9950]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Private',
    simulated: true,
    createdAt: '2026-03-05T09:15:00Z',
    updatedAt: '2026-08-26T11:30:00Z'
  },
  {
    id: 'parcel-lower-parel-palais-royale',
    ulpin: 'MH13BOM07733150',
    state: 'Maharashtra',
    district: 'Mumbai City',
    tehsil: 'Worli',
    village: 'Lower Parel',
    surveyNumber: 'CTS-912/PR',
    areaSqm: 9400.0,
    centroid: [72.8340, 19.0060],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8330, 19.0052], [72.8350, 19.0054], [72.8348, 19.0068], [72.8328, 19.0066], [72.8330, 19.0052]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Private',
    simulated: true,
    createdAt: '2026-03-08T10:00:00Z',
    updatedAt: '2026-08-26T15:00:00Z'
  },
  {
    id: 'parcel-lower-parel-peninsula',
    ulpin: 'MH13BOM07733220',
    state: 'Maharashtra',
    district: 'Mumbai City',
    tehsil: 'Worli',
    village: 'Lower Parel',
    surveyNumber: 'CTS-925/PCP',
    areaSqm: 8200.0,
    centroid: [72.8290, 19.0040],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8282, 19.0032], [72.8298, 19.0034], [72.8296, 19.0048], [72.8280, 19.0046], [72.8282, 19.0032]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Private',
    simulated: true,
    createdAt: '2026-03-10T12:00:00Z',
    updatedAt: '2026-08-25T17:00:00Z'
  },

  // --- 4. Andheri East & SEEPZ Tech Corridor (Ward K/East) ---
  {
    id: 'parcel-andheri-seepz-zone',
    ulpin: 'MH13BOM03318900',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    tehsil: 'Andheri',
    village: 'SEEPZ Special Economic Zone',
    surveyNumber: 'CTS-1204/SPZ',
    areaSqm: 14500.0,
    centroid: [72.8750, 19.1220],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8735, 19.1210], [72.8765, 19.1212], [72.8762, 19.1230], [72.8732, 19.1228], [72.8735, 19.1210]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Government',
    simulated: true,
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-08-22T16:00:00Z'
  },
  {
    id: 'parcel-andheri-nesco-it',
    ulpin: 'MH13BOM03319020',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    tehsil: 'Andheri',
    village: 'Goregaon East',
    surveyNumber: 'CTS-1310/NES',
    areaSqm: 18000.0,
    centroid: [72.8580, 19.1530],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8565, 19.1518], [72.8595, 19.1520], [72.8592, 19.1542], [72.8562, 19.1540], [72.8565, 19.1518]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Private',
    simulated: true,
    createdAt: '2026-03-18T10:30:00Z',
    updatedAt: '2026-08-24T14:30:00Z'
  },

  // --- 5. Powai Hiranandani & Tech Hub (Ward S) ---
  {
    id: 'parcel-powai-hiranandani',
    ulpin: 'MH13BOM05584100',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    tehsil: 'Kurla',
    village: 'Powai Lake Estate',
    surveyNumber: 'CTS-550/HGN',
    areaSqm: 16500.0,
    centroid: [72.9050, 19.1180],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.9035, 19.1168], [72.9065, 19.1170], [72.9062, 19.1192], [72.9032, 19.1190], [72.9035, 19.1168]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Private',
    simulated: true,
    createdAt: '2026-03-20T11:00:00Z',
    updatedAt: '2026-08-25T10:00:00Z'
  },
  {
    id: 'parcel-airport-t2-terminal',
    ulpin: 'MH13BOM03319980',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    tehsil: 'Andheri',
    village: 'Vile Parle East',
    surveyNumber: 'CS-1/CSMIA',
    areaSqm: 32000.0,
    centroid: [72.8745, 19.0980],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8720, 19.0960], [72.8770, 19.0965], [72.8765, 19.1000], [72.8715, 19.0995], [72.8720, 19.0960]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Leasehold',
    simulated: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  }
];

/**
 * Iconic Mumbai 3D Buildings across the metropolis
 */
export const SAMPLE_BUILDINGS: Building[] = [
  // --- BKC ---
  {
    id: 'bldg-bkc-fintech-tower',
    parcelId: 'parcel-bkc-fintech',
    name: 'BKC FinTech Pinnacle Tower',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8685, 19.0604], [72.8692, 19.0605], [72.8691, 19.0610], [72.8684, 19.0609], [72.8685, 19.0604]]]
    },
    eavesHeightM: 64.0,
    roofHeightM: 68.5,
    numFloors: 16,
    numBasements: 2,
    plinthElevationM: 4.5,
    yearBuilt: 2023,
    totalBuiltupAreaSqm: 28500,
    address: 'Plot C-54, G-Block, Bandra Kurla Complex, Mumbai 400051',
    simulated: true
  },
  {
    id: 'bldg-bkc-diamond-bourse',
    parcelId: 'parcel-bkc-diamond-bourse',
    name: 'Bharat Diamond Bourse (Tower A-B)',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8704, 19.0617], [72.8715, 19.0618], [72.8714, 19.0624], [72.8703, 19.0623], [72.8704, 19.0617]]]
    },
    eavesHeightM: 52.0,
    roofHeightM: 56.0,
    numFloors: 12,
    numBasements: 3,
    plinthElevationM: 4.8,
    yearBuilt: 2018,
    totalBuiltupAreaSqm: 68000,
    address: 'G Block BKC, Bandra East, Mumbai 400051',
    simulated: true
  },
  {
    id: 'bldg-bkc-jio-world',
    parcelId: 'parcel-bkc-jio-convention',
    name: 'Jio World Convention Centre & Mall',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8653, 19.0630], [72.8668, 19.0632], [72.8665, 19.0640], [72.8650, 19.0638], [72.8653, 19.0630]]]
    },
    eavesHeightM: 48.0,
    roofHeightM: 52.0,
    numFloors: 10,
    numBasements: 3,
    plinthElevationM: 4.6,
    yearBuilt: 2022,
    totalBuiltupAreaSqm: 92000,
    address: 'G Block, Bandra Kurla Complex, Bandra East, Mumbai 400051',
    simulated: true
  },
  {
    id: 'bldg-bkc-nse',
    parcelId: 'parcel-bkc-nse-bhavan',
    name: 'National Stock Exchange (NSE Bhavan)',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8634, 19.0582], [72.8645, 19.0583], [72.8643, 19.0588], [72.8632, 19.0587], [72.8634, 19.0582]]]
    },
    eavesHeightM: 60.0,
    roofHeightM: 64.0,
    numFloors: 14,
    numBasements: 2,
    plinthElevationM: 4.4,
    yearBuilt: 2015,
    totalBuiltupAreaSqm: 38000,
    address: 'Exchange Plaza, C-1, Block G, BKC, Bandra East, Mumbai 400051',
    simulated: true
  },

  // --- Nariman Point & South Mumbai ---
  {
    id: 'bldg-nariman-ocean-heights',
    parcelId: 'parcel-nariman-marine-hub',
    name: 'Nariman Marine Commercial Hub',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8233, 18.9253], [72.8240, 18.9254], [72.8239, 18.9259], [72.8232, 18.9258], [72.8233, 18.9253]]]
    },
    eavesHeightM: 88.0,
    roofHeightM: 92.0,
    numFloors: 22,
    numBasements: 3,
    plinthElevationM: 6.0,
    yearBuilt: 2021,
    totalBuiltupAreaSqm: 36200,
    address: '224 Backbay Reclamation, Nariman Point, Mumbai 400021',
    simulated: true
  },
  {
    id: 'bldg-nariman-express-towers',
    parcelId: 'parcel-nariman-express-towers',
    name: 'Express Towers (Iconic High-Rise)',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8241, 18.9277], [72.8249, 18.9278], [72.8247, 18.9284], [72.8239, 18.9283], [72.8241, 18.9277]]]
    },
    eavesHeightM: 105.0,
    roofHeightM: 110.0,
    numFloors: 25,
    numBasements: 2,
    plinthElevationM: 5.8,
    yearBuilt: 1972,
    totalBuiltupAreaSqm: 42000,
    address: 'Barrister Rajni Patel Marg, Nariman Point, Mumbai 400021',
    simulated: true
  },
  {
    id: 'bldg-cuffe-parade-wtc',
    parcelId: 'parcel-cuffe-parade-wtc',
    name: 'World Trade Centre (Centre 1)',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8175, 18.9155], [72.8185, 18.9156], [72.8183, 18.9165], [72.8173, 18.9164], [72.8175, 18.9155]]]
    },
    eavesHeightM: 152.0,
    roofHeightM: 156.0,
    numFloors: 35,
    numBasements: 2,
    plinthElevationM: 6.2,
    yearBuilt: 1970,
    totalBuiltupAreaSqm: 56000,
    address: 'Cuffe Parade, Colaba, Mumbai 400005',
    simulated: true
  },
  {
    id: 'bldg-mantralaya',
    parcelId: 'parcel-mantralaya-gov',
    name: 'Mantralaya Administrative Headquarters',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8263, 18.9280], [72.8277, 18.9282], [72.8275, 18.9290], [72.8261, 18.9288], [72.8263, 18.9280]]]
    },
    eavesHeightM: 42.0,
    roofHeightM: 45.0,
    numFloors: 9,
    numBasements: 1,
    plinthElevationM: 5.5,
    yearBuilt: 1955,
    totalBuiltupAreaSqm: 52000,
    address: 'Madam Cama Road, Nariman Point, Mumbai 400032',
    simulated: true
  },

  // --- Worli & Lower Parel Midtown Skyscrapers ---
  {
    id: 'bldg-worli-world-one',
    parcelId: 'parcel-worli-world-one',
    name: 'World One Supertall Tower (285m)',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8273, 18.9953], [72.8286, 18.9955], [72.8284, 18.9967], [72.8271, 18.9965], [72.8273, 18.9953]]]
    },
    eavesHeightM: 280.0,
    roofHeightM: 285.0,
    numFloors: 76,
    numBasements: 4,
    plinthElevationM: 5.0,
    yearBuilt: 2020,
    totalBuiltupAreaSqm: 140000,
    address: 'Lodha Place, Senapati Bapat Marg, Worli, Mumbai 400013',
    simulated: true
  },
  {
    id: 'bldg-worli-sky-vistas',
    parcelId: 'parcel-worli-lodha-grandeur',
    name: 'Lodha Grandeur Luxury Residences',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8308, 19.0015], [72.8317, 19.0016], [72.8315, 19.0022], [72.8306, 19.0021], [72.8308, 19.0015]]]
    },
    eavesHeightM: 140.0,
    roofHeightM: 145.0,
    numFloors: 35,
    numBasements: 3,
    plinthElevationM: 5.2,
    yearBuilt: 2024,
    totalBuiltupAreaSqm: 54000,
    address: 'Senapati Bapat Marg, Lower Parel, Mumbai 400013',
    simulated: true
  },
  {
    id: 'bldg-lower-parel-palais-royale',
    parcelId: 'parcel-lower-parel-palais-royale',
    name: 'Palais Royale Supertall Skyscraper (320m)',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8333, 19.0055], [72.8347, 19.0056], [72.8345, 19.0065], [72.8331, 19.0064], [72.8333, 19.0055]]]
    },
    eavesHeightM: 315.0,
    roofHeightM: 320.0,
    numFloors: 88,
    numBasements: 5,
    plinthElevationM: 5.4,
    yearBuilt: 2023,
    totalBuiltupAreaSqm: 165000,
    address: 'Tulsi Pipe Road, Lower Parel, Mumbai 400013',
    simulated: true
  },
  {
    id: 'bldg-lower-parel-peninsula',
    parcelId: 'parcel-lower-parel-peninsula',
    name: 'Peninsula Corporate Park Tower',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8285, 19.0035], [72.8295, 19.0036], [72.8293, 19.0045], [72.8283, 19.0044], [72.8285, 19.0035]]]
    },
    eavesHeightM: 92.0,
    roofHeightM: 96.0,
    numFloors: 24,
    numBasements: 3,
    plinthElevationM: 5.1,
    yearBuilt: 2016,
    totalBuiltupAreaSqm: 58000,
    address: 'Ganpatrao Kadam Marg, Lower Parel, Mumbai 400013',
    simulated: true
  },

  // --- Andheri East, SEEPZ, Powai & Airport ---
  {
    id: 'bldg-andheri-seepz-hub',
    parcelId: 'parcel-andheri-seepz-zone',
    name: 'SEEPZ Multi-Services IT Mega Tower',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8740, 19.1213], [72.8760, 19.1215], [72.8757, 19.1227], [72.8737, 19.1225], [72.8740, 19.1213]]]
    },
    eavesHeightM: 72.0,
    roofHeightM: 76.0,
    numFloors: 18,
    numBasements: 2,
    plinthElevationM: 12.0,
    yearBuilt: 2019,
    totalBuiltupAreaSqm: 82000,
    address: 'MIDC Central Road, Andheri East, Mumbai 400096',
    simulated: true
  },
  {
    id: 'bldg-andheri-nesco-center',
    parcelId: 'parcel-andheri-nesco-it',
    name: 'Nesco IT Park Tower 4',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8570, 19.1522], [72.8590, 19.1524], [72.8587, 19.1538], [72.8567, 19.1536], [72.8570, 19.1522]]]
    },
    eavesHeightM: 84.0,
    roofHeightM: 88.0,
    numFloors: 22,
    numBasements: 3,
    plinthElevationM: 14.5,
    yearBuilt: 2021,
    totalBuiltupAreaSqm: 98000,
    address: 'Western Express Highway, Goregaon East, Mumbai 400063',
    simulated: true
  },
  {
    id: 'bldg-powai-solitaire',
    parcelId: 'parcel-powai-hiranandani',
    name: 'Hiranandani Solitaire Corporate Suites',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.9040, 19.1172], [72.9060, 19.1174], [72.9057, 19.1188], [72.9037, 19.1186], [72.9040, 19.1172]]]
    },
    eavesHeightM: 110.0,
    roofHeightM: 115.0,
    numFloors: 28,
    numBasements: 3,
    plinthElevationM: 35.0, // Elevated Powai plateau
    yearBuilt: 2022,
    totalBuiltupAreaSqm: 74000,
    address: 'Central Avenue, Hiranandani Gardens, Powai, Mumbai 400076',
    simulated: true
  },
  {
    id: 'bldg-csmia-t2-concourse',
    parcelId: 'parcel-airport-t2-terminal',
    name: 'CSMIA Terminal 2 International Concourse',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8728, 19.0968], [72.8762, 19.0972], [72.8758, 19.0992], [72.8722, 19.0988], [72.8728, 19.0968]]]
    },
    eavesHeightM: 38.0,
    roofHeightM: 42.0,
    numFloors: 4,
    numBasements: 2,
    plinthElevationM: 11.2,
    yearBuilt: 2014,
    totalBuiltupAreaSqm: 450000,
    address: 'Sahar, Andheri East, Mumbai 400099',
    simulated: true
  }
];

/**
 * Generate 3D Vertical Units across the expanded buildings
 */
export function generateSampleVerticalUnits(): VerticalUnit[] {
  const units: VerticalUnit[] = [];

  // 1. BKC FinTech Tower Units (Floors -02 to +16)
  const bkcParcel = SAMPLE_PARCELS[0];
  const bkcBuilding = SAMPLE_BUILDINGS[0];

  // Basements
  for (let b = 2; b >= 1; b--) {
    const levelCode = `-0${b}`;
    const zMin = -b * 3.5;
    const zMax = -(b - 1) * 3.5;
    units.push({
      id: `unit-bkc-b0${b}-pkg`,
      buildingId: bkcBuilding.id,
      parcelId: bkcParcel.id,
      ulpin3D: formatUlpin3D(bkcParcel.ulpin, 'U', -b, `PKG${b}01`),
      domainCode: 'U',
      levelCode,
      unitCode: `PKG${b}01`,
      floorNumber: -b,
      unitName: `Basement B${b} Automated Parking & MEP Hub`,
      useType: 'Utility',
      ownerName: 'BKC Estate Management Ltd',
      ownerId: 'CORP-MH-948271',
      carpetAreaSqm: 1450.0,
      builtupAreaSqm: 1600.0,
      volumeCum: 5600.0,
      zMin,
      zMax,
      verticalDatum: 'WGS84 MSL (Plinth +4.5m)',
      bounds: { minLng: 72.8685, maxLng: 72.8692, minLat: 19.0604, maxLat: 19.0610, minZ: zMin, maxZ: zMax },
      validationStatus: 'VALID',
      provenance: 'MAHARERA_PLAN',
      taxStatus: 'PAID',
      simulated: true,
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-08-20T14:30:00Z'
    });
  }

  // Ground Floor (Plinth Datum)
  units.push({
    id: `unit-bkc-g00-lobby`,
    buildingId: bkcBuilding.id,
    parcelId: bkcParcel.id,
    ulpin3D: formatUlpin3D(bkcParcel.ulpin, 'G', 0, 'LOB01'),
    domainCode: 'G',
    levelCode: '00',
    unitCode: 'LOB01',
    floorNumber: 0,
    unitName: 'Grand Atrium & Commercial Bank Concourse',
    useType: 'Commercial',
    ownerName: 'Reserve Bank Affiliated FinTech Hub',
    ownerId: 'GOV-IN-883921',
    carpetAreaSqm: 1200.0,
    builtupAreaSqm: 1350.0,
    volumeCum: 6750.0,
    zMin: 0.0,
    zMax: 5.0,
    verticalDatum: 'WGS84 MSL (Plinth +4.5m)',
    bounds: { minLng: 72.8685, maxLng: 72.8692, minLat: 19.0604, maxLat: 19.0610, minZ: 0.0, maxZ: 5.0 },
    validationStatus: 'VALID',
    provenance: 'DRONE_LIDAR',
    taxStatus: 'EXEMPT',
    simulated: true,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z'
  });

  // Floors +01 to +16
  const floorUseMap: Record<number, { use: any; owner: string; ownerId: string }> = {
    1: { use: 'Commercial', owner: 'State Bank of India Corporate Branch', ownerId: 'CORP-SBI-001' },
    2: { use: 'Commercial', owner: 'SEBI Digital Regulatory Cell', ownerId: 'GOV-SEBI-104' },
    3: { use: 'Commercial', owner: 'Tata Consultancy Services FinTech Lab', ownerId: 'CORP-TCS-302' },
    4: { use: 'Commercial', owner: 'HDFC Securities Tech Hub', ownerId: 'CORP-HDFC-401' },
    5: { use: 'Commercial', owner: 'National Stock Exchange Data Wing', ownerId: 'CORP-NSE-505' },
    6: { use: 'Commercial', owner: 'Infosys Finacle Innovation Lab', ownerId: 'CORP-INF-602' },
    7: { use: 'Commercial', owner: 'Kotak Mahindra Wealth Office', ownerId: 'CORP-KM-701' },
    8: { use: 'Commercial', owner: 'ICICI Prudential Technology', ownerId: 'CORP-ICI-802' },
    9: { use: 'Commercial', owner: 'Morgan Stanley Global Solutions', ownerId: 'CORP-MS-901' },
    10: { use: 'Commercial', owner: 'Barclays Global Operations Centre', ownerId: 'CORP-BAR-1002' },
    11: { use: 'Commercial', owner: 'Goldman Sachs Core Engineering', ownerId: 'CORP-GS-1101' },
    12: { use: 'Commercial', owner: 'JPMorgan Chase Innovation Floor', ownerId: 'CORP-JPM-1202' },
    13: { use: 'Commercial', owner: 'BlackRock Systematic Trading Lab', ownerId: 'CORP-BLK-1301' },
    14: { use: 'Commercial', owner: 'Citigroup Executive Suites', ownerId: 'CORP-CITI-1402' },
    15: { use: 'Commercial', owner: 'Reliance Financial Ventures', ownerId: 'CORP-RIL-1501' },
    16: { use: 'Recreational', owner: 'BKC Sky Lounge & Executive Boardroom', ownerId: 'CORP-BKC-1600' },
  };

  for (let f = 1; f <= 16; f++) {
    const floorInfo = floorUseMap[f];
    const zMin = 5.0 + (f - 1) * 3.8;
    const zMax = 5.0 + f * 3.8;

    // Floor 2 has intentional collision demo between Unit 201 and Unit 202
    if (f === 2) {
      // Unit 201 (Primary)
      units.push({
        id: `unit-bkc-f02-a201`,
        buildingId: bkcBuilding.id,
        parcelId: bkcParcel.id,
        ulpin3D: formatUlpin3D(bkcParcel.ulpin, 'A', 2, '201'),
        domainCode: 'A',
        levelCode: '+02',
        unitCode: '201',
        floorNumber: 2,
        unitName: 'SEBI Digital Regulatory Lab (East Wing)',
        useType: 'Commercial',
        ownerName: 'SEBI Digital Regulatory Cell',
        ownerId: 'GOV-SEBI-104',
        carpetAreaSqm: 580.0,
        builtupAreaSqm: 650.0,
        volumeCum: 2470.0,
        zMin: 8.8,
        zMax: 12.6,
        verticalDatum: 'WGS84 MSL (Plinth +4.5m)',
        bounds: { minLng: 72.8685, maxLng: 72.8689, minLat: 19.0604, maxLat: 19.0610, minZ: 8.8, maxZ: 12.6 },
        validationStatus: 'CONFLICT', // Flagged for collision!
        provenance: 'MAHARERA_PLAN',
        taxStatus: 'PAID',
        simulated: true,
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-08-20T14:30:00Z'
      });

      // Unit 202 (Colliding with Unit 201 due to unvalidated mezzanine vertical expansion)
      units.push({
        id: `unit-bkc-f02-a202`,
        buildingId: bkcBuilding.id,
        parcelId: bkcParcel.id,
        ulpin3D: formatUlpin3D(bkcParcel.ulpin, 'A', 2, '202'),
        domainCode: 'A',
        levelCode: '+02',
        unitCode: '202',
        floorNumber: 2,
        unitName: 'Fintech Incubator Mezzanine Expansion (West Wing)',
        useType: 'Commercial',
        ownerName: 'FinTech Growth Catalyst Trust',
        ownerId: 'TRU-MH-449102',
        carpetAreaSqm: 520.0,
        builtupAreaSqm: 600.0,
        volumeCum: 2280.0,
        zMin: 11.2, // OVERLAPS with Unit 201 (8.8 to 12.6) by 1.4m vertical solid!
        zMax: 15.0,
        verticalDatum: 'WGS84 MSL (Plinth +4.5m)',
        bounds: { minLng: 72.8688, maxLng: 72.8692, minLat: 19.0604, maxLat: 19.0610, minZ: 11.2, maxZ: 15.0 },
        validationStatus: 'CONFLICT',
        provenance: 'DRONE_LIDAR',
        taxStatus: 'DUE',
        simulated: true,
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-08-20T14:30:00Z'
      });
    } else {
      // Standard Floor Units
      const unitLetters = ['A', 'B'];
      unitLetters.forEach((letter, idx) => {
        const uCode = `${letter}${f}0${idx + 1}`;
        units.push({
          id: `unit-bkc-f${f.toString().padStart(2, '0')}-${uCode.toLowerCase()}`,
          buildingId: bkcBuilding.id,
          parcelId: bkcParcel.id,
          ulpin3D: formatUlpin3D(bkcParcel.ulpin, 'A', f, uCode),
          domainCode: 'A',
          levelCode: `+${f.toString().padStart(2, '0')}`,
          unitCode: uCode,
          floorNumber: f,
          unitName: `${bkcBuilding.name} - Unit ${uCode} (Floor ${f})`,
          useType: floorInfo.use,
          ownerName: floorInfo.owner,
          ownerId: floorInfo.ownerId,
          carpetAreaSqm: 550.0 + (idx * 50),
          builtupAreaSqm: 620.0 + (idx * 60),
          volumeCum: (620.0 + (idx * 60)) * 3.8,
          zMin,
          zMax,
          verticalDatum: 'WGS84 MSL (Plinth +4.5m)',
          bounds: { 
            minLng: idx === 0 ? 72.8685 : 72.8688, 
            maxLng: idx === 0 ? 72.8688 : 72.8692, 
            minLat: 19.0604, 
            maxLat: 19.0610, 
            minZ: zMin, 
            maxZ: zMax 
          },
          validationStatus: 'VALID',
          provenance: f % 2 === 0 ? 'DRONE_LIDAR' : 'MAHARERA_PLAN',
          taxStatus: 'PAID',
          simulated: true,
          createdAt: '2026-01-20T10:00:00Z',
          updatedAt: '2026-08-20T14:30:00Z'
        });
      });
    }
  }

  // 2. World One Worli Supertall Units (Sample Units across 76 Floors)
  const w1Parcel = SAMPLE_PARCELS.find(p => p.id === 'parcel-worli-world-one') || SAMPLE_PARCELS[0];
  const w1Bldg = SAMPLE_BUILDINGS.find(b => b.id === 'bldg-worli-world-one') || SAMPLE_BUILDINGS[0];
  for (let f = 1; f <= 12; f++) {
    const zMin = 5.0 + (f - 1) * 3.75;
    const zMax = 5.0 + f * 3.75;
    const uCode = `W1-${f}01`;
    units.push({
      id: `unit-w1-f${f.toString().padStart(2, '0')}`,
      buildingId: w1Bldg.id,
      parcelId: w1Parcel.id,
      ulpin3D: formatUlpin3D(w1Parcel.ulpin, 'A', f, uCode),
      domainCode: 'A',
      levelCode: `+${f.toString().padStart(2, '0')}`,
      unitCode: uCode,
      floorNumber: f,
      unitName: `World One Sky Villa Suite ${uCode}`,
      useType: 'Residential',
      ownerName: `Dr. Cyrus Poonawalla Family Trust`,
      ownerId: `TRU-MH-90214`,
      carpetAreaSqm: 680.0,
      builtupAreaSqm: 780.0,
      volumeCum: 2925.0,
      zMin,
      zMax,
      verticalDatum: 'WGS84 MSL (Plinth +5.0m)',
      bounds: { minLng: 72.8273, maxLng: 72.8286, minLat: 18.9953, maxLat: 18.9967, minZ: zMin, maxZ: zMax },
      validationStatus: 'VALID',
      provenance: 'DRONE_LIDAR',
      taxStatus: 'PAID',
      simulated: true,
      createdAt: '2026-03-05T09:15:00Z',
      updatedAt: '2026-08-26T11:30:00Z'
    });
  }

  // 3. Nariman Point Tower Units
  const npParcel = SAMPLE_PARCELS[4];
  const npBuilding = SAMPLE_BUILDINGS[4];
  for (let f = 1; f <= 8; f++) {
    const zMin = 6.0 + (f - 1) * 4.0;
    const zMax = 6.0 + f * 4.0;
    const uCode = `NP${f}01`;
    units.push({
      id: `unit-np-f${f.toString().padStart(2, '0')}-${uCode.toLowerCase()}`,
      buildingId: npBuilding.id,
      parcelId: npParcel.id,
      ulpin3D: formatUlpin3D(npParcel.ulpin, 'A', f, uCode),
      domainCode: 'A',
      levelCode: `+${f.toString().padStart(2, '0')}`,
      unitCode: uCode,
      floorNumber: f,
      unitName: `Nariman Suite ${uCode}`,
      useType: 'Commercial',
      ownerName: f % 2 === 0 ? 'Reliance Maritime Ltd' : 'Hindustan Shipping Corporation',
      ownerId: `CORP-MUM-${8000 + f}`,
      carpetAreaSqm: 880.0,
      builtupAreaSqm: 1020.0,
      volumeCum: 4080.0,
      zMin,
      zMax,
      verticalDatum: 'WGS84 MSL (Plinth +6.0m)',
      bounds: { minLng: 72.8233, maxLng: 72.8240, minLat: 18.9253, maxLat: 18.9259, minZ: zMin, maxZ: zMax },
      validationStatus: 'VALID',
      provenance: 'BMC_GIS',
      taxStatus: 'PAID',
      simulated: true,
      createdAt: '2026-02-15T11:00:00Z',
      updatedAt: '2026-08-22T11:00:00Z'
    });
  }

  return units;
}

export const SAMPLE_VERTICAL_UNITS = generateSampleVerticalUnits();

/**
 * 3D Subterranean Infrastructure Networks across Mumbai
 */
export const SAMPLE_UNDERGROUND_ASSETS: UndergroundAsset[] = [
  // --- Metro Line 3 Aqua Line (Subterranean Transit Corridor) ---
  {
    id: 'underground-metro-aqua-line-cuffe-bkc',
    ulpin3D: 'MH13BOM04521873.T-06-MTR03',
    parcelId: 'parcel-bkc-fintech',
    assetType: 'METRO_TUNNEL',
    diameterMm: 6200,
    depthMinM: -24.5,
    depthMaxM: -18.3,
    coordinates3D: {
      type: 'LineStringZ',
      coordinates: [
        [72.8180, 18.9160, -22.0], // Cuffe Parade
        [72.8240, 18.9270, -21.5], // Nariman Point
        [72.8310, 19.0010, -20.8], // Worli / Acharya Atre Chowk
        [72.8688, 19.0607, -21.4], // BKC Station
        [72.8745, 19.0980, -23.0], // CSIA International Airport T2
        [72.8750, 19.1220, -19.5]  // SEEPZ
      ]
    },
    owningAgency: 'Mumbai Metro Rail Corporation Limited (MMRCL Line 3)',
    installationYear: 2023,
    operationalStatus: 'ACTIVE',
    validationStatus: 'VALID',
    simulated: true
  },

  // --- Coastal Road Undersea Twin Tunnel Corridor ---
  {
    id: 'underground-coastal-road-tunnel',
    ulpin3D: 'MH13BOM09841120.T-05-CRD01',
    parcelId: 'parcel-nariman-marine-hub',
    assetType: 'METRO_TUNNEL',
    diameterMm: 12190, // 12.2m twin bored tunnel
    depthMinM: -22.0,
    depthMaxM: -15.0,
    coordinates3D: {
      type: 'LineStringZ',
      coordinates: [
        [72.8236, 18.9256, -18.0], // Marine Drive
        [72.8120, 18.9550, -20.5], // Under Arabian Sea off Chowpatty
        [72.8050, 18.9750, -17.0]  // Priyadarshini Park
      ]
    },
    owningAgency: 'Brihanmumbai Municipal Corporation (BMC Coastal Road Project)',
    installationYear: 2024,
    operationalStatus: 'ACTIVE',
    validationStatus: 'VALID',
    simulated: true
  },

  // --- Water Supply Trunk Aqueducts (BMC Vaitarna/Tansa Network) ---
  {
    id: 'underground-bkc-water-01',
    ulpin3D: 'MH13BOM04521873.U-01-WSUP12',
    parcelId: 'parcel-bkc-fintech',
    assetType: 'WATER_SUPPLY',
    diameterMm: 1800,
    depthMinM: -2.8,
    depthMaxM: -1.5,
    coordinates3D: {
      type: 'LineStringZ',
      coordinates: [
        [72.8640, 19.0585, -2.2],
        [72.8688, 19.0607, -2.2],
        [72.8710, 19.0620, -2.2]
      ]
    },
    owningAgency: 'BMC Hydraulic Engineer Department (Vaitarna Aqueduct)',
    installationYear: 2018,
    operationalStatus: 'ACTIVE',
    validationStatus: 'VALID',
    simulated: true
  },
  {
    id: 'underground-south-mumbai-water-02',
    ulpin3D: 'MH13BOM09841120.U-01-WSUP08',
    parcelId: 'parcel-nariman-marine-hub',
    assetType: 'WATER_SUPPLY',
    diameterMm: 1200,
    depthMinM: -2.4,
    depthMaxM: -1.6,
    coordinates3D: {
      type: 'LineStringZ',
      coordinates: [
        [72.8180, 18.9160, -1.8],
        [72.8236, 18.9256, -1.8],
        [72.8270, 18.9285, -1.8]
      ]
    },
    owningAgency: 'BMC Hydraulic Engineer Department',
    installationYear: 2016,
    operationalStatus: 'ACTIVE',
    validationStatus: 'VALID',
    simulated: true
  },

  // --- Storm Sewer & Wastewater Network (BRIMSTOWAD) ---
  {
    id: 'underground-bkc-sewer-02',
    ulpin3D: 'MH13BOM04521873.U-02-SWR04',
    parcelId: 'parcel-bkc-fintech',
    assetType: 'SEWER_DRAIN',
    diameterMm: 1400,
    depthMinM: -4.2,
    depthMaxM: -3.2,
    coordinates3D: {
      type: 'LineStringZ',
      coordinates: [
        [72.8632, 19.0580, -3.8],
        [72.8688, 19.0603, -3.8],
        [72.8718, 19.0616, -3.8]
      ]
    },
    owningAgency: 'BMC Sewerage Operations (SWM Mithi Outfall)',
    installationYear: 2015,
    operationalStatus: 'ACTIVE',
    validationStatus: 'VALID',
    simulated: true
  },

  // --- High Voltage Power Transmission (220kV Underground) ---
  {
    id: 'underground-bkc-power-03',
    ulpin3D: 'MH13BOM04521873.U-02-HV220',
    parcelId: 'parcel-bkc-fintech',
    assetType: 'POWER_HV',
    diameterMm: 450,
    depthMinM: -3.2,
    depthMaxM: -2.5,
    coordinates3D: {
      type: 'LineStringZ',
      coordinates: [
        [72.8684, 19.0614, -2.8],
        [72.8689, 19.0608, -2.8],
        [72.8692, 19.0602, -2.8]
      ]
    },
    owningAgency: 'MSETCL / Tata Power High Voltage Transmission',
    installationYear: 2020,
    operationalStatus: 'ACTIVE',
    validationStatus: 'VALID',
    simulated: true
  },

  // --- Telecom & Optical Fiber Duct (BharatNet / MTNL) ---
  {
    id: 'underground-bkc-telecom-04',
    ulpin3D: 'MH13BOM04521873.U-01-OFC88',
    parcelId: 'parcel-bkc-fintech',
    assetType: 'TELECOM_FIBER',
    diameterMm: 200,
    depthMinM: -1.2,
    depthMaxM: -0.8,
    coordinates3D: {
      type: 'LineStringZ',
      coordinates: [
        [72.8682, 19.0613, -0.95],
        [72.8687, 19.0607, -0.95],
        [72.8695, 19.0605, -0.95]
      ]
    },
    owningAgency: 'National Optical Fiber Network / MTNL Ducting',
    installationYear: 2022,
    operationalStatus: 'ACTIVE',
    validationStatus: 'VALID',
    simulated: true
  },

  // --- Piped Natural Gas (Mahanagar Gas Limited PNG Grid) ---
  {
    id: 'underground-bkc-gas-05',
    ulpin3D: 'MH13BOM04521873.U-02-GAS09',
    parcelId: 'parcel-bkc-fintech',
    assetType: 'GAS_PIPELINE',
    diameterMm: 350,
    depthMinM: -3.0,
    depthMaxM: -2.4,
    coordinates3D: {
      type: 'LineStringZ',
      coordinates: [
        [72.8680, 19.0606, -2.7],
        [72.8688, 19.0607, -2.7],
        [72.8698, 19.0609, -2.7]
      ]
    },
    owningAgency: 'Mahanagar Gas Limited (MGL City Gas Distribution)',
    installationYear: 2019,
    operationalStatus: 'ACTIVE',
    validationStatus: 'VALID',
    simulated: true
  }
];

/**
 * Seeded 3D Topology Conflict Log (for Pitch & Verification Demo)
 */
export const SAMPLE_TOPOLOGY_LOGS: TopologyValidationLog[] = [
  {
    id: 'topologylog-bkc-conflict-01',
    ruleCode: 'ERR_3D_Z_OVERLAP',
    severity: 'CRITICAL',
    ulpin3DPrimary: 'MH13BOM04521873.A+02-201',
    ulpin3DColliding: 'MH13BOM04521873.A+02-202',
    buildingId: 'bldg-bkc-fintech-tower',
    message: 'Vertical 3D Solid Overlap Detected: Unit A+02-201 and Unit A+02-202 intersect between Z=+11.20m and Z=+12.60m with an encroaching volume of 42.5 m³.',
    details: {
      overlapVolumeCum: 42.5,
      elevationZRange: [11.20, 12.60],
      overlapPercentage: 7.3,
      description: 'Mezzanine extension on West Wing overlaps the registered ceiling bounding box of East Wing Unit A+02-201.'
    },
    centroid: [72.86885, 19.0607, 11.9],
    status: 'OPEN',
    detectedAt: '2026-08-27T14:22:00Z'
  },
  {
    id: 'topologylog-np-warning-02',
    ruleCode: 'ERR_BOUND_PROTRUSION',
    severity: 'WARNING',
    ulpin3DPrimary: 'MH13BOM09841120.A+08-NP801',
    buildingId: 'bldg-nariman-ocean-heights',
    message: 'Cantilever Balcony Protrusion: 8th floor terrace exceeds parcel cadastral boundary by 0.42m over coastal road easement.',
    details: {
      overlapVolumeCum: 8.2,
      elevationZRange: [34.0, 38.0],
      overlapPercentage: 1.1,
      description: 'Architectural cantilever overhang beyond municipal road setback.'
    },
    centroid: [72.82405, 18.9256, 36.0],
    status: 'OPEN',
    detectedAt: '2026-08-27T15:10:00Z'
  }
];

/**
 * Immutable Cadastral Audit Log Trail
 */
export const SAMPLE_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    timestamp: '2026-08-20T10:15:32Z',
    actor: 'DoLR Field Officer Rajesh Sharma',
    actorRole: 'SURVEYOR',
    action: 'CREATE',
    entityType: 'PARCEL',
    entityId: 'MH13BOM04521873',
    summary: 'Initial registration of BKC G-Block 4,250.8 sqm base parcel from BMC GIS layer.',
    hashSignature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'audit-002',
    timestamp: '2026-08-22T14:30:10Z',
    actor: 'Automated AI Cadastral Pipeline',
    actorRole: 'SYSTEM_AI',
    action: 'CREATE',
    entityType: 'VERTICAL_UNIT',
    entityId: 'MH13BOM04521873.A+02-201',
    summary: 'Auto-vectorized 3D solid from MahaRERA Floor Plan layout rev 3.2.',
    hashSignature: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
  },
  {
    id: 'audit-003',
    timestamp: '2026-08-27T14:22:05Z',
    actor: '3D Solid Topology Engine',
    actorRole: 'SYSTEM_AI',
    action: 'VALIDATE',
    entityType: 'VALIDATION_LOG',
    entityId: 'topologylog-bkc-conflict-01',
    summary: 'Flagged CRITICAL 3D vertical collision ERR_3D_Z_OVERLAP between Units 201 & 202.',
    hashSignature: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
  }
];
