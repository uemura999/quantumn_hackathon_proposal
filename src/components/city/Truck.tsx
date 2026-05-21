'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';
import type { Group } from 'three';
import type { CityProblem, RouteCandidate } from '@/engine/types';
import { DEPOT_INDEX } from '@/engine/tsp';

interface TruckProps {
  readonly problem: CityProblem;
  readonly route: RouteCandidate | null;
  readonly running: boolean;
  readonly onComplete?: () => void;
}

const SPEED_UNITS_PER_SECOND = 3;

export function Truck({ problem, route, running, onComplete }: TruckProps) {
  const groupRef = useRef<Group>(null);
  const progressRef = useRef(0);
  const completedRef = useRef(false);

  const curve = useMemo(() => {
    if (!route) return null;
    const positions = route.order.map((id) => {
      if (id === DEPOT_INDEX)
        return new Vector3(problem.depot.x, 0.25, problem.depot.y);
      const point = problem.deliveries.find((d) => d.id === id);
      if (!point) return new Vector3(0, 0.25, 0);
      return new Vector3(point.x, 0.25, point.y);
    });
    if (positions.length < 2) return null;
    return new CatmullRomCurve3(positions, false, 'catmullrom', 0.4);
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
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.85]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.45, -0.15]} castShadow>
        <boxGeometry args={[0.45, 0.3, 0.45]} />
        <meshStandardMaterial color="#D97757" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#FFE4B5"
          emissive="#FFE4B5"
          emissiveIntensity={1.2}
        />
      </mesh>
    </group>
  );
}
