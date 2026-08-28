'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Building2, 
  Compass, 
  Layers, 
  Maximize2, 
  Sparkles, 
  Eye, 
  Sliders, 
  Hash, 
  Copy, 
  Check, 
  Navigation,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatUlpin3D, Building } from '@sih/shared-types';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { ClearanceTool } from './ClearanceTool';

export const MapLibre3DMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [currentPitch, setCurrentPitch] = useState<number>(45);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedBuildingInfo, setSelectedBuildingInfo] = useState<{
    id: string;
    height: number;
    minHeight: number;
    floors: number;
    ulpin3D: string;
    coordinates: [number, number];
    building: Building;
    buildingName: string;
    ownership: {
      ownerName: string;
      ownerType: string;
      buid: string;
      ctsNumber: string;
      ward: string;
      zone: string;
      propertyTaxId: string;
      useType: string;
      mahabhulekhLink: string;
      source: string;
    } | null;
    bmcData?: {
      sacNumber: string;
      usage: string;
      name: string;
      noOfFloorsStr: string;
      notFound?: boolean;
    } | null;
  } | null>(null);

  const [isFetchingBmc, setIsFetchingBmc] = useState(false);

  const [copied, setCopied] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground Floor');
  const [selectedUnit, setSelectedUnit] = useState<string>('101');
  const { layers, setActiveTab, setSelectedBuilding, flyToTarget, setFlyToTarget, activeUndergroundLayerIds, currentRole } = useAppStore();

  const drawRef = useRef<MapboxDraw | null>(null);
  const [footprintGeoJSON, setFootprintGeoJSON] = useState<any>(null);

  useEffect(() => {
    if (flyToTarget && mapRef.current && mapLoaded) {
      mapRef.current.flyTo({
        center: [flyToTarget.lng, flyToTarget.lat],
        zoom: flyToTarget.zoom || 16,
        pitch: flyToTarget.pitch || 60,
        bearing: flyToTarget.bearing || 0,
        essential: true,
        duration: 2500
      });
      // Clear the target after flying
      setFlyToTarget(null);
    }
  }, [flyToTarget, mapLoaded, setFlyToTarget]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const container = mapContainerRef.current;
    const rect = container.getBoundingClientRect();
    console.log('[MapLibre] Container dimensions:', rect.width, 'x', rect.height);
    if (rect.width === 0 || rect.height === 0) {
      console.error('[MapLibre] Container has zero dimensions! Map will not render.');
    }

    const tileUrl = `${window.location.origin}/api/tiles/{z}/{x}/{y}`;
    console.log('[MapLibre] Tile URL:', tileUrl);

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        preserveDrawingBuffer: true,
        style: {
          version: 8,
          name: 'Mumbai 3D Dark Cadastre',
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
          sources: {
            openmaptiles: {
              type: 'vector',
              tiles: [tileUrl],
              minzoom: 0,
              maxzoom: 14,
              bounds: [72.415, 18.466, 73.516, 19.5],
              attribution: '© OpenStreetMap contributors, OpenMapTiles, SIH 3D ULPIN'
            }
          },
          layers: [
            // Dark Background
            {
              id: 'background',
              type: 'background',
              paint: {
                'background-color': '#070b14'
              }
            },
            // Landcover
            {
              id: 'landcover',
              type: 'fill',
              source: 'openmaptiles',
              'source-layer': 'landcover',
              paint: {
                'fill-color': '#10b981',
                'fill-opacity': 0.5
              }
            },
            // Landuse
            {
              id: 'landuse',
              type: 'fill',
              source: 'openmaptiles',
              'source-layer': 'landuse',
              paint: {
                'fill-color': '#1e293b',
                'fill-opacity': 0.7
              }
            },
            // Water Bodies
            {
              id: 'water',
              type: 'fill',
              source: 'openmaptiles',
              'source-layer': 'water',
              paint: {
                'fill-color': '#3b82f6',
                'fill-opacity': 0.7
              }
            },
            // Waterways
            {
              id: 'waterway',
              type: 'line',
              source: 'openmaptiles',
              'source-layer': 'waterway',
              paint: {
                'line-color': '#10b981',
                'line-width': 2,
                'line-opacity': 0.8
              }
            },
            // Roads
            {
              id: 'transportation-roads',
              type: 'line',
              source: 'openmaptiles',
              'source-layer': 'transportation',
              paint: {
                'line-color': '#475569',
                'line-width': [
                  'interpolate', ['linear'], ['zoom'],
                  10, 0.8,
                  14, 2.5,
                  16, 6.0
                ],
                'line-opacity': 0.9
              }
            },
            // Primary Highways
            {
              id: 'transportation-primary',
              type: 'line',
              source: 'openmaptiles',
              'source-layer': 'transportation',
              paint: {
                'line-color': '#334155',
                'line-width': [
                  'interpolate', ['linear'], ['zoom'],
                  10, 1.5,
                  14, 4.0,
                  16, 9.0
                ]
              }
            },
            // 2D Building Footprint Base (visible at all zooms)
            {
              id: '2d-buildings-base',
              type: 'fill',
              source: 'openmaptiles',
              'source-layer': 'building',
              paint: {
                'fill-color': '#14b8a6',
                'fill-opacity': 0.65
              }
            },
            // 3D Building Extrusion Layer (Pitched at 45 Degrees)
            {
              id: '3d-buildings',
              type: 'fill-extrusion',
              source: 'openmaptiles',
              'source-layer': 'building',
              minzoom: 12,
              paint: {
                'fill-extrusion-color': [
                  'case',
                  ['has', 'render_height'],
                  [
                    'interpolate',
                    ['linear'],
                    ['get', 'render_height'],
                    0, '#0ea5e9',      // Cyan (Low-rise)
                    25, '#38bdf8',     // Sky Blue (Mid-rise)
                    60, '#818cf8',     // Indigo (High-rise)
                    120, '#c084fc',    // Purple (Skyscraper)
                    220, '#f43f5e',    // Coral Red (Supertall)
                    300, '#fbbf24'     // Golden Peak (Ultra-tall)
                  ],
                  '#38bdf8' // Default fallback building color
                ],
                'fill-extrusion-height': [
                  'case',
                  ['has', 'render_height'],
                  ['get', 'render_height'],
                  18 // Default height in meters if unspecified
                ],
                'fill-extrusion-base': [
                  'case',
                  ['has', 'render_min_height'],
                  ['get', 'render_min_height'],
                  0
                ],
                'fill-extrusion-opacity': 0.92
              }
            },
            // POI Labels (used to extract building/place names on click)
            {
              id: 'poi-labels',
              type: 'symbol',
              source: 'openmaptiles',
              'source-layer': 'poi',
              minzoom: 13,
              layout: {
                'text-field': ['get', 'name'],
                'text-size': 10,
                'text-anchor': 'top',
                'text-offset': [0, 0.5],
                'text-max-width': 8,
                'icon-optional': true,
              },
              paint: {
                'text-color': '#94a3b8',
                'text-halo-color': '#070b14',
                'text-halo-width': 1.5,
                'text-opacity': 0.75,
              }
            },
            // Place Labels (neighborhoods, suburbs)
            {
              id: 'place-labels',
              type: 'symbol',
              source: 'openmaptiles',
              'source-layer': 'place',
              minzoom: 10,
              layout: {
                'text-field': ['get', 'name'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 14, 14],
                'text-transform': 'uppercase',
                'text-letter-spacing': 0.1,
              },
              paint: {
                'text-color': '#64748b',
                'text-halo-color': '#070b14',
                'text-halo-width': 2,
              }
            }
          ]
        },
        center: [72.8280, 18.9960], // Worli & Lower Parel dense high-rise centroid
        zoom: 14.8,
        pitch: 45, // 45 Degrees Pitch!
        bearing: -17.5
      });

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.on('load', () => {
        setMapLoaded(true);
        if (currentRole === 'engineer') {
          const draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: { polygon: true, trash: true }
          });
          map.addControl(draw as any, 'top-right');
          drawRef.current = draw;

          const updateFootprint = () => {
            const data = draw.getAll();
            if (data.features.length > 0) {
              setFootprintGeoJSON(data.features[0].geometry);
            } else {
              setFootprintGeoJSON(null);
            }
          };

          map.on('draw.create', updateFootprint);
          map.on('draw.delete', updateFootprint);
          map.on('draw.update', updateFootprint);
        }
      });

      map.on('error', (e) => {
        console.warn('[MapLibre] Map warning/error event:', e);
      });

      // Click on 3D Building
      map.on('click', '3d-buildings', async (e) => {
        if (!e.features || e.features.length === 0) return;
        const f = e.features[0];
        const props = f.properties || {};
        const rawHeight = props.render_height || 32;
        const height = Math.min(rawHeight, 300);
        const minHeight = props.render_min_height || 0;
        const floors = Math.max(1, Math.min(Math.round(height / 3.8), 80));
        const lngLat = e.lngLat;
        const lng = parseFloat(lngLat.lng.toFixed(5));
        const lat = parseFloat(lngLat.lat.toFixed(5));

        // Step 1: Extract building name from nearby POI features
        const point = e.point;
        const nearbyPois = map.queryRenderedFeatures(
          [[point.x - 40, point.y - 40], [point.x + 40, point.y + 40]],
          { layers: ['poi-labels'] }
        );
        let buildingName = 'Unnamed Building';
        if (nearbyPois.length > 0) {
          const named = nearbyPois.find(p => p.properties?.name);
          if (named) buildingName = named.properties!.name;
        }
        // Also check building layer name property
        if (buildingName === 'Unnamed Building' && props.name) {
          buildingName = props.name;
        }

        // Geospatially encode coordinates into the 14-char ULPIN so search can fly back precisely
        const latStr = Math.round(lat * 1000000).toString(36).padStart(5, '0');
        const lngStr = Math.round(lng * 1000000).toString(36).padStart(6, '0');
        const baseUlpin = `MH1${latStr}${lngStr}`.toUpperCase();
        
        const ulpin3D = formatUlpin3D(baseUlpin, 'A', Math.min(floors, 3), `U${Math.min(floors, 3)}01`);
        const bldgId = `osm-bldg-${Date.now().toString(36)}`;

        const dynamicBuilding: Building = {
          id: bldgId,
          parcelId: `parcel-${bldgId}`,
          name: buildingName !== 'Unnamed Building' ? buildingName : `Building at ${lng}, ${lat}`,
          footprint: {
            type: 'Polygon',
            coordinates: [[
              [lng - 0.0002, lat - 0.0002],
              [lng + 0.0002, lat - 0.0002],
              [lng + 0.0002, lat + 0.0002],
              [lng - 0.0002, lat + 0.0002],
              [lng - 0.0002, lat - 0.0002],
            ]]
          },
          eavesHeightM: Math.round(height * 0.85),
          roofHeightM: Math.round(height),
          numFloors: floors,
          numBasements: 0,
          plinthElevationM: Math.round(minHeight),
          totalBuiltupAreaSqm: floors * 650,
          address: `Mumbai, Maharashtra (${lng}, ${lat})`,
          simulated: true,
        };

        // Reset dropdowns
        setSelectedFloor('Ground Floor');
        setSelectedUnit('101');

        // Set initial info immediately so the popup opens instantly
        setSelectedBuildingInfo({
          id: bldgId,
          height: Math.round(height),
          minHeight: Math.round(minHeight),
          floors,
          ulpin3D,
          coordinates: [lng, lat],
          building: dynamicBuilding,
          buildingName,
          ownership: null,
          bmcData: undefined // undefined initially
        });

        // Step 1.5: Fetch MyBMC Data asynchronously
        setIsFetchingBmc(true);
        fetch(`https://mybmcid.mcgm.gov.in/server/rest/services/MCGM_UID/IPVS/FeatureServer/1/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=json`)
          .then(res => res.json())
          .then(bmcJson => {
            if (bmcJson && bmcJson.features && bmcJson.features.length > 0) {
              const bmcProps = bmcJson.features[0].attributes || bmcJson.features[0].properties;
              const bmcData = {
                sacNumber: bmcProps.SAC_NUMBER || 'UNKNOWN',
                usage: bmcProps.USAGE || 'Unknown',
                name: bmcProps.NAME || 'Unnamed BMC Building',
                noOfFloorsStr: bmcProps.NO_OF_FLOO || '',
              };
              
              let parsedFloors = 1;
              let hasBasement = false;
              if (bmcData.noOfFloorsStr) {
                 const str = bmcData.noOfFloorsStr.toLowerCase();
                 if (str.includes('b') || str.includes('base')) hasBasement = true;
                 const match = str.match(/\d+/);
                 if (match) parsedFloors = parseInt(match[0], 10) + (str.includes('g') || str.includes('gr') ? 1 : 0);
                 else if (str.includes('g') || str.includes('gr')) parsedFloors = 1;
              }
              
              if (parsedFloors > 0) {
                 const accurateFloors = parsedFloors;
                 const accurateHeight = accurateFloors * 3.5;
                 
                 setSelectedBuildingInfo(prev => {
                   if (!prev) return prev;
                   // Update the dynamic building with accurate heights
                   const updatedBuilding = {
                     ...prev.building,
                     eavesHeightM: Math.round(accurateHeight * 0.85),
                     roofHeightM: Math.round(accurateHeight),
                     numFloors: accurateFloors,
                     numBasements: hasBasement ? 1 : 0,
                     totalBuiltupAreaSqm: accurateFloors * 650,
                     name: (bmcData.name && bmcData.name.trim().length > 1) ? bmcData.name : prev.building.name
                   };
                   
                   return {
                     ...prev,
                     height: Math.round(accurateHeight),
                     floors: accurateFloors,
                     buildingName: updatedBuilding.name,
                     building: updatedBuilding,
                     bmcData
                   };
                 });
              }
            } else {
              setSelectedBuildingInfo(prev => prev ? {
                ...prev,
                bmcData: { sacNumber: '', usage: '', name: '', noOfFloorsStr: '', notFound: true }
              } : null);
            }
          })
          .catch(err => {
            console.warn('[MapLibre] Failed to fetch BMC data asynchronously', err);
            setSelectedBuildingInfo(prev => prev ? {
              ...prev,
              bmcData: { sacNumber: '', usage: '', name: '', noOfFloorsStr: '', notFound: true }
            } : null);
          })
          .finally(() => setIsFetchingBmc(false));

        // Step 2: Fetch ownership data from API
        try {
          const resp = await fetch(
            `/api/ownership?building_name=${encodeURIComponent(buildingName)}&lng=${lng}&lat=${lat}`
          );
          if (resp.ok) {
            const data = await resp.json();
            setSelectedBuildingInfo(prev => prev ? {
              ...prev,
              buildingName: data.record?.buildingName || buildingName,
              ownership: data.record || null,
            } : null);
          }
        } catch (err) {
          console.warn('[Ownership] Failed to fetch:', err);
        }
      });

      map.on('mouseenter', '3d-buildings', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', '3d-buildings', () => {
        map.getCanvas().style.cursor = '';
      });

      mapRef.current = map;
    } catch (err: any) {
      console.error('[MapLibre] Initialization error:', err);
      setErrorMessage(err.message || 'Failed to initialize MapLibre GL instance');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync MCGM Underground Layers to MapLibre
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    // Track active sources so we can remove ones that are toggled off
    const currentLayerIds = map.getStyle().layers.filter(l => l.id.startsWith('mcgm-underground-')).map(l => l.id.replace('mcgm-underground-layer-', ''));

    // Remove inactive ones
    currentLayerIds.forEach(idStr => {
      const id = parseInt(idStr, 10);
      if (!activeUndergroundLayerIds.includes(id)) {
        if (map.getLayer(`mcgm-underground-layer-${id}`)) map.removeLayer(`mcgm-underground-layer-${id}`);
        if (map.getSource(`mcgm-underground-source-${id}`)) map.removeSource(`mcgm-underground-source-${id}`);
      }
    });

    // Add new ones
    activeUndergroundLayerIds.forEach(async (id) => {
      const sourceId = `mcgm-underground-source-${id}`;
      const layerId = `mcgm-underground-layer-${id}`;
      
      if (!map.getSource(sourceId)) {
        const bounds = map.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        
        try {
          const url = `https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers/MapServer/${id}/query?geometry=${bbox}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&f=geojson&resultRecordCount=2000`;
          
          const geojson = await fetch(url).then(r => r.json());
          
          if (!map.getSource(sourceId)) { // check again after async
            map.addSource(sourceId, {
              type: 'geojson',
              data: geojson
            });

            // Assign colors based on typical utility types
            let color = '#38bdf8'; // default cyan
            if ([4, 5].includes(id)) color = '#a855f7'; // Sewer = purple
            if ([6, 7].includes(id)) color = '#10b981'; // SWD = green
            if ([310, 313].includes(id)) color = '#f59e0b'; // Tunnel = amber

            map.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': color,
                'line-width': 4,
                'line-dasharray': [2, 2],
                'line-opacity': 0.8
              }
            }, 'poi-labels'); // insert below labels
          }
        } catch (e) {
          console.warn(`[MapLibre] Failed to load MCGM layer ${id}`, e);
        }
      }
    });
  }, [activeUndergroundLayerIds, mapLoaded]);

  // Sync layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    
    if (map.getLayer('mybmc-buildings-layer')) {
      map.setLayoutProperty('mybmc-buildings-layer', 'visibility', layers.mybmc ? 'visible' : 'none');
    }
  }, [layers.mybmc, mapLoaded]);

  const setMapPitch = (pitch: number) => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({ pitch, duration: 800 });
    setCurrentPitch(pitch);
  };

  const flyToDistrict = (lng: number, lat: number, zoom = 15, pitch = 45, bearing = -15) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom,
      pitch,
      bearing,
      essential: true,
      duration: 2000
    });
    setCurrentPitch(pitch);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#070b14] flex flex-col">
      {errorMessage ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-red-950/20 text-red-300">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <h3 className="text-sm font-bold text-white">Map Initialization Notice</h3>
          <p className="text-xs max-w-md">{errorMessage}</p>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full flex-1" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      )}

      <ClearanceTool currentFootprintGeoJSON={footprintGeoJSON} />

      {/* Top-Left HUD */}
      <div className="absolute top-5 left-5 glass-panel rounded-2xl p-4 max-w-sm pointer-events-auto space-y-3 transition-all duration-300 hover:bg-[#0b0f19]/80 group">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-tight">
                MapLibre 3D Vector Map
              </h3>
              <p className="text-[10px] text-cyan-300 font-mono">
                osm-2020-02-10-v3.11_india_mumbai.mbtiles
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
            PITCH {currentPitch}°
          </span>
        </div>

        {/* District Quick-Fly Buttons */}
        <div className="space-y-1">
          <div className="text-[9px] uppercase font-semibold text-slate-400">Jump to Mumbai District:</div>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <button
              onClick={() => flyToDistrict(72.8280, 18.9960, 15.2, 45, -30)}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-left truncate border border-white/5 transition-all duration-200 font-bold text-cyan-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              🏙️ Worli Supertalls
            </button>
            <button
              onClick={() => flyToDistrict(72.8236, 18.9256, 15.5, 45, 10)}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-left truncate border border-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              🌊 Nariman Point
            </button>
            <button
              onClick={() => flyToDistrict(72.8682, 19.0716, 15.0, 40, -15)}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg text-left truncate border border-white/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              🏢 BKC Financial Hub
            </button>
            <button
              onClick={() => flyToDistrict(72.8745, 19.0980, 14.8, 45, 0)}
              className="px-2 py-1 bg-surface-100 hover:bg-surface-200 text-slate-200 rounded text-left truncate border border-white/5 transition-all"
            >
              ✈️ Airport T2 & Sahar
            </button>
          </div>
        </div>

        {/* Pitch Angle Presets */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
          <span className="text-slate-400">Camera Pitch:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setMapPitch(45)}
              className={`px-2 py-0.5 rounded font-mono font-medium transition-all ${
                currentPitch === 45 ? 'bg-brand-primary text-white font-bold shadow' : 'bg-surface-100 text-slate-300'
              }`}
            >
              45° (3D Extrusion)
            </button>
            <button
              onClick={() => setMapPitch(60)}
              className={`px-2 py-0.5 rounded font-mono font-medium transition-all ${
                currentPitch === 60 ? 'bg-brand-primary text-white font-bold shadow' : 'bg-surface-100 text-slate-300'
              }`}
            >
              60° (Perspective)
            </button>
            <button
              onClick={() => setMapPitch(0)}
              className={`px-2 py-0.5 rounded font-mono font-medium transition-all ${
                currentPitch === 0 ? 'bg-brand-primary text-white font-bold shadow' : 'bg-surface-100 text-slate-300'
              }`}
            >
              0° (2D Plan)
            </button>
          </div>
        </div>
      </div>

      {/* Building Height Color Ramp Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-2.5 border border-white/10 pointer-events-auto space-y-1.5 text-[10px] shadow-2xl">
        <div className="font-semibold text-slate-200 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          3D Building Height Gradient (m)
        </div>
        <div className="flex items-center gap-1 font-mono text-[9px]">
          <span className="px-1.5 py-0.5 rounded bg-[#0ea5e9] text-white">0-25m</span>
          <span className="px-1.5 py-0.5 rounded bg-[#38bdf8] text-black">25-60m</span>
          <span className="px-1.5 py-0.5 rounded bg-[#818cf8] text-white">60-120m</span>
          <span className="px-1.5 py-0.5 rounded bg-[#c084fc] text-black">120-220m</span>
          <span className="px-1.5 py-0.5 rounded bg-[#f43f5e] text-white">220-300m+</span>
        </div>
      </div>

      {/* Clicked 3D Building Inspector Card (Bottom-Right) */}
      {selectedBuildingInfo && (
        <div className="absolute bottom-5 right-5 glass-panel-glow rounded-3xl p-5 w-80 pointer-events-auto space-y-4 shadow-2xl animate-in slide-in-from-right-4 fade-in duration-300 overflow-y-auto max-h-[calc(100vh-480px)] custom-scrollbar">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {selectedBuildingInfo.buildingName !== 'Unnamed Building'
                    ? selectedBuildingInfo.buildingName
                    : 'OSM 3D Extruded Building'}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {selectedBuildingInfo.coordinates.join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBuildingInfo(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          {/* Accurate MyBMC Data Sync / Loading */}
          {isFetchingBmc && !selectedBuildingInfo.bmcData && (
            <div className="glass-card p-3 rounded-2xl bg-brand-primary/5 space-y-2 flex items-center justify-center">
              <span className="text-[10px] text-cyan-400 animate-pulse font-mono flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Fetching precise BMC data...
              </span>
            </div>
          )}

          {!isFetchingBmc && selectedBuildingInfo.bmcData?.notFound && (
            <div className="glass-card p-2.5 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-2">
              <div className="text-[10px] text-rose-400 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3 h-3" /> No authoritative MyBMC record found here.
              </div>
            </div>
          )}

          {selectedBuildingInfo.bmcData && !selectedBuildingInfo.bmcData.notFound && (() => {
            // Helper for units
            let unitPrefix = '';
            if (selectedFloor === 'Ground Floor') unitPrefix = 'G';
            else if (selectedFloor === 'Basement') unitPrefix = 'B';
            else unitPrefix = selectedFloor.replace(/\D/g, '');
            const availableUnits = [1, 2, 3, 4, 5, 6].map(u => `${unitPrefix}0${u}`);

            // Helper for ordinals
            const getOrdinal = (n: number) => {
              const s = ["TH", "ST", "ND", "RD"];
              const v = n % 100;
              return n + (s[(v - 20) % 10] || s[v] || s[0]);
            };

            return (
              <div className="glass-card p-3 rounded-2xl bg-brand-primary/10 space-y-2.5">
                <div className="text-[10px] font-bold text-brand-primary flex items-center justify-between">
                  <span>Selected MyBMC Building ID: <span className="text-white">{selectedBuildingInfo.bmcData.sacNumber}</span></span>
                  <span className="text-[9px] bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded">{selectedBuildingInfo.bmcData.usage}</span>
                </div>
                
                <div className="flex gap-2 text-[10px]">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold">Select Floor:</label>
                    <select 
                      value={selectedFloor}
                      onChange={(e) => setSelectedFloor(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-brand-primary"
                    >
                      {(selectedBuildingInfo.building?.numBasements ?? 0) > 0 && (
                        <option value="Basement">Basement</option>
                      )}
                      <option value="Ground Floor">Ground Floor</option>
                      {Array.from({ length: Math.max(0, selectedBuildingInfo.floors - 1) }).map((_, i) => (
                        <option key={i} value={getOrdinal(i + 1)}>{getOrdinal(i + 1)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold">Select Unit:</label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-brand-primary"
                    >
                      {availableUnits.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" /> Height & Floors dynamically corrected via MyBMC API ({selectedBuildingInfo.bmcData.noOfFloorsStr})
                </div>
              </div>
            );
          })()}

          {/* Ownership / Property Record */}
          {selectedBuildingInfo.ownership && (
            <div className="glass-card p-3 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-2">
              <div className="text-[9px] uppercase font-semibold text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Property Record (MyBMC / Mahabhulekh)
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500">Owner: </span>
                  <span className="text-white font-medium">{selectedBuildingInfo.ownership.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Type: </span>
                  <span className="text-cyan-300">{selectedBuildingInfo.ownership.ownerType}</span>
                </div>
                <div>
                  <span className="text-slate-500">BUID: </span>
                  <span className="text-emerald-300">{selectedBuildingInfo.ownership.buid}</span>
                </div>
                <div>
                  <span className="text-slate-500">CTS: </span>
                  <span className="text-white">{selectedBuildingInfo.ownership.ctsNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Ward: </span>
                  <span className="text-white">{selectedBuildingInfo.ownership.ward}</span>
                </div>
                <div>
                  <span className="text-slate-500">Use: </span>
                  <span className="text-white">{selectedBuildingInfo.ownership.useType}</span>
                </div>
              </div>
              <a
                href={selectedBuildingInfo.ownership.mahabhulekhLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 mt-1 font-mono"
              >
                <ExternalLink className="w-3 h-3" />
                View on Mahabhulekh Portal →
              </a>
              <div className="text-[8px] text-slate-600 italic">
                Source: {selectedBuildingInfo.ownership.source} • DPDP Act compliant
              </div>
            </div>
          )}

          {/* Synthesized 3D ULPIN */}
          <div className="glass-card p-3 rounded-2xl border border-white/5 bg-black/40 space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Synthesized 3D ULPIN</span>
              <button
                onClick={() => handleCopy(selectedBuildingInfo.ulpin3D)}
                className="text-cyan-300 hover:text-white flex items-center gap-0.5 font-mono"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="font-mono font-bold text-xs text-white break-all">
              {selectedBuildingInfo.ulpin3D}
            </div>
          </div>

          {/* Building Measurements */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
            <div className="glass-card p-2 rounded-lg border border-white/5">
              <div className="text-slate-400 text-[8px]">HEIGHT</div>
              <div className="font-bold text-cyan-300 text-xs mt-0.5">{selectedBuildingInfo.height}m</div>
            </div>
            <div className="glass-card p-2 rounded-lg border border-white/5">
              <div className="text-slate-400 text-[8px]">FLOORS</div>
              <div className="font-bold text-emerald-300 text-xs mt-0.5">~{selectedBuildingInfo.floors}F</div>
            </div>
            <div className="glass-card p-2 rounded-lg border border-white/5">
              <div className="text-slate-400 text-[8px]">BASE DATUM</div>
              <div className="font-bold text-amber-300 text-xs mt-0.5">+{selectedBuildingInfo.minHeight}m</div>
            </div>
          </div>

          <button
            onClick={() => {
              if (selectedBuildingInfo?.building) {
                setSelectedBuilding(selectedBuildingInfo.building);
              }
              setActiveTab('EXPLODED_3D');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-neon-cyan transition-all duration-300 hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Drill Down in Exploded 3D Scene &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
