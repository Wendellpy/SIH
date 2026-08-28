'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { LayerControl } from '@/components/LayerControl';
import { FloorScrubber } from '@/components/FloorScrubber';
import { UndergroundControl } from '@/components/UndergroundControl';
import { UndergroundTestPanel } from '@/components/UndergroundTestPanel';
import { InspectorPanel } from '@/components/InspectorPanel';
import { AIStudio } from '@/components/AIStudio';
import { AdminPortal } from '@/components/AdminPortal';
import { TimelineSlider } from '@/components/TimelineSlider';
import { useAppStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

// Dynamic client-only WebGL & MapLibre components to prevent SSR canvas issues
const MapLibre3DMap = dynamic(
  () => import('@/components/MapLibre3DMap').then((mod) => mod.MapLibre3DMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#070b14] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono">Loading MapLibre 3D Vector Tiles (MBTiles)...</span>
      </div>
    ),
  }
);

const City3DMap = dynamic(
  () => import('@/components/City3DMap').then((mod) => mod.City3DMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#070b14] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <span className="text-xs font-mono">Initializing 3D Cadastral WebGL Engine...</span>
      </div>
    ),
  }
);

const Exploded3DViewer = dynamic(
  () => import('@/components/Exploded3DViewer').then((mod) => mod.Exploded3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#070b14] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        <span className="text-xs font-mono">Loading 3D Exploded Drill-Down Scene...</span>
      </div>
    ),
  }
);

export default function HomePage() {
  const { activeTab } = useAppStore();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#060911] text-slate-100 overflow-hidden">
      {/* Top Application Header */}
      <Header />

      {/* Main Body Area */}
      <main className="relative flex-1 flex overflow-hidden p-3 gap-3">
        {/* Active Workspace Viewport */}
        <div className="relative flex-1 h-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#030712]">
          {activeTab === 'MAPLIBRE_3D' && (
            <div className="relative w-full h-full">
              <MapLibre3DMap />
              <div className="absolute top-4 right-4 z-20 pointer-events-auto">
                <UndergroundControl />
              </div>

              {/* 4D Temporal Slider on Bottom-Center */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-20 pointer-events-auto">
                <TimelineSlider />
              </div>
            </div>
          )}

          {activeTab === 'MAP_3D' && (
            <div className="relative w-full h-full">
              <City3DMap />
              
              {/* Floating Layer Control on Top-Right */}
              <div className="absolute top-4 right-4 z-20 pointer-events-auto">
                <LayerControl />
              </div>

              {/* Floating Vertical Scrubber on Bottom-Left */}
              <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
                <FloorScrubber />
              </div>

              {/* 4D Temporal Slider on Bottom-Center */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-20 pointer-events-auto">
                <TimelineSlider />
              </div>
            </div>
          )}

          {activeTab === 'EXPLODED_3D' && (
            <div className="w-full h-full">
              <Exploded3DViewer />
            </div>
          )}

          {activeTab === 'AI_STUDIO' && (
            <div className="w-full h-full">
              <AIStudio />
            </div>
          )}

          {(activeTab === 'ADMIN_PORTAL' || activeTab === 'AUDIT_LEDGER') && (
            <div className="w-full h-full">
              <AdminPortal />
            </div>
          )}
        </div>

        {/* Right Inspector Panel (Visible in 3D views) */}
        {(activeTab === 'MAP_3D' || activeTab === 'EXPLODED_3D') && (
          <aside className="h-full flex-shrink-0 z-20">
            <InspectorPanel />
          </aside>
        )}
      </main>

      <UndergroundTestPanel />
    </div>
  );
}
