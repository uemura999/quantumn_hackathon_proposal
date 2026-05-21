'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { CityProblem, Point2D } from '@/engine/types';

interface ManualRouteLineProps {
  readonly problem: CityProblem;
  readonly order: ReadonlyArray<number>;
}

const Y_OFFSET = 0.12;

export function ManualRouteLine({ problem, order }: ManualRouteLineProps) {
  const points = useMemo<ReadonlyArray<[number, number, number]>>(() => {
    if (order.length === 0) return [];
    const lookup = new Map<number, Point2D>(
      problem.deliveries.map((d) => [d.id, { x: d.x, y: d.y }]),
    );
    const pts: Array<[number, number, number]> = [];
    pts.push([problem.depot.x, Y_OFFSET, problem.depot.y]);
    for (const id of order) {
      const p = lookup.get(id);
      if (!p) continue;
      pts.push([p.x, Y_OFFSET, p.y]);
    }
    if (order.length === problem.deliveries.length) {
      pts.push([problem.depot.x, Y_OFFSET, problem.depot.y]);
    }
    return pts;
  }, [problem, order]);

  if (points.length < 2) return null;

  const isComplete = order.length === problem.deliveries.length;

  return (
    <Line
      points={points}
      color={isComplete ? '#3A4564' : '#D97757'}
      lineWidth={isComplete ? 4 : 3}
      transparent
      opacity={isComplete ? 0.9 : 0.75}
      dashed={!isComplete}
      dashScale={4}
      dashSize={0.4}
      gapSize={0.2}
    />
  );
}
