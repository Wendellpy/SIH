'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Building2, Layers, Grid } from 'lucide-react';

type ViewMode = 'BUILDING' | 'FLOORS' | 'UNITS';

interface FloorData {
  floorIndex: number;
  floorNumber: number;
  label: string;
}

const FLOORS_INFO: FloorData[] = [
  { floorIndex: 7, floorNumber: 8, label: 'FLOOR 08 · PENTHOUSE & TERRACE' },
  { floorIndex: 6, floorNumber: 7, label: 'FLOOR 07 · UPPER RESIDENTIAL' },
  { floorIndex: 5, floorNumber: 6, label: 'FLOOR 06 · RESIDENTIAL' },
  { floorIndex: 4, floorNumber: 5, label: 'FLOOR 05 · RESIDENTIAL SUITES' },
  { floorIndex: 3, floorNumber: 4, label: 'FLOOR 04 · MID RESIDENTIAL' },
  { floorIndex: 2, floorNumber: 3, label: 'FLOOR 03 · PODIUM APARTMENTS' },
  { floorIndex: 1, floorNumber: 2, label: 'FLOOR 02 · COMMERCIAL / AMENITY' },
  { floorIndex: 0, floorNumber: 1, label: 'GROUND FLOOR · LOBBY & RETAIL' },
];

export function ArchitecturalBuildingViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<ViewMode>('BUILDING');
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number>(3);
  const [hoveredFloorIndex, setHoveredFloorIndex] = useState<number | null>(null);

  // Ref to hold state for Three.js animation loop
  const stateRef = useRef({
    mode,
    selectedFloorIndex,
    hoveredFloorIndex,
    targetRotationY: -0.45,
  });

  stateRef.current.mode = mode;
  stateRef.current.selectedFloorIndex = selectedFloorIndex;
  stateRef.current.hoveredFloorIndex = hoveredFloorIndex;

  useEffect(() => {
    const container = mountRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 420;

    // 1. Scene, Camera (Centered & Perfectly Vertical)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeaeff4);

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(9.5, 4.4, 12.5);
    camera.lookAt(0, 3.85, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. High-End Studio Lighting for Grey & Black Architecture
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xc8d2dc, 1.0);
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(12, 22, 15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.85);
    fillLight.position.set(-12, 12, -10);
    scene.add(fillLight);

    // 3. Premium Grey & Black Architectural Materials
    const blackWallMaterial = new THREE.MeshStandardMaterial({
      color: 0x18202c,
      roughness: 0.35,
      metalness: 0.15,
    });

    const greySlabMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.45,
      metalness: 0.1,
    });

    const jetBlackMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0f16,
      roughness: 0.3,
      metalness: 0.3,
    });

    const smokedGlassMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.05,
      metalness: 0.9,
    });

    const balconyTintMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.65,
    });

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.1,
    });

    // 4. Ground Base Platform (Proportionally Compact)
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const baseGeometry = new THREE.CylinderGeometry(4.4, 4.6, 0.2, 48);
    const baseMesh = new THREE.Mesh(baseGeometry, groundMaterial);
    baseMesh.position.y = -0.1;
    baseMesh.receiveShadow = true;
    buildingGroup.add(baseMesh);

    const curbGeo = new THREE.BoxGeometry(4.8, 0.1, 4.2);
    const curbMesh = new THREE.Mesh(curbGeo, greySlabMaterial);
    curbMesh.position.y = 0.05;
    curbMesh.receiveShadow = true;
    buildingGroup.add(curbMesh);

    // 5. Construct Vertical Multi-Storey Residential Model
    const numFloors = 8;
    const floorHeight = 0.92;
    const floorGroups: THREE.Group[] = [];
    const floorMeshesForRaycast: THREE.Mesh[] = [];

    for (let f = 0; f < numFloors; f++) {
      const floorGroup = new THREE.Group();
      floorGroup.position.y = f * floorHeight;
      (floorGroup as any).userData = { floorIndex: f };

      // A. Cool Grey Floor Slab
      const slabGeo = new THREE.BoxGeometry(4.6, 0.1, 3.8);
      const slabMesh = new THREE.Mesh(slabGeo, greySlabMaterial);
      slabMesh.position.y = 0.05;
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      floorGroup.add(slabMesh);

      // B. Main Living Core in Deep Charcoal Black
      const coreGeo = new THREE.BoxGeometry(4.2, floorHeight - 0.1, 3.4);
      const coreMesh = new THREE.Mesh(coreGeo, blackWallMaterial.clone());
      coreMesh.position.y = floorHeight / 2;
      coreMesh.castShadow = true;
      coreMesh.receiveShadow = true;
      (coreMesh as any).userData = { floorIndex: f, isFloorCore: true };
      floorGroup.add(coreMesh);
      floorMeshesForRaycast.push(coreMesh);

      // C. Recessed Balconies
      const balconySlabGeo = new THREE.BoxGeometry(3.4, 0.08, 0.7);
      const balconySlab = new THREE.Mesh(balconySlabGeo, greySlabMaterial);
      balconySlab.position.set(0, 0.05, 2.05);
      balconySlab.castShadow = true;
      floorGroup.add(balconySlab);

      const glassRailingGeo = new THREE.BoxGeometry(3.4, 0.35, 0.04);
      const glassRailing = new THREE.Mesh(glassRailingGeo, balconyTintMaterial);
      glassRailing.position.set(0, 0.26, 2.38);
      floorGroup.add(glassRailing);

      // D. Windows with Frames
      const windowWidth = 0.62;
      const windowHeight = 0.54;
      const windowGeo = new THREE.BoxGeometry(windowWidth, windowHeight, 0.04);

      for (let w = -1.1; w <= 1.1; w += 1.1) {
        const win = new THREE.Mesh(windowGeo, smokedGlassMaterial);
        win.position.set(w, floorHeight * 0.55, 1.72);
        floorGroup.add(win);

        const frameGeo = new THREE.BoxGeometry(windowWidth + 0.06, windowHeight + 0.06, 0.02);
        const frame = new THREE.Mesh(frameGeo, jetBlackMaterial);
        frame.position.set(w, floorHeight * 0.55, 1.71);
        floorGroup.add(frame);
      }

      // Side Windows
      const sideWinGeo = new THREE.BoxGeometry(0.04, windowHeight, 0.7);
      for (let z = -0.9; z <= 0.9; z += 0.9) {
        const leftWin = new THREE.Mesh(sideWinGeo, smokedGlassMaterial);
        leftWin.position.set(-2.12, floorHeight * 0.55, z);
        floorGroup.add(leftWin);

        const rightWin = new THREE.Mesh(sideWinGeo, smokedGlassMaterial);
        rightWin.position.set(2.12, floorHeight * 0.55, z);
        floorGroup.add(rightWin);
      }

      // E. Vertical Black Architectural Fins
      const finGeo = new THREE.BoxGeometry(0.08, floorHeight, 0.15);
      const leftFin = new THREE.Mesh(finGeo, jetBlackMaterial);
      leftFin.position.set(-1.7, floorHeight / 2, 1.75);
      floorGroup.add(leftFin);

      const rightFin = new THREE.Mesh(finGeo, jetBlackMaterial);
      rightFin.position.set(1.7, floorHeight / 2, 1.75);
      floorGroup.add(rightFin);

      buildingGroup.add(floorGroup);
      floorGroups.push(floorGroup);
    }

    // 6. Roof Structure
    const roofGroup = new THREE.Group();
    roofGroup.position.y = numFloors * floorHeight;

    const roofSlabGeo = new THREE.BoxGeometry(4.6, 0.12, 3.8);
    const roofSlab = new THREE.Mesh(roofSlabGeo, greySlabMaterial);
    roofSlab.position.y = 0.06;
    roofSlab.castShadow = true;
    roofGroup.add(roofSlab);

    const liftCoreGeo = new THREE.BoxGeometry(1.6, 0.95, 1.8);
    const liftCore = new THREE.Mesh(liftCoreGeo, blackWallMaterial);
    liftCore.position.set(0, 0.52, -0.35);
    liftCore.castShadow = true;
    roofGroup.add(liftCore);

    for (let p = -1.3; p <= 1.3; p += 0.45) {
      const beamGeo = new THREE.BoxGeometry(0.08, 0.08, 2.2);
      const beam = new THREE.Mesh(beamGeo, jetBlackMaterial);
      beam.position.set(p, 0.98, 0.7);
      roofGroup.add(beam);
    }

    buildingGroup.add(roofGroup);

    // 7. Raycaster for hover & click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.x = x;
      mouse.y = y;

      // Subtle horizontal Y rotation only (no X tilt!)
      stateRef.current.targetRotationY = -0.45 + x * 0.25;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(floorMeshesForRaycast);

      if (intersects.length > 0) {
        const floorIdx = (intersects[0].object as any).userData?.floorIndex;
        if (typeof floorIdx === 'number') {
          setHoveredFloorIndex(floorIdx);
          container.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredFloorIndex(null);
      container.style.cursor = 'default';
    };

    const handlePointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.x = x;
      mouse.y = y;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(floorMeshesForRaycast);

      if (intersects.length > 0) {
        const floorIdx = (intersects[0].object as any).userData?.floorIndex;
        if (typeof floorIdx === 'number') {
          setSelectedFloorIndex(floorIdx);
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handlePointerClick);

    // 8. Animation Loop (Strictly Vertical Alignment)
    let currentRotationY = -0.45;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Horizontal Y rotation only — strictly vertical!
      currentRotationY += (stateRef.current.targetRotationY - currentRotationY) * 0.06;
      buildingGroup.rotation.y = currentRotationY;
      buildingGroup.rotation.x = 0; // Strictly vertical, no tilt
      buildingGroup.rotation.z = 0;

      const currentMode = stateRef.current.mode;
      const curSelected = stateRef.current.selectedFloorIndex;
      const curHovered = stateRef.current.hoveredFloorIndex;

      for (let f = 0; f < numFloors; f++) {
        const fGroup = floorGroups[f];
        const coreMesh = fGroup.children.find((c) => (c as any).userData?.isFloorCore) as THREE.Mesh;
        const mat = coreMesh?.material as THREE.MeshStandardMaterial;

        let targetY = f * floorHeight;

        if (currentMode === 'BUILDING') {
          // Monolithic building — strictly centered, slight lift if selected
          if (f === curSelected) {
            targetY += 0.08;
          }
        } else if (currentMode === 'FLOORS') {
          // Smooth vertical separation on Y axis only
          targetY = f * (floorHeight + 0.28);
          if (f === curSelected) {
            targetY += 0.1;
          }
        } else if (currentMode === 'UNITS') {
          // Vertical exploded unit mode
          targetY = f * (floorHeight + 0.38);
          if (f === curSelected) {
            targetY += 0.12;
          }
        }

        // Purely vertical animation (X and Z remain locked at 0!)
        fGroup.position.y += (targetY - fGroup.position.y) * 0.1;
        fGroup.position.x = 0;
        fGroup.position.z = 0;

        if (mat) {
          if (f === curSelected) {
            mat.color.lerp(new THREE.Color(0x334155), 0.15);
            mat.emissive.lerp(new THREE.Color(0x1e3a8a), 0.15);
            mat.emissiveIntensity = 0.3;
          } else if (f === curHovered) {
            mat.color.lerp(new THREE.Color(0x273546), 0.15);
            mat.emissive.lerp(new THREE.Color(0x2563eb), 0.15);
            mat.emissiveIntensity = 0.18;
          } else {
            mat.color.lerp(new THREE.Color(0x18202c), 0.15);
            mat.emissive.lerp(new THREE.Color(0x000000), 0.15);
            mat.emissiveIntensity = 0;
          }
        }
      }

      // Roof follows top floor vertically
      const topFloorTargetY = floorGroups[numFloors - 1].position.y + floorHeight;
      roofGroup.position.y += (topFloorTargetY - roofGroup.position.y) * 0.1;
      roofGroup.position.x = 0;
      roofGroup.position.z = 0;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handlePointerClick);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="relative w-full rounded-[28px] bg-[#EAEFF4] border border-white p-4 sm:p-5 flex flex-col justify-between select-none transition-all duration-500 overflow-hidden"
      style={{
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 2px #ffffff, 0 0 0 1px rgba(255,255,255,0.9)',
      }}
    >
      {/* Centered 3D Canvas Viewport */}
      <div
        ref={mountRef}
        className="relative w-full h-[400px] sm:h-[450px] flex items-center justify-center overflow-hidden rounded-[20px]"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Segmented Mode Controller (BUILDING | FLOORS | UNITS) */}
      <div className="relative z-20 flex items-center justify-between gap-3 pt-3 border-t border-[#CBD5E1]/70">
        <span className="text-[10px] font-mono text-[#64748B] font-semibold">
          Architectural View:
        </span>

        {/* Tactile Neumorphic Pill Segmented Switch */}
        <div
          className="flex items-center gap-1 p-1 rounded-full bg-[#DEE4EC]"
          style={{
            boxShadow: 'inset 2px 2px 5px #b8c0cc, inset -2px -2px 5px #ffffff',
          }}
        >
          {(['BUILDING', 'FLOORS', 'UNITS'] as ViewMode[]).map((m) => {
            const isCurrent = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0F172A] text-white shadow-md'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {m === 'BUILDING' && <Building2 className="w-3 h-3" />}
                {m === 'FLOORS' && <Layers className="w-3 h-3" />}
                {m === 'UNITS' && <Grid className="w-3 h-3" />}
                <span>{m}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
