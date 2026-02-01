"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider, BallCollider } from "@react-three/rapier";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

// PMD Colors - Orange, White, Black
const BALL_COLORS = ["#ea7600", "#ffffff", "#212322"];

// Ball component with physics
function Ball({ position, color, radius }: { position: [number, number, number]; color: string; radius: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <RigidBody
      position={position}
      colliders="ball"
      restitution={0.7}
      friction={0.3}
      linearDamping={0.1}
      angularDamping={0.1}
    >
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
}

// Generate random balls
function Balls({ count = 30 }: { count?: number }) {
  const balls = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 10,
        Math.random() * 8 + 5,
        (Math.random() - 0.5) * 6,
      ] as [number, number, number],
      color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
      radius: Math.random() * 0.3 + 0.2,
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

// Stylized low-poly pine tree
function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      {/* Foliage layers */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.8, 1.5, 8]} />
        <meshStandardMaterial color="#1a472a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[0.6, 1.2, 8]} />
        <meshStandardMaterial color="#1e5631" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <coneGeometry args={[0.4, 1, 8]} />
        <meshStandardMaterial color="#228b22" roughness={0.8} />
      </mesh>
    </group>
  );
}

// The ONU Rock with Phi Mu Delta crest
function Rock() {
  const rockRef = useRef<THREE.Mesh>(null);
  
  // Create rock-like geometry using dodecahedron
  const rockGeometry = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(1.8, 1);
    // Deform vertices for more natural rock look
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      // Flatten bottom, keep top more varied
      const yScale = y < 0 ? 0.6 : 1;
      const noise = (Math.random() - 0.5) * 0.2;
      positions.setXYZ(
        i,
        x * (1.2 + noise),
        y * yScale * (0.9 + noise * 0.5),
        z * (0.7 + noise)
      );
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <RigidBody type="fixed" position={[0, 0.8, 0]}>
      <mesh ref={rockRef} geometry={rockGeometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.95} 
          metalness={0.05}
        />
      </mesh>
      
      {/* Crest placeholder - gold/yellow decal area */}
      <mesh position={[0, 0.3, 1.3]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshStandardMaterial 
          color="#f1d44b" 
          roughness={0.7}
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* 1926 - 2026 text area */}
      <mesh position={[0, -0.9, 1.35]}>
        <planeGeometry args={[1.8, 0.4]} />
        <meshStandardMaterial 
          color="#ea7600" 
          roughness={0.7}
        />
      </mesh>
    </RigidBody>
  );
}

// Ground plane (grass)
function Ground() {
  return (
    <RigidBody type="fixed" position={[0, -0.5, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#3d5c3d" roughness={0.9} />
      </mesh>
      <CuboidCollider args={[25, 0.1, 25]} />
    </RigidBody>
  );
}

// Invisible walls to contain balls
function Walls() {
  return (
    <>
      {/* Left wall */}
      <RigidBody type="fixed" position={[-8, 5, 0]}>
        <CuboidCollider args={[0.1, 10, 10]} />
      </RigidBody>
      {/* Right wall */}
      <RigidBody type="fixed" position={[8, 5, 0]}>
        <CuboidCollider args={[0.1, 10, 10]} />
      </RigidBody>
      {/* Back wall */}
      <RigidBody type="fixed" position={[0, 5, -5]}>
        <CuboidCollider args={[10, 10, 0.1]} />
      </RigidBody>
      {/* Front wall */}
      <RigidBody type="fixed" position={[0, 5, 8]}>
        <CuboidCollider args={[10, 10, 0.1]} />
      </RigidBody>
    </>
  );
}

// Sky gradient background
function Sky() {
  const { scene } = useThree();
  
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#87ceeb");
    gradient.addColorStop(0.4, "#b0d4e8");
    gradient.addColorStop(0.7, "#d4e5f0");
    gradient.addColorStop(1, "#e8f4f8");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    
    return () => {
      texture.dispose();
    };
  }, [scene]);
  
  return null;
}

// Main scene
function Scene() {
  return (
    <>
      <Sky />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight args={["#87ceeb", "#3d5c3d", 0.3]} />
      
      <Physics gravity={[0, -9.81, 0]}>
        <Ground />
        <Rock />
        <Walls />
        <Balls count={35} />
      </Physics>
      
      {/* Pine trees in background */}
      <PineTree position={[-5, 0, -3]} scale={1.5} />
      <PineTree position={[-3.5, 0, -4]} scale={1.8} />
      <PineTree position={[4, 0, -3.5]} scale={1.6} />
      <PineTree position={[5.5, 0, -2.5]} scale={1.4} />
      <PineTree position={[-6, 0, -1]} scale={1.2} />
      <PineTree position={[6, 0, -1.5]} scale={1.3} />
      <PineTree position={[0, 0, -5]} scale={2} />
      <PineTree position={[-2, 0, -4.5]} scale={1.7} />
      <PineTree position={[2.5, 0, -4]} scale={1.5} />
    </>
  );
}

// Exported component
export default function CentennialScene() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-sky-300 to-sky-100" />
    );
  }
  
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 8], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: false }}
    >
      <Scene />
    </Canvas>
  );
}
