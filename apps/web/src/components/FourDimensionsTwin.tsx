'use client';

import React, { useState } from 'react';
import { Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface DimensionLayer {
  id: string;
  num: string;
  name: string;
  tag: string;
  subtitle: string;
  description: string;
  specs: { label: string; value: string }[];
}

const DIMENSIONS: DimensionLayer[] = [
  {
    id: 'parcels',
    num: '01',
    name: 'LAND / PARCELS',
    tag: 'SURFACE CADASTRE',
    subtitle: 'Geospatial Parcel Boundaries',
    description:
      'High-precision cadastral boundaries registered to Survey of India benchmarks. Every land parcel is assigned a 14-digit base ULPIN with sub-centimeter polygon vertices.',
    specs: [
      { label: 'COORDINATE DATUM', value: 'WGS84 / EPSG:4326' },
      { label: 'PARCEL ACCURACY', value: '± 0.05m RMS' },
      { label: 'RECORD LINKAGE', value: 'Mahabhulekh 7/12' },
      { label: 'SURFACE TYPE', value: 'Vector Cadastre' },
    ],
  },
  {
    id: 'subterranean',
    num: '02',
    name: 'UNDERGROUND INFRASTRUCTURE',
    tag: 'SUB-SURFACE TWIN',
    subtitle: 'Subterranean Utility & Transit Corridors',
    description:
      '3D subsurface network mapping Metro Line 3 tunnels, BMC high-pressure water mains, coastal road corridors and telecommunication ducts with safety buffers.',
    specs: [
      { label: 'MAX NETWORK DEPTH', value: '-45.0m MSL' },
      { label: 'PROTECTION ZONE', value: '15m Buffer' },
      { label: 'INFRASTRUCTURE', value: 'Metro 3 / BMC' },
      { label: 'SAFETY RATING', value: 'Excavation Safe' },
    ],
  },
  {
    id: 'vertical',
    num: '03',
    name: 'VERTICAL BUILDINGS',
    tag: 'EXPLODED UNITS',
    subtitle: 'Multi-Level Unit Ownership & Volume Cadastre',
    description:
      'Vertical 3D cadastral stratification. High-rise structures separate floor-by-floor to inspect individual apartments, commercial units, carpet areas and 3D ULPIN registry certificates.',
    specs: [
      { label: 'VERTICAL DATUM', value: 'MSL Orthometric' },
      { label: 'MAX STRATIFICATION', value: '120 Floors' },
      { label: 'PROPERTY STANDARD', value: 'ISO 19152 LADM' },
      { label: 'REVENUE MODEL', value: '3D Spatial Tax' },
    ],
  },
  {
    id: 'temporal',
    num: '04',
    name: 'TIME / 4D TEMPORAL',
    tag: 'TEMPORAL ENGINE',
    subtitle: 'Eight-Year Urban Transformation Timeline',
    description:
      '4D spacetime analysis from 2018 to 2026. Track urban expansion, FSI density changes, coastal land reclamation and construction progress with verified audit trails.',
    specs: [
      { label: 'TEMPORAL RANGE', value: '2018 – 2026' },
      { label: 'CHANGE INTERVALS', value: 'Quarterly Scan' },
      { label: 'AI ANOMALY ENGINE', value: 'Active Neural' },
      { label: 'AUDIT LEDGER', value: 'SHA-256 Hashed' },
    ],
  },
];

export function FourDimensionsTwin() {
  const [activeDim, setActiveDim] = useState<number>(0);
  const [timelineYear, setTimelineYear] = useState<number>(2026);
  const [rotationY, setRotationY] = useState<number>(0);

  const activeLayer = DIMENSIONS[activeDim];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    setRotationY(x * 12);
  };

  const handleMouseLeave = () => {
    setRotationY(0);
  };

  return (
    <section
      id="explore"
      className="relative w-full min-h-screen flex flex-col justify-center bg-[#080B0F] text-[#F5F5F5] overflow-hidden py-16 px-4 sm:px-8 select-none"
    >
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Clean Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span className="text-[11px] font-bold tracking-[0.16em] text-[#94A3B8] uppercase">
                Spatial Dimensions
              </span>
            </div>
            <h2 className="text-[26px] sm:text-[34px] font-extrabold tracking-tight text-white leading-tight">
              Four Dimensions of Urban Intelligence.
            </h2>
          </div>
        </div>

        {/* Neumorphic 2-Column Layout */}
        <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-stretch">
          {/* Left Column: Tactile Neumorphic Dimension Selector */}
          <div className="flex flex-col justify-between gap-3">
            <div className="space-y-3">
              {DIMENSIONS.map((dim, idx) => {
                const isActive = idx === activeDim;
                return (
                  <button
                    key={dim.id}
                    onClick={() => setActiveDim(idx)}
                    className={`w-full text-left p-5 rounded-[22px] transition-all duration-300 relative cursor-pointer ${
                      isActive
                        ? 'bg-[#F0F4F8] text-[#0F172A] border border-white'
                        : 'bg-[#E2E7EE] text-[#1E293B] border border-white/60 hover:bg-[#EAEFF5]'
                    }`}
                    style={{
                      boxShadow: isActive
                        ? '0 16px 36px rgba(0,0,0,0.5), inset 0 1px 2px #ffffff, 0 0 0 1px rgba(59,130,246,0.3)'
                        : '0 8px 20px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.7)',
                    }}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-[#3B82F6]" />
                    )}

                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[11px] font-mono font-bold tracking-wider ${
                          isActive ? 'text-[#2563EB]' : 'text-[#64748B]'
                        }`}
                      >
                        {dim.num}
                      </span>
                      <span
                        className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          isActive
                            ? 'bg-[#DEE6F0] text-[#1E293B]'
                            : 'bg-[#D2D9E2] text-[#475569]'
                        }`}
                        style={{
                          boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px #ffffff',
                        }}
                      >
                        {dim.tag}
                      </span>
                    </div>

                    <h3 className="text-[14px] font-extrabold tracking-tight text-[#0F172A] uppercase">
                      {dim.name}
                    </h3>
                    <p className="text-[11.5px] text-[#475569] mt-1 leading-[1.6]">
                      {dim.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Launch Workspace Link Button */}
            <Link
              href="/workspace"
              className="flex items-center justify-between p-4 rounded-[18px] bg-[#EAEFF4] text-[#0F172A] font-bold text-[11px] uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                boxShadow: '0 8px 20px rgba(0,0,0,0.35), inset 0 1px 2px #ffffff',
              }}
            >
              <span>Explore In Full 3D Map</span>
              <ArrowRight className="w-4 h-4 text-[#2563EB]" />
            </Link>
          </div>

          {/* Right Column: Tactile Grey-and-White Neumorphic Digital Twin Canvas */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative min-h-[500px] sm:min-h-[560px] rounded-[32px] bg-[#EAEFF4] border border-white p-7 sm:p-8 flex flex-col justify-between transition-all duration-500"
            style={{
              boxShadow: '0 24px 60px rgba(0,0,0,0.65), inset 0 1px 2px #ffffff, 0 0 0 1px rgba(255,255,255,0.9)',
            }}
          >
            {/* Top Control Bar */}
            <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
              {/* Active Dimension Pill */}
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DEE4EC] text-[#334155]"
                style={{
                  boxShadow: 'inset 2px 2px 4px #b8c0cc, inset -2px -2px 4px #ffffff',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                <span className="font-bold text-[10px] uppercase tracking-wider">{activeLayer.name}</span>
              </div>

              {/* 4D Temporal Year Selector (Active in Dimension 04) */}
              {activeDim === 3 ? (
                <div
                  className="flex items-center gap-1 p-1 rounded-full bg-[#DEE4EC]"
                  style={{
                    boxShadow: 'inset 2px 2px 4px #b8c0cc, inset -2px -2px 4px #ffffff',
                  }}
                >
                  {[2018, 2020, 2023, 2026].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setTimelineYear(yr)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono transition-all ${
                        timelineYear === yr
                          ? 'bg-[#0F172A] text-white shadow-sm'
                          : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-[#64748B] font-semibold">
                  GeoElevate 3D Cadastral Layer
                </span>
              )}
            </div>

            {/* Central Clean 3D Vector Visualizer */}
            <div
              className="relative my-auto w-full h-[320px] sm:h-[360px] flex items-center justify-center transition-transform duration-300 ease-out"
              style={{
                transform: `perspective(1000px) rotateY(${rotationY}deg)`,
              }}
            >
              {/* ────────────────── LAYER 01: LAND / PARCELS ────────────────── */}
              {activeDim === 0 && (
                <svg className="w-full max-w-[440px] h-auto drop-shadow-[0_12px_24px_rgba(140,155,175,0.4)]" viewBox="0 0 400 300" fill="none">
                  {/* Terrain Baseline Plate */}
                  <polygon points="200,40 360,130 200,220 40,130" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                  
                  {/* Cadastral Grid Subdivisions in White/Grey/Soft Blue */}
                  <polygon points="200,40 280,85 200,130 120,85" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
                  <polygon points="280,85 360,130 280,175 200,130" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.8" />
                  <polygon points="200,130 280,175 200,220 120,175" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
                  <polygon points="120,85 200,130 120,175 40,130" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />

                  {/* Parcel Centroid Marker */}
                  <circle cx="280" cy="130" r="5" fill="#0284C7" />
                  <circle cx="280" cy="130" r="10" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
                  
                  {/* Neumorphic Parcel Tag */}
                  <rect x="230" y="60" width="100" height="26" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                  <text x="280" y="77" fill="#0F172A" fontSize="9.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    MH13BOM04521
                  </text>

                  {/* Vertex Nodes */}
                  <circle cx="200" cy="40" r="3" fill="#475569" />
                  <circle cx="360" cy="130" r="3" fill="#475569" />
                  <circle cx="200" cy="220" r="3" fill="#475569" />
                  <circle cx="40" cy="130" r="3" fill="#475569" />
                </svg>
              )}

              {/* ────────────────── LAYER 02: UNDERGROUND INFRASTRUCTURE ────────────────── */}
              {activeDim === 1 && (
                <svg className="w-full max-w-[440px] h-auto drop-shadow-[0_12px_24px_rgba(140,155,175,0.4)]" viewBox="0 0 400 300" fill="none">
                  {/* Ground Surface Plate (Translucent White) */}
                  <polygon points="200,30 360,110 200,190 40,110" fill="#FFFFFF" fillOpacity="0.8" stroke="#CBD5E1" strokeWidth="1.5" />
                  
                  {/* Subsurface Rock Volume */}
                  <polygon points="40,110 200,190 200,270 40,190" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
                  <polygon points="200,190 360,110 360,190 200,270" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.2" />

                  {/* Metro Line 3 Tunnel Cylinder in Soft Slate / Blue */}
                  <path d="M100,170 Q200,230 300,160" stroke="#0284C7" strokeWidth="6" strokeLinecap="round" fill="none" />
                  <path d="M100,170 Q200,230 300,160" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />

                  {/* Underground Water Aqueduct Conduits */}
                  <path d="M160,130 L160,210 L240,240" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <circle cx="160" cy="210" r="4" fill="#0284C7" />
                  <circle cx="240" cy="240" r="4" fill="#0284C7" />

                  {/* Depth Benchmark Annotations */}
                  <line x1="30" y1="110" x2="30" y2="240" stroke="#94A3B8" strokeWidth="1.5" />
                  <text x="24" y="115" fill="#475569" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="end">0.0m</text>
                  <text x="24" y="180" fill="#0284C7" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="end">-22.5m</text>
                  <text x="24" y="240" fill="#0284C7" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="end">-45.0m</text>
                </svg>
              )}

              {/* ────────────────── LAYER 03: VERTICAL BUILDINGS (EXPLODED) ────────────────── */}
              {activeDim === 2 && (
                <svg className="w-full max-w-[440px] h-auto drop-shadow-[0_16px_32px_rgba(140,155,175,0.45)]" viewBox="0 0 400 320" fill="none">
                  {/* Ground Foundation Plinth */}
                  <polygon points="200,220 320,270 200,310 80,270" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.2" />

                  {/* Exploded Floor Slices in Clean White & Slate */}
                  {/* Floor 1 (Ground Level) */}
                  <g transform="translate(0, 40)">
                    <polygon points="200,180 290,218 200,250 110,218" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.2" />
                    <text x="200" y="222" fill="#475569" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">LEVEL 01 (RETAIL)</text>
                  </g>

                  {/* Floor 2 (Mid Level) */}
                  <g transform="translate(0, -10)">
                    <polygon points="200,140 290,178 200,210 110,178" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
                    <text x="200" y="182" fill="#334155" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">LEVEL 08 (OFFICE)</text>
                  </g>

                  {/* Floor 3 (Exploded Residential Unit with Soft Blue Accent) */}
                  <g transform="translate(0, -60)">
                    <polygon points="200,100 290,138 200,170 110,138" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.8" />
                    <polygon points="200,100 250,120 200,138 150,120" fill="#BAE6FD" stroke="#0369A1" strokeWidth="1.2" />
                    
                    {/* Unit Certificate Floating Pill */}
                    <rect x="220" y="60" width="130" height="26" rx="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
                    <text x="285" y="77" fill="#0F172A" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      UNIT B-1402 (ULPIN 3D)
                    </text>
                  </g>

                  {/* Roof Level */}
                  <g transform="translate(0, -110)">
                    <polygon points="200,70 290,108 200,140 110,108" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                    <circle cx="200" cy="70" r="3.5" fill="#0284C7" />
                  </g>

                  {/* Height Indicator */}
                  <line x1="75" y1="60" x2="75" y2="280" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="65" y="170" fill="#475569" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="end">+145.0m</text>
                </svg>
              )}

              {/* ────────────────── LAYER 04: TIME / 4D TEMPORAL ────────────────── */}
              {activeDim === 3 && (
                <svg className="w-full max-w-[440px] h-auto drop-shadow-[0_12px_24px_rgba(140,155,175,0.4)]" viewBox="0 0 400 300" fill="none">
                  {/* Base Land Grid */}
                  <polygon points="200,50 360,130 200,210 40,130" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />

                  {/* Dynamic Buildings corresponding to timeline year */}
                  {timelineYear >= 2018 && (
                    <g>
                      <polygon points="140,100 170,115 170,145 140,130" fill="#E2E8F0" stroke="#94A3B8" />
                      <polygon points="170,115 200,100 200,130 170,145" fill="#CBD5E1" stroke="#94A3B8" />
                      <polygon points="140,100 170,85 200,100 170,115" fill="#FFFFFF" stroke="#94A3B8" />
                    </g>
                  )}

                  {timelineYear >= 2020 && (
                    <g transform="translate(60, 20)">
                      <polygon points="140,80 180,100 180,145 140,125" fill="#E2E8F0" stroke="#94A3B8" />
                      <polygon points="180,100 220,80 220,125 180,145" fill="#CBD5E1" stroke="#94A3B8" />
                      <polygon points="140,80 180,60 220,80 180,100" fill="#FFFFFF" stroke="#94A3B8" />
                    </g>
                  )}

                  {timelineYear >= 2023 && (
                    <g transform="translate(-40, 25)">
                      <polygon points="160,60 200,80 200,145 160,125" fill="#E0F2FE" stroke="#0284C7" />
                      <polygon points="200,80 240,60 240,125 200,145" fill="#BAE6FD" stroke="#0284C7" />
                      <polygon points="160,60 200,40 240,60 200,80" fill="#FFFFFF" stroke="#0284C7" />
                    </g>
                  )}

                  {timelineYear >= 2026 && (
                    <g transform="translate(40, -20)">
                      <polygon points="180,40 220,60 220,140 180,120" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                      <polygon points="220,60 260,40 260,120 220,140" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" />
                      <polygon points="180,40 220,20 260,40 220,60" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                      <circle cx="220" cy="20" r="3.5" fill="#0284C7" />
                    </g>
                  )}
                </svg>
              )}
            </div>

            {/* Bottom Specs Bar: Neumorphic Inset Chips */}
            <div className="relative z-20 pt-4 border-t border-[#CBD5E1]/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-mono">
              {activeLayer.specs.map((spec, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-[#DEE4EC] p-2.5 rounded-[12px]"
                  style={{
                    boxShadow: 'inset 2px 2px 4px #c2c9d4, inset -2px -2px 4px #ffffff',
                  }}
                >
                  <p className="text-[8px] uppercase tracking-wider text-[#64748B] font-semibold">{spec.label}</p>
                  <p className="text-[#0F172A] font-bold tracking-tight text-[11px] mt-0.5">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
