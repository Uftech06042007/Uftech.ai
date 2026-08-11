"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { ThreeColors } from "@/lib/useThreeColors";

export function TalentGeo({ colors }: { colors: ThreeColors }) {
  const rings = [1.6, 1.2, 0.85, 0.55];
  const dotsRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: Math.sin(i * 12.9) * 0.5,
        z: Math.cos(i * 7.3) * 0.5,
        speed: 0.35 + (i % 5) * 0.07,
        offset: i / 14,
      })),
    []
  );

  useFrame((state) => {
    if (spinRef.current) spinRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    if (!dotsRef.current) return;
    dotsRef.current.children.forEach((child, i) => {
      const s = seeds[i];
      const t = (state.clock.elapsedTime * s.speed + s.offset) % 1;
      child.position.y = 2.2 - t * 4.2;
      child.scale.setScalar(1 - t * 0.45);
    });
  });

  return (
    <group ref={spinRef}>
      {rings.map((r, i) => (
        <mesh key={i} position={[0, 2.2 - i * 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.045, 16, 48]} />
          <meshStandardMaterial
            color={i === rings.length - 1 ? colors.acc : colors.line}
            metalness={0.3}
            roughness={0.4}
            emissive={i === rings.length - 1 ? colors.acc : "#000000"}
            emissiveIntensity={i === rings.length - 1 ? 0.5 : 0}
          />
        </mesh>
      ))}
      <group ref={dotsRef}>
        {seeds.map((s, i) => (
          <mesh key={i} position={[s.x, 2.2, s.z]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color={colors.acc} emissive={colors.acc} emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function HrmsGeo({ colors }: { colors: ThreeColors }) {
  const groupRef = useRef<THREE.Group>(null);
  const angles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.35;
  });

  return (
    <group position={[0, 0.4, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.03, 16, 64]} />
        <meshStandardMaterial color={colors.line} metalness={0.2} roughness={0.6} />
      </mesh>
      <group ref={groupRef}>
        {angles.map((a, i) => (
          <Float key={i} speed={2} floatIntensity={0.6} rotationIntensity={0.4}>
            <mesh position={[Math.cos(a) * 1.6, 0, Math.sin(a) * 1.6]}>
              <icosahedronGeometry args={[0.26, 0]} />
              <meshStandardMaterial
                color={colors.acc}
                metalness={0.4}
                roughness={0.3}
                emissive={colors.acc}
                emissiveIntensity={0.3}
              />
            </mesh>
          </Float>
        ))}
      </group>
      <mesh>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshStandardMaterial color={colors.pg} metalness={0.6} roughness={0.25} emissive={colors.acc} emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
}

export function CrmGeo({ colors }: { colors: ThreeColors }) {
  const groupRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const cubes = useMemo(() => Array.from({ length: 5 }, (_, i) => ({ offset: i / 5 })), []);

  useFrame((state) => {
    if (tiltRef.current) tiltRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.35;
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const s = cubes[i];
      const t = (state.clock.elapsedTime * 0.15 + s.offset) % 1;
      child.position.x = -2.4 + t * 4.8;
      child.position.y = Math.sin(t * Math.PI) * 0.3;
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 0.2 + t * 0.6;
    });
  });

  return (
    <group ref={tiltRef} position={[0, 0.2, 0]}>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[5, 0.04, 0.04]} />
        <meshStandardMaterial color={colors.line} />
      </mesh>
      {[-2.4, -1.2, 0, 1.2, 2.4].map((x, i) => (
        <mesh key={i} position={[x, -0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshStandardMaterial color={colors.line} />
        </mesh>
      ))}
      <group ref={groupRef}>
        {cubes.map((_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={colors.acc} metalness={0.3} roughness={0.4} emissive={colors.acc} emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

