'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { CityGrid } from './CityGrid';
import { CityLabels } from './CityLabels';
import { DeliveryPins } from './DeliveryPins';
import { ManualRouteLine } from './ManualRouteLine';
import { ProbabilityFog } from './ProbabilityFog';
import type { CandidateVisibility } from './ProbabilityFog';
import { RoadNetwork } from './RoadNetwork';
import { Truck } from './Truck';
import type { TruckJourneyProgress } from './Truck';
import type { CityProblem, RouteCandidate } from '@/engine/types';

interface CitySceneProps {
  readonly problem: CityProblem;
  readonly distribution: ReadonlyArray<RouteCandidate>;
  readonly truckRoute: RouteCandidate | null;
  readonly selectedRoute?: RouteCandidate | null;
  readonly truckRunning: boolean;
  readonly pulsing: boolean;
  readonly onTruckProgress?: (progress: TruckJourneyProgress) => void;
  readonly onTruckComplete?: () => void;
  readonly showLabels?: boolean;
  readonly showTraffic?: boolean;
  readonly visitedIds?: ReadonlySet<number>;
  readonly nextPickId?: number | null;
  readonly nextLabelSuffix?: string;
  readonly onPinClick?: (deliveryId: number) => void;
  readonly manualRouteOrder?: ReadonlyArray<number>;
  readonly candidateVisibility?: CandidateVisibility;
}

export function CityScene({
  problem,
  distribution,
  truckRoute,
  selectedRoute,
  truckRunning,
  pulsing,
  onTruckProgress,
  onTruckComplete,
  showLabels = false,
  showTraffic = true,
  visitedIds,
  nextPickId,
  nextLabelSuffix,
  onPinClick,
  manualRouteOrder,
  candidateVisibility = 'show',
}: CitySceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 20, 22], fov: 38 }}
      dpr={[1, 2]}
      shadows="percentage"
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent', borderRadius: '0.75rem' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[8, 14, 6]}
          intensity={1.1}
          color="#FFE9D0"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <hemisphereLight intensity={0.25} groundColor="#3A4564" />

        <CityGrid
          buildings={problem.layout.buildings}
          bounds={problem.layout.bounds}
        />
        <RoadNetwork
          graph={problem.layout.graph}
          showTraffic={showTraffic}
        />
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
            nextLabelSuffix={nextLabelSuffix}
          />
        )}
        <ProbabilityFog
          problem={problem}
          distribution={distribution}
          selectedRoute={selectedRoute ?? truckRoute}
          pulsing={pulsing}
          candidateVisibility={candidateVisibility}
        />
        {manualRouteOrder && manualRouteOrder.length > 0 && (
          <ManualRouteLine problem={problem} order={manualRouteOrder} />
        )}
        <Truck
          problem={problem}
          route={truckRoute}
          running={truckRunning}
          onProgress={onTruckProgress}
          onComplete={onTruckComplete}
        />

        <OrbitControls
          enablePan={false}
          minPolarAngle={0.35}
          maxPolarAngle={1.15}
          minDistance={14}
          maxDistance={34}
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  );
}
