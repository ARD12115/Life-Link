'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function Logo3D() {
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