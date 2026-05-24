'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { AdditiveBlending } from 'three';
import type { Group } from 'three';
import {
  HighlightedRouteLine,
  ROUTE_HIGHLIGHT_COLOR,
  ROUTE_HIGHLIGHT_Y,
} from './HighlightedRouteLine';
import type { CityProblem, RouteCandidate } from '@/engine/types';
import { DEPOT_INDEX } from '@/engine/tsp';
import { polylineForRoute } from '@/engine/city-layout';
import { isFlatDistribution } from '@/lib/distributionShape';

export type CandidateVisibility = 'show' | 'hideWhenSelected';

interface ProbabilityFogProps {
  readonly problem: CityProblem;
  readonly distribution: ReadonlyArray<RouteCandidate>;
  readonly selectedRoute?: RouteCandidate | null;
  readonly pulsing: boolean;
  readonly maxRoutes?: number;
  readonly candidateVisibility?: CandidateVisibility;
}

interface RouteRender {
  readonly points: ReadonlyArray<[number, number, number]>;
  readonly opacity: number;
  readonly width: number;
  readonly color: string;
  readonly yOffset: number;
  readonly selected: boolean;
}

const TOP_COLORS = ['#3DD9C8', '#FFC557', '#B68CFF'];
const FALLBACK_COLOR = '#9CA9C9';
const SELECTED_COLOR = ROUTE_HIGHLIGHT_COLOR;
const FLAT_COLOR = '#8FB8C7';
const FOG_Y_BASE = 0.14;

export const PROBABILITY_FOG_PALETTE = {
  top: TOP_COLORS,
  fallback: FALLBACK_COLOR,
} as const;

export function ProbabilityFog({
  problem,
  distribution,
  selectedRoute,
  pulsing,
  maxRoutes = 12,
  candidateVisibility = 'show',
}: ProbabilityFogProps) {
  const groupRef = useRef<Group>(null);

  const routes: ReadonlyArray<RouteRender> = useMemo(() => {
    const valid = distribution.filter((c) => c.isValid);
    if (valid.length === 0) return [];
    const selectedIsValid = selectedRoute?.isValid === true;
    const hideCandidates =
      candidateVisibility === 'hideWhenSelected' && selectedIsValid;
    if (isFlatDistribution(valid)) {
      return buildFlatRouteRenders(
        problem,
        valid,
        selectedRoute,
        hideCandidates,
      );
    }
    const top = valid.slice(0, maxRoutes);
    const selectedKey = selectedRoute ? routeKey(selectedRoute) : null;
    const selectedInTop =
      selectedKey !== null && top.some((c) => routeKey(c) === selectedKey);
    const renderCandidates =
      hideCandidates && selectedRoute
        ? [selectedRoute]
        : selectedRoute && selectedRoute.isValid && !selectedInTop
        ? [...top, selectedRoute]
        : top;
    const topProb = top[0]?.probability ?? 1;
    const deliveryNodeById = new Map(
      problem.deliveries.map((d) => [d.id, d.nodeId]),
    );

    return renderCandidates.map<RouteRender>((c, idx) => {
      const selected = selectedKey !== null && routeKey(c) === selectedKey;
      const nodeSeq: string[] = [];
      for (const id of c.order) {
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
      const yOffset = FOG_Y_BASE + idx * 0.012 + (selected ? 0.08 : 0);
      const points = polyline.points.map<[number, number, number]>((p) => [
        p.x,
        yOffset,
        p.y,
      ]);

      const relative = c.probability / Math.max(topProb, 1e-9);
      const gammaCurved = Math.pow(c.probability, 0.55);
      const opacity =
        selected
          ? 0.9
          : idx === 0
          ? Math.min(0.95, 0.45 + gammaCurved * 8)
          : Math.min(0.7, 0.08 + gammaCurved * 6);
      const width =
        selected
          ? 5
          : idx === 0
          ? 5.5
          : idx === 1
            ? Math.max(3, 4 * relative)
            : idx === 2
              ? Math.max(2.4, 3.5 * relative)
              : Math.max(1.4, 2.2 * relative);
      const color =
        selected
          ? SELECTED_COLOR
          : idx < TOP_COLORS.length
            ? TOP_COLORS[idx]
            : FALLBACK_COLOR;
      return { points, opacity, width, color, yOffset, selected };
    });
  }, [problem, distribution, selectedRoute, maxRoutes, candidateVisibility]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    if (pulsing) {
      const t = clock.getElapsedTime();
      const pulse = 0.92 + Math.sin(t * 3.2) * 0.08;
      group.scale.set(1, pulse, 1);
    } else {
      group.scale.set(1, 1, 1);
    }
  });

  if (routes.length === 0) return null;

  return (
    <group ref={groupRef}>
      {routes.map((r, i) => (
        r.selected ? (
          <HighlightedRouteLine
            key={i}
            points={r.points}
            color={r.color}
            lineWidth={r.width}
            opacity={1}
            renderOrder={40 + i}
          />
        ) : (
          <Line
            key={i}
            points={r.points}
            color={r.color}
            lineWidth={r.width}
            transparent
            opacity={r.opacity}
            blending={i < 3 ? undefined : AdditiveBlending}
            depthTest={false}
            depthWrite={false}
            renderOrder={10 + i}
          />
        )
      ))}
    </group>
  );
}

function routeKey(route: RouteCandidate): string {
  return route.order.join(',');
}

interface SegmentAccumulator {
  readonly start: { x: number; y: number };
  readonly end: { x: number; y: number };
  weight: number;
}

function buildFlatRouteRenders(
  problem: CityProblem,
  valid: ReadonlyArray<RouteCandidate>,
  selectedRoute: RouteCandidate | null | undefined,
  hideCandidates: boolean,
): ReadonlyArray<RouteRender> {
  const deliveryNodeById = new Map(
    problem.deliveries.map((d) => [d.id, d.nodeId]),
  );
  if (hideCandidates && selectedRoute) {
    return [routeRenderForCandidate(problem, deliveryNodeById, selectedRoute)];
  }

  const segments = new Map<string, SegmentAccumulator>();

  for (const candidate of valid) {
    const nodeSeq = nodeSequenceForRoute(
      problem,
      deliveryNodeById,
      candidate,
    );
    const polyline = polylineForRoute(
      problem.layout,
      problem.shortestPaths,
      nodeSeq,
    );
    for (let i = 1; i < polyline.nodeIds.length; i++) {
      const from = polyline.nodeIds[i - 1];
      const to = polyline.nodeIds[i];
      const start = polyline.points[i - 1];
      const end = polyline.points[i];
      if (!start || !end) continue;
      const key = segmentKey(from, to);
      const existing = segments.get(key);
      if (existing) {
        existing.weight += candidate.probability;
      } else {
        segments.set(key, {
          start,
          end,
          weight: candidate.probability,
        });
      }
    }
  }

  const maxWeight = Math.max(
    ...Array.from(segments.values(), (segment) => segment.weight),
    1e-9,
  );
  const renders: RouteRender[] = Array.from(segments.values()).map(
    (segment, idx) => {
      const relative = segment.weight / maxWeight;
      const yOffset = FOG_Y_BASE + 0.01 + (idx % 3) * 0.002;
      return {
        points: [
          [segment.start.x, yOffset, segment.start.y],
          [segment.end.x, yOffset, segment.end.y],
        ],
        opacity: Math.min(0.5, 0.08 + relative * 0.34),
        width: Math.max(1.5, 3.4 * relative),
        color: FLAT_COLOR,
        yOffset,
        selected: false,
      };
    },
  );

  if (selectedRoute) {
    renders.push(routeRenderForCandidate(problem, deliveryNodeById, selectedRoute));
  }

  return renders;
}

function routeRenderForCandidate(
  problem: CityProblem,
  deliveryNodeById: ReadonlyMap<number, string>,
  candidate: RouteCandidate,
): RouteRender {
  const nodeSeq = nodeSequenceForRoute(problem, deliveryNodeById, candidate);
  const polyline = polylineForRoute(
    problem.layout,
    problem.shortestPaths,
    nodeSeq,
  );
  return {
    points: polyline.points.map<[number, number, number]>((p) => [
      p.x,
      ROUTE_HIGHLIGHT_Y,
      p.y,
    ]),
    opacity: 0.9,
    width: 5,
    color: SELECTED_COLOR,
    yOffset: ROUTE_HIGHLIGHT_Y,
    selected: true,
  };
}

function nodeSequenceForRoute(
  problem: CityProblem,
  deliveryNodeById: ReadonlyMap<number, string>,
  candidate: RouteCandidate,
): string[] {
  const nodeSeq: string[] = [];
  for (const id of candidate.order) {
    nodeSeq.push(
      id === DEPOT_INDEX
        ? problem.layout.depotNodeId
        : deliveryNodeById.get(id) ?? problem.layout.depotNodeId,
    );
  }
  return nodeSeq;
}

function segmentKey(from: string, to: string): string {
  return from < to ? `${from}~${to}` : `${to}~${from}`;
}
