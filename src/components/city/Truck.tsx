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
  readonly onComplete?: () => void;
}

const SPEED_UNITS_PER_SECOND = 4.5;

export function Truck({ problem, route, running, onComplete }: TruckProps) {
  const groupRef = useRef<Group>(null);
  const progressRef = useRef(0);
  const completedRef = useRef(false);

  const curve = useMemo(() => {
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
    return new CatmullRomCurve3(positions, false, 'catmullrom', 0.18);
  }, [problem, route]);

  const totalLength = useMemo(() => {
    if (!curve) return 0;
    return curve.getLength();
  }, [curve]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group || !curve || totalLength === 0) return;

    if (running) {
      completedRef.current = false;
      progressRef.current += (delta * SPEED_UNITS_PER_SECOND) / totalLength;
    } else {
      progressRef.current = 0;
    }

    if (progressRef.current >= 1) {
      progressRef.current = 1;
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    }

    const t = progressRef.current;
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    group.position.copy(pos);
    const targetAngle = Math.atan2(tangent.x, tangent.z);
    group.rotation.y = targetAngle;
  });

  if (!curve) return null;

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
