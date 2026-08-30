'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { UndergroundControl } from '@/components/UndergroundControl';
import { UndergroundTestPanel } from '@/components/UndergroundTestPanel';
import { InspectorPanel } from '@/components/InspectorPanel';
import { AdminPortal } from '@/components/AdminPortal';
import { TimelineSlider } from '@/components/TimelineSlider';
import { useAppStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import { MaharashtraTestPanel } from '@/components/MaharashtraTestPanel';
import { MaharashtraPanel } from '@/components/MaharashtraPanel';

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

export default function WorkspacePage() {
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

          {activeTab === 'EXPLODED_3D' && (
            <div className="w-full h-full relative">
              <Exploded3DViewer />
              <div className="absolute top-4 right-4 h-[calc(100%-2rem)] z-20 pointer-events-auto">
                <InspectorPanel />
              </div>
            </div>
          )}

          {(activeTab === 'ADMIN_PORTAL' || activeTab === 'AUDIT_LEDGER') && (
            <div className="w-full h-full">
              <AdminPortal />
            </div>
          )}

          {activeTab === 'MAHARASHTRA' && (
            <div className="w-full h-full bg-[#030712] overflow-y-auto">
              <MaharashtraPanel />
            </div>
          )}
        </div>
      </main>

      <UndergroundTestPanel />
      <MaharashtraTestPanel />
    </div>
  );
}
