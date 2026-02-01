"use client";

import { Canvas, useThree, useLoader, useFrame } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

// PMD Colors - Orange, White, Black
const BALL_COLORS = ["#ea7600", "#ffffff", "#1a1a1a"];

// Ball component with physics
function Ball({ position, color, radius }: { position: [number, number, number]; color: string; radius: number }) {
  return (
    <RigidBody
      position={position}
      colliders="ball"
      restitution={0.8}
      friction={0.2}
      linearDamping={0.05}
      angularDamping={0.05}
    >
      <mesh castShadow>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
}

// Generate balls that start high and fall
function Balls({ count = 25 }: { count?: number }) {
  const balls = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 6,
        Math.random() * 4 + 3, // Start higher
        (Math.random() - 0.5) * 4,
      ] as [number, number, number],
      color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
      radius: Math.random() * 0.15 + 0.08,
    }));
  }, [count]);

  return (
    <>
      {balls.map((ball) => (
        <Ball key={ball.id} position={ball.position} color={ball.color} radius={ball.radius} />
      ))}
    </>
  );
}

// Smaller, better positioned pine trees
function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale * 0.4}>
      {/* Trunk */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.6, 6]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      {/* Foliage layers */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <coneGeometry args={[0.5, 1, 6]} />
        <meshStandardMaterial color="#1a472a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <coneGeometry args={[0.4, 0.8, 6]} />
        <meshStandardMaterial color="#1e5631" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[0.25, 0.6, 6]} />
        <meshStandardMaterial color="#228b22" roughness={0.8} />
      </mesh>
    </group>
  );
}

// The ONU Rock with Phi Mu Delta crest - CENTERED and VISIBLE
function Rock() {
  const crestTexture = useLoader(THREE.TextureLoader, "/pmd-crest.jpg");
  
  useEffect(() => {
    if (crestTexture) {
      crestTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [crestTexture]);

  return (
    <RigidBody type="fixed" position={[0, 0.5, 0]} colliders="cuboid">
      {/* Main rock body - simple box for now */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.8, 0.8]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          roughness={0.95} 
          metalness={0.02}
        />
      </mesh>
      
      {/* Phi Mu Delta Crest on front */}
      <mesh position={[0, 0.15, 0.41]}>
        <planeGeometry args={[0.9, 1.1]} />
        <meshStandardMaterial 
          map={crestTexture}
          roughness={0.7}
        />
      </mesh>
      
      {/* 1926 - 2026 orange bar below crest */}
      <mesh position={[0, -0.6, 0.41]}>
        <planeGeometry args={[1.2, 0.25]} />
        <meshStandardMaterial color="#ea7600" roughness={0.7} />
      </mesh>
    </RigidBody>
  );
}

// Ground plane (grass)
function Ground() {
  return (
    <RigidBody type="fixed" position={[0, -0.4, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#3d6b3d" roughness={0.9} />
      </mesh>
      <CuboidCollider args={[15, 0.1, 15]} />
    </RigidBody>
  );
}

// Invisible walls to contain balls - smaller area
function Walls() {
  return (
    <>
      {/* Left */}
      <RigidBody type="fixed" position={[-4, 2, 0]}>
        <CuboidCollider args={[0.1, 5, 5]} />
      </RigidBody>
      {/* Right */}
      <RigidBody type="fixed" position={[4, 2, 0]}>
        <CuboidCollider args={[0.1, 5, 5]} />
      </RigidBody>
      {/* Back */}
      <RigidBody type="fixed" position={[0, 2, -3]}>
        <CuboidCollider args={[5, 5, 0.1]} />
      </RigidBody>
      {/* Front */}
      <RigidBody type="fixed" position={[0, 2, 4]}>
        <CuboidCollider args={[5, 5, 0.1]} />
      </RigidBody>
      {/* Ceiling */}
      <RigidBody type="fixed" position={[0, 6, 0]}>
        <CuboidCollider args={[5, 0.1, 5]} />
      </RigidBody>
    </>
  );
}

// Sky background
function Sky() {
  const { scene } = useThree();
  
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#87ceeb");
    gradient.addColorStop(0.5, "#b8d8eb");
    gradient.addColorStop(1, "#e0eef5");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
    
    return () => texture.dispose();
  }, [scene]);
  
  return null;
}

// Main scene
function SceneContent() {
  return (
    <>
      <Sky />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={["#87ceeb", "#3d6b3d", 0.3]} />
      
      <Physics gravity={[0, -9.81, 0]}>
        <Ground />
        <Suspense fallback={null}>
          <Rock />
        </Suspense>
        <Walls />
        <Balls count={30} />
      </Physics>
      
      {/* Pine trees - smaller, in background */}
      <PineTree position={[-3, 0, -1.5]} scale={2} />
      <PineTree position={[-2.2, 0, -2]} scale={2.5} />
      <PineTree position={[-1.2, 0, -1.8]} scale={1.8} />
      <PineTree position={[1.2, 0, -1.8]} scale={2} />
      <PineTree position={[2.2, 0, -2]} scale={2.3} />
      <PineTree position={[3, 0, -1.5]} scale={1.9} />
      
      {/* Far background trees */}
      <PineTree position={[-2.5, 0, -2.5]} scale={3} />
      <PineTree position={[0, 0, -2.8]} scale={3.2} />
      <PineTree position={[2.5, 0, -2.5]} scale={2.8} />
    </>
  );
}

// Main component
export default function CentennialScene() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div className="w-full h-full bg-gradient-to-b from-sky-300 to-green-300" />;
  }
  
  return (
    <Canvas
      shadows
      camera={{ 
        position: [0, 1.5, 4],  // Closer, centered on rock
        fov: 50 
      }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
