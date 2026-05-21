'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { CityGrid } from './CityGrid';
import { CityLabels } from './CityLabels';
import { DeliveryPins } from './DeliveryPins';
import { ManualRouteLine } from './ManualRouteLine';
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
  readonly showLabels?: boolean;
  readonly visitedIds?: ReadonlySet<number>;
  readonly nextPickId?: number | null;
  readonly onPinClick?: (deliveryId: number) => void;
  readonly manualRouteOrder?: ReadonlyArray<number>;
}

export function CityScene({
  problem,
  distribution,
  truckRoute,
  truckRunning,
  pulsing,
  onTruckComplete,
  showLabels = false,
  visitedIds,
  nextPickId,
  onPinClick,
  manualRouteOrder,
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
        <DeliveryPins
          problem={problem}
          visitedIds={visitedIds}
          nextPickId={nextPickId}
          onPinClick={onPinClick}
        />
        {showLabels && (
          <CityLabels
            problem={problem}
            highlightedIds={visitedIds}
            nextPickId={nextPickId ?? null}
          />
        )}
        <ProbabilityFog
          problem={problem}
          distribution={distribution}
          pulsing={pulsing}
        />
        {manualRouteOrder && manualRouteOrder.length > 0 && (
          <ManualRouteLine problem={problem} order={manualRouteOrder} />
        )}
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
