'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import {
  HighlightedRouteLine,
  ROUTE_HIGHLIGHT_Y,
} from './HighlightedRouteLine';
import { polylineForRoute } from '@/engine/city-layout';
import type { CityProblem } from '@/engine/types';

interface ManualRouteLineProps {
  readonly problem: CityProblem;
  readonly order: ReadonlyArray<number>;
}

const Y_OFFSET = ROUTE_HIGHLIGHT_Y;

export function ManualRouteLine({ problem, order }: ManualRouteLineProps) {
  const points = useMemo<ReadonlyArray<[number, number, number]>>(() => {
    if (order.length === 0) return [];
    const deliveryNodeById = new Map(
      problem.deliveries.map((d) => [d.id, d.nodeId]),
    );
    const nodeSequence: string[] = [problem.layout.depotNodeId];
    for (const id of order) {
      const nodeId = deliveryNodeById.get(id);
      if (!nodeId) continue;
      nodeSequence.push(nodeId);
    }
    if (order.length === problem.deliveries.length) {
      nodeSequence.push(problem.layout.depotNodeId);
    }
    const polyline = polylineForRoute(
      problem.layout,
      problem.shortestPaths,
      nodeSequence,
    );
    return polyline.points.map<[number, number, number]>((p) => [
      p.x,
      Y_OFFSET,
      p.y,
    ]);
  }, [problem, order]);

  if (points.length < 2) return null;

  const isComplete = order.length === problem.deliveries.length;

  if (isComplete) {
    return (
      <HighlightedRouteLine
        points={points}
        lineWidth={5.5}
        haloWidth={10}
        renderOrder={34}
      />
    );
  }

  return (
    <Line
      points={points}
      color="#D97757"
      lineWidth={3.5}
      transparent
      opacity={0.85}
      dashed
      dashScale={3}
      dashSize={0.5}
      gapSize={0.25}
      depthTest={false}
      depthWrite={false}
      renderOrder={24}
    />
  );
}
