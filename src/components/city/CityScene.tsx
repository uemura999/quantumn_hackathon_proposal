'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { CityGrid } from './CityGrid';
import { DeliveryPins } from './DeliveryPins';
import { ProbabilityFog } from './ProbabilityFog';
import { Truck } from './Truck';
import type { CityProblem, RouteCandidate } from '@/engine/types';

interface CitySceneProps {
  readonly problem: CityProblem;
  readonly distribution: ReadonlyArray<RouteCandidate>;
  readonly truckRoute: RouteCandidate | null;
  readonly truckRunning: boolean;
  readonly pulsing: boolean;
  readonly onTruckComplete?: () => void;
}

export function CityScene({
  problem,
  distribution,
  truckRoute,
  truckRunning,
  pulsing,
  onTruckComplete,
}: CitySceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 12, 14], fov: 35 }}
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent', borderRadius: '0.75rem' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[6, 12, 4]}
          intensity={1.1}
          color="#FFE9D0"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <hemisphereLight intensity={0.25} groundColor="#3A4564" />

        <CityGrid />
        <DeliveryPins problem={problem} />
        <ProbabilityFog
          problem={problem}
          distribution={distribution}
          pulsing={pulsing}
        />
        <Truck
          problem={problem}
          route={truckRoute}
          running={truckRunning}
          onComplete={onTruckComplete}
        />

        <OrbitControls
          enablePan={false}
          minPolarAngle={0.4}
          maxPolarAngle={1.1}
          minDistance={10}
          maxDistance={22}
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  );
}
