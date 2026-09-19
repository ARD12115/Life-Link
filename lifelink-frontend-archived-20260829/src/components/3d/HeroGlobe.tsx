'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useProgress } from '@react-three/drei';
import { useScrollProgress } from '@/hooks/useDeviceCapabilities';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';

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

  const progress = { loaded: models.every(Boolean) };

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
  // Determine which model to show based on scroll progress
  // 0-1: wireframe, 1-2: lowpoly, 2-3: textured, 3+: detailed
  const modelIndex = Math.min(Math.floor(progress), 3);
  
  // Smooth transition between models
  const t = progress - modelIndex;
  
  const currentModel = models[modelIndex];
  const nextModel = models[Math.min(modelIndex + 1, 3)];

  return (
    <group>
      {/* Current model */}
      <ModelRenderer model={currentModel} opacity={1 - t} isWireframe={modelIndex === 0} />
      
      {/* Next model (for smooth transition) */}
      {t > 0 && <ModelRenderer model={nextModel} opacity={t} isWireframe={modelIndex + 1 === 0} />}
    </group>
  );
}

function ModelRenderer({ model, opacity, isWireframe }: { model: any, opacity: number, isWireframe: boolean }) {
  if (!model) return null;
  
  const geometry = model.nodes.Globe?.geometry || 
                   model.nodes.Globe_Wireframe?.geometry || 
                   model.nodes.Globe_Lowpoly?.geometry || 
                   model.nodes.Globe_Textured?.geometry || 
                   model.nodes.Globe_Detailed?.geometry;
  
  const material = model.materials.Material || 
                   model.materials.WireframeMaterial || 
                   model.materials.LowpolyMaterial || 
                   model.materials.TexturedMaterial || 
                   model.materials.DetailedMaterial;

  if (!geometry) return null;

  return (
    <mesh>
      <primitive object={geometry.clone()} />
      <meshStandardMaterial 
        color="#1e293b" 
        wireframe={isWireframe} 
        transparent 
        opacity={opacity * (isWireframe ? 0.5 : 1)}
      />
    </mesh>
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