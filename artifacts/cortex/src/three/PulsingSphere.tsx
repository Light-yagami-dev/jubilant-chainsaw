import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import WebGLErrorBoundary from "./ErrorBoundary";
import * as THREE from "three";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function SphereMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<any>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.6;
      meshRef.current.rotation.z = t * 0.3;
      const pulse = 1 + Math.sin(t * 2.5) * 0.08;
      meshRef.current.scale.setScalar(pulse);
    }
    if (matRef.current) {
      matRef.current.distort = 0.35 + Math.sin(t * 1.8) * 0.15;
      matRef.current.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        ref={matRef}
        color="#3b82f6"
        emissive="#1d4ed8"
        emissiveIntensity={0.6}
        roughness={0.1}
        metalness={0.6}
        distort={0.4}
        speed={2}
      />
    </mesh>
  );
}

function ParticleRing() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.5;
      groupRef.current.rotation.x = clock.elapsedTime * 0.2;
    }
  });

  const count = 24;
  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const r = 1.7;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1} />
          </mesh>
        );
      })}
    </group>
  );
}

function CSSPulse() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700"
        style={{ boxShadow: "0 0 40px rgba(59,130,246,0.6)" }}
      />
    </div>
  );
}

export default function PulsingSphere() {
  const webgl = useMemo(() => supportsWebGL(), []);

  if (!webgl) return <CSSPulse />;

  return (
    <WebGLErrorBoundary fallback={<CSSPulse />}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#3b82f6" />
        <pointLight position={[-3, -3, -3]} intensity={1} color="#8b5cf6" />
        <Suspense fallback={null}>
          <SphereMesh />
          <ParticleRing />
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  );
}
