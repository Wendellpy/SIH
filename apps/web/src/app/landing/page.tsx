'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Building2, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Cards3DCarousel } from '@/components/Cards3DCarousel';
import { FourDimensionsTwin } from '@/components/FourDimensionsTwin';
import { ArchitecturalBuildingViewer } from '@/components/ArchitecturalBuildingViewer';

/* ═══════════════════════════════════════════════════
   Bhū-Aadhaar 3D Engine — Complete Landing Page
   Premium digital-twin command center aesthetic
   ═══════════════════════════════════════════════════ */

/* ── Color tokens ── */
const C = {
  bg: '#080B0F',
  panel: '#11161B',
  panel2: '#171D23',
  border: '#272D34',
  text: '#F5F5F5',
  text2: '#9AA1AA',
  muted: '#68717B',
  accent: '#5FA8FF',
};

/* ── Data ── */
const NAV_LINKS = ['Platform', 'Explore', 'Intelligence', 'Infrastructure', 'About'];

const LEFT_META = [
  { label: 'MODEL', value: 'Mumbai Digital Twin' },
  { label: 'VIEW', value: '3D / Spatial' },
  { label: 'DATA', value: 'Multi-layer Intelligence' },
];

const CAPABILITIES = [
  { icon: '◈', title: 'PROPERTY INTELLIGENCE', desc: 'Understand properties in their spatial context.' },
  { icon: '◈', title: 'INFRASTRUCTURE', desc: 'Explore roads, utilities and critical networks.' },
  { icon: '◈', title: 'TEMPORAL ANALYSIS', desc: 'See how places change across time.' },
  { icon: '◈', title: 'SCENARIO INSIGHTS', desc: 'Explore potential urban and environmental impacts.' },
];

const STATS = [
  { value: '2.4M+', label: 'BUILDINGS' },
  { value: '150+', label: 'DATA LAYERS' },
  { value: '75+', label: 'USE CASES' },
  { value: '2018–2026', label: 'TEMPORAL VIEW' },
];

const EXPLORE_ITEMS = [
  { num: '01', title: 'PROPERTY CADASTRAL MAPPING', desc: 'Query parcel boundaries, registered owners, built-up areas and 3D land unit identifiers.', detail: 'Connects Revenue Dept records directly to the 3D cadastre.' },
  { num: '02', title: 'SUBTERRANEAN INFRASTRUCTURE', desc: 'Inspect underground utilities, metro rail tunnels, pipeline depths and safe excavation corridors.', detail: 'Prevents damage to critical utilities during civic construction.' },
  { num: '03', title: 'VERTICAL SPATIAL TAXATION', desc: 'Track property tax valuation floor by floor, resolve unit disputes and verify ownership.', detail: 'Enables fair, accurate 3D spatial revenue collection.' },
  { num: '04', title: '4D TIME SCRUBBING', desc: 'Analyze urban expansion, development progression and historical cadastral changes across time.', detail: 'Eight-year historical dataset covering Mumbai metropolitan area.' },
];

const WORKFLOW_STEPS = [
  { num: '01', title: 'Select Cadastral Parcel', desc: 'Click any registered land parcel or building on the vector map to load its spatial profile.' },
  { num: '02', title: 'Inspect Vertical Units', desc: 'Switch to exploded 3D view to inspect individual floors, unit ownership and carpet areas.' },
  { num: '03', title: 'Overlay Subsurface Data', desc: 'Activate subterranean layers to examine utilities, tunnels and infrastructure depths.' },
  { num: '04', title: 'Generate 3D Property Card', desc: 'Export certified DoLR-compliant property certificates with unique 3D ULPIN codes.' },
];

const PLATFORM_FEATURES = [
  { title: 'Open Standards', desc: 'Built on OGC standards, ISO 19152 LADM and W3C spatial data specifications.' },
  { title: 'Sub-Metre Accuracy', desc: 'Precise 3D coordinates aligned with Survey of India reference frameworks.' },
  { title: 'API Integration', desc: 'REST and WebSocket endpoints for seamless municipal GIS system integration.' },
  { title: 'Multi-Agency Access', desc: 'Tailored views for Revenue, City Engineering and Utility authorities.' },
  { title: 'Digital Twin Scale', desc: 'Capable of handling millions of building features with zero performance degradation.' },
  { title: 'Verifiable Records', desc: 'Cryptographically hashed audit logs for tamper-proof ownership histories.' },
];

/* ── Scroll-reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── Section wrapper ── */
function Section({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {children}
    </section>
  );
}

/* ── Divider ── */
function Divider() {
  return <div className="mx-auto max-w-5xl h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />;
}

/* ── Section label ── */
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-5 h-px" style={{ background: C.accent }} />
      <span className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: C.accent }}>{text}</span>
    </div>
  );
}

/* ── Interactive 3D Cursor-Responsive Hero ── */
function InteractiveCityHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalized mouse coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth organic inertia
  const springConfig = { damping: 20, stiffness: 150, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D rotations and directional translation following mouse
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-35, 35]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-25, 25]);
  const scale = useTransform(smoothX, [-0.5, 0, 0.5], [1.03, 1, 1.03]);

  // Subtle interactive glow coordinates
  const glowX = useTransform(smoothX, [-0.5, 0.5], ['30%', '70%']);
  const glowY = useTransform(smoothY, [-0.5, 0.5], ['30%', '70%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full flex items-center justify-center cursor-crosshair select-none py-1 overflow-visible"
      style={{ perspective: '1100px' }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full flex items-center justify-center"
      >
        {/* Soft Dynamic Glow behind 3D Model that moves with mouse */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle at center, rgba(95, 168, 255, 0.5) 0%, rgba(95, 168, 255, 0) 70%)',
            left: glowX,
            top: glowY,
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '70%',
          }}
        />

        <Image
          src="/mumbai-3d-hero.png"
          alt="Mumbai 3D Digital Twin Model"
          width={1024}
          height={682}
          className="w-full h-auto object-contain filter drop-shadow-[0_30px_70px_rgba(0,0,0,0.95)] pointer-events-none transition-transform duration-100"
          priority
        />
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-x-hidden pt-16"
      style={{ background: C.bg, color: C.text, fontFamily: "Inter, 'Segoe UI', sans-serif" }}
    >
      {/* ═══════════════════════════════════════
          NAVBAR — fixed command center
          ═══════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-5 lg:px-8 border-b border-white/[0.08] backdrop-blur-xl bg-[#080B0F]/85 transition-all"
      >
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 select-none flex-shrink-0">
          <div className="w-8 h-8 rounded-[8px] bg-white text-black flex items-center justify-center shadow-md shadow-black/40 font-bold hover:scale-105 transition-all">
            <Building2 className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <span className="text-[13px] font-extrabold tracking-wider text-white uppercase">
            Bhū-Aadhaar
          </span>
        </div>

        {/* Center Floating Segmented Pill Nav */}
        <div className="hidden md:flex items-center gap-1 bg-[#141a22] p-1 rounded-[10px] border border-white/[0.06] shadow-md">
          {NAV_LINKS.map((link, idx) => {
            const isActive = idx === 0; // Default active highlight on first pill
            return (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className={`px-3.5 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-black shadow-sm font-extrabold'
                    : 'bg-[#202732] text-[#9ca3af] hover:text-white hover:bg-[#283240] border border-white/[0.03]'
                }`}
              >
                {link === 'Intelligence' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-0.5" />}
                {link}
              </a>
            );
          })}
        </div>

        {/* Right Action CTA Button */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-1.5 rounded-[8px] bg-white text-black px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all"
          >
            Enter Engine <ArrowRight className="h-3 w-3 stroke-[2.5]" />
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          SECTION 1 — HERO
          ═══════════════════════════════════════ */}
      <section className="relative z-10 text-center pt-8 sm:pt-10 pb-0 px-4">
        <h1
          className="text-[30px] sm:text-[40px] lg:text-[48px] font-bold tracking-tight leading-[1.1]"
          style={{ letterSpacing: '-0.03em' }}
        >
          SEE THE CITY.<br />UNDERSTAND THE LAND.
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-[12px] sm:text-[13px] leading-[1.7]" style={{ color: C.text2 }}>
          A unified 3D geospatial intelligence platform for exploring property,
          infrastructure and urban change through a living digital view of the city.
        </p>
      </section>

      {/* Hero composition: 3D model */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-10 pb-8 max-w-5xl mx-auto -mt-4 sm:-mt-8 md:-mt-12">
        {/* 3D CITY MODEL with Interactive Mouse Follower */}
        <InteractiveCityHero />

        {/* Stats bar */}
        <div className="mt-2 sm:mt-4 mx-auto max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-px rounded-md overflow-hidden" style={{ border: `1px solid ${C.border}`, background: C.border }}>
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center py-4 px-3" style={{ background: C.panel }}>
              <span className="text-[18px] sm:text-[22px] font-bold tracking-tight">{s.value}</span>
              <span className="text-[8px] font-semibold tracking-[0.14em] uppercase mt-1" style={{ color: C.muted }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════
          SECTION 2 — 3D CARDS CAROUSEL (ABOUT)
          ═══════════════════════════════════════ */}
      <Cards3DCarousel />

      <Divider />

      {/* ═══════════════════════════════════════
          SECTION 3 — FOUR DIMENSIONS DIGITAL TWIN
          ═══════════════════════════════════════ */}
      <FourDimensionsTwin />

      <Divider />

      {/* ═══════════════════════════════════════
          SECTION 4 — INTELLIGENCE (Property)
          ═══════════════════════════════════════ */}
      <Section id="intelligence" className="px-5 sm:px-8 lg:px-16 py-20 max-w-6xl mx-auto">
        <SectionLabel text="Intelligence" />
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-[34px] sm:text-[44px] lg:text-[50px] font-black leading-[1.08] tracking-[-0.03em] text-white">
              Property intelligence<br />
              <span className="text-[#94A3B8]">
                in three dimensions.
              </span>
            </h2>
            <p className="text-[15px] sm:text-[16px] leading-[1.75] text-[#9AA1AA] max-w-lg">
              Click any building on the 3D map to instantly retrieve its MyBMC records, ownership data, floor plans and vertical unit breakdowns. Drill down into an exploded 3D model showing every unit on every floor.
            </p>
            <div className="pt-2 space-y-3.5">
              {[
                'Floor-by-floor vertical ownership mapping',
                'MyBMC & MahaRERA record integration',
                '3D exploded view with unit-level inspection',
                'Geometry conflict detection across units',
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3 group transition-transform duration-200 hover:translate-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] group-hover:bg-white transition-colors" />
                  <span className="text-[13.5px] sm:text-[14px] font-medium text-[#E2E8F0] tracking-wide">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <ArchitecturalBuildingViewer />
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════
          SECTION 5 — INFRASTRUCTURE
          ═══════════════════════════════════════ */}
      <Section id="infrastructure" className="px-5 sm:px-8 lg:px-16 py-20 max-w-6xl mx-auto">
        <SectionLabel text="Infrastructure" />
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1 rounded-[24px] bg-[#0E1318] p-6 border border-white/[0.08] shadow-2xl flex items-center justify-center min-h-[300px]">
            <svg className="w-full max-w-[440px] h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]" viewBox="0 0 400 240" fill="none">
              {/* Surface terrain wire */}
              <polygon points="200,20 360,90 200,160 40,90" fill="#131C28" stroke="#334155" strokeWidth="1.2" />
              {/* Subsurface volume */}
              <polygon points="40,90 200,160 200,225 40,155" fill="#0A0E14" stroke="#1E293B" />
              <polygon points="200,160 360,90 360,155 200,225" fill="#070A0F" stroke="#1E293B" />
              {/* Metro 3 Tunnel */}
              <path d="M90,140 Q200,190 310,130" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M90,140 Q200,190 310,130" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="4 4" fill="none" />
              {/* Utility Conduits */}
              <path d="M150,110 L150,175 L230,200" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="150" cy="175" r="3.5" fill="#38BDF8" />
              <circle cx="230" cy="200" r="3.5" fill="#38BDF8" />
              {/* Depth labels */}
              <text x="32" y="95" fill="#94A3B8" fontSize="8" fontFamily="monospace">0.0m</text>
              <text x="32" y="150" fill="#38BDF8" fontSize="8" fontFamily="monospace">-25.0m</text>
              <text x="32" y="215" fill="#38BDF8" fontSize="8" fontFamily="monospace">-45.0m</text>
            </svg>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-[26px] sm:text-[32px] font-bold leading-[1.15] tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              What lies beneath<br />the city surface.
            </h2>
            <p className="mt-5 text-[13px] leading-[1.8] max-w-lg" style={{ color: C.text2 }}>
              The subterranean intelligence layer maps Mumbai&apos;s hidden infrastructure — Metro Line 3 tunnels, BMC water mains, Coastal Road corridors, sewage networks and telecom fibre routes — all rendered in 3D beneath the surface.
            </p>
            <div className="mt-6 space-y-3">
              {[
                'Metro tunnel corridor mapping',
                'Water supply trunk aqueducts',
                'Coastal Road undersea tunnel',
                'Sewage and telecom networks',
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: C.accent }} />
                  <span className="text-[11px]" style={{ color: C.text2 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════
          SECTION 6 — TEMPORAL
          ═══════════════════════════════════════ */}
      <Section className="px-5 sm:px-8 lg:px-16 py-20 max-w-6xl mx-auto">
        <SectionLabel text="Temporal Analysis" />
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-[26px] sm:text-[32px] font-bold leading-[1.15] tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              See how the city<br />changes through time.
            </h2>
            <p className="mt-5 text-[13px] leading-[1.8] max-w-lg" style={{ color: C.text2 }}>
              The 4D temporal engine lets you scrub through eight years of urban transformation. Watch buildings rise, infrastructure expand and neighbourhoods evolve from 2018 to 2026 — all through the same spatial lens.
            </p>
            <div className="mt-6 flex items-center gap-6">
              {['2018', '2020', '2023', '2026'].map((y, i) => (
                <div key={y} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-[13px] font-bold" style={{ color: i === 3 ? C.accent : C.text2 }}>{y}</span>
                    <span className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: C.muted }}>
                      {['Baseline', 'Growth', 'Expansion', 'Current'][i]}
                    </span>
                  </div>
                  {i < 3 && <div className="w-6 h-px" style={{ background: C.border }} />}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] bg-[#0E1318] p-6 border border-white/[0.08] shadow-2xl flex items-center justify-center min-h-[300px]">
            <svg className="w-full max-w-[440px] h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]" viewBox="0 0 400 240" fill="none">
              {/* Land base */}
              <polygon points="200,30 360,100 200,170 40,100" fill="#131C28" stroke="#334155" strokeWidth="1.2" />
              {/* 2018 Low-rise */}
              <g transform="translate(60, 20)">
                <polygon points="120,80 150,95 150,125 120,110" fill="#1E293B" stroke="#64748B" />
                <polygon points="150,95 180,80 180,110 150,125" fill="#0F172A" stroke="#64748B" />
                <polygon points="120,80 150,65 180,80 150,95" fill="#334155" stroke="#94A3B8" />
              </g>
              {/* 2026 High-rise tower with growth beacon */}
              <g transform="translate(-20, -10)">
                <polygon points="170,40 210,60 210,135 170,115" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
                <polygon points="210,60 250,40 250,115 210,135" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
                <polygon points="170,40 210,20 250,40 210,60" fill="#0284C7" stroke="#7DD3FC" strokeWidth="1.2" />
                <circle cx="210" cy="20" r="3" fill="#38BDF8" />
              </g>
              {/* Timeline curve */}
              <path d="M70,160 Q200,200 330,160" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
              <text x="200" y="210" fill="#94A3B8" fontSize="9" fontFamily="monospace" textAnchor="middle">2018 → 2026 TEMPORAL GROWTH</text>
            </svg>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════
          SECTION 7 — HOW IT WORKS
          ═══════════════════════════════════════ */}
      <Section className="px-5 sm:px-8 lg:px-16 py-20 max-w-6xl mx-auto">
        <SectionLabel text="Workflow" />
        <h2 className="text-[26px] sm:text-[32px] font-bold leading-[1.15] tracking-tight mb-10" style={{ letterSpacing: '-0.02em' }}>
          From selection to insight<br />in four steps.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WORKFLOW_STEPS.map((step, i) => (
            <div
              key={i}
              className="rounded-md p-4 relative overflow-hidden group transition-all duration-300"
              style={{ background: C.panel, border: `1px solid ${C.border}` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${C.accent}44`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
            >
              <span className="text-[36px] font-bold absolute top-3 right-3 leading-none" style={{ color: `${C.border}88` }}>{step.num}</span>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase mb-2 mt-1">{step.title}</p>
              <p className="text-[11px] leading-[1.65] pr-6" style={{ color: C.muted }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════
          SECTION 8 — PLATFORM
          ═══════════════════════════════════════ */}
      <Section id="platform" className="px-5 sm:px-8 lg:px-16 py-20 max-w-6xl mx-auto">
        <SectionLabel text="Platform" />
        <h2 className="text-[26px] sm:text-[32px] font-bold leading-[1.15] tracking-tight mb-3" style={{ letterSpacing: '-0.02em' }}>
          Built on open standards.
        </h2>
        <p className="text-[13px] leading-[1.8] max-w-2xl mb-10" style={{ color: C.text2 }}>
          Every component of the Bhū-Aadhaar engine is designed around interoperability, transparency and real-time spatial accuracy.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PLATFORM_FEATURES.map((f, i) => (
            <div
              key={i}
              className="rounded-md p-4 transition-all duration-300"
              style={{ background: C.panel, border: `1px solid ${C.border}` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${C.accent}44`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
            >
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase mb-2">{f.title}</p>
              <p className="text-[11px] leading-[1.6]" style={{ color: C.muted }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════
          SECTION 9 — CTA
          ═══════════════════════════════════════ */}
      <Section className="relative z-10 text-center px-4 py-20">
        <p className="text-[15px] sm:text-[18px] font-bold tracking-[0.04em] uppercase leading-[1.6]" style={{ color: C.text2 }}>
          One City.<br />Many Layers.<br />One Intelligent View.
        </p>
        <p className="mt-4 text-[12px]" style={{ color: C.muted }}>
          Explore Mumbai through the Bhū-Aadhaar 3D Engine.
        </p>
        <div className="mt-7">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2.5 rounded px-8 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200"
            style={{ background: C.accent, color: C.bg }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#7DBBFF'; e.currentTarget.style.boxShadow = `0 0 24px ${C.accent}44`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.accent; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Enter 3D Engine <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
      <footer className="relative z-10 px-5 sm:px-8 lg:px-16 py-8" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 select-none">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase">{`Bhū-Aadhaar`}</span>
            <span className="text-[9px]" style={{ color: C.muted }}>|</span>
            <span className="text-[9px] tracking-wider uppercase" style={{ color: C.muted }}>3D Engine</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-[8px] tracking-[0.1em] uppercase" style={{ color: `${C.muted}88` }}>Department of Land Resources</span>
            <span style={{ color: C.border }}>·</span>
            <span className="text-[8px] tracking-[0.1em] uppercase" style={{ color: `${C.muted}88` }}>Smart India Hackathon 2024</span>
            <span style={{ color: C.border }}>·</span>
            <span className="text-[8px] tracking-[0.1em] uppercase" style={{ color: `${C.muted}88` }}>Problem Statement #26011</span>
          </div>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-1 text-[9px] font-medium tracking-wider uppercase transition-colors"
            style={{ color: C.muted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
          >
            Launch Engine <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
