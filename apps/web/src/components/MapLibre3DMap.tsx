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
  AlertCircle,
  X,
  Image as ImageIcon,
  Box as BoxIcon,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { FloorPlan3D } from './FloorPlan3D';
import { useAppStore } from '@/lib/store';
import { formatUlpin3D, Building } from '@sih/shared-types';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { SAMPLE_BUILDINGS, SAMPLE_VERTICAL_UNITS, SAMPLE_MINING_AREAS, SAMPLE_PUBLIC_AMENITIES, SAMPLE_ELEVATED_CORRIDORS, SAMPLE_REGULATED_BOUNDARIES } from '@sih/sample-data';
import { ClearanceTool } from './ClearanceTool';
import { generateProceduralUtilities } from '@/lib/proceduralUtilities';
import { WESTERN_LINE_GEOJSON, generateInitialTrains, updateTrains, getTrainsGeoJSON, TrainState } from '@/lib/trainRoutes';

export const MapLibre3DMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [currentPitch, setCurrentPitch] = useState<number>(45);
  const [basemapStyle, setBasemapStyle] = useState<'street' | 'satellite'>('street');
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
      unitCount?: number;
      notFound?: boolean;
    } | null;
    isAnimated: boolean;
    featureId?: string;
    featureSource?: string;
    featureBldgId?: string;
  } | null>(null);

  const [bmcScrapedUnits, setBmcScrapedUnits] = useState<Record<string, string[]> | null>(null);
  const [isScrapingBmc, setIsScrapingBmc] = useState<boolean>(false);

  useEffect(() => {
    if (selectedBuildingInfo?.bmcData?.sacNumber) {
      const sac = selectedBuildingInfo.bmcData.sacNumber;
      setIsScrapingBmc(true);
      setBmcScrapedUnits(null);
      const floors = selectedBuildingInfo.floors || 1;
      const expectedUnits = selectedBuildingInfo.bmcData.unitCount || 0;
      fetch(`http://localhost:4000/api/v1/bmc/${sac}/units?expectedFloors=${floors}&expectedUnits=${expectedUnits}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.unitsByFloor) {
            setBmcScrapedUnits(data.unitsByFloor);
          }
        })
        .catch(console.error)
        .finally(() => setIsScrapingBmc(false));
    } else {
      setBmcScrapedUnits(null);
    }
  }, [selectedBuildingInfo?.bmcData?.sacNumber, selectedBuildingInfo?.floors, selectedBuildingInfo?.bmcData?.unitCount]);

  const [isFetchingBmc, setIsFetchingBmc] = useState(false);

  const [copied, setCopied] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground Floor');
  const [showAquariaFloorPlan, setShowAquariaFloorPlan] = useState(false);
  const [aquariaViewMode, setAquariaViewMode] = useState<'2D' | '3D'>('3D');
  const [selectedUnit, setSelectedUnit] = useState<string>('101');
  const { activeTab, layers, setActiveTab, setSelectedBuilding, setSelectedMiningArea, flyToTarget, setFlyToTarget, activeUndergroundLayerIds, currentRole, temporalYear, floodSimulation, searchedParcelGeoJSON, mapViewState, setMapViewState, searchedUlpin3D } = useAppStore();

  const drawRef = useRef<MapboxDraw | null>(null);
  const dynamicBuildingsRef = useRef<any[]>([]);
  const [footprintGeoJSON, setFootprintGeoJSON] = useState<any>(null);

  // Train animation state
  const trainsRef = useRef<TrainState[]>([]);
  const lastTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (flyToTarget && mapRef.current && mapLoaded) {
      console.log('[MapLibre flyTo] Flying to:', flyToTarget.lng, flyToTarget.lat, 'zoom:', flyToTarget.zoom);
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

  const lastProcessedUlpinRef = useRef<string | null>(null);

  useEffect(() => {
    if (searchedUlpin3D && activeTab === 'MAPLIBRE_3D' && lastProcessedUlpinRef.current !== searchedUlpin3D) {
      lastProcessedUlpinRef.current = searchedUlpin3D;
      
      const parts = searchedUlpin3D.split('-');
      if (parts.length > 1) {
        const unitRaw = parts[parts.length - 1]; // e.g. 101 or 01
        
        const baseAndLevel = parts[0]; // e.g. MH1...A+02
        const levelCode = baseAndLevel.slice(-3); // +02 or -01 or 000
        
        if (levelCode.startsWith('+') || levelCode.startsWith('-') || levelCode === '000' || levelCode.startsWith('G')) {
           let levelNum = parseInt(levelCode.replace('+', ''), 10);
           if (levelCode.startsWith('G') || levelCode.endsWith('00')) levelNum = 0;
           
           if (!isNaN(levelNum)) {
             if (levelNum === 0) setSelectedFloor('Ground Floor');
             else if (levelNum < 0) setSelectedFloor('Basement');
             else {
                const s = ["TH", "ST", "ND", "RD"];
                const v = levelNum % 100;
                const ordinal = levelNum + (s[(v - 20) % 10] || s[v] || s[0]);
                setSelectedFloor(ordinal);
             }
           }
        }
        
        setSelectedUnit(unitRaw);
      }
        
      // Ensure the building is actually selected so the Inspector panel opens for the right building
      if (mapRef.current && mapLoaded) {
         setTimeout(() => {
           if (!mapRef.current) return;
           const center = mapRef.current.getCenter();
           const point = mapRef.current.project(center);
           // Add simulated flag so the click handler knows to expand its search box
           mapRef.current.fire('click', { lngLat: center, point, originalEvent: { simulated: true } as any });
         }, 2600);
      }
    }
  }, [searchedUlpin3D, activeTab, mapLoaded]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const container = mapContainerRef.current;
    const rect = container.getBoundingClientRect();
    console.log('[MapLibre] Container dimensions:', rect.width, 'x', rect.height);
    if (rect.width === 0 || rect.height === 0) {
      console.error('[MapLibre] Container has zero dimensions! Map will not render.');
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        preserveDrawingBuffer: true,
        attributionControl: false,
        style: {
          version: 8,
          name: 'Mumbai 3D Dark Cadastre',
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
          sources: {
            openmaptiles: {
              type: 'vector',
              url: 'https://tiles.openfreemap.org/planet',
              attribution: '© OpenStreetMap contributors, OpenMapTiles, OpenFreeMap, SIH 3D ULPIN'
            },
            'satellite-esri': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: 'Esri, Maxar, Earthstar Geographics'
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
            // Esri Satellite
            {
              id: 'satellite-layer',
              type: 'raster',
              source: 'satellite-esri',
              layout: {
                visibility: 'none'
              },
              paint: {
                'raster-opacity': 1.0,
                'raster-saturation': -0.1
              }
            },
            // Landcover
            {
              id: 'landcover',
              type: 'fill',
              source: 'openmaptiles',
              'source-layer': 'landcover',
              paint: {
                'fill-color': '#1c3326', // Subtle dark forest green
                'fill-opacity': 1.0
              }
            },
            // Landuse
            {
              id: 'landuse',
              type: 'fill',
              source: 'openmaptiles',
              'source-layer': 'landuse',
              paint: {
                'fill-color': '#111827', // Very dark grey/black ground
                'fill-opacity': 1.0
              }
            },
            // Water Bodies
            {
              id: 'water',
              type: 'fill',
              source: 'openmaptiles',
              'source-layer': 'water',
              paint: {
                'fill-color': '#0f2744', // Subtle dark navy blue
                'fill-opacity': 1.0
              }
            },
            // Waterways
            {
              id: 'waterway',
              type: 'line',
              source: 'openmaptiles',
              'source-layer': 'waterway',
              paint: {
                'line-color': '#0f2744',
                'line-width': 2,
                'line-opacity': 1.0
              }
            },
            // Roads
            {
              id: 'transportation-roads',
              type: 'line',
              source: 'openmaptiles',
              'source-layer': 'transportation',
              paint: {
                'line-color': '#374151', // Medium grey to stand out against dark ground
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
                'line-color': '#4b5563', // Lighter grey for major roads
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
                'fill-color': '#94a3b8', // Slate 400 base
                'fill-opacity': 1.0
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
                'fill-extrusion-color': '#94a3b8', // Slate 400 allows directional shading
                'fill-extrusion-height': [
                  'case',
                  ['all', ['has', 'render_height'], ['>', ['get', 'render_height'], 0]],
                  ['case', ['>', ['get', 'render_height'], 400], 400, ['get', 'render_height']],
                  18 // Default height in meters if unspecified or 0
                ],
                'fill-extrusion-base': [
                  'case',
                  ['all', ['has', 'render_min_height'], ['>', ['get', 'render_min_height'], 0]],
                  ['get', 'render_min_height'],
                  0
                ],
                'fill-extrusion-opacity': 1.0
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
        center: mapViewState ? [mapViewState.lng, mapViewState.lat] : [72.8280, 18.9960],
        zoom: mapViewState ? mapViewState.zoom : 14.8,
        pitch: mapViewState ? mapViewState.pitch : 45,
        bearing: mapViewState ? mapViewState.bearing : -17.5
      });

      map.on('load', () => {
        setMapLoaded(true);
        
        // Persist map state on movement to return exactly where we left off
        map.on('moveend', () => {
          setMapViewState({
            lng: parseFloat(map.getCenter().lng.toFixed(5)),
            lat: parseFloat(map.getCenter().lat.toFixed(5)),
            zoom: parseFloat(map.getZoom().toFixed(2)),
            pitch: parseFloat(map.getPitch().toFixed(2)),
            bearing: parseFloat(map.getBearing().toFixed(2))
          });
        });
        
        // Add Live Trains Data Sources & Layers
        map.addSource('train-routes', {
          type: 'geojson',
          data: WESTERN_LINE_GEOJSON as any
        });

        // Add Mining Areas Source
        map.addSource('mining-areas', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: SAMPLE_MINING_AREAS.map(m => ({
              type: 'Feature',
              geometry: m.boundary,
              properties: { id: m.id, name: m.name, status: m.operationalStatus, mineral: m.mineral, risk: m.analyticalRiskIndicator }
            }))
          }
        });

        map.addLayer({
          id: 'mining-areas-fill',
          type: 'fill',
          source: 'mining-areas',
          layout: { visibility: 'visible' },
          paint: {
            'fill-color': [
              'match',
              ['get', 'status'],
              'ACTIVE', '#fb923c', // orange-400
              'INACTIVE', '#9ca3af', // gray-400
              '#fb923c'
            ],
            'fill-opacity': 0.4
          }
        }, 'poi-labels');

        map.addLayer({
          id: 'mining-areas-line',
          type: 'line',
          source: 'mining-areas',
          layout: { visibility: 'visible' },
          paint: {
            'line-color': '#f97316', // orange-500
            'line-width': 2,
            'line-dasharray': [2, 1]
          }
        });

        // Add Mining Underground Network Source
        const undergroundFeatures: any[] = [];
        SAMPLE_MINING_AREAS.forEach(m => {
          if (m.undergroundNetwork) {
            m.undergroundNetwork.segments.forEach(seg => {
              undergroundFeatures.push({
                type: 'Feature',
                geometry: seg.geometry,
                properties: { id: seg.uldpn, mineId: m.id, type: 'tunnel', depth: seg.depthBelowSurfaceM }
              });
            });
            m.undergroundNetwork.nodes.forEach(node => {
              undergroundFeatures.push({
                type: 'Feature',
                geometry: node.geometry,
                properties: { id: node.uldpn, mineId: m.id, type: 'node', nodeType: node.featureType }
              });
            });
          }
        });

        map.addSource('mining-underground', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: undergroundFeatures
          }
        });

        map.addLayer({
          id: 'mining-tunnels-line',
          type: 'line',
          source: 'mining-underground',
          filter: ['==', 'type', 'tunnel'],
          layout: { visibility: 'visible' },
          paint: {
            'line-color': '#a855f7', // purple-500
            'line-width': 3,
            'line-dasharray': [2, 1]
          }
        });

        map.addLayer({
          id: 'mining-nodes-circle',
          type: 'circle',
          source: 'mining-underground',
          filter: ['==', 'type', 'node'],
          layout: { visibility: 'visible' },
          paint: {
            'circle-color': '#d946ef', // fuchsia-500
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
          }
        });

        map.on('click', 'mining-tunnels-line', (e) => {
          if (!e.features || e.features.length === 0) return;
          const props = e.features[0].properties;
          const area = SAMPLE_MINING_AREAS.find(m => m.id === props.mineId);
          if (area) {
            setSelectedMiningArea(area);
            setActiveTab('MINING');
          }
        });

        map.on('click', 'mining-areas-fill', (e) => {
          if (!e.features || e.features.length === 0) return;
          const props = e.features[0].properties;
          const area = SAMPLE_MINING_AREAS.find(m => m.id === props.id);
          if (area) {
            setSelectedMiningArea(area);
            setActiveTab('MINING');
          }
        });
        
        map.on('mouseenter', 'mining-areas-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'mining-areas-fill', () => { map.getCanvas().style.cursor = ''; });

        // Add Mock InSAR Deformation Source (Jharia region)
        const insarFeatures: any[] = [];
        for (let i = 0; i < 800; i++) {
          const lng = 86.415 + (Math.random() - 0.5) * 0.015;
          const lat = 23.755 + (Math.random() - 0.5) * 0.015;
          const dist = Math.sqrt(Math.pow(lng - 86.415, 2) + Math.pow(lat - 23.755, 2));
          
          if (dist > 0.007) continue;
          
          // Generate a hotspot center
          const losDeformation = -120 * Math.pow((1 - dist / 0.007), 2) * (0.8 + Math.random() * 0.2);
          const coherence = dist < 0.002 ? 0.4 + Math.random() * 0.3 : 0.6 + Math.random() * 0.4;
          
          if (coherence > 0.5) {
            insarFeatures.push({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [lng, lat] },
              properties: { losDeformation, coherence }
            });
          }
        }

        map.addSource('insar-points', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: insarFeatures }
        });

        map.addLayer({
          id: 'insar-points-heatmap',
          type: 'heatmap',
          source: 'insar-points',
          layout: { visibility: 'none' }, // Toggled independently later or tied to MINING tab with sub-toggle
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'losDeformation'], -120, 1, 0, 0],
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0,0,255,0)',
              0.2, 'royalblue',
              0.4, 'cyan',
              0.6, 'yellow',
              0.8, 'orange',
              1, 'red'
            ],
            'heatmap-radius': 25,
            'heatmap-opacity': 0.6
          }
        });
        
        map.addLayer({
          id: 'train-routes-layer',
          type: 'line',
          source: 'train-routes',
          layout: { visibility: 'none' },
          paint: {
            'line-color': '#06b6d4',
            'line-width': 2,
            'line-opacity': 0.3,
            'line-dasharray': [2, 2]
          }
        });

        map.addSource('live-trains', {
          type: 'geojson',
          data: getTrainsGeoJSON([])
        });

        // Glowing halo for trains
        map.addLayer({
          id: 'live-trains-halo',
          type: 'circle',
          source: 'live-trains',
          layout: { visibility: 'none' },
          paint: {
            'circle-radius': 12,
            'circle-color': '#06b6d4',
            'circle-opacity': 0.2,
            'circle-blur': 1
          }
        });

        // Core train point
        map.addLayer({
          id: 'live-trains-layer',
          type: 'circle',
          source: 'live-trains',
          layout: { visibility: 'none' },
          paint: {
            'circle-radius': 5,
            'circle-color': '#06b6d4',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Train Click Handler
        map.on('click', 'live-trains-layer', (e) => {
          if (!e.features || e.features.length === 0) return;
          const props = e.features[0].properties;
          
          new maplibregl.Popup({ className: 'glass-popup', closeButton: false })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3 text-slate-200">
                <div class="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                  <div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span class="font-bold tracking-wider text-xs">${props.name}</span>
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-900/50 text-cyan-300 border border-cyan-800">${props.type}</span>
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div class="text-slate-400">Heading</div>
                  <div class="font-medium text-white">${props.direction} towards ${props.destination}</div>
                  <div class="text-slate-400">Origin</div>
                  <div>${props.source}</div>
                  <div class="text-slate-400">Speed</div>
                  <div class="text-cyan-300">${props.speed} km/h</div>
                  <div class="text-slate-400">Distance Covered</div>
                  <div class="text-emerald-300">${((props.progress * props.totalLength) || 0).toFixed(1)} km</div>
                  <div class="text-slate-400">Progress</div>
                  <div class="text-emerald-300">${Math.round(props.progress * 100)}% Complete</div>
                </div>
              </div>
            `)
            .addTo(map);
        });

        map.on('mouseenter', 'live-trains-layer', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'live-trains-layer', () => {
          map.getCanvas().style.cursor = '';
        });

        // Initialize trains
        trainsRef.current = generateInitialTrains(8);
        lastTimeRef.current = performance.now();
        
        // Start animation loop
        const animate = (time: number) => {
          if (!mapRef.current) return;
          
          const deltaTime = time - lastTimeRef.current;
          lastTimeRef.current = time;
          
          trainsRef.current = updateTrains(trainsRef.current, deltaTime);
          
          const source = mapRef.current.getSource('live-trains') as maplibregl.GeoJSONSource;
          if (source) {
            source.setData(getTrainsGeoJSON(trainsRef.current));
          }
          
          animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);

      });

      map.on('error', (e) => {
        console.warn('[MapLibre] Map warning/error event:', e);
      });

      // Global click handler for utility popups
      map.on('click', (e) => {
        const renderedFeatures = map.queryRenderedFeatures(e.point);
        const mcgmFeature = renderedFeatures.find(f => f.layer.id.startsWith('mcgm-underground-layer-'));
        if (mcgmFeature) {
          const props = mcgmFeature.properties || {};
          new maplibregl.Popup({ className: 'glass-popup', closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3 text-slate-200 text-xs max-w-xs">
                <div class="font-bold text-white mb-1 border-b border-white/10 pb-1 flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-cyan-400"></div>
                  MCGM Underground Asset
                </div>
                <div class="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                  <div class="text-slate-400">Type</div>
                  <div>${props.ASSET_TYPE || props.TYPE || 'Unknown'}</div>
                  <div class="text-slate-400">Agency</div>
                  <div>${props.OWNER || props.AGENCY || props.operator || 'MCGM'}</div>
                  <div class="text-slate-400">Depth</div>
                  <div>${props.DEPTH || props.depth || 'N/A'}</div>
                  <div class="text-slate-400">Material</div>
                  <div>${props.MATERIAL || props.material || 'Unknown'}</div>
                </div>
              </div>
            `)
            .addTo(map);
          return; 
        }

        const procFeature = renderedFeatures.find(f => f.layer.id === 'procedural-utilities-layer');
        if (procFeature) {
          const props = procFeature.properties || {};
          new maplibregl.Popup({ className: 'glass-popup', closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3 text-slate-200 text-xs max-w-xs">
                <div class="font-bold text-white mb-1 border-b border-white/10 pb-1 flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
                  Procedural Utility
                </div>
                <div class="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                  <div class="text-slate-400">Type</div>
                  <div>${props.assetType || 'Unknown'}</div>
                  <div class="text-slate-400">Agency</div>
                  <div>${props.owningAgency || 'Unknown'}</div>
                  <div class="text-slate-400">Color</div>
                  <div class="flex items-center gap-1">
                    <div class="w-3 h-3 rounded" style="background-color: ${props.color || '#ffffff'}"></div>
                    ${props.color || 'Default'}
                  </div>
                </div>
              </div>
            `)
            .addTo(map);
          return;
        }
      });

      // Click on 3D Building
      map.on('click', 'authoritative-buildings-layer', (e) => {
        if (!e.features || e.features.length === 0) return;
        const f = e.features[0];
        const props = f.properties || {};
        
        const rawHeight = props.render_height || props.height || 18;
        const height = Math.min(rawHeight, 300);
        const minHeight = props.render_min_height || 0;
        const floors = Math.max(1, Math.min(Math.round(height / 3.8), 80));
        
        const seed = (typeof f.id === 'number') ? (f.id % 10) : 0;
        const isAnimated = height > 40 || (seed % 2 === 1);
        
        const lngLat = e.lngLat;
        const lng = parseFloat(lngLat.lng.toFixed(5));
        const lat = parseFloat(lngLat.lat.toFixed(5));
        
        const bldgId = f.id || `osm-bldg-${Date.now().toString(36)}`;
        
        // Geospatially encode coordinates into the 14-char ULPIN so search can fly back precisely
        const latStr = Math.round(lat * 1000000).toString(36).padStart(5, '0');
        const lngStr = Math.round(lng * 1000000).toString(36).padStart(6, '0');
        const baseUlpin = `MH1${latStr}${lngStr}`.toUpperCase();
        
        const ulpin3D = formatUlpin3D(baseUlpin, 'A', Math.min(floors, 3), `U${Math.min(floors, 3)}01`);
        
        const dynamicBuilding: Building = {
          id: bldgId as string,
          parcelId: `parcel-${bldgId}`,
          name: props.name || 'Authoritative Building',
          footprint: {
            type: 'Polygon',
            coordinates: []
          },
          eavesHeightM: height,
          roofHeightM: height,
          numFloors: props.floors || floors,
          numBasements: 0,
          plinthElevationM: minHeight,
          yearBuilt: props.year_built || 2020,
          totalBuiltupAreaSqm: (props.floors || floors) * 150,
          address: 'Mumbai, Maharashtra',
          simulated: false
        };

        const buildingName = dynamicBuilding.name;

        setSelectedBuildingInfo({
          id: bldgId as string,
          height: Math.round(height),
          minHeight: Math.round(minHeight),
          floors,
          ulpin3D,
          coordinates: [lng, lat],
          building: dynamicBuilding,
          buildingName,
          ownership: null,
          bmcData: undefined, // undefined initially
          isAnimated
        });
      });

      map.on('click', async (e) => {
        // Expand hit area for better accuracy, especially if simulated
        let bldgs: any[] = [];
        try {
          const availableLayers = ['detailed-landmarks-3d', '3d-buildings'].filter(l => map.getLayer(l));
          if (availableLayers.length > 0) {
            const isSimulated = (e.originalEvent as any)?.simulated;
            if (isSimulated) {
              const pad = 20;
              const bbox = [
                [e.point.x - pad, e.point.y - pad],
                [e.point.x + pad, e.point.y + pad]
              ];
              bldgs = map.queryRenderedFeatures(bbox as any, { layers: availableLayers });
            } else {
              bldgs = map.queryRenderedFeatures(e.point, { layers: availableLayers });
            }
          }
        } catch (err) {
          console.warn("Layer query failed", err);
        }
        
        if (bldgs.length === 0) return;
        
        const f = bldgs[0];
        const props = f.properties || {};
        const rawHeight = (props.render_height && props.render_height > 0) ? props.render_height : (props.height || 18);
        const height = Math.min(rawHeight, 300);
        const minHeight = props.render_min_height || 0;
        const floors = Math.max(1, Math.min(Math.round(height / 3.8), 80));
        
        const seed = (typeof f.id === 'number') ? (f.id % 10) : 0;
        const isAnimated = height > 40 || (seed % 2 === 1);
        
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

        // Step 1.1: If still unnamed, fallback to Nominatim
        if (buildingName === 'Unnamed Building') {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
              headers: { 'Accept-Language': 'en' }
            });
            const data = await res.json();
            if (data && data.address) {
              buildingName = data.address.building || data.address.amenity || data.address.office || data.address.shop || data.address.house || data.name || data.display_name;
              if (buildingName.length > 30) buildingName = buildingName.split(',')[0];
            }
          } catch (err) {
            console.warn('[MapLibre] Nominatim fallback for unnamed 3D building failed:', err);
          }
        }

        // Geospatially encode coordinates into the 14-char ULPIN so search can fly back precisely
        // Use centroid to ensure the ULPIN remains strictly stable across the entire footprint
        let ulpinLng = lng;
        let ulpinLat = lat;
        try {
          if (f.geometry && f.geometry.type === 'Polygon') {
            const centroid = turf.centroid(f.geometry as any);
            ulpinLng = parseFloat(centroid.geometry.coordinates[0].toFixed(5));
            ulpinLat = parseFloat(centroid.geometry.coordinates[1].toFixed(5));
          } else if (f.geometry && f.geometry.type === 'MultiPolygon') {
            const centroid = turf.centroid(f.geometry as any);
            ulpinLng = parseFloat(centroid.geometry.coordinates[0].toFixed(5));
            ulpinLat = parseFloat(centroid.geometry.coordinates[1].toFixed(5));
          }
        } catch (err) {}

        const latStr = Math.round(ulpinLat * 1000000).toString(36).padStart(5, '0');
        const lngStr = Math.round(ulpinLng * 1000000).toString(36).padStart(6, '0');
        const baseUlpin = `MH1${latStr}${lngStr}`.toUpperCase();
        
        const ulpin3D = formatUlpin3D(baseUlpin, 'A', 0, 'G01'); // Default to ground floor unit instead of placeholder U301
        // Check if this click corresponds to a known authoritative building in our mock database
        let matchedBuilding = null;
        try {
          const clickPoint = turf.point([lng, lat]);
          matchedBuilding = SAMPLE_BUILDINGS.find(b => {
            if (!b.footprint || !b.footprint.coordinates || b.footprint.coordinates.length === 0) return false;
            // Ensure polygon is closed for turf
            let polyCoords = [...b.footprint.coordinates[0]];
            if (polyCoords[0][0] !== polyCoords[polyCoords.length-1][0] || polyCoords[0][1] !== polyCoords[polyCoords.length-1][1]) {
              polyCoords.push([...polyCoords[0]]);
            }
            if (polyCoords.length < 4) return false;
            const poly = turf.polygon([polyCoords]);
            return turf.booleanPointInPolygon(clickPoint, poly);
          });
        } catch (e) {
          console.warn("Geospatial match failed", e);
        }

        // Ensure procedural buildings use their predefined ID instead of thrashing state
        const bldgId = String(matchedBuilding ? matchedBuilding.id : (props.bldgId || (f.id ? `osm-${f.id}` : `osm-bldg-${Date.now().toString(36)}`)));
        if (matchedBuilding) {
           buildingName = matchedBuilding.name;
        } else if (props.name) {
           buildingName = props.name;
        }

        // Extract exact building geometry directly from the hit feature
        // MapLibre queryRenderedFeatures returns the unprojected 2D ground footprint even for 3D layers.
        let baseGeometry = f.geometry;
        
        if (matchedBuilding && matchedBuilding.footprint) {
          baseGeometry = matchedBuilding.footprint;
        } else if (baseGeometry.type === 'MultiPolygon') {
          // Fix MultiPolygon Chunk Selection:
          // Break apart the tile-chunked MultiPolygon and isolate the single specific building the user clicked
          // by finding the constituent polygon closest to the 3D ground hit point.
          let targetPolygon = null;
          let minDistance = Infinity;
          const clickPt = turf.point([lng, lat]);

          (baseGeometry as any).coordinates.forEach((coords: any) => {
            try {
              const poly = turf.polygon(coords);
              const center = turf.centroid(poly);
              const dist = turf.distance(clickPt, center);
              if (dist < minDistance) {
                minDistance = dist;
                targetPolygon = poly.geometry;
              }
            } catch(e) {}
          });

          if (targetPolygon) {
             baseGeometry = targetPolygon;
          }
        } else if (baseGeometry.type !== 'Polygon') {
          // Fallback if not a polygon (e.g. Point) and not in our database
          baseGeometry = {
            type: 'Polygon',
            coordinates: [[
              [lng - 0.0002, lat - 0.0002],
              [lng + 0.0002, lat - 0.0002],
              [lng + 0.0002, lat + 0.0002],
              [lng - 0.0002, lat + 0.0002],
              [lng - 0.0002, lat - 0.0002]
            ]]
          };
        }

        // Correct for 3D Perspective Shift:
        // Clicking a tall 3D roof returns the 'lng/lat' of the ground FAR BEHIND the building.
        // We must query the MyBMC API using the precise 2D ground centroid of the extracted footprint.
        let queryLng = lng;
        let queryLat = lat;
        try {
          if (baseGeometry) {
            const center = turf.centroid(baseGeometry);
            queryLng = parseFloat(center.geometry.coordinates[0].toFixed(5));
            queryLat = parseFloat(center.geometry.coordinates[1].toFixed(5));
          }
        } catch (e) {
          console.warn('Centroid calculation failed', e);
        }

        const dynamicBuilding: Building = {
          id: bldgId as string,
          parcelId: `parcel-${bldgId}`,
          ulpin3D,
          name: buildingName !== 'Unnamed Building' ? buildingName : `Building at ${queryLng}, ${queryLat}`,
          footprint: baseGeometry,
          eavesHeightM: Math.round(height * 0.85),
          roofHeightM: Math.round(height),
          numFloors: floors,
          numBasements: 0,
          plinthElevationM: Math.round(minHeight),
          totalBuiltupAreaSqm: floors * 650,
          address: `Mumbai, Maharashtra (${queryLng}, ${queryLat})`,
          simulated: true,
          yearBuilt: 2000,
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
          coordinates: [queryLng, queryLat],
          building: dynamicBuilding,
          buildingName,
          ownership: null,
          bmcData: undefined, // undefined initially
          isAnimated,
          featureId: f.id,
          featureSource: f.source,
          featureBldgId: props.bldgId
        });

        // Step 1.5: Fetch MyBMC Data asynchronously (now enforcing strict MyBMC selection & true geometry)
        // Check if the click is within Mumbai boundaries
        const isMumbai = queryLat >= 18.85 && queryLat <= 19.35 && queryLng >= 72.70 && queryLng <= 73.10;

        const executeOverpassFallback = () => {
          // Pan-India Fallback: Overpass API
          // Search for any named feature (node, way, relation) within 30 meters, or just any building
          const overpassQuery = `[out:json];(nwr(around:30,${queryLat},${queryLng})["name"];nwr(around:30,${queryLat},${queryLng})["building"];);out tags;`;
          return fetch(`https://overpass-api.de/api/interpreter`, {
            method: 'POST',
            body: overpassQuery
          }).then(r => r.json()).then(osmJson => {
            if (osmJson && osmJson.elements && osmJson.elements.length > 0) {
              // Prioritize elements that actually have a name
              const bestElement = osmJson.elements.find((e: any) => e.tags && (e.tags.name || e.tags['name:en'])) || osmJson.elements[0];
              const tags = bestElement.tags || {};
              
              let fallbackName = tags['building:levels'] ? `OSM Building (${tags['building:levels']} Floors)` : 'Generic OSM Structure';
              
              const osmData = {
                sacNumber: `OSM-${bestElement.id}`,
                usage: tags.building || tags.amenity || tags.shop || tags.office || 'Unknown',
                name: tags.name || tags['name:en'] || fallbackName,
                noOfFloorsStr: tags['building:levels'] || '',
                unitCount: parseInt(tags['building:levels']) || 0,
              };
              
              const updateState = (data: any) => {
                setSelectedBuildingInfo(prev => {
                  if (!prev) return prev;
                  let finalName = data.name !== 'Unnamed Building' ? data.name : prev.buildingName;
                  if (data.usage && data.usage !== 'Unknown' && !finalName.includes('[')) {
                     finalName = `${finalName} [${data.usage}]`;
                  }
                  
                  // Calculate area and floors for non-BMC properties
                  const accurateFloors = parseInt(data.noOfFloorsStr) || prev.floors || 1;
                  const originalHeight = prev.height; 
                  
                  const updatedBuilding = {
                    ...prev.building,
                    numFloors: accurateFloors,
                    name: finalName
                  };
                  
                  return { 
                    ...prev, 
                    height: originalHeight,
                    floors: accurateFloors,
                    buildingName: finalName,
                    building: updatedBuilding,
                    bmcData: data 
                  };
                });
              };

              if (!tags.name && !tags['name:en']) {
                // Stitch Layer: Nominatim Reverse Geocoding for nameless buildings
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${queryLat}&lon=${queryLng}&format=json`)
                  .then(res => res.json())
                  .then(nomData => {
                    if (nomData && nomData.display_name) {
                       osmData.name = nomData.display_name.split(',').slice(0, 2).join(', '); // Get short address
                    }
                    updateState(osmData);
                  })
                  .catch(() => updateState(osmData));
              } else {
                updateState(osmData);
              }
            } else {
              setSelectedBuildingInfo(prev => prev ? { ...prev, bmcData: { sacNumber: '', usage: '', name: '', noOfFloorsStr: '', unitCount: 0, notFound: true } } : prev);
            }
          });
        };

        // Step 1.5: Fetch MyBMC Data asynchronously (now enforcing strict MyBMC selection & true geometry)
        setIsFetchingBmc(true);
        
        if (isMumbai) {
          fetch(`https://mybmcid.mcgm.gov.in/server/rest/services/MCGM_UID/IPVS/FeatureServer/1/query?geometry=${queryLng},${queryLat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&outSR=4326&f=json`)
            .then(res => res.json())
            .then(bmcJson => {
              if (bmcJson && bmcJson.features && bmcJson.features.length > 0) {
                const bmcProps = bmcJson.features[0].attributes || bmcJson.features[0].properties;
                const bmcData = {
                  sacNumber: bmcProps.SAC_NUMBER || 'UNKNOWN',
                  usage: bmcProps.USAGE || 'Unknown',
                  name: bmcProps.NAME || 'Unnamed BMC Building',
                  noOfFloorsStr: bmcProps.NO_OF_FLOO || '',
                  unitCount: parseInt(bmcProps.UNIT_CNT) || 0,
                };
                
                let parsedFloors = 0;
                let hasBasement = false;
                if (bmcData.noOfFloorsStr) {
                   const str = bmcData.noOfFloorsStr.toLowerCase();
                   if (str.includes('b') || str.includes('base')) hasBasement = true;
                   const match = str.match(/\d+/);
                   if (match) parsedFloors = parseInt(match[0], 10) + (str.includes('g') || str.includes('gr') ? 1 : 0);
                   else if (str.includes('g') || str.includes('gr')) parsedFloors = 1;
                }
                
                setSelectedBuildingInfo(prev => {
                  if (!prev) return prev;
                  // Update the dynamic building with accurate heights ONLY if BMC had valid floor data
                  let finalName = (bmcData.name && bmcData.name.trim().length > 1) ? bmcData.name : prev.building.name;
                  if (bmcData.usage && bmcData.usage !== 'Unknown' && !finalName.includes('[')) {
                     finalName = `${finalName} [${bmcData.usage}]`;
                  }
                  const footprintArea = bmcProps['SHAPE.AREA'] || bmcProps.Shape__Area || bmcProps.SHAPE_Area || 650;
                  
                  const accurateFloors = parsedFloors > 0 ? parsedFloors : prev.floors;
                  const originalHeight = prev.height; // Always keep the building at its visual OSM height to prevent popping/climbing
                  
                  const updatedBuilding = {
                    ...prev.building,
                    numFloors: accurateFloors,
                    numBasements: hasBasement ? 1 : prev.building.numBasements,
                    totalBuiltupAreaSqm: accurateFloors * footprintArea,
                    name: finalName
                  };
                  
                  return {
                    ...prev,
                    height: originalHeight,
                    floors: accurateFloors,
                    buildingName: updatedBuilding.name,
                    building: updatedBuilding,
                    bmcData
                  };
                });
              } else {
                executeOverpassFallback();
              }
            })
            .catch(err => {
              console.warn('[MapLibre] Failed to fetch data', err);
              executeOverpassFallback();
            })
            .finally(() => setIsFetchingBmc(false));
        } else {
          // Immediately use fallback for non-Mumbai regions
          executeOverpassFallback().finally(() => setIsFetchingBmc(false));
        }

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

      // Click on Surface Land Parcel to compute True Area via ML API
      const handleSurfaceClick = async (e: any) => {
        // Prevent if we clicked a building
        const point = e.point;
        const bldgs = map.queryRenderedFeatures(point, { layers: ['3d-buildings', '2d-buildings-base'] });
        if (bldgs.length > 0) return;

        const f = e.features?.[0];
        const lngLat = e.lngLat;
        const lng = parseFloat(lngLat.lng.toFixed(5));
        const lat = parseFloat(lngLat.lat.toFixed(5));

        // Create a 14-char base ULPIN
        const latStr = Math.round(lat * 1000000).toString(36).padStart(5, '0');
        const lngStr = Math.round(lng * 1000000).toString(36).padStart(6, '0');
        const baseUlpin = `MH1${latStr}${lngStr}`.toUpperCase();
        
        // Mock a polygon around the click point for extraction (approx 20x20m)
        const d = 0.0001; 
        const polygon = [
          [lng - d, lat - d],
          [lng + d, lat - d],
          [lng + d, lat + d],
          [lng - d, lat + d],
          [lng - d, lat - d]
        ];

        try {
          // Hit the ML service to calculate True Area
          const res = await fetch('http://localhost:8000/api/v1/ml/process-surface-parcel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base_ulpin: baseUlpin,
              polygon_2d: polygon
            })
          });
          const mlData = await res.json();
          
          const parcelId = `surface-parcel-${Date.now().toString(36)}`;
          const dynamicParcel: any = {
            id: parcelId,
            parcelId: parcelId,
            name: f?.properties?.name || `Satellite Extracted Surface`,
            footprint: { type: 'Polygon', coordinates: [] }, // mock
            totalBuiltupAreaSqm: mlData.surface_area_sqm,
            address: `True Area (SRTM Extracted)`,
            simulated: true,
          };

          setSelectedBuildingInfo({
            id: parcelId,
            height: 0,
            minHeight: 0,
            floors: 0,
            ulpin3D: mlData.ulpin_3d,
            coordinates: [lng, lat],
            building: dynamicParcel,
            buildingName: dynamicParcel.name,
            ownership: null,
            bmcData: { 
              sacNumber: `ML-SURF-${baseUlpin.slice(-6)}`, 
              usage: mlData.is_slope_corrected ? 'Slope Corrected (Satellite)' : 'Planimetric Fallback', 
              name: `True Area: ${mlData.surface_area_sqm} m²`, 
              noOfFloorsStr: '0' 
            },
            isAnimated: false
          });
        } catch (err) {
          console.error("Failed to extract surface parcel data:", err);
        }
      };

      map.on('click', 'landuse', handleSurfaceClick);
      map.on('click', 'landcover', handleSurfaceClick);

      map.on('mouseenter', 'landuse', () => { map.getCanvas().style.cursor = 'crosshair'; });
      map.on('mouseleave', 'landuse', () => { map.getCanvas().style.cursor = ''; });
      map.on('mouseenter', 'landcover', () => { map.getCanvas().style.cursor = 'crosshair'; });
      map.on('mouseleave', 'landcover', () => { map.getCanvas().style.cursor = ''; });

      // Highlight Polygon Click Handler -> Inspector
      map.on('click', 'searched-parcel-fill', (e) => {
        // Reuse already loaded data in the Zustand store
        const state = useAppStore.getState();
        if (state.selectedParcel || state.selectedBuilding || state.selectedUnit) {
          // Open the main Inspector Panel
          setActiveTab('INSPECTOR');
        }
      });
      
      map.on('mouseenter', 'searched-parcel-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'searched-parcel-fill', () => { map.getCanvas().style.cursor = ''; });

      // Generic Popup for Amenities, Corridors, Boundaries
      const handleFeatureClick = (e: any) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties;
        
        const name = props.name || 'Name not available';
        const category = props.category || props.boundaryType || 'Unknown';
        const dataSource = props.dataSource || 'demo';
        
        const badgeColor = dataSource === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        const badgeIcon = dataSource === 'verified' ? `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>` : `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

        const html = `
          <div class="p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-xs font-sans">
            <div class="flex items-start justify-between gap-3 mb-2">
              <h3 class="text-sm font-bold text-white leading-tight">${name}</h3>
              <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${badgeColor}">
                ${badgeIcon}
                ${dataSource}
              </span>
            </div>
            <div class="text-xs text-slate-400 capitalize">
              <span class="font-medium text-slate-300">Type:</span> ${category}
            </div>
            ${props.capacity ? `<div class="text-xs text-slate-400 mt-1"><span class="font-medium text-slate-300">Capacity:</span> ${props.capacity}</div>` : ''}
            ${props.sourceName ? `<div class="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800">Source: ${props.sourceName}</div>` : ''}
          </div>
        `;

        new maplibregl.Popup({ className: 'custom-popup', closeButton: true, maxWidth: '300px' })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);
      };

      const hoverLayers = ['public-amenities-points', 'elevated-stations-points', 'elevated-corridors-lines', 'regulated-boundaries-fill'];
      hoverLayers.forEach(layer => {
        map.on('click', layer, handleFeatureClick);
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
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

  // Dynamic MCGM Underground Utilities (Update on Pan/Zoom)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    // X-Ray True Underground Mode: Make buildings and the ground transparent
    const isUndergroundActive = activeUndergroundLayerIds.length > 0;
    const buildingOpacity = isUndergroundActive ? 0.05 : 1.0;
    const authOpacity = isUndergroundActive ? 0.1 : 0.95;
    const groundOpacity = isUndergroundActive ? 0.05 : 0.5;
    const landuseOpacity = isUndergroundActive ? 0.05 : 0.7;
    const waterOpacity = isUndergroundActive ? 0.05 : 0.7;
    const roadOpacity = isUndergroundActive ? 0.1 : 0.9;
    const baseBuildingOpacity = isUndergroundActive ? 0.0 : 0.65;

    try {
      if (map.getLayer('3d-buildings')) {
        map.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', buildingOpacity);
      }
      if (map.getLayer('authoritative-buildings-layer')) {
        map.setPaintProperty('authoritative-buildings-layer', 'fill-extrusion-opacity', authOpacity);
      }
      if (map.getLayer('landcover')) {
        map.setPaintProperty('landcover', 'fill-opacity', groundOpacity);
      }
      if (map.getLayer('landuse')) {
        map.setPaintProperty('landuse', 'fill-opacity', landuseOpacity);
      }
      if (map.getLayer('water')) {
        map.setPaintProperty('water', 'fill-opacity', waterOpacity);
      }
      if (map.getLayer('background')) {
        map.setPaintProperty('background', 'background-opacity', isUndergroundActive ? 0.1 : 1.0);
      }
      if (map.getLayer('transportation-roads')) {
        map.setPaintProperty('transportation-roads', 'line-opacity', roadOpacity);
      }
      if (map.getLayer('transportation-primary')) {
        map.setPaintProperty('transportation-primary', 'line-opacity', roadOpacity);
      }
      if (map.getLayer('2d-buildings-base')) {
        map.setPaintProperty('2d-buildings-base', 'fill-opacity', baseBuildingOpacity);
      }
    } catch (err) {
      console.warn('[MapLibre] Failed to set X-Ray opacities', err);
    }

    const updateMCGMLayers = async () => {
      // Remove inactive layers
      const style = map.getStyle();
      if (!style || !style.layers) return;
      const currentLayerIds = style.layers.filter(l => l.id.startsWith('mcgm-underground-')).map(l => l.id.replace('mcgm-underground-layer-', ''));
      currentLayerIds.forEach(idStr => {
        const id = parseInt(idStr, 10);
        if (!activeUndergroundLayerIds.includes(id)) {
          if (map.getLayer(`mcgm-underground-layer-${id}`)) map.removeLayer(`mcgm-underground-layer-${id}`);
          if (map.getSource(`mcgm-underground-source-${id}`)) map.removeSource(`mcgm-underground-source-${id}`);
        }
      });

      if (activeUndergroundLayerIds.length === 0) return;

      const bounds = map.getBounds();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

      // Fetch and update active layers
      activeUndergroundLayerIds.forEach(async (id) => {
        const sourceId = `mcgm-underground-source-${id}`;
        const layerId = `mcgm-underground-layer-${id}`;
        
        try {
          const url = `https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers/MapServer/${id}/query?geometry=${bbox}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&f=geojson&resultRecordCount=2000`;
          
          let rawGeojson = await fetch(url).then(r => r.json());
          let geojson = rawGeojson;
          
          if (rawGeojson && rawGeojson.features && rawGeojson.features.length > 0) {
            try {
              // OPTIMIZATION: Simplify the raw lines to reduce vertex count before buffering
              const simplified = turf.simplify(rawGeojson as any, { tolerance: 0.00005, highQuality: false });
              // OPTIMIZATION: Use steps: 2 (instead of default 8) to reduce the 3D polygon complexity by 75%
              geojson = turf.buffer(simplified, 0.0015, { units: 'kilometers', steps: 2 });
            } catch (err) {
              console.warn('[MapLibre] Failed to buffer utility lines into 3D pipes:', err);
            }
          }
          
          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
              type: 'geojson',
              data: geojson
            });

            let color = '#38bdf8'; // default cyan
            if ([4, 5].includes(id)) color = '#a855f7'; // Sewer = purple
            if ([6, 7].includes(id)) color = '#10b981'; // SWD = green
            if ([310, 313].includes(id)) color = '#f59e0b'; // Tunnel = amber

            map.addLayer({
              id: layerId,
              type: 'fill-extrusion',
              source: sourceId,
              paint: {
                'fill-extrusion-color': color,
                'fill-extrusion-height': 2.1, // Visible above Z-culling plane
                'fill-extrusion-base': 0.1,   // Above Z=0 to prevent maplibre culling
                'fill-extrusion-opacity': 0.85
              }
            }, 'poi-labels'); // insert below labels
          } else {
            // Update the existing source with new data for the new chunk
            (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson as any);
          }
        } catch (e) {
          console.warn(`[MapLibre] Failed to load MCGM layer ${id}`, e);
        }
      });
    };

    updateMCGMLayers(); // Trigger immediately when toggled
    
    map.on('moveend', updateMCGMLayers);
    
    return () => {
      map.off('moveend', updateMCGMLayers);
    };
  }, [activeUndergroundLayerIds, mapLoaded]);

  // Procedurally generate Pan-India Underground Utilities
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const sourceId = 'procedural-utilities-source';
    const layerId = 'procedural-utilities-layer';

    const updateUtilities = async () => {
      if (!['engineer', 'utility'].includes(currentRole)) return;
      
      const bounds = map.getBounds();
      const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
      
      let features: any[] = [];
      try {
        const query = `[out:json];(way[man_made=pipeline](${bbox});way[power=cable](${bbox});way[route=pipeline](${bbox}););out geom;`;
        const res = await fetch(`https://overpass-api.de/api/interpreter`, { method: 'POST', body: query });
        const osmJson = await res.json();
        
        // Use Real Data if it exists in OSM
        if (osmJson && osmJson.elements && osmJson.elements.length > 0) {
          features = osmJson.elements.map((e: any) => {
            const isPower = e.tags.power === 'cable';
            const type = isPower ? 'POWER_HV' : (e.tags.substance === 'sewage' ? 'SEWER_DRAIN' : 'WATER_SUPPLY');
            return {
              type: 'Feature',
              properties: {
                assetType: type,
                owningAgency: e.tags.operator || 'Unknown Agency',
                depthMin: -1.5,
                depthMax: -2.5,
                color: isPower ? '#eab308' : (type === 'SEWER_DRAIN' ? '#f97316' : '#06b6d4')
              },
              geometry: {
                type: 'LineString',
                coordinates: e.geometry.map((pt: any) => [pt.lon, pt.lat])
              }
            };
          });
        } else {
          console.warn('[MapLibre] No real underground utility data mapped in this region of OpenStreetMap.');
        }
      } catch (err) {
        console.error('[MapLibre] Failed to fetch real utilities from OSM:', err);
      }

      const geojson = { type: 'FeatureCollection', features };

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: 'geojson', data: geojson as any });
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 4,
            'line-dasharray': [2, 2],
            'line-opacity': 0.85
          }
        }, 'poi-labels');
      } else {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson as any);
      }
    };

    if (['engineer', 'utility'].includes(currentRole)) {
      updateUtilities(); // initial render
      map.on('moveend', updateUtilities);
    } else {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }

    return () => {
      map.off('moveend', updateUtilities);
    };
  }, [currentRole, mapLoaded]);



  // Sync searched parcel geometry
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (searchedParcelGeoJSON) {
      if (!map.getSource('searched-parcel-source')) {
        map.addSource('searched-parcel-source', {
          type: 'geojson',
          data: searchedParcelGeoJSON
        });
        
        map.addLayer({
          id: 'searched-parcel-fill',
          type: 'fill',
          source: 'searched-parcel-source',
          paint: {
            'fill-color': '#10b981', // emerald-500
            'fill-opacity': 0.3
          },
          filter: ['==', ['geometry-type'], 'Polygon']
        }, 'poi-labels');

        map.addLayer({
          id: 'searched-parcel-line',
          type: 'line',
          source: 'searched-parcel-source',
          paint: {
            'line-color': '#10b981',
            'line-width': 3,
            'line-dasharray': [2, 1]
          },
          filter: ['==', ['geometry-type'], 'Polygon']
        }, 'poi-labels');

        map.addLayer({
          id: 'searched-parcel-point',
          type: 'circle',
          source: 'searched-parcel-source',
          paint: {
            'circle-color': '#a855f7', // purple-500
            'circle-radius': 10,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-pitch-alignment': 'map'
          },
          filter: ['==', ['geometry-type'], 'Point']
        }, 'poi-labels');
      } else {
        (map.getSource('searched-parcel-source') as maplibregl.GeoJSONSource).setData(searchedParcelGeoJSON);
      }
    } else {
      if (map.getLayer('searched-parcel-fill')) map.removeLayer('searched-parcel-fill');
      if (map.getLayer('searched-parcel-line')) map.removeLayer('searched-parcel-line');
      if (map.getLayer('searched-parcel-point')) map.removeLayer('searched-parcel-point');
      if (map.getSource('searched-parcel-source')) map.removeSource('searched-parcel-source');
    }
  }, [searchedParcelGeoJSON, mapLoaded]);

  // Sync layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    
    if (map.getLayer('mybmc-buildings-layer')) {
      map.setLayoutProperty('mybmc-buildings-layer', 'visibility', layers.mybmc ? 'visible' : 'none');
    }

    if (map.getLayer('mining-areas-fill')) {
      const showMining = activeTab === 'MINING';
      map.setLayoutProperty('mining-areas-fill', 'visibility', showMining ? 'visible' : 'none');
      map.setLayoutProperty('mining-areas-line', 'visibility', showMining ? 'visible' : 'none');
      if (map.getLayer('mining-tunnels-line')) {
        map.setLayoutProperty('mining-tunnels-line', 'visibility', showMining ? 'visible' : 'none');
        map.setLayoutProperty('mining-nodes-circle', 'visibility', showMining ? 'visible' : 'none');
      }
      if (map.getLayer('insar-points-heatmap')) {
        map.setLayoutProperty('insar-points-heatmap', 'visibility', showMining ? 'visible' : 'none');
      }
    }
  }, [layers.mybmc, layers.mining, activeTab, mapLoaded]);

  // Dynamically overwrite OSM building with authoritative height on click
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (selectedBuildingInfo) {
      const { featureId, featureSource, featureBldgId } = selectedBuildingInfo as any;
      
      // Highlight for OSM Vector Tile Buildings using pristine 2D geometry in a separate layer
      if (featureSource === 'openmaptiles' && selectedBuildingInfo.building.footprint) {
        const geojson = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: selectedBuildingInfo.building.footprint,
            properties: {
              height: (selectedBuildingInfo.height || 18) + 0.5,
              minHeight: selectedBuildingInfo.minHeight || 0
            }
          }]
        };

        if (!map.getSource('selected-osm-source')) {
          map.addSource('selected-osm-source', {
            type: 'geojson',
            data: geojson as any
          });
          map.addLayer({
            id: 'selected-osm-highlight',
            type: 'fill-extrusion',
            source: 'selected-osm-source',
            paint: {
              'fill-extrusion-color': '#0ea5e9',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'minHeight'],
              'fill-extrusion-opacity': 1.0 // Fully opaque, envelops original building to prevent Z-fighting
            }
          }, 'poi-labels');
        } else {
          (map.getSource('selected-osm-source') as maplibregl.GeoJSONSource).setData(geojson as any);
        }
      } else {
        if (map.getLayer('selected-osm-highlight')) map.removeLayer('selected-osm-highlight');
        if (map.getSource('selected-osm-source')) map.removeSource('selected-osm-source');
      }

      // Highlight for Procedural Landmarks directly on the base layer
      if (featureSource === 'detailed-landmarks-source' && featureBldgId) {
        if (map.getLayer('detailed-landmarks-3d')) {
          map.setPaintProperty('detailed-landmarks-3d', 'fill-extrusion-color', [
            'case',
            ['==', ['get', 'bldgId'], featureBldgId], '#0ea5e9',
            ['get', 'color']
          ]);
        }
      } else {
        if (map.getLayer('detailed-landmarks-3d')) {
          map.setPaintProperty('detailed-landmarks-3d', 'fill-extrusion-color', ['get', 'color']);
        }
      }
      
    } else {
      // Clear all highlights
      if (map.getLayer('selected-osm-highlight')) map.removeLayer('selected-osm-highlight');
      if (map.getSource('selected-osm-source')) map.removeSource('selected-osm-source');
      if (map.getLayer('detailed-landmarks-3d')) map.setPaintProperty('detailed-landmarks-3d', 'fill-extrusion-color', ['get', 'color']);
    }
  }, [selectedBuildingInfo, mapLoaded]);

  // Manage Draw Tool based on role
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (currentRole === 'engineer') {
      if (!drawRef.current) {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: { polygon: true, trash: true }
        });
        map.addControl(draw as any, 'top-left'); // Move to top-left to avoid collisions
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
    } else {
      if (drawRef.current) {
        map.removeControl(drawRef.current as any);
        drawRef.current = null;
        setFootprintGeoJSON(null);
      }
    }
  }, [currentRole, mapLoaded]);

  // 4D Temporal Year Simulation
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    if (!map.getLayer('3d-buildings')) return;

    let global_progress = 1.0;
    if (temporalYear < 2018) global_progress = 0.05;
    else if (temporalYear === 2018) global_progress = 0.08;
    else if (temporalYear === 2019) global_progress = 0.14;
    else if (temporalYear === 2020) global_progress = 0.20;
    else if (temporalYear === 2021) global_progress = 0.35;
    else if (temporalYear === 2022) global_progress = 0.55;
    else if (temporalYear === 2023) global_progress = 0.75;
    else if (temporalYear >= 2024) global_progress = 1.0;

    map.setPaintProperty('3d-buildings', 'fill-extrusion-height', [
      'let',
      'render_ht', ['case', ['has', 'render_height'], ['get', 'render_height'], 18],
      
      'seed', ['%', ['coalesce', ['id'], 0], 10],
      
      ['case',
        ['>', ['var', 'render_ht'], 40], ['*', ['var', 'render_ht'], global_progress],
        ['==', ['%', ['var', 'seed'], 2], 1], ['*', ['var', 'render_ht'], global_progress],
        ['var', 'render_ht']
      ]
    ]);

    if (map.getLayer('authoritative-buildings-layer')) {
      map.setPaintProperty('authoritative-buildings-layer', 'fill-extrusion-height', [
        'case',
        ['<', temporalYear, ['get', 'year_built']], 0,
        ['==', temporalYear, ['get', 'year_built']], ['*', ['get', 'render_height'], 0.5],
        ['get', 'render_height']
      ]);
    }
  }, [temporalYear, mapLoaded]);

  // Flood Simulation 
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    
    if (floodSimulation.active) {
      if (!map.getSource('flood-source')) {
        map.addSource('flood-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [72.7, 18.8],
                [73.1, 18.8],
                [73.1, 19.3],
                [72.7, 19.3],
                [72.7, 18.8]
              ]]
            }
          }
        });
        map.addLayer({
          id: 'flood-layer',
          type: 'fill-extrusion',
          source: 'flood-source',
          paint: {
            'fill-extrusion-color': '#06b6d4', // Sleek holographic cyan
            'fill-extrusion-opacity': 0.45,
            'fill-extrusion-height': floodSimulation.waterLevelM,
            'fill-extrusion-base': 0,
            'fill-extrusion-height-transition': { duration: 300, delay: 0 }
          } as any
        }, 'poi-labels');
      } else {
        map.setPaintProperty('flood-layer', 'fill-extrusion-height', floodSimulation.waterLevelM);
      }
    } else {
      if (map.getLayer('flood-layer')) {
        map.removeLayer('flood-layer');
        map.removeSource('flood-source');
      }
    }
  }, [floodSimulation.active, floodSimulation.waterLevelM, mapLoaded]);

  const setMapPitch = (pitch: number) => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({ pitch, duration: 800 });
    setCurrentPitch(pitch);
  };

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    
    if (basemapStyle === 'satellite') {
      if (map.getLayer('satellite-layer')) map.setLayoutProperty('satellite-layer', 'visibility', 'visible');
      if (map.getLayer('landcover')) map.setPaintProperty('landcover', 'fill-opacity', 0.1);
      if (map.getLayer('landuse')) map.setPaintProperty('landuse', 'fill-opacity', 0.1);
      if (map.getLayer('water')) map.setPaintProperty('water', 'fill-opacity', 0.2);
    } else {
      if (map.getLayer('satellite-layer')) map.setLayoutProperty('satellite-layer', 'visibility', 'none');
      if (map.getLayer('landcover')) map.setPaintProperty('landcover', 'fill-opacity', 1.0);
      if (map.getLayer('landuse')) map.setPaintProperty('landuse', 'fill-opacity', 1.0);
      if (map.getLayer('water')) map.setPaintProperty('water', 'fill-opacity', 1.0);
    }
  }, [basemapStyle, mapLoaded]);

  // ----------------------------------------------------
  // PUBLIC AMENITIES (Dynamic BMC ArcGIS Fetch)
  // ----------------------------------------------------
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const updateAmenities = async () => {
      const amenitiesEnabled = layers.publicAmenitiesParking || layers.publicAmenitiesParks || layers.publicAmenitiesSchools || layers.publicAmenitiesHospitals;
      
      if (!amenitiesEnabled) {
        if (map.getLayer('public-amenities-points')) {
          map.setLayoutProperty('public-amenities-points', 'visibility', 'none');
        }
        return;
      }

      const bounds = map.getBounds();
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

      // Mapping layers to their IDs and categories
      const targets = [
        { id: 214, cat: 'hospital', enabled: layers.publicAmenitiesHospitals, color: '#f43f5e', nameField: 'NAME', capField: null },
        { id: 296, cat: 'school', enabled: layers.publicAmenitiesSchools, color: '#f97316', nameField: 'SCHNAME', capField: null },
        { id: 329, cat: 'parking', enabled: layers.publicAmenitiesParking, color: '#3b82f6', nameField: 'NAME', capField: 'TOTAL' },
        { id: 327, cat: 'park', enabled: layers.publicAmenitiesParks, color: '#10b981', nameField: 'NAME', capField: null },
      ];

      const allFeatures: any[] = [];

      for (const t of targets) {
        if (!t.enabled) continue;
        const url = `https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers/MapServer/${t.id}/query?geometry=${bbox}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&f=geojson&resultRecordCount=2000`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.features) {
            data.features.forEach((f: any) => {
              // Convert polygons to points for parks using turf centroid
              let geom = f.geometry;
              if (geom && (geom.type === 'Polygon' || geom.type === 'MultiPolygon')) {
                try {
                  geom = turf.centroid(f).geometry;
                } catch (e) {
                  // Fallback if invalid
                }
              }

              // Force 2D Point
              if (geom && geom.type === 'Point' && geom.coordinates && geom.coordinates.length > 2) {
                geom.coordinates = [geom.coordinates[0], geom.coordinates[1]];
              }

              allFeatures.push({
                type: 'Feature',
                geometry: geom,
                properties: {
                  id: `bmc-${t.cat}-${f.properties?.OBJECTID || Math.random()}`,
                  category: t.cat,
                  name: f.properties?.[t.nameField] || `Unnamed ${t.cat}`,
                  capacity: t.capField ? f.properties?.[t.capField] : undefined,
                  dataSource: 'verified',
                  sourceName: 'BMC ArcGIS REST Services',
                  color: t.color
                }
              });
            });
          }
        } catch (e) {
          console.error(`Failed to fetch BMC amenity layer ${t.id}`, e);
        }
      }

      const featureCollection = { type: 'FeatureCollection', features: allFeatures };

      if (!mapRef.current) return;
      const activeMap = mapRef.current;

      if (!activeMap.getSource('public-amenities-source')) {
        activeMap.addSource('public-amenities-source', { type: 'geojson', data: featureCollection as any });
        activeMap.addLayer({
          id: 'public-amenities-points',
          type: 'circle',
          source: 'public-amenities-source',
          paint: {
            'circle-color': ['get', 'color'],
            'circle-radius': 6,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff'
          }
        });
      } else {
        (activeMap.getSource('public-amenities-source') as maplibregl.GeoJSONSource).setData(featureCollection as any);
        activeMap.setLayoutProperty('public-amenities-points', 'visibility', 'visible');
      }
    };

    updateAmenities();
    map.on('moveend', updateAmenities);

    return () => {
      map.off('moveend', updateAmenities);
    };
  }, [
    layers.publicAmenitiesParking, 
    layers.publicAmenitiesParks, 
    layers.publicAmenitiesSchools, 
    layers.publicAmenitiesHospitals, 
    mapLoaded
  ]);

  // ----------------------------------------------------
  // ELEVATED CORRIDORS & REGULATED BOUNDARIES
  // ----------------------------------------------------
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    // ----------------------------------------------------
    // ELEVATED CORRIDORS
    // ----------------------------------------------------
    if (layers.elevatedCorridors) {
      if (!map.getSource('elevated-corridors-source')) {
        map.addSource('elevated-corridors-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: SAMPLE_ELEVATED_CORRIDORS.map(c => ({
              type: 'Feature',
              properties: { ...c },
              geometry: c.geometry
            }))
          }
        });
        map.addLayer({
          id: 'elevated-corridors-lines',
          type: 'line',
          source: 'elevated-corridors-source',
          paint: {
            'line-color': '#a855f7',
            'line-width': 4,
            'line-dasharray': [2, 1]
          }
        });

        // Add Stations
        const stations = SAMPLE_ELEVATED_CORRIDORS.flatMap(c => c.stations || []);
        map.addSource('elevated-stations-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: stations.map(s => ({
              type: 'Feature',
              properties: { ...s },
              geometry: s.geometry
            }))
          }
        });
        map.addLayer({
          id: 'elevated-stations-points',
          type: 'circle',
          source: 'elevated-stations-source',
          paint: {
            'circle-color': '#ffffff',
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#a855f7'
          }
        });
      } else {
        map.setLayoutProperty('elevated-corridors-lines', 'visibility', 'visible');
        map.setLayoutProperty('elevated-stations-points', 'visibility', 'visible');
      }
    } else {
      if (map.getLayer('elevated-corridors-lines')) {
        map.setLayoutProperty('elevated-corridors-lines', 'visibility', 'none');
        map.setLayoutProperty('elevated-stations-points', 'visibility', 'none');
      }
    }

    // ----------------------------------------------------
    // REGULATED BOUNDARIES
    // ----------------------------------------------------
    if (layers.regulatedBoundaries) {
      if (!map.getSource('regulated-boundaries-source')) {
        map.addSource('regulated-boundaries-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: SAMPLE_REGULATED_BOUNDARIES.map(b => ({
              type: 'Feature',
              properties: { ...b, color: b.boundaryType === 'crz' ? '#3b82f6' : '#22c55e' },
              geometry: b.geometry
            }))
          }
        });
        map.addLayer({
          id: 'regulated-boundaries-fill',
          type: 'fill',
          source: 'regulated-boundaries-source',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.15
          }
        }, '3d-buildings'); // render below 3D buildings
        map.addLayer({
          id: 'regulated-boundaries-line',
          type: 'line',
          source: 'regulated-boundaries-source',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-dasharray': [4, 2]
          }
        }, '3d-buildings');
      } else {
        map.setLayoutProperty('regulated-boundaries-fill', 'visibility', 'visible');
        map.setLayoutProperty('regulated-boundaries-line', 'visibility', 'visible');
      }
    } else {
      if (map.getLayer('regulated-boundaries-fill')) {
        map.setLayoutProperty('regulated-boundaries-fill', 'visibility', 'none');
        map.setLayoutProperty('regulated-boundaries-line', 'visibility', 'none');
      }
    }

  }, [layers, mapLoaded]);

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

      {/* Top-Left HUD (Minimal Action Bar) */}
      <div className="absolute top-5 left-5 glass-panel rounded-xl p-1.5 pointer-events-auto flex items-center shadow-xl border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-1.5 px-2.5 border-r border-white/10">
          <Building2 className="w-3.5 h-3.5 text-brand-primary" />
          <span className="text-[11px] font-bold text-white tracking-wide">3D MAP</span>
        </div>
        
        <div className="flex items-center gap-1 px-2">
          <button onClick={() => flyToDistrict(72.8280, 18.9960, 15.2, 45, -30)} className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 rounded-md text-slate-300 font-medium transition-colors">Worli</button>
          <button onClick={() => flyToDistrict(72.8236, 18.9256, 15.5, 45, 10)} className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 rounded-md text-slate-300 font-medium transition-colors">Nariman</button>
          <button onClick={() => flyToDistrict(72.8682, 19.0716, 15.0, 40, -15)} className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 rounded-md text-slate-300 font-medium transition-colors">BKC</button>
          <button onClick={() => flyToDistrict(72.8745, 19.0980, 14.8, 45, 0)} className="px-2 py-1 text-[10px] bg-white/5 hover:bg-white/10 rounded-md text-slate-300 font-medium transition-colors">Airport</button>
        </div>
      </div>

      {/* Map Pitch Controls (Bottom-Left) */}
      <div className="absolute bottom-5 left-5 glass-panel rounded-xl p-1.5 pointer-events-auto flex items-center shadow-xl border-white/10 backdrop-blur-md gap-2">
        <div className="flex items-center gap-1 border-r border-white/10 pr-2">
          <button onClick={() => setBasemapStyle('street')} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${basemapStyle === 'street' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Map</button>
          <button onClick={() => setBasemapStyle('satellite')} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${basemapStyle === 'satellite' ? 'bg-brand-primary text-white shadow-sm' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Satellite</button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMapPitch(0)} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${currentPitch === 0 ? 'bg-brand-primary text-white shadow-sm' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>2D</button>
          <button onClick={() => setMapPitch(45)} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${currentPitch === 45 ? 'bg-brand-primary text-white shadow-sm' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>3D</button>
          <button onClick={() => setMapPitch(60)} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${currentPitch === 60 ? 'bg-brand-primary text-white shadow-sm' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>60°</button>
        </div>
      </div>


      {/* Clicked 3D Building Inspector Card (Bottom-Right) */}
      {selectedBuildingInfo && (
        <div className="absolute bottom-5 right-5 glass-panel-glow rounded-3xl p-5 w-80 pointer-events-auto space-y-4 shadow-2xl animate-in slide-in-from-right-4 fade-in duration-300 overflow-y-auto max-h-[85vh] custom-scrollbar">
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

          {isScrapingBmc && (
            <div className="glass-card p-4 rounded-xl border border-blue-500/20 bg-blue-950/10 space-y-3 mt-2 mb-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"></div>
                <div className="text-[10px] text-blue-400 font-mono animate-pulse">
                  Querying MyBMC Property Tax Portal...
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="h-2 bg-white/10 rounded w-3/4 animate-pulse"></div>
                <div className="h-2 bg-white/10 rounded w-1/2 animate-pulse"></div>
                <div className="h-6 bg-white/10 rounded w-full animate-pulse mt-2"></div>
              </div>
            </div>
          )}

          {!isFetchingBmc && !isScrapingBmc && selectedBuildingInfo.bmcData?.notFound && (
            <div className="glass-card p-2.5 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-2">
              <div className="text-[10px] text-rose-400 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3 h-3" /> No authoritative MyBMC record found here.
              </div>
            </div>
          )}

          {!isFetchingBmc && !isScrapingBmc && selectedBuildingInfo.bmcData && !selectedBuildingInfo.bmcData.notFound && (() => {
            // Helper for units
            let availableUnits: string[] = [];
            let floorNumStr = 'F0';
            
            // Check if building has hardcoded sample units
            const existingBldgUnits = SAMPLE_VERTICAL_UNITS.filter(u => u.buildingId === selectedBuildingInfo.id);
            
            let floorNumber = 0;
            if (selectedFloor === 'Ground Floor') floorNumber = 0;
            else if (selectedFloor === 'Basement') floorNumber = -1;
            else floorNumber = parseInt(selectedFloor.replace(/\D/g, '')) || 0;
            
            if (selectedFloor === 'Ground Floor') floorNumStr = 'F0';
            else if (selectedFloor === 'Basement') floorNumStr = 'B1';
            else floorNumStr = `F${floorNumber}`;

            if (existingBldgUnits.length > 0) {
              // Real data exists! Use it.
              const floorUnits = existingBldgUnits.filter(u => u.floorNumber === floorNumber);
              availableUnits = floorUnits.map(u => u.unitCode);
              if (availableUnits.length === 0) availableUnits = ['NO_UNITS_FOUND'];
            } else if (bmcScrapedUnits && Object.keys(bmcScrapedUnits).length > 0) {
              // We successfully fetched exact unit names from our BMC Scraper API!
              const fIndex = selectedFloor === 'Basement' || selectedFloor === 'Ground Floor' ? 0 : parseInt(selectedFloor.replace(/\D/g, '')) || 0;
              const scrapedFloorKey = fIndex === 0 ? 'Ground Floor' : `F${fIndex}`;
              
              // First try the exact floor key (F1, F2), then All Floors (if scraper couldn't distribute), then fallback
              availableUnits = bmcScrapedUnits[scrapedFloorKey] || bmcScrapedUnits['All Floors'] || bmcScrapedUnits['F1'] || [];
              
              if (availableUnits.length === 0) {
                 availableUnits = ['NO_UNITS_FOUND'];
              }
            } else {
              // Calculate realistic units per floor based on actual BMC unit count if available
              let unitsPerFloor = 1;
              const numFloors = Math.max(1, selectedBuildingInfo.floors);
              
              const bmcUnits = selectedBuildingInfo.bmcData?.unitCount || 0;
              
              if (bmcUnits > 0) {
                // Exact total count from MyBMC. Distribute mathematically so the total across all floors is 100% accurate.
                const baseUnits = Math.floor(bmcUnits / numFloors);
                const remainder = bmcUnits % numFloors;
                
                // Determine floor index (0 for Ground, 1 for F1, etc.)
                let fIndex = 0;
                if (selectedFloor === 'Basement') fIndex = 0;
                else if (selectedFloor === 'Ground Floor') fIndex = 0;
                else fIndex = parseInt(selectedFloor.replace(/\D/g, '')) || 0;
                
                // Add 1 extra unit to the first `remainder` floors to distribute perfectly
                unitsPerFloor = baseUnits + (fIndex < remainder ? 1 : 0);
                unitsPerFloor = Math.max(0, unitsPerFloor);
              } else {
                // Fallback: Calculate units per floor based on built-up area
                // Many buildings in BMC GIS have UNIT_CNT = 0 (like RN0408960310000), but property tax has the real units.
                // Since property tax API is secured, we MUST mathematically distribute units here so the user can select them!
                const totalArea = selectedBuildingInfo.building?.totalBuiltupAreaSqm || (numFloors * 650);
                const areaPerFloor = totalArea / numFloors;
                
                // Assume average flat size in Mumbai is ~65 sqm (approx 700 sqft)
                unitsPerFloor = Math.max(1, Math.round(areaPerFloor / 65));
                
                // Adjust for ground floor and basement which typically have fewer units (lobbies, parking, etc.)
                if (selectedFloor === 'Ground Floor' || selectedFloor === 'Basement') {
                  unitsPerFloor = Math.max(1, Math.floor(unitsPerFloor * 0.4));
                }
              }
              
              // Cap at a reasonable maximum to avoid UI clutter for massive podiums
              unitsPerFloor = Math.min(unitsPerFloor, 32);
              
              if (unitsPerFloor === 0) {
                 availableUnits = ['NO_UNITS_FOUND'];
              } else {
                 availableUnits = Array.from({ length: unitsPerFloor }).map((_, i) => {
                   const idx = i + 1;
                   if (selectedFloor === 'Ground Floor') return `0${idx}`;
                   if (selectedFloor === 'Basement') return `B0${idx}`;
                   return `${floorNumber}${idx < 10 ? '0' : ''}${idx}`;
                 });
                 if (availableUnits.length === 0) {
                   availableUnits = ['NA'];
                 }
              }
            }
            
            // Ensure selectedUnit is valid for this floor
            if (!availableUnits.includes(selectedUnit)) {
              // Only override if the user didn't just search for this specific unit
              if (searchedUlpin3D && searchedUlpin3D.includes(`-${selectedUnit}`)) {
                 availableUnits.push(selectedUnit);
                 availableUnits.sort();
              } else {
                 setTimeout(() => setSelectedUnit(availableUnits[0]), 0);
              }
            }

            // Generate accurate dynamic ULPIN based on selection
            const baseUlpin = selectedBuildingInfo.ulpin3D.split('.')[0] || selectedBuildingInfo.ulpin3D;
            const dynamicUlpin3D = `${baseUlpin}.${floorNumStr}.${selectedUnit}`;

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
          {(() => {
            const baseUlpin = selectedBuildingInfo.ulpin3D.split('.')[0] || selectedBuildingInfo.ulpin3D;
            let domainCode: 'G' | 'A' | 'U' = 'A';
            let levelNum = 0;
            
            if (selectedFloor === 'Ground Floor') {
              domainCode = 'G';
              levelNum = 0;
            } else if (selectedFloor === 'Basement') {
              domainCode = 'U';
              levelNum = -1;
            } else {
              domainCode = 'A';
              levelNum = parseInt(selectedFloor.replace(/\D/g, '')) || 1;
            }
            
            const computedDynamicUlpin = formatUlpin3D(baseUlpin, domainCode, levelNum, selectedUnit);

            return (
              <div className="glass-card p-3 rounded-2xl border border-white/5 bg-black/40 space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Synthesized 3D ULPIN</span>
                  <button
                    onClick={() => handleCopy(computedDynamicUlpin)}
                    className="text-cyan-300 hover:text-white flex items-center gap-0.5 font-mono"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono font-bold text-xs text-white break-all">
                  {computedDynamicUlpin}
                </div>
              </div>
            );
          })()}

          {/* Building Measurements */}
          {(() => {
            let progress = 1.0;
            if (temporalYear < 2018) progress = 0.05;
            else if (temporalYear === 2018) progress = 0.08;
            else if (temporalYear === 2019) progress = 0.14;
            else if (temporalYear === 2020) progress = 0.20;
            else if (temporalYear === 2021) progress = 0.35;
            else if (temporalYear === 2022) progress = 0.55;
            else if (temporalYear === 2023) progress = 0.75;
            else if (temporalYear >= 2024) progress = 1.0;

            if (!selectedBuildingInfo.isAnimated) progress = 1.0;

            const isUnderConstruction = progress > 0.0 && progress < 1.0;
            const displayHeight = Math.max(0, Math.round(selectedBuildingInfo.height * progress));
            const displayFloors = Math.max(0, Math.round(selectedBuildingInfo.floors * progress));
            
            return (
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
                <div className="glass-card p-2 rounded-lg border border-white/5 relative">
                  {isUnderConstruction && <div className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-black px-1 rounded-sm font-bold shadow-neon-emerald">U/C</div>}
                  <div className="text-slate-400 text-[8px]">HEIGHT</div>
                  <div className="font-bold text-cyan-300 text-xs mt-0.5">{displayHeight}m</div>
                </div>
                <div className="glass-card p-2 rounded-lg border border-white/5">
                  <div className="text-slate-400 text-[8px]">FLOORS</div>
                  <div className="font-bold text-emerald-300 text-xs mt-0.5">~{displayFloors}F</div>
                </div>
                <div className="glass-card p-2 rounded-lg border border-white/5">
                  <div className="text-slate-400 text-[8px]">BASE DATUM</div>
                  <div className="font-bold text-amber-300 text-xs mt-0.5">+{selectedBuildingInfo.minHeight}m</div>
                </div>
              </div>
            );
          })()}

          <button
            onClick={() => {
              if (selectedBuildingInfo?.building) {
                setSelectedBuilding(selectedBuildingInfo.building);
              }
              // Set the currently configured ULPIN so Exploded View highlights it
              const baseU = selectedBuildingInfo.ulpin3D.split('.')[0] || selectedBuildingInfo.ulpin3D;
              let dCode: 'G' | 'A' | 'U' = 'A';
              let lNum = 0;
              if (selectedFloor === 'Ground Floor') { dCode = 'G'; lNum = 0; }
              else if (selectedFloor === 'Basement') { dCode = 'U'; lNum = -1; }
              else { dCode = 'A'; lNum = parseInt(selectedFloor.replace(/\D/g, '')) || 1; }
              useAppStore.getState().setSearchedUlpin3D(formatUlpin3D(baseU, dCode, lNum, selectedUnit));
              
              // Automatically explode the building to make the highlighted unit visible
              useAppStore.getState().setExplodedDistance(1.5);
              
              setActiveTab('EXPLODED_3D');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-neon-cyan transition-all duration-300 hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Drill Down in Exploded 3D Scene &rarr;
          </button>
          
          {selectedBuildingInfo.buildingName.toLowerCase().includes('aquaria') && (
            <button
              onClick={() => setShowAquariaFloorPlan(true)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-neon-emerald transition-all duration-300 hover:scale-[1.02]"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-200" />
              View 3D Floor Plan & Mockups
            </button>
          )}
        </div>
      )}

      {/* Aquaria Grande Floor Plan Modal Overlay */}
      {showAquariaFloorPlan && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl max-h-full bg-slate-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="text-emerald-400" />
                Aquaria Grande - Mockups & Floor Plans
              </h2>
              
              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setAquariaViewMode('2D')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    aquariaViewMode === '2D' ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  2D Scraped Plans
                </button>
                <button
                  onClick={() => setAquariaViewMode('3D')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    aquariaViewMode === '3D' ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <BoxIcon className="w-3.5 h-3.5" />
                  Interactive 3D
                </button>
              </div>

              <button 
                onClick={() => setShowAquariaFloorPlan(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-hidden flex flex-col bg-slate-900">
              {aquariaViewMode === '3D' ? (
                <div className="w-full h-full flex-1">
                  <FloorPlan3D planIndex={parseInt(selectedUnit) || 0} />
                </div>
              ) : (
                <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col gap-8 items-center">
                  {[
                    'https://img.staticmb.com/mbimages/project/2023/11/08/Master-Plan-25-Wadhwa-Aquaria-Grande-Mumbai-5029949_462_700.jpg',
                    'https://img.staticmb.com/mbimages/project/Floor-Plan-2-Wadhwa-Aquaria-Grande-Mumbai-5029949_700_1024.jpg',
                    'https://img.staticmb.com/mbimages/project/Floor-Plan-23-Wadhwa-Aquaria-Grande-Mumbai-5029949_618_1024.jpg',
                    'https://img.staticmb.com/mbimages/project/Floor-Plan-24-Wadhwa-Aquaria-Grande-Mumbai-5029949_596_1024.jpg',
                    'https://img.staticmb.com/mbimages/project/Floor-Plan-3-Wadhwa-Aquaria-Grande-Mumbai-5029949_700_1024.jpg'
                  ].map((src, idx) => (
                    <div key={idx} className="w-full bg-white rounded-xl p-2 flex justify-center">
                      <img 
                        src={src} 
                        alt={`Floor plan ${idx + 1}`} 
                        className="max-w-full h-auto object-contain rounded-lg"
                        style={{ maxHeight: '70vh' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
