import React, { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sun,
  Wind,
  ShieldCheck,
  Building2,
  UserCheck,
  Zap,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import HeroHologramFallback from './HeroHologramFallback';

// WebGL capability detector
export const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

// 1. Central Skill Intelligence Core
const SkillCore = ({ onHover, activeNode, isMobile, sceneScale }) => {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.35;
      coreRef.current.rotation.x += delta * 0.15;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.4;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.3;
    if (ring3Ref.current) ring3Ref.current.rotation.y -= delta * 0.35;
  });

  const coreRadius = isMobile ? 0.75 : 0.95;

  return (
    <group scale={[sceneScale, sceneScale, sceneScale]}>
      {/* Central Pulsing Sphere */}
      <mesh
        ref={coreRef}
        onPointerOver={() => onHover('core')}
        onPointerOut={() => onHover(null)}
      >
        <icosahedronGeometry args={[coreRadius, isMobile ? 1 : 2]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#10b981"
          emissiveIntensity={activeNode === 'core' ? 1.6 : 0.9}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Wireframe outer lattice */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <icosahedronGeometry args={[coreRadius, 1]} />
        <meshBasicMaterial
          color="#34d399"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Inner Glow Core */}
      <mesh scale={[0.5, 0.5, 0.5]}>
        <sphereGeometry args={[coreRadius, isMobile ? 12 : 16, isMobile ? 12 : 16]} />
        <meshBasicMaterial color="#a7f3d0" />
      </mesh>

      {/* Concentric Orbital Rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[coreRadius * 1.55, 0.02, 12, isMobile ? 32 : 64]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#059669"
          emissiveIntensity={0.6}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[coreRadius * 1.8, 0.015, 12, isMobile ? 32 : 64]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.5}
        />
      </mesh>

      {!isMobile && (
        <mesh ref={ring3Ref} rotation={[-Math.PI / 4, Math.PI / 3, 0]}>
          <torusGeometry args={[coreRadius * 2.05, 0.012, 12, 64]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.4}
          />
        </mesh>
      )}

      {/* Center 3D HUD Badge */}
      <Html position={[0, -coreRadius * 1.45, 0]} center distanceFactor={isMobile ? 8 : 11}>
        <div className="pointer-events-none select-none px-2.5 sm:px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-400/40 text-emerald-300 text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase whitespace-nowrap shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-pulse">
          <Sparkles size={11} className="text-teal-300 shrink-0" />
          <span>Skill Intelligence Core</span>
        </div>
      </Html>
    </group>
  );
};

// 2. Solar PV Panel Array 3D Model
const SolarPanelArray3D = ({ position, onHover, isHovered, isMobile, sceneScale }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08 - 0.2;
    }
  });

  const width = isMobile ? 1.1 : 1.55;
  const height = isMobile ? 0.7 : 0.95;

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.35}>
      <group
        ref={groupRef}
        position={position}
        scale={[sceneScale, sceneScale, sceneScale]}
        onPointerOver={() => onHover('solar')}
        onPointerOut={() => onHover(null)}
      >
        {/* Mounting Stand */}
        <mesh position={[0, -height * 0.65, 0]}>
          <cylinderGeometry args={[0.05, 0.07, height * 1.1, 10]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Panel Frame */}
        <mesh position={[0, 0, 0]} rotation={[0.42, 0, 0]}>
          <boxGeometry args={[width, height, 0.05]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Photovoltaic Cells */}
        <mesh position={[0, 0.01, 0.03]} rotation={[0.42, 0, 0]}>
          <boxGeometry args={[width * 0.92, height * 0.9, 0.02]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive={isHovered ? '#0ea5e9' : '#0369a1'}
            emissiveIntensity={isHovered ? 0.95 : 0.4}
            roughness={0.15}
            metalness={0.95}
          />
        </mesh>

        {/* Panel Grid Overlay Wireframe */}
        <mesh position={[0, 0.02, 0.035]} rotation={[0.42, 0, 0]}>
          <planeGeometry args={[width * 0.93, height * 0.91]} />
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={isHovered ? 0.8 : 0.3}
          />
        </mesh>

        <Html position={[0, height * 0.75, 0]} center distanceFactor={isMobile ? 8 : 10}>
          <div
            className={`transition-all duration-300 pointer-events-none select-none px-2 sm:px-2.5 py-1 rounded-lg backdrop-blur-md text-[9px] sm:text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 ${
              isHovered
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/60 shadow-lg scale-105'
                : 'bg-slate-900/80 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Sun size={11} className="text-amber-400 shrink-0" />
            <span>500kW Solar PV Array</span>
          </div>
        </Html>
      </group>
    </Float>
  );
};

// 3. Wind Turbine 3D Model with Spinning Rotor Blades
const WindTurbine3D = ({ position, onHover, isHovered, isMobile, sceneScale }) => {
  const rotorRef = useRef();
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (rotorRef.current) {
      const speed = isHovered ? 3.5 : 1.8;
      rotorRef.current.rotation.z += delta * speed;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.1 + 0.3;
    }
  });

  const towerHeight = isMobile ? 1.7 : 2.4;
  const bladeLength = isMobile ? 0.95 : 1.35;

  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.3}>
      <group
        ref={groupRef}
        position={position}
        scale={[sceneScale, sceneScale, sceneScale]}
        onPointerOver={() => onHover('wind')}
        onPointerOut={() => onHover(null)}
      >
        {/* Tower Mast */}
        <mesh position={[0, -towerHeight * 0.1, 0]}>
          <cylinderGeometry args={[0.06, 0.12, towerHeight, isMobile ? 10 : 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Nacelle housing */}
        <mesh position={[0, towerHeight * 0.45, 0.1]}>
          <boxGeometry args={[0.26, 0.24, 0.55]} />
          <meshStandardMaterial
            color={isHovered ? '#10b981' : '#e2e8f0'}
            emissive={isHovered ? '#059669' : '#000000'}
            emissiveIntensity={isHovered ? 0.5 : 0}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* Rotor Hub & 3 Aerodynamic Blades */}
        <group position={[0, towerHeight * 0.45, 0.38]} ref={rotorRef}>
          <mesh>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, idx) => (
            <group key={idx} rotation={[0, 0, angle]}>
              <mesh position={[0, bladeLength * 0.52, 0]}>
                <boxGeometry args={[0.06, bladeLength, 0.015]} />
                <meshStandardMaterial
                  color="#f8fafc"
                  emissive={isHovered ? '#06b6d4' : '#000000'}
                  emissiveIntensity={isHovered ? 0.35 : 0}
                />
              </mesh>
            </group>
          ))}
        </group>

        <Html position={[0, towerHeight * 0.75, 0]} center distanceFactor={isMobile ? 8 : 10}>
          <div
            className={`transition-all duration-300 pointer-events-none select-none px-2 sm:px-2.5 py-1 rounded-lg backdrop-blur-md text-[9px] sm:text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 ${
              isHovered
                ? 'bg-sky-500/25 text-sky-300 border border-sky-400/60 shadow-lg scale-105'
                : 'bg-slate-900/80 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Wind size={11} className="text-sky-400 shrink-0" />
            <span>GWO Wind Turbine</span>
          </div>
        </Html>
      </group>
    </Float>
  );
};

// 4. Floating Holographic Satellite Node
const FloatingSatelliteNode = ({
  position,
  label,
  sublabel,
  icon: Icon,
  badgeColor,
  nodeKey,
  onHover,
  isHovered,
  isMobile,
  sceneScale,
}) => {
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.4}>
      <group
        position={position}
        scale={[sceneScale, sceneScale, sceneScale]}
        onPointerOver={() => onHover(nodeKey)}
        onPointerOut={() => onHover(null)}
      >
        <mesh>
          <sphereGeometry args={[isMobile ? 0.14 : 0.18, 12, 12]} />
          <meshStandardMaterial
            color={badgeColor}
            emissive={badgeColor}
            emissiveIntensity={isHovered ? 1.5 : 0.8}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.25, 20]} />
          <meshBasicMaterial
            color={badgeColor}
            transparent
            opacity={isHovered ? 0.9 : 0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        <Html position={[0, 0.38, 0]} center distanceFactor={isMobile ? 8 : 10}>
          <div
            className={`transition-all duration-300 cursor-pointer select-none px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl backdrop-blur-md border text-xs font-semibold whitespace-nowrap shadow-xl flex items-center gap-2 ${
              isHovered
                ? 'bg-slate-900/95 text-white border-emerald-400 scale-105 shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-200 border-slate-700/80'
            }`}
          >
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: badgeColor }}
            >
              <Icon size={11} />
            </div>
            <div>
              <span className="block font-bold text-white text-[10px] sm:text-[11px] leading-tight">
                {label}
              </span>
              <span className="block text-[8px] sm:text-[9px] text-emerald-400 font-medium leading-tight">
                {sublabel}
              </span>
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
};

// 5. Energy Connection Lines
const EnergyConnections = ({ targets, corePos = [0, 0, 0] }) => {
  const lineCoords = useMemo(() => {
    return targets.map((t) => [
      new THREE.Vector3(...corePos),
      new THREE.Vector3(...t),
    ]);
  }, [targets, corePos]);

  return (
    <group>
      {lineCoords.map(([start, end], idx) => {
        const points = [start, end];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <primitive
            key={idx}
            object={new THREE.Line(
              lineGeometry,
              new THREE.LineBasicMaterial({
                color: idx % 2 === 0 ? 0x10b981 : 0x06b6d4,
                transparent: true,
                opacity: 0.35,
                linewidth: 1,
              })
            )}
          />
        );
      })}
    </group>
  );
};

// 6. Particle Field (Adaptive count based on device)
const ParticleField = ({ count = 350 }) => {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return positions;
  }, [count]);

  const pointsRef = useRef();

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.025;
      pointsRef.current.rotation.x += delta * 0.012;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#34d399"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
};

// 7. Responsive Camera & Viewport Controller
const ResponsiveSceneManager = ({ isIntroActive, onIntroComplete }) => {
  const { camera, size } = useThree();

  useEffect(() => {
    // Dynamic FOV and camera distance calculation based on viewport width & height
    const aspect = size.width / size.height;

    if (size.width < 400) {
      // Small mobile phones (iPhone SE, etc.)
      camera.fov = 54;
      camera.position.z = 8.8;
    } else if (size.width < 640) {
      // Standard mobile phones
      camera.fov = 50;
      camera.position.z = 8.2;
    } else if (size.width < 1024) {
      // Tablets / iPads
      camera.fov = 48;
      camera.position.z = 8.0;
    } else if (aspect < 1.3) {
      // Square-ish / 4:3 displays
      camera.fov = 48;
      camera.position.z = 8.2;
    } else {
      // Standard laptops, desktops & ultrawide
      camera.fov = 45;
      camera.position.z = 7.5;
    }

    camera.updateProjectionMatrix();
  }, [size.width, size.height, camera]);

  useFrame((state) => {
    // Subtle pointer parallax (only on desktop/tablets with fine pointer)
    if (size.width >= 640) {
      state.camera.position.x = THREE.MathUtils.lerp(
        state.camera.position.x,
        state.pointer.x * 0.45,
        0.04
      );
      state.camera.position.y = THREE.MathUtils.lerp(
        state.camera.position.y,
        state.pointer.y * 0.3,
        0.04
      );
    }
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};

// Main Responsive 3D Renewable Ecosystem Scene
const Responsive3DScene = ({ activeNode, setActiveNode, isIntroActive, onIntroComplete }) => {
  const { size } = useThree();

  const isSmallMobile = size.width < 380;
  const isMobile = size.width < 640;
  const isTablet = size.width >= 640 && size.width < 1024;

  // Responsive scale factor
  const sceneScale = useMemo(() => {
    if (size.width < 360) return 0.62;
    if (size.width < 420) return 0.72;
    if (size.width < 640) return 0.8;
    if (size.width < 1024) return 0.9;
    if (size.width > 1800) return 1.15;
    return 1.0;
  }, [size.width]);

  // Particle count adapted to hardware
  const particleCount = isMobile ? 180 : isTablet ? 450 : 800;

  // Responsive object coordinates
  const layout = useMemo(() => {
    if (isMobile) {
      // Mobile compact composition: Core in upper center, Solar left, Wind right, Technician bottom
      return {
        core: [0, 0.45, 0],
        solar: [-1.22, -0.85, 0.1],
        wind: [1.22, -0.75, 0.1],
        tech: [0, -1.95, 0.3],
        match: [0, 1.65, 0.2],
        epc: null, // Hidden on mobile to prevent clutter & overflow
        passport: null, // Hidden on mobile
        connectionTargets: [
          [-1.22, -0.85, 0.1],
          [1.22, -0.75, 0.1],
          [0, -1.95, 0.3],
          [0, 1.65, 0.2],
        ],
      };
    }

    if (isTablet) {
      // Tablet balanced composition
      return {
        core: [0, 0.15, 0],
        solar: [-2.15, -0.6, 0],
        wind: [2.15, -0.35, 0],
        tech: [-1.6, 1.6, 0.3],
        epc: [1.7, 1.5, 0.3],
        passport: [0, 2.0, 0],
        match: [0, -1.9, 0],
        connectionTargets: [
          [-2.15, -0.6, 0],
          [2.15, -0.35, 0],
          [-1.6, 1.6, 0.3],
          [1.7, 1.5, 0.3],
          [0, 2.0, 0],
          [0, -1.9, 0],
        ],
      };
    }

    // Desktop full ecosystem composition
    return {
      core: [0, 0, 0],
      solar: [-3.0, -0.6, 0],
      wind: [3.0, -0.2, 0],
      tech: [-2.2, 1.9, 0.4],
      epc: [2.4, 1.8, 0.4],
      passport: [0, 2.3, 0],
      match: [0, -2.1, 0],
      connectionTargets: [
        [-3.0, -0.6, 0],
        [3.0, -0.2, 0],
        [-2.2, 1.9, 0.4],
        [2.4, 1.8, 0.4],
        [0, 2.3, 0],
        [0, -2.1, 0],
      ],
    };
  }, [isMobile, isTablet]);

  return (
    <>
      <ambientLight intensity={isMobile ? 0.9 : 0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} color="#f8fafc" />
      <pointLight position={[0, 0, 1.5]} intensity={2.2} color="#10b981" distance={10} />
      <pointLight position={[-4, 2, -2]} intensity={1.5} color="#06b6d4" distance={8} />

      <ResponsiveSceneManager
        isIntroActive={isIntroActive}
        onIntroComplete={onIntroComplete}
      />

      <ParticleField count={particleCount} />

      <EnergyConnections
        targets={layout.connectionTargets}
        corePos={layout.core}
      />

      {/* Central Skill Intelligence Core */}
      <group position={layout.core}>
        <SkillCore
          onHover={setActiveNode}
          activeNode={activeNode}
          isMobile={isMobile}
          sceneScale={sceneScale}
        />
      </group>

      {/* Solar Panel Array */}
      <SolarPanelArray3D
        position={layout.solar}
        onHover={setActiveNode}
        isHovered={activeNode === 'solar'}
        isMobile={isMobile}
        sceneScale={sceneScale}
      />

      {/* Wind Turbine */}
      <WindTurbine3D
        position={layout.wind}
        onHover={setActiveNode}
        isHovered={activeNode === 'wind'}
        isMobile={isMobile}
        sceneScale={sceneScale}
      />

      {/* Technician Node */}
      {layout.tech && (
        <FloatingSatelliteNode
          position={layout.tech}
          label="Rahul Kumar"
          sublabel="Technician • 96% Match"
          icon={UserCheck}
          badgeColor="#10b981"
          nodeKey="tech"
          onHover={setActiveNode}
          isHovered={activeNode === 'tech'}
          isMobile={isMobile}
          sceneScale={sceneScale}
        />
      )}

      {/* AI Matching Indicator */}
      {layout.match && (
        <FloatingSatelliteNode
          position={layout.match}
          label="AI Matching"
          sublabel="6 Factor Analysis"
          icon={Zap}
          badgeColor="#8b5cf6"
          nodeKey="match"
          onHover={setActiveNode}
          isHovered={activeNode === 'match'}
          isMobile={isMobile}
          sceneScale={sceneScale}
        />
      )}

      {/* Desktop / Tablet Satellites */}
      {layout.epc && (
        <FloatingSatelliteNode
          position={layout.epc}
          label="GreenVolt EPC"
          sublabel="500kW Solar Installation"
          icon={Building2}
          badgeColor="#06b6d4"
          nodeKey="epc"
          onHover={setActiveNode}
          isHovered={activeNode === 'epc'}
          isMobile={isMobile}
          sceneScale={sceneScale}
        />
      )}

      {layout.passport && (
        <FloatingSatelliteNode
          position={layout.passport}
          label="Digital Skill Passport"
          sublabel="✓ Level 4 Verified"
          icon={ShieldCheck}
          badgeColor="#f59e0b"
          nodeKey="passport"
          onHover={setActiveNode}
          isHovered={activeNode === 'passport'}
          isMobile={isMobile}
          sceneScale={sceneScale}
        />
      )}
    </>
  );
};

// Main Export Component with Intro Sequence & Full Viewport Responsiveness
const RenewableHero3D = () => {
  const [activeNode, setActiveNode] = useState(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isIntroActive, setIsIntroActive] = useState(true);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());

    // Auto-complete intro transition after 2.8s
    const timer = setTimeout(() => {
      setIsIntroActive(false);
    }, 2800);

    // Skip on user interaction (tap, scroll, keydown)
    const handleInteraction = () => {
      setIsIntroActive(false);
    };

    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleInteraction, { once: true, passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const handleSkipIntro = (e) => {
    e.stopPropagation();
    setIsIntroActive(false);
  };

  if (!hasWebGL) {
    return <HeroHologramFallback />;
  }

  return (
    <div className="relative w-full h-[480px] sm:h-[580px] lg:h-[640px] select-none overflow-hidden">
      {/* Skip Intro Badge Button during intro */}
      {isIntroActive && (
        <button
          type="button"
          onClick={handleSkipIntro}
          className="absolute top-3 right-3 sm:top-5 sm:right-6 z-30 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[10px] sm:text-xs font-mono font-semibold backdrop-blur-md transition-all shadow-md flex items-center gap-1.5 animate-pulse cursor-pointer"
        >
          <span>Skip Intro</span>
          <ChevronDown size={13} />
        </button>
      )}

      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        resize={{ debounce: { scroll: 50, resize: 100 } }}
      >
        <Suspense fallback={null}>
          <Responsive3DScene
            activeNode={activeNode}
            setActiveNode={setActiveNode}
            isIntroActive={isIntroActive}
            onIntroComplete={() => setIsIntroActive(false)}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RenewableHero3D;
