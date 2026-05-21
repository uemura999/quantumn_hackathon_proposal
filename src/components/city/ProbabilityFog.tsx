'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { AdditiveBlending } from 'three';
import type { Group } from 'three';
import type { CityProblem, RouteCandidate } from '@/engine/types';
import { DEPOT_INDEX } from '@/engine/tsp';

interface ProbabilityFogProps {
  readonly problem: CityProblem;
  readonly distribution: ReadonlyArray<RouteCandidate>;
  readonly pulsing: boolean;
}

interface RouteRender {
  readonly points: ReadonlyArray<[number, number, number]>;
  readonly opacity: number;
  readonly width: number;
  readonly color: string;
}

const MAX_ROUTES = 8;

export function ProbabilityFog({
  problem,
  distribution,
  pulsing,
}: ProbabilityFogProps) {
  const groupRef = useRef<Group>(null);

  const routes: ReadonlyArray<RouteRender> = useMemo(() => {
    const top = distribution.filter((c) => c.isValid).slice(0, MAX_ROUTES);
    if (top.length === 0) return [];

    const topProb = top[0]?.probability ?? 1;
    return top.map((c, idx) => {
      const points = c.order.map<[number, number, number]>((id) => {
        if (id === DEPOT_INDEX) return [problem.depot.x, 0.08, problem.depot.y];
        const point = problem.deliveries.find((d) => d.id === id);
        if (!point) return [0, 0.08, 0];
        return [point.x, 0.08, point.y];
      });
      const relative = c.probability / Math.max(topProb, 1e-6);
      const opacity = Math.min(0.85, Math.max(0.08, c.probability * 3));
      const width = idx === 0 ? 4 : Math.max(1.5, 2 * relative);
      const color = idx === 0 ? '#D97757' : '#F0A878';
      return { points, opacity, width, color };
    });
  }, [problem, distribution]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    if (pulsing) {
      const pulse = 0.85 + Math.sin(clock.getElapsedTime() * 3) * 0.15;
      group.scale.set(1, pulse, 1);
    } else {
      group.scale.set(1, 1, 1);
    }
  });

  if (routes.length === 0) return null;

  return (
    <group ref={groupRef}>
      {routes.map((r, i) => (
        <Line
          key={i}
          points={r.points}
          color={r.color}
          lineWidth={r.width}
          transparent
          opacity={r.opacity}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      ))}
    </group>
  );
}
