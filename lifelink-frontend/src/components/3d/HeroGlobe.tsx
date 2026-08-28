'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useProgress } from '@react-three/drei';
import { useScrollProgress } from '@/hooks/useDeviceCapabilities';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { Suspense, useRef, useMemo } from 'react';

export function HeroGlobe() {
  const scrollProgress = useScrollProgress();
  const { webgl2, reducedMotion, lowMemory } = useDeviceCapabilities();
  const groupRef = useRef<THREE.Group>(null);
  
  if (reducedMotion || lowMemory || !webgl2) {
    return <StaticGlobeFallback />;
  }

  // Load all LOD models in parallel
  const models = useGLTF([
    '/models/globe-wireframe.glb',
    '/models/globe-lowpoly.glb',
    '/models/globe-textured.glb',
    '/models/globe-detailed.glb',
  ]);

  const progress = useProgress(models);

  if (!progress.loaded) {
    return <GlobeSkeleton />;
  }

  const [wireframe, lowpoly, textured, detailed] = models;

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <MorphingModels 
          models={[wireframe, lowpoly, textured, detailed]} 
          progress={scrollProgress * 3} 
        />
      </Suspense>
    </group>
  );
}

function MorphingModels({ models, progress }: { models: any[], progress: number }) {
  const [wireframe, lowpoly, textured, detailed] = models;

  return (
    <group>
      {/* Model 0: Wireframe (0-0.33) */}
      <LOD distances={[0, 10, 20]}>
        <mesh 
          geometry={wireframe.nodes.Globe_Wireframe?.geometry || wireframe.nodes.Globe?.geometry} 
          material={wireframe.materials.WireframeMaterial || wireframe.materials.Material}
        />
      </LOD>
      
      {/* Model 1: Low-poly (0.33-0.66) */}
      <LOD distances={[0, 15, 30]}>
        <mesh 
          geometry={lowpoly.nodes.Globe_Lowpoly?.geometry || lowpoly.nodes.Globe?.geometry} 
          material={lowpoly.materials.LowpolyMaterial || lowpoly.materials.Material}
        />
      </LOD>
      
      {/* Model 2: Textured (0.66-1.0) */}
      <LOD distances={[0, 20, 40]}>
        <mesh 
          geometry={textured.nodes.Globe_Textured?.geometry || textured.nodes.Globe?.geometry} 
          material={textured.materials.TexturedMaterial || textured.materials.Material}
        />
      </LOD>
      
      {/* Model 3: Detailed (1.0+) */}
      <LOD distances={[0, 25, 50]}>
        <mesh 
          geometry={detailed.nodes.Globe_Detailed?.geometry || detailed.nodes.Globe?.geometry} 
          material={detailed.materials.DetailedMaterial || detailed.materials.Material}
        />
      </LOD>
    </group>
  );
}

function GlobeSkeleton() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial 
          color="#1e293b" 
          wireframe 
          transparent 
          opacity={0.3}
        />
      </mesh>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </group>
  );
}

function StaticGlobeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center p-8">
        <div className="w-32 h-32 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-2 border-red-500/30 rounded-full animate-pulse" />
          <div className="absolute inset-0 border-2 border-red-500/50 rounded-full animate-pulse delay-500" />
          <div className="relative z-10 w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9H9.75a9 9 0 000-18h.25a9 9 0 110 18z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">LifeLink</h3>
        <p className="text-slate-400">Emergency Blood Network</p>
      </div>
    </div>
  );
}