import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Unique 3D Geometries per type
function Render3DObject({ type }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
  });

  if (type === 'quantum') {
    return (
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 3]} />
        <MeshTransmissionMaterial
          transmission={0.92}
          roughness={0.08}
          ior={1.5}
          thickness={1.2}
          chromaticAberration={0.08}
          attenuationColor="#aeebff"
          color="#ffffff"
        />
      </mesh>
    );
  }

  if (type === 'neural') {
    return (
      <group ref={meshRef}>
        <mesh>
          <sphereGeometry args={[1.4, 64, 64]} />
          <meshStandardMaterial color="#d9f6ff" emissive="#aeebff" emissiveIntensity={0.6} wireframe transparent opacity={0.5} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.0, 0.02, 16, 100]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
      </group>
    );
  }

  if (type === 'prism') {
    return (
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.6, 0]} />
        <MeshTransmissionMaterial
          transmission={0.95}
          roughness={0.05}
          ior={1.55}
          thickness={1.5}
          chromaticAberration={0.1}
          attenuationColor="#aeebff"
          color="#ffffff"
        />
      </mesh>
    );
  }

  if (type === 'matrix') {
    return (
      <group ref={meshRef}>
        <mesh>
          <boxGeometry args={[1.6, 1.6, 1.6]} />
          <meshStandardMaterial color="#aeebff" emissive="#000000" wireframe transparent opacity={0.6} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.7} />
        </mesh>
      </group>
    );
  }

  if (type === 'shield') {
    return (
      <group ref={meshRef}>
        <mesh>
          <cylinderGeometry args={[1.6, 1.6, 0.3, 32]} />
          <MeshTransmissionMaterial transmission={0.9} roughness={0.1} ior={1.4} thickness={1.0} attenuationColor="#aeebff" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.02, 16, 64]} />
          <meshStandardMaterial color="#aeebff" emissive="#aeebff" emissiveIntensity={0.9} />
        </mesh>
      </group>
    );
  }

  if (type === 'pulsar') {
    return (
      <group ref={meshRef}>
        <mesh>
          <torusGeometry args={[1.4, 0.15, 32, 64]} />
          <MeshTransmissionMaterial transmission={0.92} roughness={0.08} ior={1.5} thickness={1.2} attenuationColor="#aeebff" />
        </mesh>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.1, 0.02, 16, 64]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
      </group>
    );
  }

  // Default: Orb Core
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 64, 64]} />
      <MeshTransmissionMaterial
        transmission={0.95}
        roughness={0.05}
        ior={1.52}
        thickness={1.4}
        chromaticAberration={0.05}
        attenuationColor="#aeebff"
        color="#ffffff"
      />
    </mesh>
  );
}

export function Page3DCanvas({ type = 'orb', className = '' }) {
  return (
    <div className={`relative w-full h-[320px] sm:h-[400px] flex items-center justify-center pointer-events-none ${className}`}>
      <div className="absolute w-64 h-64 bg-radial from-white/15 via-cyan-100/10 to-transparent rounded-full blur-3xl" />
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[-5, -5, -2]} intensity={1.5} color="#aeebff" />
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.6} floatIntensity={1.0}>
            <Render3DObject type={type} />
          </Float>
          <Environment preset="city" />
          <Sparkles count={30} scale={5} size={2} speed={0.4} opacity={0.5} color="#d9f6ff" />
        </Suspense>
      </Canvas>
    </div>
  );
}
