import type { RouteCandidate } from '@/engine/types';

export const DELIVERY_SPEED_DISTANCE_PT_PER_MIN = 24;

export interface RouteOutcomeDelta {
  readonly routeChanged: boolean;
  readonly distanceDelta: number;
  readonly amplificationDelta: number;
}

export function estimateDeliveryMinutes(distance: number): number {
  return distance / DELIVERY_SPEED_DISTANCE_PT_PER_MIN;
}

export function formatDeliveryMinutes(minutes: number): string {
  if (minutes < 1) return `${Math.round(minutes * 60)} 秒相当`;
  return `${minutes.toFixed(1)} 分相当`;
}

export function sameRoute(
  a: RouteCandidate | null | undefined,
  b: RouteCandidate | null | undefined,
): boolean {
  if (!a || !b) return false;
  return a.order.join(',') === b.order.join(',');
}

export function describeRouteOrder(route: RouteCandidate): string {
  return route.order
    .map((id) => (id < 0 ? '倉庫' : String(id + 1)))
    .join(' → ');
}

export function compareRouteOutcome(
  current: RouteCandidate | null,
  previous: RouteCandidate | null,
  currentAmplification: number,
  previousAmplification: number,
): RouteOutcomeDelta | null {
  if (!current || !previous) return null;
  return {
    routeChanged: !sameRoute(current, previous),
    distanceDelta: current.distance - previous.distance,
    amplificationDelta: currentAmplification - previousAmplification,
  };
}
