import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Environment, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const PLANS = [
  { name: 'Master Plan', url: 'https://img.staticmb.com/mbimages/project/2023/11/08/Master-Plan-25-Wadhwa-Aquaria-Grande-Mumbai-5029949_462_700.jpg', aspect: 462 / 700, wallsUrl: '/floorplans/walls1.json' },
  { name: '3 BHK (Type 1)', url: 'https://img.staticmb.com/mbimages/project/Floor-Plan-2-Wadhwa-Aquaria-Grande-Mumbai-5029949_700_1024.jpg', aspect: 700 / 1024, wallsUrl: '/floorplans/walls2.json' },
  { name: '3 BHK (Type 2)', url: 'https://img.staticmb.com/mbimages/project/Floor-Plan-23-Wadhwa-Aquaria-Grande-Mumbai-5029949_618_1024.jpg', aspect: 618 / 1024, wallsUrl: '/floorplans/walls3.json' },
  { name: '4 BHK (Type 1)', url: 'https://img.staticmb.com/mbimages/project/Floor-Plan-24-Wadhwa-Aquaria-Grande-Mumbai-5029949_596_1024.jpg', aspect: 596 / 1024, wallsUrl: '/floorplans/walls4.json' },
  { name: '4 BHK (Type 2)', url: 'https://img.staticmb.com/mbimages/project/Floor-Plan-3-Wadhwa-Aquaria-Grande-Mumbai-5029949_700_1024.jpg', aspect: 700 / 1024, wallsUrl: '/floorplans/walls5.json' }
];

const ExtrudedWalls = ({ wallsUrl }: { wallsUrl: string }) => {
  const [shapes, setShapes] = React.useState<THREE.Shape[]>([]);

  React.useEffect(() => {
    fetch(wallsUrl)
      .then(r => r.json())
      .then((data: number[][][]) => {
        const newShapes = data.map(contour => {
          const shape = new THREE.Shape();
          if (contour.length > 0) {
            shape.moveTo(contour[0][0], -contour[0][1]);
            for (let i = 1; i < contour.length; i++) {
              shape.lineTo(contour[i][0], -contour[i][1]);
            }
            shape.lineTo(contour[0][0], -contour[0][1]);
          }
          return shape;
        });
        setShapes(newShapes);
      })
      .catch(e => console.error("Failed to load walls", e));
  }, [wallsUrl]);

  return (
    <>
      {shapes.map((shape, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} castShadow receiveShadow>
          <extrudeGeometry args={[shape, { depth: 2, bevelEnabled: false }]} />
          <meshStandardMaterial color="#2a3b4c" transparent opacity={0.6} roughness={0.1} metalness={0.2} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
};

const RoomLabel = ({ position, text }: { position: [number, number, number], text: string }) => (
  <Text
    position={position}
    rotation={[-Math.PI / 2, 0, 0]}
    fontSize={0.4}
    color="#00ffcc"
    anchorX="center"
    anchorY="middle"
  >
    {text}
  </Text>
);

const TexturedFloor = ({ url, aspect }: { url: string, aspect: number }) => {
  const texture = useTexture(url);
  const width = 20;
  const height = width / aspect;
  
  return (
    <Plane args={[width, height]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <meshStandardMaterial map={texture} roughness={0.8} />
    </Plane>
  );
};

export const FloorPlan3D = ({ planIndex = 0 }: { planIndex?: number }) => {
  // Ensure the index is within bounds (0 to PLANS.length - 1)
  const safeIndex = (planIndex >= 0 && planIndex < PLANS.length) ? planIndex : 0;
  const [activePlan, setActivePlan] = React.useState(safeIndex);
  
  const plan = PLANS[activePlan] || PLANS[0];

  return (
    <div className="w-full h-full min-h-[600px] relative rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex flex-col">
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-row justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
          <h3 className="text-white font-bold text-lg tracking-wider">{plan.name}</h3>
          <p className="text-emerald-400 text-xs font-mono uppercase">Interactive 3D Cadastral Layout</p>
          <p className="text-slate-400 text-[10px] mt-1">Left Click: Rotate • Right Click: Pan • Scroll: Zoom</p>
        </div>
        <div className="flex flex-col gap-2 pointer-events-auto bg-slate-900/80 p-2 rounded-lg backdrop-blur-md border border-white/10">
          <div className="text-xs text-slate-400 font-semibold mb-1">Select Flat Plan</div>
          {PLANS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setActivePlan(idx)}
              className={`px-3 py-1.5 rounded text-xs font-semibold text-left transition-all ${
                activePlan === idx ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 z-0 bg-slate-950">
        <Canvas shadows camera={{ position: [0, 15, 12], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={['#0f172a']} />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <TexturedFloor url={plan.url} aspect={plan.aspect} />
        </Suspense>

        {/* AI Extracted Walls */}
        <Suspense fallback={null}>
          <ExtrudedWalls wallsUrl={plan.wallsUrl} />
        </Suspense>

        <OrbitControls 
          enableRotate={true}
          enableDamping 
          dampingFactor={0.05} 
          maxPolarAngle={Math.PI / 2 - 0.05}
          maxDistance={50}
          minDistance={5}
        />
      </Canvas>
      </div>
    </div>
  );
};
