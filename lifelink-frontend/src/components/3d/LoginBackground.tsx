'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingElementProps {
  index: number;
  total: number;
}

export function FloatingElement({ index, total }: { index: number; total: number }) {
  const progress = index / total;
  const angle = progress * Math.PI * 2;
  const radius = 8 + Math.random() * 4;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = (Math.random() - 0.5) * 6;
  
  const size = 0.2 + Math.random() * 0.5;
  const speed = 0.2 + Math.random() * 0.3;
  
  const ref = useRef<THREE.Mesh>(null!);
  const { clock } = useThree();
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y += Math.sin(clock.getElapsedTime() * speed) * 0.01;
      ref.current.rotation.y += 0.002;
    }
  });
  
  return (
    <mesh
      ref={ref}
      position={[x, y, z]}
      scale={size}
      rotation={[Math.random(), Math.random(), Math.random()]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#ef4444" 
        transparent 
        opacity={0.3}
        roughness={0.7}
        metalness={0.2}
      />
    </mesh>
  );
}

function FloatingElements({ count }: { count: number }) {
  const elements = Array.from({ length: count }, (_, i) => (
    <FloatingElement key={i} index={i} total={count} />
  ));
  return <group>{elements}</group>;
}

export function LoginBackground() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 10], fov: 45 }}
      className="fixed inset-0"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <fog attach="fog" args={['#0f172a', 5, 20]} />
      
      <Suspense fallback={null}>
        <FloatingElements count={30} />
      </Suspense>
    </Canvas>
  );
}

function LoginParticles() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 50], fov: 75 }}
      className="fixed inset-0"
    >
      <Suspense fallback={null}>
        <ParticleSystem count={100} />
      </Suspense>
    </Canvas>
  );
}

function ParticleSystem({ count }: { count: number }) {
  const particles = Array.from({ length: count }, (_, i) => (
    <Particle key={i} index={i} />
  ));
  return <points>{particles}</points>;
}

function Particle({ index }: { index: number }) {
  const position = useMemo(() => [
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  ], []);
  
  const size = Math.random() * 2 + 0.5;
  const opacity = Math.random() * 0.5 + 0.1;
  const speed = Math.random() * 0.5 + 0.2;
  
  return (
    <mesh position={position} scale={size}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial 
        color="#ef4444" 
        transparent 
        opacity={opacity}
        sizeAttenuation
      />
      <FloatAnimation speed={speed} />
    </mesh>
  );
}

function FloatAnimation({ speed }: { speed: number }) {
  const { clock } = useThree();
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y += Math.sin(clock.getElapsedTime() * speed) * 0.01;
      ref.current.rotation.y += 0.002;
    }
  });
  
  return null;
}

function Particle({ index }: { index: number }) {
  const position = useMemo(() => [
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  ], []);
  
  const size = Math.random() * 2 + 0.5;
  const opacity = Math.random() * 0.5 + 0.1;
  const speed = Math.random() * 0.5 + 0.2;
  
  return (
    <mesh position={position} scale={size}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial 
        color="#ef4444" 
        transparent 
        opacity={opacity}
        sizeAttenuation
      />
      <FloatAnimation speed={speed} />
    </mesh>
  );
}

function Logo3D() {
  const group = useRef<THREE.Group>(null);
  const { clock } = useThree();
  
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.3;
      group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });
  
  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[0.8, 0.25, 16, 32]} />
        <meshStandardMaterial 
          color="#ef4444" 
          roughness={0.3} 
          metalness={0.7}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[0.5, 0.15, 12, 24]} />
        <meshStandardMaterial 
          color="#ef4444" 
          roughness={0.3} 
          metalness={0.7}
        />
        <meshRotation rotation={[Math.PI / 2, 0, 0]} />
      </mesh>
    </group>
  );
}