'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';
import type { Group } from 'three';
import type { CityProblem, RouteCandidate } from '@/engine/types';
import { DEPOT_INDEX } from '@/engine/tsp';
import { polylineForRoute } from '@/engine/city-layout';

interface TruckProps {
  readonly problem: CityProblem;
  readonly route: RouteCandidate | null;
  readonly running: boolean;
  readonly onProgress?: (progress: TruckJourneyProgress) => void;
  readonly onComplete?: () => void;
}

export interface TruckJourneyProgress {
  readonly fraction: number;
  readonly completedDeliveries: number;
}

interface TruckJourney {
  readonly curve: CatmullRomCurve3;
  readonly deliveryArrivalFractions: ReadonlyArray<number>;
}

const SPEED_UNITS_PER_SECOND = 4.5;

export function Truck({
  problem,
  route,
  running,
  onProgress,
  onComplete,
}: TruckProps) {
  const groupRef = useRef<Group>(null);
  const progressRef = useRef(0);
  const completedRef = useRef(false);
  const reportedProgressRef = useRef('');

  const journey = useMemo<TruckJourney | null>(() => {
    if (!route) return null;
    const deliveryNodeById = new Map(
      problem.deliveries.map((d) => [d.id, d.nodeId]),
    );
    const nodeSeq: string[] = [];
    for (const id of route.order) {
      nodeSeq.push(
        id === DEPOT_INDEX
          ? problem.layout.depotNodeId
          : deliveryNodeById.get(id) ?? problem.layout.depotNodeId,
      );
    }
    const polyline = polylineForRoute(
      problem.layout,
      problem.shortestPaths,
      nodeSeq,
    );
    if (polyline.points.length < 2) return null;
    const positions = polyline.points.map(
      (p) => new Vector3(p.x, 0.28, p.y),
    );
    const curve = new CatmullRomCurve3(positions, false, 'catmullrom', 0.18);
    const arcLengths = curve.getLengths(Math.max(400, positions.length * 32));
    let arrivalPointIndex = 0;
    const deliveryArrivalFractions: number[] = [];
    for (let i = 1; i < nodeSeq.length; i++) {
      const leg = polylineForRoute(
        problem.layout,
        problem.shortestPaths,
        [nodeSeq[i - 1], nodeSeq[i]],
      );
      arrivalPointIndex += Math.max(0, leg.points.length - 1);
      if (route.order[i] !== DEPOT_INDEX) {
        deliveryArrivalFractions.push(
          arcFractionAtControlPoint(
            arrivalPointIndex,
            positions.length,
            arcLengths,
          ),
        );
      }
    }

    return { curve, deliveryArrivalFractions };
  }, [problem, route]);

  const totalLength = useMemo(() => {
    if (!journey) return 0;
    return journey.curve.getLength();
  }, [journey]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || !journey || totalLength === 0) return;

    if (running) {
      progressRef.current += (delta * SPEED_UNITS_PER_SECOND) / totalLength;
    } else {
      progressRef.current = 0;
      completedRef.current = false;
      reportedProgressRef.current = '';
    }

    if (progressRef.current >= 1) {
      progressRef.current = 1;
    }

    const t = progressRef.current;
    if (running) {
      const completedDeliveries = journey.deliveryArrivalFractions.filter(
        (arrival) => arrival <= t,
      ).length;
      const visiblePercentage = Math.floor(t * 100);
      const reportKey = `${visiblePercentage}:${completedDeliveries}`;
      if (reportedProgressRef.current !== reportKey) {
        reportedProgressRef.current = reportKey;
        onProgress?.({
          fraction: visiblePercentage / 100,
          completedDeliveries,
        });
      }
    }

    if (progressRef.current >= 1) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    }

    const pos = journey.curve.getPointAt(t);
    const tangent = journey.curve.getTangentAt(t);
    group.position.copy(pos);
    const targetAngle = Math.atan2(tangent.x, tangent.z);
    group.rotation.y = targetAngle;
  });

  if (!journey) return null;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.55, 0.4, 0.95]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.5, -0.2]} castShadow>
        <boxGeometry args={[0.5, 0.32, 0.5]} />
        <meshStandardMaterial color="#D97757" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.6, 0.4]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial
          color="#FFE4B5"
          emissive="#FFE4B5"
          emissiveIntensity={1.4}
        />
      </mesh>
    </group>
  );
}

function arcFractionAtControlPoint(
  pointIndex: number,
  pointCount: number,
  arcLengths: ReadonlyArray<number>,
): number {
  const targetT = pointIndex / (pointCount - 1);
  const divisions = arcLengths.length - 1;
  const scaledIndex = targetT * divisions;
  const beforeIndex = Math.floor(scaledIndex);
  const afterIndex = Math.min(divisions, Math.ceil(scaledIndex));
  const interpolation = scaledIndex - beforeIndex;
  const distance =
    arcLengths[beforeIndex] +
    (arcLengths[afterIndex] - arcLengths[beforeIndex]) * interpolation;
  return distance / arcLengths[divisions];
}
