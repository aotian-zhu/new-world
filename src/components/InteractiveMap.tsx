import React, { useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Environment, ContactShadows, Float } from '@react-three/drei';
import { contentConfig } from '../config/contentConfig';
import { cn } from '../lib/utils';
import { X, Loader2 } from 'lucide-react';
import * as THREE from 'three';

// --- 3D Materials ---
const GlassMaterial = new THREE.MeshPhysicalMaterial({
  color: '#6fa8a8', // Teal-ish glass to match drawing
  transmission: 0.6,
  opacity: 1,
  transparent: true,
  roughness: 0.3,
  metalness: 0.4,
  ior: 1.5,
  thickness: 2,
});

const SolidMaterial = new THREE.MeshStandardMaterial({
  color: '#e0e4e0', // Hospital white/grey
  roughness: 0.9,
  metalness: 0.1,
});

const RoofMaterial = new THREE.MeshStandardMaterial({
  color: '#8b3a3a', // Reddish roof
  roughness: 0.9,
  metalness: 0.1,
});

const BaseMaterial = new THREE.MeshStandardMaterial({
  color: '#d0d0c0', // Paths and bases
  roughness: 1,
});

const HedgeMaterial = new THREE.MeshStandardMaterial({
  color: '#253a1a', // Dark green hedge
  roughness: 0.9,
});

const GrassMaterial = new THREE.MeshStandardMaterial({
  color: '#3a5525', // Lawn
  roughness: 1,
});

// --- Data Mapping to 3D Space ---
// 完全按照原图：青帮、商会、军医院在同一后排线上，情报局在右侧独立区域且靠前
const buildingsData = {
  qingbang: { position: [-12, 0, -3], scale: [4, 4.5, 3.5], isGlass: true, rotation: [0, 0, 0], floors: 3 },
  shanghui: { position: [-4, 0, -3], scale: [3.5, 3, 3], isGlass: true, rotation: [0, 0, 0], floors: 2 },
  hospital: { position: [4, 0, -3], scale: [3.5, 4.5, 3.5], isGlass: false, rotation: [0, 0, 0], floors: 3 },
  intelligence: { position: [14, 0, 1], scale: [4, 4.5, 3.5], isGlass: true, rotation: [0, -Math.PI / 2, 0], floors: 3 }, // 面向左侧喷泉
};

const treePositions = [
  [-14, -4], [-8, -2], [-3, -4], [-12, 4], [-6, 5],
  [0, -3], [1, 3], [8, -4], [6, 4], [3, 6],
  [10, -1], [18, 2], [15, 8], [12, 9]
];

// --- 3D Components ---
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0, 0.6, 1.2, 5]} />
        <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0, 0.5, 1, 5]} />
        <meshStandardMaterial color="#355e23" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.4]} />
        <meshStandardMaterial color="#4a3b2c" />
      </mesh>
    </group>
  );
}

// 镜头控制 Rig：点击时平滑拉近镜头
function CameraRig({ activeLocation, buildingsData, controlsRef }: any) {
  const { camera } = useThree();
  const vec = useRef(new THREE.Vector3());
  const pos = useRef(new THREE.Vector3());

  useFrame(() => {
    if (activeLocation && buildingsData[activeLocation]) {
      const b = buildingsData[activeLocation];
      // 目标位置看向建筑略上方
      vec.current.set(b.position[0], b.position[1] + 2, b.position[2]);
      // 镜头拉近并压低视角，增强沉浸感
      pos.current.set(b.position[0] + 5, b.position[1] + 12, b.position[2] + 16);
    } else {
      // 默认全局俯视视角
      vec.current.set(0, 0, 0);
      pos.current.set(0, 18, 28);
    }
    
    // 平滑插值相机位置
    camera.position.lerp(pos.current, 0.04);
    
    if (controlsRef.current) {
      // 平滑插值控制器的焦点
      controlsRef.current.target.lerp(vec.current, 0.04);
      controlsRef.current.update();
    }
  });
  return null;
}

function Building({ locId, name, position, scale, isGlass, active, onClick, subLocations, rotation = [0, 0, 0], floors = 3 }: any) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const isActive = active === locId;

  useFrame((state) => {
    if (meshRef.current) {
      // Hover 时的 Y轴浮动
      const targetY = isActive ? 0.5 : hovered ? 0.2 : 0;
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
      
      // Hover/Active 时的体积放大膨胀效果
      const targetScale = isActive ? 1.05 : hovered ? 1.02 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (!isActive && !hovered) {
        meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.001;
      }
    }
  });

  const width = scale[0];
  const height = scale[1];
  const depth = scale[2];
  
  const floorHeight = height / floors;

  const hW = width + 1.2;
  const hD = depth + 1.2;
  const hT = 0.4;
  const hH = 0.6;

  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onClick(locId); }} 
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }} 
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <group ref={meshRef}>
        {/* 庭院绿植围栏 (Hedges) */}
        <group position={[0, hH/2, 0]}>
          <mesh position={[0, 0, hD/2]} material={HedgeMaterial} castShadow receiveShadow><boxGeometry args={[hW + hT, hH, hT]}/></mesh>
          <mesh position={[0, 0, -hD/2]} material={HedgeMaterial} castShadow receiveShadow><boxGeometry args={[hW + hT, hH, hT]}/></mesh>
          <mesh position={[hW/2, 0, 0]} material={HedgeMaterial} castShadow receiveShadow><boxGeometry args={[hT, hH, hD - hT]}/></mesh>
          <mesh position={[-hW/2, 0, 0]} material={HedgeMaterial} castShadow receiveShadow><boxGeometry args={[hT, hH, hD - hT]}/></mesh>
        </group>

        {/* 地基台阶 (Foundation / Steps) */}
        <mesh position={[0, 0.1, 0]} material={BaseMaterial} castShadow receiveShadow>
          <boxGeometry args={[width + 0.8, 0.2, depth + 0.8]} />
        </mesh>
        <mesh position={[0, 0.3, 0]} material={BaseMaterial} castShadow receiveShadow>
          <boxGeometry args={[width + 0.4, 0.2, depth + 0.4]} />
        </mesh>

        {/* 建筑主梁 (Main Body) */}
        <mesh position={[0, height/2 + 0.4, 0]} material={isGlass ? GlassMaterial : SolidMaterial} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
        </mesh>

        {/* 玻璃建筑内部核心，增加深邃感 */}
        {isGlass && (
          <mesh position={[0, height/2 + 0.4, 0]}>
            <boxGeometry args={[width - 0.6, height, depth - 0.6]} />
            <meshStandardMaterial color="#1a2b3c" roughness={0.8} />
          </mesh>
        )}

        {/* 楼层分隔线 (Floor Separators) */}
        {Array.from({ length: floors + 1 }).map((_, i) => (
          <mesh key={`floor-${i}`} position={[0, i * floorHeight + 0.4, 0]} castShadow>
            <boxGeometry args={[width + 0.1, 0.1, depth + 0.1]} />
            <meshStandardMaterial color={isGlass ? "#2a3a4a" : "#6a6050"} />
          </mesh>
        ))}

        {/* 建筑边角立柱 (Corner Pillars) */}
        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map((pos, i) => (
          <mesh key={`pillar-${i}`} position={[pos[0] * (width/2), height/2 + 0.4, pos[1] * (depth/2)]} castShadow>
            <boxGeometry args={[0.2, height, 0.2]} />
            <meshStandardMaterial color={isGlass ? "#2a3a4a" : "#6a6050"} />
          </mesh>
        ))}

        {/* 军医院红十字标识 */}
        {!isGlass && locId === 'hospital' && (
          <group position={[0, height - 0.5, depth/2 + 0.05]}>
            <mesh material={new THREE.MeshStandardMaterial({ color: '#cc0000' })}>
              <boxGeometry args={[0.8, 0.25, 0.1]} />
            </mesh>
            <mesh material={new THREE.MeshStandardMaterial({ color: '#cc0000' })}>
              <boxGeometry args={[0.25, 0.8, 0.1]} />
            </mesh>
          </group>
        )}

        {/* 屋檐底座 (Cornice) */}
        <mesh position={[0, height + 0.5, 0]} material={SolidMaterial} castShadow>
          <boxGeometry args={[width + 0.6, 0.2, depth + 0.6]} />
        </mesh>

        {/* 四坡屋顶 (Hip Roof) */}
        <mesh position={[0, height + 0.6 + width/4, 0]} rotation={[0, Math.PI / 4, 0]} material={RoofMaterial} castShadow>
          <coneGeometry args={[width * 0.85, width / 2, 4]} />
        </mesh>
        
        {/* 悬浮标签与据点 - 只有在没有建筑被点击激活，或者当前建筑被激活时才显示 */}
        {(!active || isActive) && (
          <>
            {/* 悬浮标签 (Label) */}
            <Html position={[0, height + width/2 + 2.5, 0]} center style={{ pointerEvents: 'none', transition: 'opacity 0.3s' }} className={active ? "opacity-0" : "opacity-100"}>
              <div className={cn(
                "px-6 py-2.5 rounded-full border-2 backdrop-blur-md transition-all duration-500 select-none",
                hovered 
                  ? "bg-[#1a0f0a]/95 border-[#d4c3a3] opacity-100 scale-125 shadow-[0_0_30px_rgba(212,195,163,0.4)] -translate-y-2" 
                  : "bg-black/80 border-[#d4c3a3]/40 opacity-90 scale-100 shadow-lg"
              )}>
                <span className="text-[#d4c3a3] font-serif text-xl tracking-[0.2em] whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-bold">
                  {name}
                </span>
              </div>
            </Html>

            {/* 子地点标注 (Sub-location Markers) */}
            {subLocations?.filter((sub: any) => sub.showOnBuilding).map((sub: any, idx: number) => {
              const mX = (sub.fx || 0) * width;
              const mY = height * (sub.fy || 0) + 0.4;
              const mZ = depth / 2 + 0.05;

              return (
                <Float key={sub.name} speed={2 + idx * 0.5} rotationIntensity={0.2} floatIntensity={0.6} position={[mX, mY, mZ + 0.2]}>
                  <Html transform scale={0.4} style={{ pointerEvents: 'none', transition: 'opacity 0.3s' }} className={active ? "opacity-0" : "opacity-100"}>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border-2 transition-all duration-500",
                      hovered 
                        ? "bg-[#1a0a0a]/95 text-[#e5d5b5] border-[#d4c3a3]/80 shadow-[0_0_15px_rgba(212,195,163,0.3)] scale-110" 
                        : "bg-[#0a0a0a]/80 text-[#d4c3a3]/90 border-[#d4c3a3]/40 shadow-md"
                    )}>
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]",
                        hovered ? "bg-red-500 text-red-500 animate-pulse" : "bg-[#d4c3a3] text-[#d4c3a3]"
                      )} />
                      <span className="text-xl font-serif whitespace-nowrap drop-shadow-md font-bold tracking-widest">
                        {sub.name}
                      </span>
                    </div>
                  </Html>
                </Float>
              );
            })}
          </>
        )}

        {/* 内部互动光源 (Inner Glow on Hover) */}
        {(hovered || isActive) && (
          <pointLight position={[0, height/2, 0]} intensity={3} color="#d4c3a3" distance={15} decay={2} />
        )}
      </group>
    </group>
  );
}

function MapScene({ activeLocation, setActiveLocation, controlsRef }: any) {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 15, 10]} intensity={2} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={1} color="#88ccff" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#d4c3a3" />
      
      {/* Ground Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow onClick={() => setActiveLocation(null)}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#3a5525" roughness={1} />
        <gridHelper args={[60, 40, '#2b4515', '#223811']} position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]} />
      </mesh>

      {/* Central Fountain */}
      <group position={[4, 0, 2]}>
        <mesh position={[0, 0.05, 0]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[1.8, 2.5, 32]} />
          <meshStandardMaterial color="#d0d0c0" />
        </mesh>
        <mesh position={[0, 0.1, 0]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[1.8, 32]} />
          <meshStandardMaterial color="#88ccff" roughness={0.1} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 1.2, 16]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
      </group>

      {/* Main White Paths */}
      {/* Path for left 3 buildings */}
      <mesh position={[-4, -0.05, -0.5]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 1.5]} />
        <meshStandardMaterial color="#d0d0c0" />
      </mesh>
      {/* Path connecting to fountain */}
      <mesh position={[4, -0.05, 0.5]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.5, 2]} />
        <meshStandardMaterial color="#d0d0c0" />
      </mesh>
      {/* Path from fountain to Intelligence Plaza */}
      <mesh position={[9, -0.05, 2]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.5, 1.5]} />
        <meshStandardMaterial color="#d0d0c0" />
      </mesh>
      
      {/* Paths connecting buildings to main path */}
      <mesh position={[-12, -0.05, -1.5]} rotation={[-Math.PI/2, 0, 0]} receiveShadow><planeGeometry args={[1.5, 2]} /><meshStandardMaterial color="#d0d0c0" /></mesh>
      <mesh position={[-4, -0.05, -1.5]} rotation={[-Math.PI/2, 0, 0]} receiveShadow><planeGeometry args={[1.5, 2]} /><meshStandardMaterial color="#d0d0c0" /></mesh>
      <mesh position={[4, -0.05, -1.5]} rotation={[-Math.PI/2, 0, 0]} receiveShadow><planeGeometry args={[1.5, 2]} /><meshStandardMaterial color="#d0d0c0" /></mesh>

      {/* Trees */}
      {treePositions.map((pos, i) => (
        <Tree key={`tree-${i}`} position={[pos[0], 0, pos[1]]} />
      ))}

      {/* Buildings */}
      {contentConfig.map.locations.map((loc) => {
        const data = buildingsData[loc.id as keyof typeof buildingsData];
        if (!data) return null;
        return (
          <Building 
            key={loc.id}
            locId={loc.id}
            name={loc.name}
            position={data.position as [number, number, number]}
            scale={data.scale as [number, number, number]}
            rotation={data.rotation as [number, number, number]}
            floors={data.floors}
            isGlass={data.isGlass}
            active={activeLocation}
            onClick={setActiveLocation}
            subLocations={loc.subLocations}
          />
        );
      })}

      {/* Environment lighting without remote HDR to prevent loading failures */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 15, 10]} intensity={2} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={1} color="#88ccff" />
      <pointLight position={[0, 10, 0]} intensity={1} color="#d4c3a3" />
      
      <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={40} blur={2} far={10} />
      
      <OrbitControls 
        ref={controlsRef}
        makeDefault 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={5} 
        maxDistance={40}
        enablePan={false}
        autoRotate={!activeLocation}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function InteractiveMap() {
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);

  return (
    <section className="relative py-24 bg-[#0a0a0a] border-y border-[#222] overflow-hidden" id="interactive-map">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center relative z-20 pointer-events-none">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-serif tracking-widest text-[#d4c3a3] mb-6 drop-shadow-lg"
        >
          {contentConfig.map.sectionTitle}
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-primary-foreground/60 max-w-2xl mx-auto font-serif text-lg"
        >
          {contentConfig.map.description}
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="relative w-full aspect-[4/5] md:aspect-[21/9] overflow-hidden rounded-xl border border-[#333] shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#050505]">
          
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center text-[#d4c3a3]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          }>
            <Canvas shadows camera={{ position: [0, 15, 25], fov: 45 }}>
              <CameraRig activeLocation={activeLocation} buildingsData={buildingsData} controlsRef={controlsRef} />
              <MapScene activeLocation={activeLocation} setActiveLocation={setActiveLocation} controlsRef={controlsRef} />
            </Canvas>
          </Suspense>

          {/* Floating Info Panel UI */}
          <div className="absolute inset-0 pointer-events-none z-50">
            <AnimatePresence>
              {activeLocation && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="absolute bottom-6 left-6 right-6 md:left-auto md:right-8 md:bottom-8 md:top-8 md:w-[380px] bg-[#0a0a0a]/90 backdrop-blur-2xl border border-[#d4c3a3]/30 p-5 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-y-auto pointer-events-auto"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(212, 195, 163, 0.3) transparent'
                  }}
                >
                {contentConfig.map.locations.map((loc) => (
                  loc.id === activeLocation && (
                    <div key={loc.id} className="space-y-5">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#d4c3a3]/20 group">
                        <img 
                          src={loc.image} 
                          alt={loc.name}
                          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent opacity-90" />
                        <h4 className="absolute bottom-4 left-5 text-3xl font-serif text-[#d4c3a3] tracking-widest drop-shadow-md">
                          {loc.name}
                        </h4>
                      </div>
                      
                      <p className="text-[#d4c3a3]/80 font-serif leading-relaxed text-sm">
                        {loc.desc}
                      </p>

                      <div className="pt-3 border-t border-[#d4c3a3]/10">
                        <p className="text-xs text-[#d4c3a3]/50 mb-3 tracking-widest uppercase">包含据点</p>
                        <div className="flex flex-wrap gap-2">
                          {loc.subLocations?.map(sub => (
                            <span key={sub.name} className="text-xs px-2.5 py-1 rounded bg-[#d4c3a3]/5 text-[#d4c3a3]/90 border border-[#d4c3a3]/20 shadow-sm">
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 pb-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                        <span className="text-[10px] text-red-500 tracking-widest uppercase font-bold">Signal Intercepted</span>
                      </div>

                      <button 
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-[#d4c3a3]/60 hover:text-[#d4c3a3] hover:bg-black/80 transition-colors z-10 border border-transparent hover:border-[#d4c3a3]/30"
                        onClick={() => setActiveLocation(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
          
          {!activeLocation && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-[#d4c3a3]/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#d4c3a3] rounded-full animate-ping" />
                <span className="text-[#d4c3a3]/80 text-xs tracking-widest font-serif hidden md:inline">点击或拖拽地图查看，点击建筑获取机密</span>
                <span className="text-[#d4c3a3]/80 text-xs tracking-widest font-serif md:hidden">滑动查看地图，点击建筑获取机密</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
