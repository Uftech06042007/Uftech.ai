"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { ThreeColors } from "@/lib/useThreeColors";

// Orchestration hub with agent satellites — a rigid rotating group, so each
// agent's connecting spoke can stay a static local transform.
export function AgentsGeo({ colors }: { colors: ThreeColors }) {
  const groupRef = useRef<THREE.Group>(null);
  const agents = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        const r = 1.7;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, y: Math.sin(i * 1.7) * 0.35, angle: a };
      }),
    []
  );

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color={colors.pg} metalness={0.6} roughness={0.25} emissive={colors.acc} emissiveIntensity={0.25} />
      </mesh>
      <group ref={groupRef}>
        {agents.map((a, i) => (
          <group key={i}>
            <mesh position={[a.x / 2, a.y / 2, a.z / 2]} rotation={[0, -a.angle, Math.PI / 2]}>
              <cylinderGeometry args={[0.014, 0.014, Math.hypot(a.x, a.z, a.y), 8]} />
              <meshBasicMaterial color={colors.acc} transparent opacity={0.65} />
            </mesh>
            <Float speed={2.4} floatIntensity={0.7} rotationIntensity={0.6}>
              <mesh position={[a.x, a.y, a.z]}>
                <sphereGeometry args={[0.19, 20, 20]} />
                <meshStandardMaterial color={colors.acc} metalness={0.35} roughness={0.3} emissive={colors.acc} emissiveIntensity={0.45} />
              </mesh>
            </Float>
          </group>
        ))}
      </group>
    </group>
  );
}

// A fanned stack of documents with a scanning beam sweeping across, and
// retrieved fragments streaming into a central answer core.
export function GenAIGeo({ colors }: { colors: ThreeColors }) {
  const beamRef = useRef<THREE.Mesh>(null);
  const dotsRef = useRef<THREE.Group>(null);
  const docs = useMemo(() => Array.from({ length: 5 }, (_, i) => ({ y: -0.6 + i * 0.18, rot: -0.28 + i * 0.03 })), []);
  const seeds = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ speed: 0.4 + (i % 4) * 0.08, offset: i / 10 })), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (beamRef.current) beamRef.current.position.y = Math.sin(t * 0.9) * 0.65;
    if (!dotsRef.current) return;
    dotsRef.current.children.forEach((child, i) => {
      const s = seeds[i];
      const p = (t * s.speed + s.offset) % 1;
      child.position.x = -0.9 + p * 2.6;
      child.position.y = Math.sin(p * Math.PI) * 0.5 - 0.1;
      child.scale.setScalar(1 - p * 0.5);
    });
  });

  return (
    <group>
      <group position={[-1.1, 0, 0]} rotation={[0, 0.3, 0]}>
        {docs.map((d, i) => (
          <mesh key={i} position={[0, d.y, 0]} rotation={[0, 0, d.rot]}>
            <boxGeometry args={[1.1, 0.06, 0.75]} />
            <meshStandardMaterial color={i === 2 ? colors.acc : colors.line} metalness={0.2} roughness={0.5} emissive={i === 2 ? colors.acc : "#000000"} emissiveIntensity={i === 2 ? 0.3 : 0} />
          </mesh>
        ))}
        <mesh ref={beamRef} position={[0, 0, 0.42]}>
          <boxGeometry args={[1.3, 0.03, 0.03]} />
          <meshBasicMaterial color={colors.acc} transparent opacity={0.85} />
        </mesh>
      </group>

      <group ref={dotsRef}>
        {seeds.map((_, i) => (
          <mesh key={i} position={[-0.9, 0, 0]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color={colors.acc} emissive={colors.acc} emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>

      <mesh position={[1.4, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color={colors.pg} metalness={0.55} roughness={0.3} emissive={colors.acc} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[1.4, 0, 0]}>
        <torusGeometry args={[0.56, 0.012, 12, 48]} />
        <meshBasicMaterial color={colors.acc} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// A dark app screen with a docked copilot panel firing suggestion bubbles.
export function CopilotsGeo({ colors }: { colors: ThreeColors }) {
  const bubblesRef = useRef<THREE.Group>(null);
  const seeds = useMemo(() => Array.from({ length: 3 }, (_, i) => ({ offset: i / 3 })), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!bubblesRef.current) return;
    bubblesRef.current.children.forEach((child, i) => {
      const p = (t * 0.35 + seeds[i].offset) % 1;
      child.position.y = -0.3 + p * 1.6;
      const m = child as THREE.Mesh;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = p < 0.85 ? 0.9 : 0.9 * (1 - (p - 0.85) / 0.15);
    });
  });

  return (
    <group rotation={[0, -0.15, 0]}>
      <mesh position={[-0.3, 0, -0.15]}>
        <boxGeometry args={[2.6, 1.7, 0.06]} />
        <meshStandardMaterial color={colors.pg} metalness={0.3} roughness={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-1.0, 0.5 - i * 0.42, -0.1]}>
          <boxGeometry args={[1.5, 0.14, 0.02]} />
          <meshStandardMaterial color={colors.line} />
        </mesh>
      ))}

      <Float speed={1.6} floatIntensity={0.35} rotationIntensity={0.1}>
        <mesh position={[1.15, -0.05, 0.28]}>
          <boxGeometry args={[1.05, 1.3, 0.07]} />
          <meshStandardMaterial color={colors.pg2} metalness={0.3} roughness={0.4} emissive={colors.acc} emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[1.15, -0.05, 0.32]}>
          <boxGeometry args={[1.05, 1.3, 0.001]} />
          <meshBasicMaterial color={colors.acc} wireframe transparent opacity={0.4} />
        </mesh>
      </Float>

      <group ref={bubblesRef}>
        {seeds.map((_, i) => (
          <mesh key={i} position={[1.15, -0.3, 0.4]}>
            <sphereGeometry args={[0.08, 14, 14]} />
            <meshStandardMaterial color={colors.acc} emissive={colors.acc} emissiveIntensity={0.6} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function automationPath(t: number): [number, number, number] {
  return [-2.3 + t * 4.6, Math.sin(t * Math.PI) * 0.4, Math.sin(t * Math.PI * 2) * 0.5];
}

// Cargo cubes winding along an S-curve between three system waypoints.
export function AutomationGeo({ colors }: { colors: ThreeColors }) {
  const groupRef = useRef<THREE.Group>(null);
  const cubes = useMemo(() => Array.from({ length: 4 }, (_, i) => ({ offset: i / 4 })), []);
  const nodeTs = [0.08, 0.5, 0.92];

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const t = (state.clock.elapsedTime * 0.18 + cubes[i].offset) % 1;
      const [x, y, z] = automationPath(t);
      child.position.set(x, y, z);
      child.rotation.y = t * Math.PI * 4;
    });
  });

  return (
    <group>
      {nodeTs.map((t, i) => {
        const [x, y, z] = automationPath(t);
        return (
          <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.03, 12, 32]} />
            <meshStandardMaterial color={colors.line} metalness={0.4} roughness={0.4} />
          </mesh>
        );
      })}
      <group ref={groupRef}>
        {cubes.map((_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.28, 0.28, 0.28]} />
            <meshStandardMaterial color={colors.acc} metalness={0.3} roughness={0.35} emissive={colors.acc} emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// A guardrail ring with particles streaming through it — most pass, a
// tagged few get deflected off-axis to read as active filtering.
export function GovernanceGeo({ colors }: { colors: ThreeColors }) {
  const particlesRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        offset: i / 12,
        speed: 0.5 + (i % 3) * 0.1,
        deflect: i % 5 === 0,
        oy: Math.sin(i * 3.1) * 0.5,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Tilt gently rather than spin flat-on — a full spin around the ring's
    // own hole-axis is a no-op on a torus, and spinning any other axis
    // eventually swings it edge-on to the camera.
    if (ringRef.current) ringRef.current.rotation.y = 0.3 + Math.sin(t * 0.25) * 0.25;
    if (!particlesRef.current) return;
    particlesRef.current.children.forEach((child, i) => {
      const s = seeds[i];
      const p = (t * s.speed + s.offset) % 1;
      child.position.z = -1.6 + p * 3.2;
      child.position.y = s.oy + (s.deflect && p > 0.55 ? (p - 0.55) * 2.2 : 0);
      child.position.x = s.deflect && p > 0.55 ? (p - 0.55) * 1.6 : 0;
    });
  });

  return (
    <group rotation={[0.35, 0, 0]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.85, 0.05, 16, 48]} />
        <meshStandardMaterial color={colors.acc} metalness={0.4} roughness={0.3} emissive={colors.acc} emissiveIntensity={0.35} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.15, 0.012, 12, 48, Math.PI * 1.2]} />
        <meshBasicMaterial color={colors.line} transparent opacity={0.6} />
      </mesh>
      <group ref={particlesRef}>
        {seeds.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color={colors.ink} emissive={colors.acc} emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// A server rack with one module actively deploying — sliding out, pausing,
// sliding back in — while small version tags orbit slowly overhead.
export function MLOpsGeo({ colors }: { colors: ThreeColors }) {
  const activeRef = useRef<THREE.Mesh>(null);
  const tagsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (activeRef.current) {
      const cycle = (Math.sin(t * 0.6) + 1) / 2;
      activeRef.current.position.x = cycle * 0.55;
      const mat = activeRef.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 0.25 + cycle * 0.5;
    }
    if (tagsRef.current) tagsRef.current.rotation.y = t * 0.3;
  });

  return (
    <group>
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[1.9, 1.9, 0.5]} />
        <meshStandardMaterial color={colors.pg} metalness={0.5} roughness={0.4} />
      </mesh>
      {[-0.6, 0, 0.6].map((y, i) => (
        <mesh key={i} ref={i === 1 ? activeRef : undefined} position={[0, y, 0.15]}>
          <boxGeometry args={[1.6, 0.42, 0.5]} />
          <meshStandardMaterial
            color={i === 1 ? colors.acc : colors.line}
            metalness={0.4}
            roughness={0.3}
            emissive={i === 1 ? colors.acc : "#000000"}
            emissiveIntensity={i === 1 ? 0.3 : 0}
          />
        </mesh>
      ))}
      <group ref={tagsRef}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.5, 1.1, Math.sin(a) * 1.5]}>
              <octahedronGeometry args={[0.14, 0]} />
              <meshStandardMaterial color={colors.acc} metalness={0.3} roughness={0.3} emissive={colors.acc} emissiveIntensity={0.4} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

