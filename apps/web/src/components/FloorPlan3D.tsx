import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

const Wall = ({ position, args, color = '#2a3b4c', opacity = 0.8 }: any) => (
  <Box position={position} args={args} castShadow receiveShadow>
    <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.1} metalness={0.2} side={THREE.DoubleSide} />
  </Box>
);

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

export const FloorPlan3D = () => {
  return (
    <div className="w-full h-full min-h-[500px] relative rounded-xl overflow-hidden bg-slate-950 border border-white/5">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <h3 className="text-white font-bold text-lg tracking-wider">PREMIUM 3.5 BHK</h3>
        <p className="text-emerald-400 text-xs font-mono uppercase">Interactive 3D Cadastral Layout</p>
        <p className="text-slate-400 text-[10px] mt-1">Left Click: Rotate • Right Click: Pan • Scroll: Zoom</p>
      </div>
      
      <Canvas shadows camera={{ position: [0, 12, 10], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00ffcc" />
        <pointLight position={[5, 5, 5]} intensity={0.3} color="#3b82f6" />
        <Environment preset="city" />

        {/* Floor Base */}
        <Plane args={[20, 15]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </Plane>
        
        {/* Subtle grid on the floor */}
        <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, 0, 0]} />

        {/* Outer Walls */}
        <Wall position={[0, 1, -7.5]} args={[20, 2, 0.4]} />
        <Wall position={[0, 1, 7.5]} args={[20, 2, 0.4]} />
        <Wall position={[-10, 1, 0]} args={[0.4, 2, 15]} />
        <Wall position={[10, 1, 0]} args={[0.4, 2, 15]} />

        {/* Inner Walls (Room Divisions) */}
        {/* Master Bedroom */}
        <Wall position={[-5, 1, -2]} args={[0.2, 2, 11]} color="#334155" />
        <Wall position={[-7.5, 1, 3.5]} args={[5, 2, 0.2]} color="#334155" />
        
        {/* Kitchen */}
        <Wall position={[4, 1, -3.5]} args={[0.2, 2, 8]} color="#334155" />
        <Wall position={[7, 1, 0.5]} args={[6, 2, 0.2]} color="#334155" />

        {/* Bedroom 2 */}
        <Wall position={[4, 1, 5]} args={[0.2, 2, 5]} color="#334155" />

        {/* Labels */}
        <RoomLabel position={[-7.5, 0.1, -1]} text="MASTER BEDROOM\n300 sq.ft" />
        <RoomLabel position={[-7.5, 0.1, 5.5]} text="BATH\n80 sq.ft" />
        <RoomLabel position={[-0.5, 0.1, 1]} text="LIVING & DINING\n550 sq.ft" />
        <RoomLabel position={[7, 0.1, -3.5]} text="KITCHEN\n200 sq.ft" />
        <RoomLabel position={[7, 0.1, 4.5]} text="BEDROOM 2\n250 sq.ft" />
        <RoomLabel position={[7, 0.1, 2.5]} text="BATH" />

        {/* Simple Furniture Mocks */}
        {/* Bed 1 */}
        <Box position={[-8, 0.4, -4]} args={[2.5, 0.8, 3.5]} castShadow>
          <meshStandardMaterial color="#475569" />
        </Box>
        {/* Bed 2 */}
        <Box position={[8, 0.4, 5.5]} args={[2, 0.8, 3]} castShadow>
          <meshStandardMaterial color="#475569" />
        </Box>
        {/* Kitchen Island */}
        <Box position={[6.5, 0.6, -2]} args={[1.5, 1.2, 3]} castShadow>
          <meshStandardMaterial color="#94a3b8" />
        </Box>
        {/* Sofa */}
        <Box position={[-2, 0.5, 4]} args={[3, 1, 1]} castShadow>
          <meshStandardMaterial color="#334155" />
        </Box>
        <Box position={[-1, 0.5, 2.5]} args={[1, 1, 2]} castShadow>
          <meshStandardMaterial color="#334155" />
        </Box>
        {/* TV Unit */}
        <Box position={[2.5, 0.6, 3]} args={[0.4, 1.2, 4]} castShadow>
          <meshStandardMaterial color="#1e293b" />
        </Box>

        {/* Glass Balcony */}
        <Box position={[-0.5, 0.5, -8]} args={[10, 1, 1]} castShadow>
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.3} />
        </Box>
        <RoomLabel position={[-0.5, 0.1, -7.5]} text="BALCONY" />

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2 - 0.1}
          maxDistance={30}
          minDistance={5}
        />
      </Canvas>
    </div>
  );
};
