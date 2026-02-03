'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

extend({ MeshLineGeometry, MeshLineMaterial });

// Badge file paths - ordered 6-4-2-1-3-5-7 for V-shape arrangement
const BADGE_PATHS = [
  '/lanyard/card6.glb',  // Far left
  '/lanyard/card4.glb',
  '/lanyard/card2.glb',
  '/lanyard/card1.glb',  // Center
  '/lanyard/card3.glb',
  '/lanyard/card5.glb',
  '/lanyard/card7.glb',  // Far right
];

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
}

export default function Lanyard({
  position = [0, 0, 50],
  gravity = [0, -40, 0],
  fov = 25,
  transparent = true
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show fewer badges on mobile for performance
  const badgeCount = isMobile ? 4 : 7;

  return (
    <div className="relative z-0 w-full h-full">
      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          {BADGE_PATHS.slice(0, badgeCount).map((path, index) => (
            <Badge 
              key={path} 
              modelPath={path} 
              index={index} 
              total={badgeCount}
              isMobile={isMobile} 
            />
          ))}
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BadgeProps {
  modelPath: string;
  index: number;
  total: number;
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
}

function Badge({ modelPath, index, total, maxSpeed = 50, minSpeed = 0, isMobile = false }: BadgeProps) {
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = {
    type: 'dynamic' as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4
  };

  // Load this badge's model
  const { nodes, materials } = useGLTF(modelPath) as any;

  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  // Calculate horizontal offset to spread badges across
  const spacing = isMobile ? 3.5 : 3;
  const xOffset = (index - (total - 1) / 2) * spacing;
  
  // Distance from center (0 = center, 3 = far edge)
  const distanceFromCenter = Math.abs(index - (total - 1) / 2);
  
  // Stagger vertical positions slightly for visual interest
  const yOffset = Math.sin(index * 0.8) * 0.3;
  
  // V-shape: outer badges pushed back (positive Z), center forward
  // Creates a V when viewed from above
  const zOffset = distanceFromCenter * 1.2;
  
  // Fan angle: outer badges rotate outward on Y-axis
  // Left side (index < center) rotates positive, right side rotates negative
  const centerIndex = (total - 1) / 2;
  const fanAngle = (index - centerIndex) * 0.15; // ~8.5 degrees per step

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) {
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        }
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  return (
    <group position={[xOffset, 4 + yOffset, zOffset]} rotation={[0, fanAngle, 0]}>
      <RigidBody ref={fixed} {...segmentProps} type="fixed" />
      <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody
        position={[2, 0, 0]}
        ref={card}
        {...segmentProps}
        type={dragged ? 'kinematicPosition' : 'dynamic'}
      >
        <CuboidCollider args={[0.8, 1.125, 0.01]} />
        <group
          scale={2.25}
          position={[0, -1.2, -0.05]}
          rotation={[Math.PI / 2, 0, 0]}
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}
          onPointerUp={(e: any) => {
            e.target.releasePointerCapture(e.pointerId);
            drag(false);
          }}
          onPointerDown={(e: any) => {
            e.target.setPointerCapture(e.pointerId);
            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
          }}
        >
          {/* Badge card - render with all embedded materials */}
          <primitive object={nodes.card.clone()} />
          <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
          <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
        </group>
      </RigidBody>
    </group>
  );
}

// Preload all badge models
BADGE_PATHS.forEach(path => useGLTF.preload(path));
