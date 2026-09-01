import { 
  Parcel, 
  Building, 
  VerticalUnit, 
  UndergroundAsset, 
  TopologyValidationLog, 
  AuditLog, 
  formatUlpin3D,
  MiningArea
} from '@sih/shared-types';

/**
 * Real Mumbai City Cadastral Dataset (BMC MCGM / DP2034 Wards)
 * Georeferenced coordinates across South Mumbai, Midtown Worli/Lower Parel, BKC, Andheri, and Powai.
 */
const _SAMPLE_PARCELS: Parcel[] = [
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
  },
  {
    id: 'parcel-bandra-crce',
    ulpin: 'MH13BOM05521990',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    tehsil: 'Bandra',
    village: 'Bandra West',
    surveyNumber: 'CTS-CRCE',
    areaSqm: 8000.0,
    centroid: [72.82096, 19.04443],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [72.8205, 19.0440], [72.8215, 19.0440], [72.8215, 19.0450], [72.8205, 19.0450], [72.8205, 19.0440]
      ]]
    },
    crs: 'EPSG:4326',
    ownershipType: 'Private',
    simulated: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z'
  }
];

/**
 * Iconic Mumbai 3D Buildings across the metropolis
 */
const _SAMPLE_BUILDINGS: Building[] = [
  // --- Bandra West ---
  {
    id: 'bldg-bandra-crce',
    parcelId: 'parcel-bandra-crce',
    name: 'Fr Conceicao Rodrigues College of Engineering',
    footprint: {
      type: 'Polygon',
      coordinates: [[[72.8208, 19.0443], [72.8211, 19.0443], [72.8211, 19.0446], [72.8208, 19.0446], [72.8208, 19.0443]]]
    },
    eavesHeightM: 34.2, // 9 floors * 3.8m
    roofHeightM: 36.2,
    numFloors: 9,
    numBasements: 1,
    plinthElevationM: 4.5,
    yearBuilt: 1984,
    totalBuiltupAreaSqm: 15000,
    address: 'Father Agnel Ashram, Bandstand, Bandra West, Mumbai 400050',
    simulated: true
  },
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

  // 1. CRCE College (Floors 0 to 8)
  const crceBuilding = _SAMPLE_BUILDINGS.find(b => b.id === 'bldg-bandra-crce');
  const crceParcel = _SAMPLE_PARCELS.find(p => p.id === 'parcel-bandra-crce');
  if (crceBuilding && crceParcel) {
    for (let f = 0; f < 9; f++) {
      const levelCode = f === 0 ? 'G' : `+0${f}`;
      for (let u = 1; u <= 4; u++) {
        const zMin = f * 3.8;
        const zMax = (f + 1) * 3.8;
        units.push({
          id: `unit-crce-${f}0${u}`,
          buildingId: crceBuilding.id,
          parcelId: crceParcel.id,
          ulpin3D: formatUlpin3D(crceParcel.ulpin, 'A', f, `U${f}0${u}`),
          domainCode: 'A',
          levelCode,
          unitCode: `U${f}0${u}`,
          floorNumber: f,
          unitName: `CRCE Room ${f}0${u}`,
          useType: 'Institutional',
          ownerName: 'Father Agnel Ashram',
          ownerId: 'ORG-MH-CRCE',
          carpetAreaSqm: f === 0 ? (u === 1 ? 120 : u === 2 ? 95 : u === 3 ? 65 : 45) : (f === 8 ? (u <= 2 ? 110 : 75) : ([55, 65, 72, 48][u - 1])),
          builtupAreaSqm: f === 0 ? (u === 1 ? 142 : u === 2 ? 112 : u === 3 ? 78 : 55) : (f === 8 ? (u <= 2 ? 130 : 90) : ([68, 78, 86, 58][u - 1])),
          zMin,
          zMax,
          simulated: true
        } as unknown as VerticalUnit);
      }
    }
  }

  // 2. BKC FinTech Tower Units (Floors -02 to +16)
  const bkcParcel = _SAMPLE_PARCELS.find(p => p.id === 'parcel-bkc-fintech') || _SAMPLE_PARCELS[0];
  const bkcBuilding = _SAMPLE_BUILDINGS.find(b => b.id === 'bldg-bkc-fintech-tower') || _SAMPLE_BUILDINGS[0];

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
      carpetAreaSqm: b === 1 ? 1280 : 1150,
      builtupAreaSqm: b === 1 ? 1420 : 1310,
      volumeCum: b === 1 ? 4480 : 4025,
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
    carpetAreaSqm: 985,
    builtupAreaSqm: 1150,
    volumeCum: 5750,
    zMin: 0.0,
    zMax: 5.0,
    verticalDatum: 'WGS84 MSL (Plinth +4.5m)',
    bounds: { minLng: 72.8685, maxLng: 72.8692, minLat: 19.0604, maxLat: 19.0610, minZ: 0.0, maxZ: 5.0 },
    validationStatus: 'VALID',
    provenance: 'DRONE_LIDAR',
    taxStatus: 'EXEMPT',
    simulated: true,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z',
    georeference: {
      crs: 'EPSG:4979',
      verticalDatum: 'ellipsoidal',
      ellipsoidHeightM: 14.5,
      groundElevationM: 14.5,
      floorElevationAboveGroundM: 0.0,
      surveySource: {
        gnssStationOrCorsId: 'CORS-MUM-01',
        surveyDate: '2026-05-12T08:00:00Z',
        horizontalAccuracyM: 0.02,
        verticalAccuracyM: 0.05
      },
      demSource: 'SRTM 30m v3',
      dsmComparisonM: 14.8,
      dataSource: 'demo'
    }
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
        carpetAreaSqm: 465,
        builtupAreaSqm: 538,
        volumeCum: 2044,
        zMin: 8.8,
        zMax: 12.6,
        verticalDatum: 'WGS84 MSL (Plinth +4.5m)',
        bounds: { minLng: 72.8685, maxLng: 72.8689, minLat: 19.0604, maxLat: 19.0610, minZ: 8.8, maxZ: 12.6 },
        validationStatus: 'CONFLICT', // Flagged for collision!
        provenance: 'MAHARERA_PLAN',
        taxStatus: 'PAID',
        simulated: true,
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-08-20T14:30:00Z',
        georeference: {
          crs: 'EPSG:4979',
          verticalDatum: 'ellipsoidal',
          ellipsoidHeightM: 23.3,
          groundElevationM: 14.5,
          floorElevationAboveGroundM: 8.8,
          surveySource: {
            gnssStationOrCorsId: 'CORS-MUM-01',
            surveyDate: '2026-05-12T10:00:00Z',
            horizontalAccuracyM: 0.02,
            verticalAccuracyM: 0.05
          },
          demSource: 'SRTM 30m v3',
          dsmComparisonM: 78.5,
          dataSource: 'demo'
        }
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
        carpetAreaSqm: 412,
        builtupAreaSqm: 485,
        volumeCum: 1843,
        zMin: 11.2, // OVERLAPS with Unit 201 (8.8 to 12.6) by 1.4m vertical solid!
        zMax: 15.0,
        verticalDatum: 'WGS84 MSL (Plinth +4.5m)',
        bounds: { minLng: 72.8688, maxLng: 72.8692, minLat: 19.0604, maxLat: 19.0610, minZ: 11.2, maxZ: 15.0 },
        validationStatus: 'CONFLICT',
        provenance: 'DRONE_LIDAR',
        taxStatus: 'DUE',
        simulated: true,
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-08-20T14:30:00Z',
        georeference: {
          crs: 'EPSG:4979',
          verticalDatum: 'ellipsoidal',
          ellipsoidHeightM: 25.7,
          groundElevationM: 14.5,
          floorElevationAboveGroundM: 11.2,
          surveySource: {
            gnssStationOrCorsId: 'CORS-MUM-01',
            surveyDate: '2026-05-12T11:00:00Z',
            horizontalAccuracyM: 0.02,
            verticalAccuracyM: 0.05
          },
          demSource: 'SRTM 30m v3',
          dsmComparisonM: 78.5,
          dataSource: 'demo'
        }
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
          carpetAreaSqm: idx === 0 ? (185 + f * 12) : (155 + f * 10),
          builtupAreaSqm: idx === 0 ? (220 + f * 14) : (185 + f * 12),
          volumeCum: (idx === 0 ? (220 + f * 14) : (185 + f * 12)) * 3.8,
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
  const w1Parcel = _SAMPLE_PARCELS.find(p => p.id === 'parcel-worli-world-one') || _SAMPLE_PARCELS[0];
  const w1Bldg = _SAMPLE_BUILDINGS.find(b => b.id === 'bldg-worli-world-one') || _SAMPLE_BUILDINGS[0];
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
      carpetAreaSqm: f <= 4 ? (92 + f * 5) : (f <= 8 ? (135 + f * 8) : (185 + f * 12)),
      builtupAreaSqm: f <= 4 ? (115 + f * 6) : (f <= 8 ? (168 + f * 10) : (230 + f * 15)),
      volumeCum: (f <= 4 ? (115 + f * 6) : (f <= 8 ? (168 + f * 10) : (230 + f * 15))) * 3.75,
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
  const npParcel = _SAMPLE_PARCELS[4];
  const npBuilding = _SAMPLE_BUILDINGS[4];
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
      carpetAreaSqm: 195 + f * 18 + (f % 2 === 0 ? 25 : 0),
      builtupAreaSqm: 235 + f * 22 + (f % 2 === 0 ? 30 : 0),
      volumeCum: (235 + f * 22 + (f % 2 === 0 ? 30 : 0)) * 4.0,
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

export const _SAMPLE_VERTICAL_UNITS = generateSampleVerticalUnits();

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

export const SAMPLE_MINING_AREAS: MiningArea[] = [
  {
    id: 'mine-jharia-001',
    name: 'Jharia Coalfield Demo (Jharkhand)',
    coordinates: [86.41, 23.75],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [86.40, 23.74], [86.42, 23.74], [86.42, 23.76], [86.40, 23.76], [86.40, 23.74]
      ]]
    },
    district: 'Dhanbad',
    state: 'Jharkhand',
    tehsil: 'Jharia',
    mineral: 'Coal',
    miningType: 'UNDERGROUND',
    operationalStatus: 'ACTIVE',
    areaSqm: 2500000,
    incidentCount: 0,
    analyticalRiskIndicator: 80,
    dataSource: 'demo',
    lastUpdated: '2026-08-31T00:00:00Z',
    isSynthetic: true,
    undergroundNetwork: {
      nodes: [
        {
          uldpn: 'IND-JH-DHN-JHR01-SHF-0001',
          mineId: 'mine-jharia-001',
          state: 'Jharkhand',
          district: 'Dhanbad',
          featureType: 'shaft',
          dataSource: 'demo',
          crs: 'EPSG:4326',
          geometry: { type: 'Point', coordinates: [86.41, 23.75, 200] },
          connectedSegments: ['IND-JH-DHN-JHR01-TUN-0001']
        },
        {
          uldpn: 'IND-JH-DHN-JHR01-JNC-0001',
          mineId: 'mine-jharia-001',
          state: 'Jharkhand',
          district: 'Dhanbad',
          featureType: 'junction',
          dataSource: 'demo',
          crs: 'EPSG:4326',
          geometry: { type: 'Point', coordinates: [86.415, 23.75, 50] },
          connectedSegments: ['IND-JH-DHN-JHR01-TUN-0001', 'IND-JH-DHN-JHR01-TUN-0002']
        }
      ],
      segments: [
        {
          uldpn: 'IND-JH-DHN-JHR01-TUN-0001',
          mineId: 'mine-jharia-001',
          state: 'Jharkhand',
          district: 'Dhanbad',
          featureType: 'tunnel_segment',
          dataSource: 'demo',
          crs: 'EPSG:4326',
          geometry: { type: 'LineString', coordinates: [[86.41, 23.75, 200], [86.415, 23.75, 50]] },
          startCoordinate: [86.41, 23.75, 200],
          endCoordinate: [86.415, 23.75, 50],
          lengthM: 600,
          surfaceElevationM: 200,
          undergroundElevationM: 50,
          depthBelowSurfaceM: 150,
          connectsTo: ['IND-JH-DHN-JHR01-SHF-0001', 'IND-JH-DHN-JHR01-JNC-0001'],
          deformationCorrelation: {
            uldpn: 'IND-JH-DHN-JHR01-TUN-0001',
            analysisZoneRadiusM: 100,
            meanLosDeformationMm: -15.4,
            maxLosDeformationMm: -22.1,
            velocityMmPerYear: -8.5,
            cumulativeDisplacementMm: -45.0,
            distanceToHotspotM: 12,
            meanCoherence: 0.85,
            analyticalStatus: 'deformation_detected',
            lastObservationDate: '2026-08-15T00:00:00Z',
            dataSources: {
              sensor: 'Sentinel-1A',
              processingMethod: 'DInSAR',
              demSource: 'Copernicus 30m',
              coherenceThreshold: 0.5
            }
          }
        },
        {
          uldpn: 'IND-JH-DHN-JHR01-TUN-0002',
          mineId: 'mine-jharia-001',
          state: 'Jharkhand',
          district: 'Dhanbad',
          featureType: 'tunnel_segment',
          dataSource: 'demo',
          crs: 'EPSG:4326',
          geometry: { type: 'LineString', coordinates: [[86.415, 23.75, 50], [86.415, 23.755, 50]] },
          startCoordinate: [86.415, 23.75, 50],
          endCoordinate: [86.415, 23.755, 50],
          lengthM: 400,
          surfaceElevationM: 205,
          undergroundElevationM: 50,
          depthBelowSurfaceM: 155,
          connectsTo: ['IND-JH-DHN-JHR01-JNC-0001'],
          deformationCorrelation: {
            uldpn: 'IND-JH-DHN-JHR01-TUN-0002',
            analysisZoneRadiusM: 100,
            meanLosDeformationMm: -42.8,
            maxLosDeformationMm: -65.2,
            velocityMmPerYear: -25.0,
            cumulativeDisplacementMm: -120.5,
            distanceToHotspotM: 0,
            meanCoherence: 0.78,
            analyticalStatus: 'high_deformation_investigation_recommended',
            lastObservationDate: '2026-08-15T00:00:00Z'
          }
        }
      ]
    },
    insarTimeSeries: {
      locationId: 'jharia-hotspot-1',
      geometry: { type: 'Point', coordinates: [86.415, 23.755] },
      trend: 'accelerating',
      velocityMmPerYear: -25.0,
      observations: [
        { date: '2026-06-01T00:00:00Z', cumulativeDisplacementMm: 0, coherence: 0.8 },
        { date: '2026-06-13T00:00:00Z', cumulativeDisplacementMm: -12.5, coherence: 0.85 },
        { date: '2026-06-25T00:00:00Z', cumulativeDisplacementMm: -28.0, coherence: 0.79 },
        { date: '2026-07-07T00:00:00Z', cumulativeDisplacementMm: -45.2, coherence: 0.82 },
        { date: '2026-07-19T00:00:00Z', cumulativeDisplacementMm: -65.5, coherence: 0.75 },
        { date: '2026-07-31T00:00:00Z', cumulativeDisplacementMm: -92.0, coherence: 0.88 },
        { date: '2026-08-15T00:00:00Z', cumulativeDisplacementMm: -120.5, coherence: 0.78 }
      ]
    }
  },
  {
    id: 'mine-korba-001',
    name: 'Korba Deep Excavation Demo (Chhattisgarh)',
    coordinates: [82.68, 22.35],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [82.67, 22.34], [82.69, 22.34], [82.69, 22.36], [82.67, 22.36], [82.67, 22.34]
      ]]
    },
    district: 'Korba',
    state: 'Chhattisgarh',
    tehsil: 'Korba',
    mineral: 'Coal',
    miningType: 'UNDERGROUND',
    operationalStatus: 'ACTIVE',
    areaSqm: 3000000,
    incidentCount: 0,
    analyticalRiskIndicator: 75,
    dataSource: 'demo',
    lastUpdated: '2026-08-31T00:00:00Z',
    isSynthetic: true,
    undergroundNetwork: {
      nodes: [
        {
          uldpn: 'IND-CG-KRB-KRB01-SHF-0001',
          mineId: 'mine-korba-001',
          state: 'Chhattisgarh',
          district: 'Korba',
          featureType: 'shaft',
          dataSource: 'demo',
          crs: 'EPSG:4326',
          geometry: { type: 'Point', coordinates: [82.68, 22.35, 300] },
          connectedSegments: ['IND-CG-KRB-KRB01-TUN-0001']
        }
      ],
      segments: [
        {
          uldpn: 'IND-CG-KRB-KRB01-TUN-0001',
          mineId: 'mine-korba-001',
          state: 'Chhattisgarh',
          district: 'Korba',
          featureType: 'tunnel_segment',
          dataSource: 'demo',
          crs: 'EPSG:4326',
          geometry: { type: 'LineString', coordinates: [[82.68, 22.35, 300], [82.685, 22.355, 100]] },
          startCoordinate: [82.68, 22.35, 300],
          endCoordinate: [82.685, 22.355, 100],
          lengthM: 800,
          surfaceElevationM: 300,
          undergroundElevationM: 100,
          depthBelowSurfaceM: 200,
          connectsTo: ['IND-CG-KRB-KRB01-SHF-0001'],
          deformationCorrelation: {
            uldpn: 'IND-CG-KRB-KRB01-TUN-0001',
            analysisZoneRadiusM: 150,
            meanLosDeformationMm: -1.2,
            maxLosDeformationMm: -3.5,
            velocityMmPerYear: -0.5,
            cumulativeDisplacementMm: -2.1,
            distanceToHotspotM: 1500,
            meanCoherence: 0.92,
            analyticalStatus: 'stable',
            lastObservationDate: '2026-08-20T00:00:00Z',
            dataSources: {
              sensor: 'Sentinel-1A',
              processingMethod: 'PS-InSAR',
              demSource: 'Copernicus 30m',
              coherenceThreshold: 0.7
            }
          }
        }
      ]
    },
    insarTimeSeries: {
      locationId: 'korba-stable-1',
      geometry: { type: 'Point', coordinates: [82.682, 22.352] },
      trend: 'stable',
      velocityMmPerYear: -0.5,
      observations: [
        { date: '2026-06-05T00:00:00Z', cumulativeDisplacementMm: 0, coherence: 0.9 },
        { date: '2026-07-15T00:00:00Z', cumulativeDisplacementMm: -1.0, coherence: 0.92 },
        { date: '2026-08-20T00:00:00Z', cumulativeDisplacementMm: -2.1, coherence: 0.95 }
      ]
    }
  },
  {
    id: 'mine-khetri-001',
    name: 'Khetri Copper Complex Demo (Rajasthan)',
    coordinates: [75.78, 28.00],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [75.77, 27.99], [75.79, 27.99], [75.79, 28.01], [75.77, 28.01], [75.77, 27.99]
      ]]
    },
    district: 'Jhunjhunu',
    state: 'Rajasthan',
    tehsil: 'Khetri',
    mineral: 'Copper',
    miningType: 'UNDERGROUND',
    operationalStatus: 'ACTIVE',
    areaSqm: 1500000,
    incidentCount: 0,
    analyticalRiskIndicator: 60,
    dataSource: 'demo',
    lastUpdated: '2026-08-31T00:00:00Z',
    isSynthetic: true,
    undergroundNetwork: {
      nodes: [
        {
          uldpn: 'IND-RJ-JHJ-KHT01-ENT-0001',
          mineId: 'mine-khetri-001',
          state: 'Rajasthan',
          district: 'Jhunjhunu',
          featureType: 'entrance',
          dataSource: 'demo',
          crs: 'EPSG:4326',
          geometry: { type: 'Point', coordinates: [75.78, 28.00, 350] },
          connectedSegments: ['IND-RJ-JHJ-KHT01-TUN-0001']
        }
      ],
      segments: [
        {
          uldpn: 'IND-RJ-JHJ-KHT01-TUN-0001',
          mineId: 'mine-khetri-001',
          state: 'Rajasthan',
          district: 'Jhunjhunu',
          featureType: 'tunnel_segment',
          dataSource: 'demo',
          crs: 'EPSG:4326',
          geometry: { type: 'LineString', coordinates: [[75.78, 28.00, 350], [75.78, 27.995, 200]] },
          startCoordinate: [75.78, 28.00, 350],
          endCoordinate: [75.78, 27.995, 200],
          lengthM: 750,
          surfaceElevationM: 350,
          undergroundElevationM: 200,
          depthBelowSurfaceM: 150,
          connectsTo: ['IND-RJ-JHJ-KHT01-ENT-0001']
        }
      ]
    }
  },
  {
    id: 'mine-sundargarh-001',
    name: 'Sundargarh Iron Demo (Odisha)',
    coordinates: [84.05, 22.12],
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [84.04, 22.11], [84.06, 22.11], [84.06, 22.13], [84.04, 22.13], [84.04, 22.11]
      ]]
    },
    district: 'Sundargarh',
    state: 'Odisha',
    tehsil: 'Koira',
    mineral: 'Iron Ore',
    miningType: 'OPEN_CAST',
    operationalStatus: 'INACTIVE',
    areaSqm: 4000000,
    incidentCount: 0,
    analyticalRiskIndicator: 45,
    dataSource: 'demo',
    lastUpdated: '2026-08-31T00:00:00Z',
    isSynthetic: true,
    // Note: No underground network for this open cast mine.
  }
];

import { MAHARERA_PARCELS, MAHARERA_BUILDINGS, MAHARERA_UNITS } from './maharera';
import { applyReraMetadataToBuildings } from './rera-matcher';

export const SAMPLE_PARCELS: Parcel[] = [..._SAMPLE_PARCELS, ...MAHARERA_PARCELS];

const baseBuildings = [..._SAMPLE_BUILDINGS, ...MAHARERA_BUILDINGS];
export const SAMPLE_BUILDINGS: Building[] = applyReraMetadataToBuildings(baseBuildings, SAMPLE_PARCELS);

export const SAMPLE_VERTICAL_UNITS: VerticalUnit[] = [..._SAMPLE_VERTICAL_UNITS, ...MAHARERA_UNITS];

// ============================================================================
// NEW LAYERS: Amenities, Elevated Corridors, Regulated Boundaries
// ============================================================================

import { PublicFeature, ElevatedCorridor, RegulatedBoundary } from '@sih/shared-types';

export const SAMPLE_PUBLIC_AMENITIES: PublicFeature[] = [
  {
    id: 'pub-lilavati-hospital',
    category: 'hospital',
    name: 'Lilavati Hospital and Research Centre',
    operator: 'Lilavati Kirtilal Mehta Medical Trust',
    capacity: 323, // verified bed count
    geometry: { type: 'Point', coordinates: [72.8286, 19.0505] },
    dataSource: 'verified',
    sourceName: 'OpenStreetMap'
  },
  {
    id: 'pub-jio-garden',
    category: 'park',
    name: 'Jio World Garden',
    geometry: { type: 'Point', coordinates: [72.8631, 19.0573] },
    dataSource: 'verified',
    sourceName: 'OpenStreetMap'
  },
  {
    id: 'pub-dais-school',
    category: 'school',
    name: 'Dhirubhai Ambani International School',
    geometry: { type: 'Point', coordinates: [72.8684, 19.0620] },
    dataSource: 'verified',
    sourceName: 'OpenStreetMap'
  },
  {
    id: 'pub-bkc-parking',
    category: 'parking',
    name: 'BKC Public Parking',
    geometry: { type: 'Point', coordinates: [72.8665, 19.0610] },
    dataSource: 'verified',
    sourceName: 'OpenStreetMap'
  }
];

export const SAMPLE_ELEVATED_CORRIDORS: ElevatedCorridor[] = [
  {
    id: 'corr-metro-2a',
    corridorType: 'metro',
    lineName: 'Mumbai Metro Line 2A',
    verticalPosition: 'elevated',
    status: 'operational',
    operator: 'MMMOCL',
    heightAboveGroundM: 12.5,
    geometry: {
      type: 'LineString',
      coordinates: [
        [72.8640, 19.2550], // Dahisar East
        [72.8530, 19.2300], // Borivali West (Don Bosco)
        [72.8390, 19.1670], // Goregaon West
        [72.8330, 19.1230]  // Andheri West
      ]
    },
    stations: [
      { id: 'stn-dahisar-e', name: 'Dahisar East', corridorId: 'corr-metro-2a', geometry: { type: 'Point', coordinates: [72.8640, 19.2550] } },
      { id: 'stn-andheri-w', name: 'Andheri West', corridorId: 'corr-metro-2a', geometry: { type: 'Point', coordinates: [72.8330, 19.1230] }, interchangeWith: ['corr-metro-1'] }
    ],
    dataSource: 'demo',
    sourceName: 'Manual Digitization (Proxy)'
  }
];

export const SAMPLE_REGULATED_BOUNDARIES: RegulatedBoundary[] = [
    {
    id: 'reg-sgnp-esz',
    boundaryType: 'eco_sensitive_zone',
    name: 'Sanjay Gandhi National Park',
    notifyingAuthority: 'MoEFCC',
    notificationDate: '2016-12-05',
    restrictions: 'Prohibits commercial mining, saw mills, and polluting industries. Regulates tree felling and major construction.',
    geometry: {
      type: 'MultiPolygon',
      coordinates: [[[[72.8656894,19.1815605],[72.8660595,19.1814389],[72.8662848,19.1804003],[72.8659952,19.1796251],[72.8671217,19.1792299],[72.8670412,19.1799341],[72.8675508,19.1801824],[72.8681356,19.179392],[72.8683662,19.1796301],[72.867583,19.1807144],[72.8676742,19.1810488],[72.8689402,19.1805979],[72.8690261,19.1808208],[72.8691709,19.1808461],[72.8693372,19.1801571],[72.8698039,19.1800101],[72.8701258,19.1808765],[72.8707051,19.180912],[72.87144,19.1810893],[72.8714937,19.182052],[72.8722233,19.1821178],[72.8692827,19.1830395],[72.868653,19.1869047],[72.8692596,19.1878402],[72.8706187,19.1869555],[72.8709104,19.1852803],[72.8732776,19.1839729],[72.8734083,19.1815785],[72.8727382,19.1818544],[72.872749,19.1810944],[72.8720033,19.1798277],[72.8724486,19.1799443],[72.8725934,19.1794123],[72.873677,19.1790728],[72.8734941,19.180708],[72.8734236,19.1814236],[72.873577,19.1814315],[72.8752939,19.1814948],[72.8785747,19.1816163],[72.8812354,19.1816305],[72.8860428,19.1817943],[72.8893431,19.1819031],[72.8899723,19.1688681],[72.8921842,19.169309],[72.8893196,19.1626813],[72.8906822,19.1630765],[72.8913581,19.1636947],[72.8921735,19.1639582],[72.8922325,19.1636339],[72.8923023,19.1632691],[72.8929058,19.1632184],[72.8941637,19.1636466],[72.8943193,19.1636947],[72.8962827,19.1637454],[72.8974736,19.1642014],[72.8995871,19.1658027],[72.9003596,19.1650426],[72.8973555,19.1587998],[72.8935039,19.1539047],[72.8930962,19.1525973],[72.8929138,19.1507021],[72.8949094,19.1474689],[72.895199,19.1449452],[72.8958857,19.1448337],[72.8956604,19.1444385],[72.8949737,19.1445094],[72.8940296,19.1425938],[72.8934502,19.1424519],[72.8934932,19.1421884],[72.8942335,19.1421073],[72.8943837,19.1426039],[72.8951132,19.1426141],[72.8950488,19.1435161],[72.8962827,19.144479],[72.895993,19.1468507],[72.8956175,19.1477325],[72.8956818,19.1483507],[72.8960574,19.1483406],[72.8960574,19.1480162],[72.8967333,19.1476007],[72.8971517,19.1476159],[72.8973448,19.147996],[72.8979349,19.1479605],[72.8984284,19.1485331],[72.8997105,19.1485331],[72.8993136,19.1474841],[72.8987503,19.1467341],[72.8988093,19.1459689],[72.8994745,19.1454419],[72.8999197,19.1462375],[72.9011482,19.1468659],[72.9010034,19.148148],[72.9011911,19.1484673],[72.9012555,19.1498051],[72.9010677,19.1503473],[72.9001558,19.1511936],[72.8992063,19.151295],[72.8984874,19.1516243],[72.8983694,19.1521666],[72.8978491,19.1524757],[72.8977042,19.1529368],[72.8979027,19.1532459],[72.8989702,19.1536007],[72.8995764,19.1531547],[72.899732,19.1534993],[72.8994584,19.154148],[72.8984713,19.1545331],[72.9007888,19.1551209],[72.9023766,19.1585667],[72.9022693,19.1589518],[72.9033208,19.1606747],[72.9013896,19.1624989],[72.9013252,19.1639785],[72.9010463,19.1641204],[72.9023122,19.1670593],[72.9059171,19.1680322],[72.909522,19.1736666],[72.9098224,19.1774363],[72.9119682,19.1808006],[72.9169679,19.1804053],[72.9196608,19.1794629],[72.918266,19.1749231],[72.9198003,19.1728052],[72.9223323,19.1729674],[72.9233301,19.1727039],[72.9240703,19.1716196],[72.9243922,19.1695168],[72.9230672,19.1689695],[72.9226434,19.1681842],[72.9250199,19.1676977],[72.9258889,19.1682652],[72.9250628,19.1685591],[72.9257816,19.1701805],[72.9263341,19.1705048],[72.926361,19.170672],[72.927171,19.1709811],[72.92804,19.1709862],[72.9284799,19.1713206],[72.928555,19.1717918],[72.9287964,19.1721161],[72.9287535,19.1712649],[72.9281151,19.1697701],[72.9277557,19.1689847],[72.9279864,19.1675305],[72.9276752,19.1665171],[72.9282224,19.166056],[72.9284531,19.1662055],[72.9285698,19.1661383],[72.9287709,19.1662612],[72.9289681,19.166279],[72.9294938,19.1659344],[72.9295582,19.1661016],[72.9296547,19.1666641],[72.9304155,19.1671791],[72.9304257,19.1675801],[72.9305544,19.1681284],[72.9306336,19.1684183],[72.9306755,19.1690695],[72.9308456,19.1695801],[72.9310012,19.1699626],[72.9310923,19.1706138],[72.9312532,19.1712395],[72.9312681,19.1713055],[72.9312667,19.1716398],[72.9315391,19.1717472],[72.9316878,19.1716943],[72.931893,19.1719539],[72.9322967,19.1725873],[72.9323131,19.1726038],[72.9323301,19.1726273],[72.9326856,19.1730535],[72.9328466,19.1734006],[72.9330285,19.1737796],[72.9332435,19.1740668],[72.9334279,19.1742213],[72.9334688,19.1743025],[72.9338255,19.1747737],[72.9336822,19.1749673],[72.9339163,19.1750801],[72.9339874,19.1750959],[72.934413,19.175288],[72.9344881,19.1754425],[72.9346839,19.175559],[72.9349869,19.1762278],[72.9349762,19.1764178],[72.9348153,19.176661],[72.9348099,19.1768536],[72.9348797,19.1769955],[72.9357594,19.1765597],[72.9369932,19.1779683],[72.9368231,19.1786533],[72.9367152,19.1792051],[72.9365542,19.1797906],[72.9380597,19.18012],[72.9384662,19.1808534],[72.9381705,19.1809014],[72.9379126,19.1812169],[72.9374343,19.1820411],[72.9371196,19.182929],[72.9371488,19.183344],[72.9368237,19.184062],[72.9372293,19.1843851],[72.9375645,19.184945],[72.9384068,19.184945],[72.9394404,19.1849512],[72.9395069,19.1850788],[72.9396516,19.1853463],[72.9399168,19.1858367],[72.9399759,19.1861863],[72.9399678,19.1864624],[72.9400671,19.186817],[72.9393291,19.1868248],[72.9394412,19.1871562],[72.9395913,19.1877242],[72.9397643,19.188349],[72.940049,19.1883886],[72.9406893,19.1885305],[72.9409683,19.1896795],[72.9411721,19.1899582],[72.9414967,19.190632],[72.9422504,19.1908625],[72.9426903,19.1913869],[72.942347,19.1919872],[72.9423416,19.1926762],[72.9426205,19.193492],[72.9426848,19.1937148],[72.9428807,19.1953183],[72.9426044,19.1956096],[72.9426312,19.196866],[72.9423577,19.1973219],[72.942524,19.1983402],[72.9413223,19.199475],[72.9417247,19.2009948],[72.9417729,19.2013495],[72.9438275,19.2032948],[72.9441279,19.2034569],[72.9446483,19.2044194],[72.944659,19.2052756],[72.9447609,19.2065471],[72.945866,19.2064914],[72.9487896,19.2055035],[72.9496425,19.2053921],[72.950753,19.2049361],[72.9537409,19.2042776],[72.9538053,19.204465],[72.952542,19.2048981],[72.9522362,19.2050957],[72.9515348,19.2051882],[72.9509488,19.2052426],[72.9504633,19.2053237],[72.9497353,19.2057306],[72.9497766,19.2060354],[72.9498571,19.2069827],[72.9495621,19.2070537],[72.9496103,19.2075045],[72.9488218,19.2076616],[72.9485857,19.2081377],[72.9485018,19.2089591],[72.9484772,19.2091993],[72.9485777,19.2094916],[72.9483162,19.2095118],[72.9480453,19.2093611],[72.9474217,19.2094447],[72.9470783,19.2094383],[72.946322,19.2094244],[72.9465929,19.2108327],[72.9468772,19.2120004],[72.946507,19.2121017],[72.9465312,19.2122739],[72.9465875,19.2125753],[72.9465306,19.2126852],[72.9464479,19.2128447],[72.9462931,19.21324],[72.9463541,19.2138974],[72.9466472,19.2145067],[72.9476966,19.2160978],[72.9491947,19.2192707],[72.9493938,19.2196431],[72.9499849,19.2205549],[72.9504645,19.2206215],[72.9514316,19.219353],[72.9519412,19.2187097],[72.9526332,19.2187198],[72.9525547,19.2188648],[72.9525045,19.2192618],[72.9525769,19.2195936],[72.9528558,19.2199659],[72.952652,19.2202293],[72.953226,19.220827],[72.9538,19.2208574],[72.9537731,19.2214349],[72.9550391,19.22261],[72.9555327,19.2229568],[72.9563695,19.2234154],[72.9565573,19.2235015],[72.9569349,19.2234984],[72.9573176,19.2236789],[72.9575689,19.22371],[72.9576918,19.2237105],[72.9577911,19.2241588],[72.9578716,19.2243867],[72.9579507,19.2245614],[72.9579869,19.2247679],[72.9580277,19.225148],[72.9580419,19.2255352],[72.9582363,19.2255428],[72.9582372,19.2256036],[72.9582559,19.2264773],[72.9582725,19.2265331],[72.9583214,19.2265721],[72.9583892,19.2265837],[72.9584664,19.2265637],[72.9591226,19.2262715],[72.959478,19.2263334],[72.9597607,19.226724],[72.9614255,19.2295165],[72.9618844,19.230533],[72.9636268,19.2310927],[72.9632125,19.23167],[72.9623991,19.2322693],[72.9627277,19.2334762],[72.9620611,19.233718],[72.9581237,19.2340725],[72.9609346,19.2408797],[72.9560852,19.2418319],[72.9552698,19.2425207],[72.9496117,19.2452073],[72.9496694,19.2461672],[72.9487252,19.2466534],[72.9491651,19.2471497],[72.9493689,19.2482032],[72.9498196,19.2490844],[72.9502702,19.2487299],[72.9496479,19.2473726],[72.9498088,19.2467243],[72.9505491,19.2463192],[72.9511607,19.2483551],[72.9516971,19.2486286],[72.9515684,19.2496618],[72.9528022,19.2530144],[72.9524267,19.2551718],[72.9520833,19.2553035],[72.9514289,19.2547161],[72.9484033,19.2478892],[72.9489398,19.2472814],[72.9483819,19.2468763],[72.9483604,19.2461571],[72.9488432,19.2460963],[72.94884,19.2455737],[72.9479313,19.2460052],[72.947545,19.2525688],[72.9468584,19.2549794],[72.9453349,19.2560733],[72.9446053,19.2574305],[72.9419231,19.259436],[72.9390263,19.2595372],[72.9369664,19.2588283],[72.9359364,19.2633455],[72.9356575,19.2683082],[72.9352927,19.2729062],[72.9311299,19.2755191],[72.929585,19.2800156],[72.9276001,19.2837322],[72.9259586,19.2852208],[72.9241669,19.288836],[72.9223645,19.28835],[72.9205298,19.2880765],[72.9166353,19.2878538],[72.9125583,19.2879044],[72.9109383,19.2874183],[72.9108095,19.2870132],[72.9111099,19.2870234],[72.9103053,19.284441],[72.9117644,19.2825473],[72.9118395,19.2812105],[72.913481,19.279651],[72.9172683,19.2791851],[72.9180193,19.2799345],[72.9178262,19.280532],[72.9185557,19.2809067],[72.9186308,19.2815144],[72.9188669,19.2815346],[72.9196072,19.2813219],[72.9199505,19.2798535],[72.9205835,19.2790636],[72.9214954,19.2788509],[72.9218066,19.2790535],[72.9214311,19.2800662],[72.9221713,19.280532],[72.922107,19.281089],[72.9223215,19.281089],[72.9227185,19.2814739],[72.9232335,19.2815245],[72.9235339,19.2811194],[72.9242206,19.2811397],[72.9242635,19.2814941],[72.9251325,19.2815447],[72.9252398,19.2808662],[72.9254436,19.2808561],[72.9254436,19.2805118],[72.9267096,19.2809574],[72.9268599,19.2806941],[72.9270101,19.2803801],[72.9273319,19.2805624],[72.9277396,19.2806029],[72.9278254,19.2799649],[72.928201,19.2797472],[72.9290378,19.2797624],[72.9290432,19.2795953],[72.9286623,19.2794282],[72.9283082,19.2792206],[72.9284263,19.2781775],[72.9286945,19.2781218],[72.9282814,19.277028],[72.9287052,19.2766432],[72.9284853,19.2762229],[72.9276484,19.2767191],[72.9275787,19.27639],[72.9271603,19.2762482],[72.9261357,19.2762432],[72.9257762,19.2765318],[72.9253793,19.2761267],[72.9253685,19.2756912],[72.9249448,19.2754735],[72.9251808,19.2751443],[72.9248536,19.2746228],[72.9247087,19.2747544],[72.9243815,19.2747696],[72.9242527,19.2749671],[72.9241133,19.2749215],[72.9235339,19.2742632],[72.9235661,19.2736961],[72.9239523,19.2728758],[72.9248321,19.2727239],[72.9245102,19.2724302],[72.9246819,19.2721061],[72.9244888,19.2719238],[72.924242,19.2723086],[72.9240703,19.2722479],[72.9238021,19.2727745],[72.923212,19.2728758],[72.9232013,19.273686],[72.922976,19.2736961],[72.9230297,19.2740607],[72.9223537,19.2749924],[72.9219139,19.2750026],[72.9218924,19.2752051],[72.922343,19.2754785],[72.9211306,19.2780813],[72.9208517,19.2782534],[72.9202616,19.2774331],[72.9196286,19.277423],[72.919178,19.2786383],[72.9176438,19.2769875],[72.917794,19.275195],[72.9180944,19.2739189],[72.9188239,19.2733518],[72.9188561,19.2730176],[72.9201221,19.2729872],[72.9203796,19.2723491],[72.9203796,19.2714073],[72.9199934,19.2712047],[72.9203904,19.2700704],[72.9208088,19.2700704],[72.9217851,19.2697463],[72.9232228,19.2679638],[72.9218066,19.2676195],[72.9224503,19.2673156],[72.9226327,19.2664345],[72.9219568,19.2655129],[72.920047,19.2649153],[72.918781,19.2632138],[72.9180622,19.2632037],[72.9179013,19.2637202],[72.9183197,19.264652],[72.9177511,19.2675486],[72.9168498,19.2682069],[72.9163778,19.2681158],[72.9163027,19.2675081],[72.9160774,19.2674574],[72.9160237,19.2679132],[72.9156053,19.2679537],[72.9156053,19.2683082],[72.9149508,19.2681563],[72.9148328,19.2672144],[72.9139423,19.2670321],[72.9139745,19.2677613],[72.9135561,19.2677511],[72.9134488,19.2681056],[72.9124832,19.2684095],[72.9125154,19.2690475],[72.9122257,19.2698071],[72.911464,19.2706376],[72.9103374,19.2708199],[72.9101658,19.2714883],[72.9113245,19.2729467],[72.9117107,19.2727846],[72.9118628,19.27333],[72.9103803,19.2756811],[72.9040718,19.2711237],[72.9032993,19.2732303],[72.9003596,19.2724403],[72.8989219,19.2766533],[72.8958213,19.2804713],[72.8957999,19.2811498],[72.8940725,19.28436],[72.8926885,19.285717],[72.8926027,19.2868816],[72.8916585,19.2904462],[72.8920662,19.2913474],[72.8904354,19.2926233],[72.8896308,19.2916107],[72.8904033,19.2908411],[72.8924203,19.2858284],[72.8904354,19.2861829],[72.8906608,19.2856563],[72.890414,19.2843803],[72.890017,19.2841372],[72.8899205,19.2826587],[72.8918624,19.2824967],[72.8912723,19.2792763],[72.8933966,19.2791446],[72.8932893,19.2775952],[72.8930533,19.2764811],[72.8945017,19.276309],[72.8955531,19.2760659],[72.8961646,19.2757216],[72.8962934,19.2753773],[72.8967011,19.2752659],[72.8972483,19.2736151],[72.8976238,19.2718529],[72.898407,19.2720656],[72.8986806,19.2675891],[72.8982085,19.2672701],[72.8975487,19.2671992],[72.8973073,19.2670574],[72.8972858,19.264176],[72.8970605,19.2630771],[72.8970551,19.2613249],[72.8971302,19.2607222],[72.8967655,19.2601247],[72.896921,19.2597094],[72.8969264,19.2593093],[72.8966153,19.2590612],[72.8964758,19.2579217],[72.8965938,19.2576483],[72.8962612,19.2573343],[72.8937614,19.2593093],[72.8936166,19.2594815],[72.8931391,19.2597094],[72.8931606,19.260307],[72.8926724,19.2605956],[72.8925598,19.2611831],[72.8920448,19.2613654],[72.8907198,19.2613806],[72.8905535,19.2616642],[72.8894001,19.262915],[72.8890729,19.263386],[72.8882575,19.2639481],[72.8881073,19.2650976],[72.8880322,19.2660243],[72.8879678,19.2667384],[72.8873831,19.2669308],[72.8871739,19.2672853],[72.8869539,19.2672397],[72.8863048,19.2676499],[72.8860742,19.2681411],[72.8850818,19.2666776],[72.8842664,19.2666523],[72.8833598,19.2662978],[72.8831613,19.2670169],[72.8827858,19.2669916],[72.8829628,19.2663484],[72.8823996,19.266313],[72.8821474,19.2670827],[72.881155,19.2654977],[72.8814071,19.2639329],[72.8813106,19.2625048],[72.8806883,19.2603222],[72.8788322,19.2610869],[72.8780812,19.2618313],[72.8779417,19.2622668],[72.8773409,19.2622567],[72.878446,19.2610565],[72.8781509,19.2600664],[72.87711,19.2606271],[72.8764269,19.2609692],[72.8763807,19.2605399],[72.8761072,19.2604404],[72.8768141,19.2597215],[72.8773009,19.2592412],[72.8776541,19.2587862],[72.8779285,19.2580991],[72.8782317,19.2575988],[72.8783254,19.2573731],[72.8786543,19.2568068],[72.8787731,19.2567287],[72.8795151,19.2562616],[72.8798203,19.2560878],[72.8802656,19.2557367],[72.8807755,19.255225],[72.8811214,19.2548722],[72.8813989,19.2545677],[72.8818276,19.2542582],[72.8834231,19.2537973],[72.8838943,19.253679],[72.8848471,19.2532787],[72.8854856,19.252711],[72.8862754,19.2520177],[72.8885364,19.2498137],[72.8764236,19.2503607],[72.8752434,19.245286],[72.874428,19.2416597],[72.8732211,19.2365037],[72.8754687,19.2365442],[72.8776631,19.2389761],[72.8780536,19.239216],[72.8783748,19.2394185],[72.8783749,19.2394185],[72.8783756,19.2394189],[72.8784457,19.239463],[72.8791038,19.2399357],[72.879648,19.2403266],[72.8796821,19.2403483],[72.8803209,19.2407525],[72.8806434,19.2409556],[72.8806444,19.2409562],[72.8806453,19.2409568],[72.8806509,19.2409603],[72.880651,19.2409604],[72.8806511,19.2409604],[72.8808742,19.2411007],[72.8811638,19.2412859],[72.8814359,19.2414587],[72.8819945,19.2418109],[72.8819948,19.2418111],[72.8821672,19.2419195],[72.8824835,19.242116],[72.8824837,19.2421161],[72.8824845,19.2421166],[72.8824846,19.2421167],[72.8826872,19.2422424],[72.8865409,19.2392184],[72.8894377,19.237699],[72.8928065,19.2377192],[72.8949737,19.2356933],[72.8947806,19.2285009],[72.8950596,19.2221998],[72.8867984,19.2183298],[72.8863267,19.2158827],[72.8856159,19.2161182],[72.8853961,19.2161911],[72.884967,19.2163333],[72.8849663,19.2163335],[72.8845376,19.2164756],[72.8839396,19.2166798],[72.8839387,19.2166801],[72.8823469,19.2172237],[72.8820568,19.2173228],[72.8811391,19.2165296],[72.8809605,19.216375],[72.8806696,19.21613],[72.8795573,19.215193],[72.8793706,19.2149746],[72.8792989,19.2148906],[72.8791431,19.2147627],[72.8791428,19.2147624],[72.8788357,19.214555],[72.8787864,19.2145217],[72.8786498,19.2144293],[72.8799963,19.2121093],[72.883569,19.2048247],[72.8832042,19.2046828],[72.8839499,19.2030618],[72.8874635,19.1951283],[72.8918624,19.1973574],[72.891519,19.1985733],[72.8953385,19.1985733],[72.900027,19.2008125],[72.9009859,19.2010612],[72.9011084,19.2010882],[72.9021266,19.2013125],[72.9023193,19.201359],[72.9023194,19.201359],[72.9024395,19.2013881],[72.902426,19.2004908],[72.902426,19.2004907],[72.9024192,19.2000458],[72.9024181,19.1999788],[72.9024159,19.1998334],[72.9024144,19.1997347],[72.9024142,19.1997185],[72.9023974,19.1995234],[72.9023967,19.1994902],[72.9023927,19.1992988],[72.9023915,19.1992392],[72.9023904,19.1991881],[72.9023904,19.199188],[72.9023824,19.1988118],[72.9023738,19.1984624],[72.9023582,19.1978469],[72.9023576,19.1972512],[72.9021411,19.1970366],[72.9014686,19.19637],[72.9014686,19.1963699],[72.901331,19.1957988],[72.901331,19.1957987],[72.901258,19.1954958],[72.9011523,19.1950574],[72.9009368,19.194163],[72.9009071,19.1940318],[72.9006953,19.1930969],[72.9006824,19.1930205],[72.9006767,19.1930043],[72.9006397,19.1929004],[72.9006104,19.1927761],[72.900585,19.1926688],[72.9005391,19.1924744],[72.9004905,19.1922693],[72.9004614,19.1921468],[72.9004449,19.1920761],[72.9004449,19.192076],[72.9004365,19.1920407],[72.9004221,19.1919245],[72.9004029,19.1918361],[72.9003913,19.1917954],[72.9003718,19.1917278],[72.9003416,19.1916325],[72.9003398,19.1916232],[72.9003226,19.1915367],[72.9003172,19.1913648],[72.9003047,19.1911311],[72.90026,19.190824],[72.9002553,19.1907036],[72.9002517,19.1906215],[72.9002456,19.1904906],[72.900239,19.1904437],[72.9002302,19.1903827],[72.9002282,19.1903264],[72.9002264,19.1902828],[72.9002221,19.190215],[72.9002177,19.1901491],[72.9002074,19.1901484],[72.900197,19.1901474],[72.9001913,19.1900026],[72.9001935,19.1898526],[72.9001857,19.1897603],[72.9001857,19.1897601],[72.9001738,19.1896245],[72.9001613,19.1895422],[72.9001569,19.1893844],[72.900153,19.1893597],[72.9001524,19.1893563],[72.9001487,19.1893349],[72.9001827,19.1856968],[72.9001882,19.1851018],[72.8973907,19.1892042],[72.8973904,19.1892044],[72.8973668,19.1892231],[72.8973648,19.1892246],[72.8973646,19.1892248],[72.8973646,19.1892249],[72.8973373,19.1892456],[72.8973362,19.1892464],[72.8970505,19.1894636],[72.8970381,19.1894731],[72.8961793,19.1901424],[72.896104,19.1902011],[72.8956751,19.1905407],[72.8956748,19.1905407],[72.8956745,19.1905408],[72.8956676,19.1905413],[72.8944969,19.1906301],[72.8943005,19.1906452],[72.8941652,19.1906646],[72.8940371,19.190683],[72.894037,19.190683],[72.8924341,19.1910663],[72.8920067,19.1911061],[72.891081,19.1911927],[72.8878406,19.1922339],[72.8878214,19.1922401],[72.8877289,19.1922698],[72.8876686,19.1922892],[72.887576,19.1923189],[72.8872545,19.1924222],[72.8871415,19.1924585],[72.8871129,19.1924677],[72.887081,19.192478],[72.8870364,19.1924777],[72.8858588,19.19247],[72.8856478,19.1924686],[72.8855747,19.1924682],[72.8847443,19.192463],[72.8827839,19.1924557],[72.88275,19.1924601],[72.8807251,19.1927249],[72.8788411,19.1929713],[72.8788389,19.1929716],[72.8784562,19.1929286],[72.8784166,19.1929242],[72.8774167,19.1928117],[72.8769661,19.1928422],[72.8768011,19.1928534],[72.87672,19.1928589],[72.8767068,19.1928603],[72.8767006,19.1928626],[72.8765601,19.1929154],[72.8765417,19.1929223],[72.8765152,19.1929282],[72.874707,19.1906345],[72.8747982,19.1902292],[72.8746211,19.1892008],[72.8741652,19.1886739],[72.873559,19.1885016],[72.8721267,19.1890538],[72.8711128,19.1890893],[72.8707963,19.189145],[72.8698254,19.1906751],[72.8699487,19.1912425],[72.8695518,19.1912628],[72.869305,19.1907207],[72.8690743,19.1907561],[72.8689456,19.1910297],[72.8679424,19.1911158],[72.8678781,19.1908524],[72.8675026,19.1908524],[72.8675026,19.1902647],[72.866832,19.190209],[72.8667784,19.1899455],[72.8680658,19.1896567],[72.8676957,19.1887499],[72.8677386,19.1882635],[72.8674167,19.1869006],[72.8670144,19.1869969],[72.8668642,19.1863281],[72.8664458,19.1864142],[72.8668106,19.1857303],[72.8669554,19.184646],[72.865845,19.1844637],[72.8660166,19.1833085],[72.8657699,19.1831616],[72.8656894,19.1815605]],[[72.9385892,19.2362859],[72.9386562,19.2371393],[72.9386562,19.2374989],[72.938744,19.2380452],[72.9400234,19.2378755],[72.9403031,19.2389956],[72.9403943,19.2396135],[72.9405659,19.2403479],[72.9409468,19.2411076],[72.9416281,19.2422472],[72.9410541,19.2421332],[72.9411319,19.2427638],[72.9413599,19.2434627],[72.9415979,19.2437734],[72.9421887,19.244468],[72.9427466,19.2452328],[72.9438597,19.2455595],[72.9444444,19.2444149],[72.9456139,19.2458735],[72.9453756,19.2466492],[72.9455917,19.2468046],[72.945992,19.2465167],[72.9463139,19.246466],[72.9464963,19.2461875],[72.946668,19.2458076],[72.9469228,19.2455341],[72.9474243,19.2454607],[72.9477006,19.2450884],[72.9482648,19.2440515],[72.9477838,19.2431841],[72.9477489,19.2416748],[72.9480171,19.2412849],[72.948693,19.2398465],[72.9493555,19.2399705],[72.9496291,19.2392893],[72.9498437,19.239026],[72.9500824,19.2390462],[72.9499939,19.238717],[72.9502675,19.2384106],[72.9505957,19.2381257],[72.9507878,19.23778],[72.9517186,19.2366708],[72.9513538,19.2360326],[72.9521906,19.2353286],[72.9521682,19.2352575],[72.9520243,19.2348018],[72.9520351,19.2344777],[72.9519793,19.2344649],[72.951327,19.2343156],[72.9513216,19.2339965],[72.9515147,19.2336698],[72.9518098,19.233024],[72.9512787,19.2329227],[72.9509085,19.233019],[72.9505679,19.2329379],[72.9505357,19.2328949],[72.9506537,19.2326745],[72.9508388,19.2324542],[72.9511177,19.2319351],[72.9512206,19.2308853],[72.9496801,19.2301319],[72.948221,19.2301319],[72.9484284,19.2293025],[72.9483497,19.2288251],[72.9487628,19.2277513],[72.9492134,19.2276905],[72.9492027,19.2262925],[72.9488754,19.2264242],[72.9484194,19.2254821],[72.9484624,19.2252642],[72.9501817,19.2258442],[72.9501146,19.2238586],[72.9502997,19.2232432],[72.9497186,19.2229153],[72.9489236,19.2226278],[72.9486796,19.2224809],[72.9485938,19.2223466],[72.9485106,19.2223517],[72.9483417,19.2221922],[72.9483069,19.2221009],[72.9476094,19.2216856],[72.9470354,19.2215565],[72.9462978,19.2213538],[72.9458418,19.2213184],[72.9456407,19.22125],[72.945528,19.2220782],[72.9453349,19.223304],[72.9450157,19.2247831],[72.9449299,19.225553],[72.9451793,19.2269485],[72.944836,19.2276753],[72.9447448,19.2281109],[72.9446673,19.2282435],[72.944203,19.2290378],[72.9436612,19.2305219],[72.9429746,19.2304181],[72.9425635,19.2309086],[72.9420894,19.2326011],[72.9417086,19.2326517],[72.9409066,19.233181],[72.9404533,19.2332874],[72.9400831,19.2330797],[72.9400609,19.2331854],[72.9400429,19.2333254],[72.9397827,19.2343511],[72.939139,19.2363542],[72.9385892,19.2362859]]],[[[72.897377,19.334045],[72.898128,19.3286388],[72.8987288,19.3223415],[72.8989863,19.3194458],[72.8995442,19.3177651],[72.9036426,19.3176234],[72.9042434,19.3163274],[72.9057884,19.3164894],[72.9061532,19.3162059],[72.9074192,19.3172589],[72.907741,19.3172791],[72.9076338,19.3168336],[72.9070329,19.3159831],[72.9083204,19.3115079],[72.908535,19.3099081],[72.9084062,19.3092803],[72.9069257,19.3109004],[72.9060673,19.3133709],[72.9052305,19.3138772],[72.9045868,19.3158414],[72.9030204,19.3165299],[72.9009819,19.3159224],[72.90066,19.3153352],[72.8999305,19.3149099],[72.899909,19.3124596],[72.9005742,19.3098271],[72.9045868,19.3053112],[72.9072046,19.302233],[72.9097366,19.2940714],[72.9105949,19.2915601],[72.9111743,19.290912],[72.9113459,19.2901626],[72.9168606,19.2900614],[72.9185343,19.2909727],[72.9211092,19.2912765],[72.9223752,19.2916006],[72.9248643,19.2914183],[72.9271602,19.2915196],[72.9307437,19.2909727],[72.9331469,19.289069],[72.934885,19.289636],[72.9367518,19.2893728],[72.9370093,19.2916208],[72.9365372,19.2956511],[72.9361939,19.2981016],[72.9363656,19.299256],[72.9383826,19.3012204],[72.9384255,19.3022532],[72.9387688,19.3028405],[72.9390692,19.3030633],[72.9378676,19.3080248],[72.9372883,19.3087741],[72.9371595,19.3161249],[72.9363656,19.3170159],[72.9355716,19.3200938],[72.9359793,19.3211468],[72.9335117,19.3225642],[72.9335332,19.3248928],[72.9319024,19.3302586],[72.9307222,19.3310281],[72.9300785,19.331109],[72.9288125,19.3308256],[72.928791,19.3305623],[72.928791,19.3300764],[72.9289841,19.328983],[72.9281473,19.328983],[72.9277825,19.3276669],[72.9279113,19.3262495],[72.9279327,19.3236576],[72.9270744,19.3232324],[72.9260015,19.3230097],[72.9257011,19.3239614],[72.9245424,19.3246498],[72.9244351,19.3263305],[72.9239201,19.3277479],[72.9232979,19.3299954],[72.9230189,19.331676],[72.922461,19.3335185],[72.9194784,19.3328504],[72.9166889,19.3360697],[72.9133844,19.3419211],[72.9104447,19.3411315],[72.9106164,19.3400179],[72.9103374,19.3397749],[72.9091573,19.3405848],[72.9073763,19.3404633],[72.9079985,19.3388841],[72.9079342,19.3376692],[72.9103803,19.3329313],[72.9101443,19.3313115],[72.9107237,19.3291045],[72.9110884,19.3286185],[72.9110884,19.3279301],[72.9106807,19.3279098],[72.910788,19.3272821],[72.9110455,19.3271809],[72.9111314,19.3262292],[72.909286,19.3273024],[72.9079127,19.328902],[72.9082346,19.3294285],[72.9078269,19.3302181],[72.9073119,19.3320809],[72.9059601,19.3329718],[72.9048013,19.3331743],[72.9025268,19.3345512],[72.9017973,19.3353408],[72.897377,19.334045]]],[[[72.9019394,19.1421985],[72.9019828,19.1412641],[72.9020737,19.1412631],[72.9020738,19.1412631],[72.9026268,19.1412578],[72.9030717,19.1412488],[72.9030994,19.1412484],[72.9030995,19.1412484],[72.903479,19.1412429],[72.9034791,19.1412429],[72.9037944,19.1412376],[72.9042759,19.1411031],[72.9045679,19.1410279],[72.9047954,19.1409724],[72.9047987,19.1418437],[72.9046565,19.1419806],[72.9042703,19.1420237],[72.9039538,19.1422238],[72.9036614,19.142087],[72.9031008,19.1414687],[72.9026985,19.1413192],[72.9024973,19.1414561],[72.9025242,19.1423556],[72.9023579,19.1426166],[72.9020414,19.1426191],[72.9019394,19.1421985]]],[[[72.906162,19.139676],[72.9073623,19.1393252],[72.9070825,19.1400482],[72.9069603,19.1402608],[72.9066283,19.1403047],[72.9065427,19.1401848],[72.9064488,19.1400501],[72.9064381,19.1399501],[72.9062005,19.139726],[72.906162,19.139676]]],[[[72.9094684,19.1407592],[72.9098527,19.1399783],[72.9099414,19.1400041],[72.9099884,19.1400118],[72.9100302,19.1400265],[72.9101437,19.1401154],[72.9103264,19.1402577],[72.9107316,19.1405939],[72.9113536,19.1403958],[72.9116866,19.1402909],[72.9118345,19.1402444],[72.9122238,19.1403405],[72.9123865,19.1403741],[72.9127223,19.1404485],[72.9127655,19.1406388],[72.9128131,19.1408664],[72.9128756,19.1411686],[72.9130853,19.141202],[72.9135352,19.1412714],[72.9139208,19.1417947],[72.9142765,19.1417495],[72.9143668,19.1417367],[72.9145429,19.1417112],[72.9151463,19.141631],[72.91525,19.1416032],[72.9152902,19.1415919],[72.9155468,19.1415196],[72.9155913,19.1415064],[72.9156198,19.141498],[72.9159247,19.1414078],[72.9162581,19.1413092],[72.9168074,19.1413337],[72.9171247,19.1413403],[72.9176846,19.1414102],[72.9177194,19.1414098],[72.9181294,19.1414049],[72.9184463,19.1408699],[72.9188743,19.1415068],[72.9191923,19.1419544],[72.9196391,19.1425966],[72.9206669,19.1440631],[72.9208603,19.1440699],[72.9216426,19.144613],[72.9221558,19.1453082],[72.9223786,19.1455317],[72.9226134,19.1457522],[72.922755,19.146027],[72.9229651,19.1462978],[72.9231098,19.1467273],[72.9231621,19.1468784],[72.9232454,19.1470526],[72.9233389,19.1473364],[72.9233975,19.1475943],[72.9234383,19.1477258],[72.9235497,19.148147],[72.9236099,19.1483339],[72.9236783,19.1486755],[72.9236791,19.1486775],[72.9236792,19.1486776],[72.9237111,19.1487504],[72.9238109,19.1490514],[72.9238273,19.1491534],[72.9239335,19.1493415],[72.9240463,19.1495315],[72.9240327,19.1499354],[72.9240295,19.1499937],[72.9240247,19.1502181],[72.9220748,19.1509453],[72.9216242,19.1495162],[72.9218173,19.1492933],[72.9220533,19.148746],[72.9209161,19.1480264],[72.9208302,19.1494554],[72.9205406,19.1496176],[72.9205191,19.1501345],[72.9203367,19.1501953],[72.9196286,19.1484825],[72.9191029,19.1482798],[72.9186523,19.1485737],[72.9183519,19.1486446],[72.9174077,19.1458675],[72.915777,19.1439418],[72.9150045,19.1443675],[72.9135668,19.1463034],[72.9122901,19.1462426],[72.9120004,19.1468203],[72.9120541,19.1473372],[72.9116785,19.1470939],[72.9114425,19.1473068],[72.9108846,19.146202],[72.910949,19.1438709],[72.9115498,19.1438709],[72.9113781,19.1428979],[72.9109919,19.1422999],[72.9105413,19.1429181],[72.910155,19.1428877],[72.9094684,19.1407592]]],[[[72.930851,19.2842284],[72.932117,19.2793067],[72.9332328,19.2793674],[72.9334688,19.2832765],[72.9340267,19.2852816],[72.9309368,19.2853018],[72.930851,19.2842284]]],[[[72.9598188,19.2537437],[72.9600334,19.2524573],[72.9615247,19.2507759],[72.9609024,19.2492363],[72.9605269,19.2457114],[72.9617178,19.2449922],[72.9622006,19.243017],[72.9618466,19.242784],[72.9651511,19.2411329],[72.9675221,19.2451644],[72.9707408,19.2449922],[72.9726505,19.2434526],[72.9746139,19.2419635],[72.9749465,19.2428853],[72.9749787,19.2444351],[72.9755258,19.2444756],[72.9755258,19.2449922],[72.9741633,19.2446782],[72.9736161,19.2473827],[72.973144,19.2476359],[72.9736054,19.2499758],[72.9729509,19.2501682],[72.9727471,19.2505126],[72.9713523,19.2498745],[72.9711056,19.2485273],[72.9701614,19.2464002],[72.9689276,19.2466332],[72.9661596,19.248031],[72.9666531,19.2494997],[72.9679406,19.2504417],[72.9687667,19.252275],[72.969507,19.2517483],[72.969743,19.2520522],[72.9703224,19.2516673],[72.9703545,19.2522142],[72.970022,19.2522345],[72.9699576,19.2524979],[72.9701936,19.2539361],[72.9694748,19.2542299],[72.9696572,19.2563569],[72.9699039,19.2564987],[72.9694319,19.2571267],[72.9698503,19.2575926],[72.9699039,19.2584434],[72.9697537,19.2591726],[72.9695928,19.2580787],[72.9682946,19.2573191],[72.9673612,19.255972],[72.9672646,19.2563771],[72.9674792,19.2571672],[72.967447,19.2575419],[72.9659128,19.2580889],[72.9654729,19.2581294],[72.9636598,19.2569038],[72.9618573,19.2558505],[72.9602909,19.2558403],[72.9598188,19.2537437]]]]
    },
    dataSource: 'verified',
    sourceName: 'OpenStreetMap (boundary=national_park)'
  }
];

