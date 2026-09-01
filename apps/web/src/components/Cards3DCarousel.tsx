'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

// Register GSAP ScrollTrigger on client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface CarouselCardData {
  id: string;
  badge: string;
  metric: string;
  title: string;
  subtitle: string;
  desc: string;
  stats: { label: string; value: string }[];
  tag: string;
}

const CAROUSEL_CARDS: CarouselCardData[] = [
  {
    id: 'property',
    badge: '3D CADASTRE',
    metric: '2.4M+ UNITS',
    title: 'PROPERTY',
    subtitle: 'Vertical Cadastral Units',
    desc: 'Floor-by-floor spatial registries with 3D unit geometry, conflict detection and certified ownership title tracking.',
    stats: [
      { label: 'STANDARD', value: 'ISO 19152 LADM' },
      { label: 'ACCURACY', value: '< 0.1m 3D' },
    ],
    tag: 'CADASTRE',
  },
  {
    id: 'infrastructure',
    badge: 'SUBTERRANEAN',
    metric: '150+ NETWORKS',
    title: 'INFRASTRUCTURE',
    subtitle: 'Subsurface Utility Twin',
    desc: 'Full subterranean intelligence mapping metro lines, BMC trunk water mains, sewage grids and safe excavation corridors.',
    stats: [
      { label: 'MAX DEPTH', value: '-45.0m MSL' },
      { label: 'STATUS', value: 'ACTIVE MESH' },
    ],
    tag: 'UTILITIES',
  },
  {
    id: 'land',
    badge: 'SURVEY OF INDIA',
    metric: '14-DIGIT ULPIN',
    title: 'LAND',
    subtitle: 'Unified Geo-Parcel Engine',
    desc: 'GeoElevate coordinates anchored directly to Survey of India benchmarks and Revenue Department spatial boundaries.',
    stats: [
      { label: 'DATUM', value: 'WGS84 / UTM 43N' },
      { label: 'PARCELS', value: 'VERIFIED' },
    ],
    tag: 'TERRAIN',
  },
  {
    id: 'intelligence',
    badge: 'SPATIAL AI',
    metric: '75+ MODELS',
    title: 'INTELLIGENCE',
    subtitle: 'Predictive Temporal Analytics',
    desc: '4D urban growth scrubbing (2018–2026), automated FSI violation audits and real-time cadastral anomaly alerts.',
    stats: [
      { label: 'TEMPORAL', value: '8-YR TIMELINE' },
      { label: 'AUDIT', value: 'HASH VERIFIED' },
    ],
    tag: 'ANALYTICS',
  },
];

/* ── Clean White/Grey 3D Monochrome Vector Illustrations (Neumorphic) ── */
function CardIllustration({ id }: { id: string }) {
  if (id === 'property') {
    return (
      <svg className="w-24 h-24 sm:w-28 sm:h-28 text-slate-700 drop-shadow-[0_8px_16px_rgba(140,155,175,0.35)]" viewBox="0 0 120 120" fill="none">
        {/* Isometric 3D High-rise structure in white & matte grey */}
        <polygon points="60,16 96,36 60,56 24,36" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
        <polygon points="24,36 60,56 60,104 24,84" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
        <polygon points="60,56 96,36 96,84 60,104" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.2" />
        
        {/* Floor slice level lines */}
        <path d="M24,52 L60,72 L96,52" stroke="#64748B" strokeWidth="1.2" strokeDasharray="3 2" />
        <path d="M24,68 L60,88 L96,68" stroke="#475569" strokeWidth="1.4" />
        <path d="M24,84 L60,104 L96,84" stroke="#64748B" strokeWidth="1.2" strokeDasharray="3 2" />

        {/* Highlighted 3D Unit */}
        <polygon points="60,68 86,54 86,68 60,82" fill="#FFFFFF" fillOpacity="0.9" stroke="#334155" strokeWidth="1.5" />

        {/* Top beacon */}
        <circle cx="60" cy="16" r="3.5" fill="#334155" />
        <line x1="60" y1="6" x2="60" y2="16" stroke="#475569" strokeWidth="1.5" />
      </svg>
    );
  }

  if (id === 'infrastructure') {
    return (
      <svg className="w-24 h-24 sm:w-28 sm:h-28 text-slate-700 drop-shadow-[0_8px_16px_rgba(140,155,175,0.35)]" viewBox="0 0 120 120" fill="none">
        {/* Ground surface plate */}
        <polygon points="60,22 98,42 60,62 22,42" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
        
        {/* Subsurface tunnel cylinders in tactile monochrome */}
        <ellipse cx="60" cy="84" rx="34" ry="18" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
        <ellipse cx="60" cy="84" rx="25" ry="13" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        
        {/* Subterranean pipeline conduits */}
        <path d="M32,44 L32,74 L48,82 L86,82" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M88,44 L88,68 L74,76" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
        
        {/* Depth benchmark */}
        <line x1="16" y1="42" x2="16" y2="84" stroke="#94A3B8" strokeWidth="1.5" />
        <circle cx="16" cy="42" r="2.5" fill="#64748B" />
        <circle cx="16" cy="84" r="2.5" fill="#334155" />
      </svg>
    );
  }

  if (id === 'land') {
    return (
      <svg className="w-24 h-24 sm:w-28 sm:h-28 text-slate-700 drop-shadow-[0_8px_16px_rgba(140,155,175,0.35)]" viewBox="0 0 120 120" fill="none">
        {/* 3D Isometric Land Terrain Mesh */}
        <polygon points="60,22 102,44 60,66 18,44" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
        <polygon points="18,44 60,66 60,94 18,72" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
        <polygon points="60,66 102,44 102,72 60,94" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.2" />

        {/* Survey cadastral boundary */}
        <polygon points="42,38 78,32 86,50 50,56" fill="#F8FAFC" fillOpacity="0.95" stroke="#334155" strokeWidth="1.5" />
        <circle cx="42" cy="38" r="2.5" fill="#334155" />
        <circle cx="78" cy="32" r="2.5" fill="#334155" />
        <circle cx="86" cy="50" r="2.5" fill="#334155" />
        <circle cx="50" cy="56" r="2.5" fill="#334155" />

        {/* Geo survey pin */}
        <circle cx="64" cy="42" r="3.5" fill="#0F172A" />
        <circle cx="64" cy="42" r="7" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    );
  }

  // Intelligence default
  return (
    <svg className="w-24 h-24 sm:w-28 sm:h-28 text-slate-700 drop-shadow-[0_8px_16px_rgba(140,155,175,0.35)]" viewBox="0 0 120 120" fill="none">
      {/* 3D Isometric AI Data Cube */}
      <polygon points="60,18 96,36 60,54 24,36" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
      <polygon points="24,36 60,54 60,96 24,78" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
      <polygon points="60,54 96,36 96,78 60,96" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.2" />

      {/* Internal neural lattice connections */}
      <circle cx="60" cy="54" r="4" fill="#0F172A" />
      <line x1="60" y1="54" x2="42" y2="44" stroke="#475569" strokeWidth="1.5" />
      <circle cx="42" cy="44" r="3" fill="#334155" />
      <line x1="60" y1="54" x2="78" y2="44" stroke="#475569" strokeWidth="1.5" />
      <circle cx="78" cy="44" r="3" fill="#334155" />
      <line x1="60" y1="54" x2="60" y2="76" stroke="#475569" strokeWidth="1.5" />
      <circle cx="60" cy="76" r="3" fill="#334155" />
    </svg>
  );
}

export function Cards3DCarousel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const numCards = CAROUSEL_CARDS.length;

  // Sync GSAP ScrollTrigger to scroll through cards
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const targetIndex = Math.min(
            numCards - 1,
            Math.max(0, Math.floor(self.progress * numCards * 0.999))
          );
          setActiveIndex(targetIndex);
        },
      });
    }, section);

    return () => ctx.revert();
  }, [numCards]);

  const goToCard = useCallback((idx: number) => {
    const nextIdx = Math.max(0, Math.min(numCards - 1, idx));
    setActiveIndex(nextIdx);
  }, [numCards]);

  const handlePrev = () => goToCard(activeIndex - 1);
  const handleNext = () => goToCard(activeIndex + 1);

  // Touch / swipe handling
  const touchStartX = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) handleNext();
    else if (diff < -40) handlePrev();
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#080B0F] overflow-hidden py-16 px-4 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Carousel Stage */}
      <div className="relative w-full max-w-6xl h-[520px] sm:h-[560px] flex items-center justify-center perspective-[1200px] z-10">
        <div
          ref={trackRef}
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {CAROUSEL_CARDS.map((card, idx) => {
            const offset = idx - activeIndex;
            const isCenter = offset === 0;

            // 3D positioning calculations (Neumorphic coverflow on dark canvas)
            const rotateY = isCenter ? 0 : offset > 0 ? -22 : 22;
            const translateX = offset * 320;
            const translateZ = isCenter ? 35 : -90;
            const scale = isCenter ? 1.02 : 0.86;
            const opacity = isCenter ? 1 : Math.abs(offset) === 1 ? 0.8 : 0.3;
            const zIndex = isCenter ? 30 : 20 - Math.abs(offset);

            return (
              <div
                key={card.id}
                onClick={() => goToCard(idx)}
                className={`absolute w-[310px] sm:w-[360px] md:w-[380px] h-[440px] sm:h-[480px] rounded-[32px] p-7 flex flex-col justify-between cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  isCenter
                    ? 'bg-[#EAEFF4] border border-white'
                    : 'bg-[#DCE2EA] border border-white/60 hover:bg-[#E2E8F0]'
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: 'preserve-3d',
                  boxShadow: isCenter
                    ? '0 28px 65px rgba(0,0,0,0.65), inset 0 1px 2px #ffffff, 0 0 0 1px rgba(255,255,255,0.9)'
                    : '0 16px 40px rgba(0,0,0,0.55), inset 0 1px 2px rgba(255,255,255,0.7), 0 0 0 1px rgba(255,255,255,0.5)',
                }}
              >
                {/* Card Top Row: Neumorphic Inset Badge & Raised Metric */}
                <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.14em] uppercase">
                  {/* Inset Sunken Badge */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[#475569] bg-[#DEE4EC]"
                    style={{
                      boxShadow: 'inset 2px 2px 4px #b8c0cc, inset -2px -2px 4px #ffffff',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#475569]" />
                    <span className="text-[9px] font-semibold">{card.badge}</span>
                  </div>

                  {/* Raised Metric Tag */}
                  <span
                    className="text-[#1E293B] font-mono text-[9px] font-bold px-3 py-1 rounded-full bg-[#F1F5F9]"
                    style={{
                      boxShadow: '3px 3px 6px #b8c0cc, -3px -3px 6px #ffffff',
                    }}
                  >
                    {card.metric}
                  </span>
                </div>

                {/* Card Center: Neumorphic Tactile Illustration Disc & Typography */}
                <div className="flex flex-col items-center text-center my-auto py-2">
                  {/* Tactile Inset Embossed Disc for Illustration */}
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center mb-4 bg-[#E2E8F0]"
                    style={{
                      boxShadow: 'inset 4px 4px 8px #b4becb, inset -4px -4px 8px #ffffff',
                    }}
                  >
                    <CardIllustration id={card.id} />
                  </div>

                  <h3 className="text-[21px] sm:text-[24px] font-extrabold tracking-tight text-[#0F172A] uppercase">
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-medium text-[#64748B] tracking-wide mt-0.5">
                    {card.subtitle}
                  </p>
                  <p className="text-[11.5px] sm:text-[12px] text-[#475569] leading-[1.65] mt-2.5 max-w-[290px]">
                    {card.desc}
                  </p>
                </div>

                {/* Card Bottom: Metadata Stats & Tactile Raised Action Button */}
                <div className="pt-4 border-t border-[#CBD5E1]/80 flex items-center justify-between text-[9px] font-mono">
                  {card.stats.map((st, sIdx) => (
                    <div key={sIdx} className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-wider text-[#64748B] font-semibold">{st.label}</span>
                      <span className="font-bold text-[#0F172A] text-[10px] tracking-tight">{st.value}</span>
                    </div>
                  ))}

                  {/* Neumorphic Tactile Pill Button */}
                  <Link
                    href="/workspace"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0F172A] bg-[#E2E8F0] px-3.5 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      boxShadow: '3px 3px 7px #b8c0cc, -3px -3px 7px #ffffff',
                    }}
                  >
                    View <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controller & 01/04 Progress Indicator (Dark Theme Seamless) */}
      <div className="relative z-20 mt-8 flex items-center gap-6">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          aria-label="Previous card"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-[#12171E] border border-white/10 ${
            activeIndex === 0
              ? 'text-white/20 opacity-40 cursor-not-allowed'
              : 'text-white hover:bg-white/10 hover:border-white/30 active:scale-95 cursor-pointer shadow-lg'
          }`}
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Dark Inset Pill Track with 01 / 04 */}
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-[#12171E] border border-white/10 shadow-inner">
          <span className="font-mono text-[11px] font-bold tracking-widest text-white">
            0{activeIndex + 1}
          </span>
          <div className="flex items-center gap-1.5">
            {CAROUSEL_CARDS.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => goToCard(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  dotIdx === activeIndex
                    ? 'w-6 bg-white shadow-sm'
                    : 'w-2 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-[11px] font-semibold tracking-widest text-[#68717B]">
            0{numCards}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={activeIndex === numCards - 1}
          aria-label="Next card"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-[#12171E] border border-white/10 ${
            activeIndex === numCards - 1
              ? 'text-white/20 opacity-40 cursor-not-allowed'
              : 'text-white hover:bg-white/10 hover:border-white/30 active:scale-95 cursor-pointer shadow-lg'
          }`}
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </section>
  );
}
