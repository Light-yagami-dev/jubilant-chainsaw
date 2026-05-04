import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Text, Line } from "@react-three/drei";
import { motion } from "framer-motion";
import WebGLErrorBoundary from "./ErrorBoundary";
import * as THREE from "three";

type Role = "student" | "educator" | "parent";

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

const NODES: { role: Role; label: string; emoji: string; pos: [number, number, number]; color: string }[] = [
  { role: "student",  label: "Student",  emoji: "🎓", pos: [-2, 0, 0],  color: "#3b82f6" },
  { role: "educator", label: "Educator", emoji: "📚", pos: [0, 1.4, 0], color: "#8b5cf6" },
  { role: "parent",   label: "Parent",   emoji: "👨‍👩‍👧", pos: [2, 0, 0],   color: "#10b981" },
];

function ConnectionLine({ from, to }: { from: [number,number,number]; to: [number,number,number] }) {
  return (
    <Line
      points={[from, to]}
      color="#1e2d45"
      transparent
      opacity={0.6}
      lineWidth={1}
    />
  );
}

function RoleNode({
  node, selected, hovered, onSelect, onHover,
}: {
  node: typeof NODES[0];
  selected: boolean;
  hovered: boolean;
  onSelect: (r: Role) => void;
  onHover: (r: Role | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const active = selected || hovered;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.elapsedTime;
      meshRef.current.position.y = node.pos[1] + Math.sin(t * 1.2 + node.pos[0]) * 0.12;
      const s = active ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={node.pos}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(node.role); }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(node.role); }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={active ? 0.7 : 0.2}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      <Text
        position={[node.pos[0], node.pos[1] - 0.85, node.pos[2]]}
        fontSize={0.22}
        color={active ? "#e2eaf6" : "#4a6480"}
        anchorX="center"
        anchorY="middle"
      >
        {node.label}
      </Text>
      {selected && (
        <mesh position={node.pos}>
          <ringGeometry args={[0.65, 0.72, 32]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Scene({ onSelect, selected }: { onSelect: (r: Role) => void; selected: Role | null }) {
  const [hovered, setHovered] = useState<Role | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#3b82f6" />
      <pointLight position={[0, -3, -3]} intensity={1} color="#8b5cf6" />
      {NODES.map((a, i) =>
        NODES.slice(i + 1).map((b) => (
          <ConnectionLine key={`${a.role}-${b.role}`} from={a.pos} to={b.pos} />
        ))
      )}
      {NODES.map((node) => (
        <RoleNode
          key={node.role}
          node={node}
          selected={selected === node.role}
          hovered={hovered === node.role}
          onSelect={onSelect}
          onHover={setHovered}
        />
      ))}
    </group>
  );
}

function CSSFallback({ onSelect, selected }: { onSelect: (r: Role) => void; selected: Role | null }) {
  return (
    <div className="flex justify-center items-center gap-6 h-full">
      {NODES.map((node) => (
        <motion.button
          key={node.role}
          onClick={() => onSelect(node.role)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex flex-col items-center gap-2 p-5 rounded-xl border transition-all ${
            selected === node.role
              ? "border-blue-500 bg-blue-500/15"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
          style={selected === node.role ? { boxShadow: "0 0 20px rgba(59,130,246,0.4)" } : undefined}
        >
          <span className="text-3xl">{node.emoji}</span>
          <span className="text-sm font-mono text-[hsl(var(--text))]">{node.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

interface Props {
  onSelect: (role: Role) => void;
  selected: Role | null;
}

export default function IsoNodeCluster({ onSelect, selected }: Props) {
  const webgl = useMemo(() => supportsWebGL(), []);

  if (!webgl) return <CSSFallback onSelect={onSelect} selected={selected} />;

  return (
    <WebGLErrorBoundary fallback={<CSSFallback onSelect={onSelect} selected={selected} />}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Suspense fallback={null}>
          <Scene onSelect={onSelect} selected={selected} />
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  );
}
