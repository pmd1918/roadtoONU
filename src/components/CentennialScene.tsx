"use client";

import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

// PMD Colors - Orange, White, Black
const BALL_COLORS = ["#ea7600", "#ffffff", "#212322"];

// Ball component with physics
function Ball({ position, color, radius }: { position: [number, number, number]; color: string; radius: number }) {
  return (
    <RigidBody
      position={position}
      colliders="ball"
      restitution={0.7}
      friction={0.3}
      linearDamping={0.1}
      angularDamping={0.1}
    >
      <mesh castShadow>
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
        (Math.random() - 0.5) * 12,
        Math.random() * 8 + 5,
        (Math.random() - 0.5) * 8,
      ] as [number, number, number],
      color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
      radius: Math.random() * 0.25 + 0.15,
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
  const crestTexture = useLoader(THREE.TextureLoader, "/pmd-crest.jpg");
  
  // Create rock-like geometry
  const rockGeometry = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(2, 1);
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const yScale = y < 0 ? 0.5 : 1;
      const noise = (Math.random() - 0.5) * 0.15;
      positions.setXYZ(
        i,
        x * (1.3 + noise),
        y * yScale * (0.85 + noise * 0.5),
        z * (0.65 + noise)
      );
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Configure crest texture
  useEffect(() => {
    if (crestTexture) {
      crestTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [crestTexture]);

  return (
    <RigidBody type="fixed" position={[0, 1, 0]} colliders="hull">
      {/* Main rock body */}
      <mesh geometry={rockGeometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.95} 
          metalness={0.02}
        />
      </mesh>
      
      {/* Phi Mu Delta Crest - painted on rock */}
      <mesh position={[0, 0.4, 1.35]} rotation={[0, 0, 0]}>
        <planeGeometry args={[1.2, 1.5]} />
        <meshStandardMaterial 
          map={crestTexture}
          transparent
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      
      {/* 1926 - 2026 text as simple plane with color */}
      <mesh position={[0, -0.7, 1.4]}>
        <planeGeometry args={[1.6, 0.35]} />
        <meshStandardMaterial color="#ea7600" roughness={0.8} />
      </mesh>
    </RigidBody>
  );
}

// Ground plane (grass)
function Ground() {
  return (
    <RigidBody type="fixed" position={[0, -0.5, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#4a7c4a" roughness={0.9} />
      </mesh>
      <CuboidCollider args={[30, 0.1, 30]} />
    </RigidBody>
  );
}

// Invisible walls to contain balls
function Walls() {
  return (
    <>
      <RigidBody type="fixed" position={[-10, 5, 0]}>
        <CuboidCollider args={[0.1, 12, 12]} />
      </RigidBody>
      <RigidBody type="fixed" position={[10, 5, 0]}>
        <CuboidCollider args={[0.1, 12, 12]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 5, -6]}>
        <CuboidCollider args={[12, 12, 0.1]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 5, 10]}>
        <CuboidCollider args={[12, 12, 0.1]} />
      </RigidBody>
      <RigidBody type="fixed" position={[0, 15, 0]}>
        <CuboidCollider args={[12, 0.1, 12]} />
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
    gradient.addColorStop(0, "#5b9bd5");
    gradient.addColorStop(0.3, "#87ceeb");
    gradient.addColorStop(0.6, "#b8d4e8");
    gradient.addColorStop(1, "#d4e8f0");
    
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

// Main scene content
function SceneContent() {
  return (
    <>
      <Sky />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 12, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight args={["#87ceeb", "#4a7c4a", 0.4]} />
      
      <Physics gravity={[0, -9.81, 0]}>
        <Ground />
        <Suspense fallback={null}>
          <Rock />
        </Suspense>
        <Walls />
        <Balls count={35} />
      </Physics>
      
      {/* Pine trees arranged like in the photo */}
      <PineTree position={[-6, 0, -2]} scale={1.8} />
      <PineTree position={[-4.5, 0, -3.5]} scale={2.2} />
      <PineTree position={[-3, 0, -2.5]} scale={1.6} />
      <PineTree position={[3, 0, -3]} scale={2} />
      <PineTree position={[5, 0, -2]} scale={1.9} />
      <PineTree position={[6.5, 0, -3.5]} scale={2.3} />
      <PineTree position={[-7, 0, -4]} scale={2.5} />
      <PineTree position={[7, 0, -4]} scale={2.4} />
      <PineTree position={[0, 0, -5]} scale={2.6} />
      <PineTree position={[-2, 0, -4.5]} scale={2.1} />
      <PineTree position={[2, 0, -4]} scale={1.9} />
    </>
  );
}

// Exported component
export default function CentennialScene() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-sky-400 to-green-200" />
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-sky-400 to-green-200 flex items-center justify-center">
        <p className="text-red-600">Error loading 3D scene: {error}</p>
      </div>
    );
  }
  
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2.5, 9], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor("#87ceeb");
      }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
