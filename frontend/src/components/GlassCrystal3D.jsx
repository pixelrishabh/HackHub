import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Neural Network Background Node Lines Component
function NeuralNetworkBackdrop() {
  const linesRef = useRef(null);

  // Generate 25 Neural Node Points
  const { positions, lineGeometry } = useMemo(() => {
    const pointsCount = 28;
    const points = [];
    for (let i = 0; i < pointsCount; i++) {
      const theta = (i / pointsCount) * Math.PI * 2;
      const radius = 3.5 + (Math.sin(i * 3) * 0.6);
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * radius,
          (Math.sin(i * 2.5) * 1.8),
          Math.sin(theta) * radius - 0.5
        )
      );
    }

    const linePositions = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].distanceTo(points[j]) < 2.8) {
          linePositions.push(points[i].x, points[i].y, points[i].z);
          linePositions.push(points[j].x, points[j].y, points[j].z);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    return { positions: points, lineGeometry: geometry };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (linesRef.current) {
      linesRef.current.rotation.y = time * 0.12;
      linesRef.current.rotation.z = Math.sin(time * 0.15) * 0.1;
    }
  });

  return (
    <group ref={linesRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#aeebff" transparent opacity={0.25} linewidth={1} />
      </lineSegments>
      {positions.map((pt, idx) => (
        <mesh key={idx} position={pt}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// Ultra-Smooth 3D AI Core Centerpiece Mesh Component
function AICoreMesh() {
  const meshRef = useRef(null);
  const innerSphereRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);

  // Mouse Parallax State
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse.current.targetX = x * 0.45;
      mouse.current.targetY = y * 0.45;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Smooth Mouse Parallax Lerp
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05;

    if (meshRef.current) {
      // Slow continuous rotation
      meshRef.current.rotation.x = time * 0.25 + mouse.current.y * 0.5;
      meshRef.current.rotation.y = time * 0.35 + mouse.current.x * 0.5;
      meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.15;

      // Breathing scale modulation
      const scale = 1 + Math.sin(time * 1.5) * 0.035;
      meshRef.current.scale.set(scale, scale, scale);
    }

    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.y = -time * 0.6;
      innerSphereRef.current.rotation.z = time * 0.3;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.3;
      ring1Ref.current.rotation.y = time * 0.2;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * 0.4;
      ring2Ref.current.rotation.z = time * 0.25;
    }
  });

  return (
    <group>
      {/* Neural Network Background Node Lines */}
      <NeuralNetworkBackdrop />

      {/* 1. Main High-Density Silky-Smooth Glass AI Knot Core */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <torusKnotGeometry args={[1.2, 0.36, 256, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={0.95}
          roughness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.05}
          ior={1.52}
          thickness={1.4}
          chromaticAberration={0.06}
          anisotropy={0.15}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.1}
          attenuationDistance={1.2}
          attenuationColor="#aeebff"
          color="#ffffff"
        />
      </mesh>

      {/* 2. Inner Glowing Core Orb */}
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.65, 64, 64]} />
        <meshStandardMaterial
          color="#d9f6ff"
          emissive="#aeebff"
          emissiveIntensity={1.2}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* 3. Orbiting Energy Rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.5, 0.015, 32, 128]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
        />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.9, 0.012, 32, 128]} />
        <meshStandardMaterial
          color="#aeebff"
          emissive="#aeebff"
          emissiveIntensity={1.0}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* 4. Ambient Sparkles Particle Field */}
      <Sparkles count={55} scale={6.5} size={2.5} speed={0.4} opacity={0.65} color="#d9f6ff" />
    </group>
  );
}

// Main GlassCrystal3D R3F Canvas Container
export function GlassCrystal3D() {
  return (
    <div className="relative w-full h-[450px] sm:h-[520px] lg:h-[600px] flex items-center justify-center">
      {/* Background Soft Glow Aura */}
      <div className="absolute w-80 h-80 sm:w-[450px] sm:h-[450px] bg-radial from-white/25 via-cyan-100/12 to-transparent rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute w-64 h-64 bg-cyan-100/20 rounded-full blur-2xl pointer-events-none" />

      {/* R3F Canvas */}
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#aeebff" />
        <pointLight position={[0, 0, 5]} intensity={1.2} color="#ffffff" />

        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2}>
            <AICoreMesh />
          </Float>
          <Environment preset="city" />
          <ContactShadows position={[0, -2.4, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
        </Suspense>
      </Canvas>
    </div>
  );
}

