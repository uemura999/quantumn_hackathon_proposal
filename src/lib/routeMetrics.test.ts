import { describe, expect, it } from 'vitest';
import type { RouteCandidate } from '@/engine/types';
import {
  compareRouteOutcome,
  DELIVERY_SPEED_DISTANCE_PT_PER_MIN,
  describeRouteOrder,
  estimateDeliveryMinutes,
  sameRoute,
} from './routeMetrics';

const routeA: RouteCandidate = {
  order: [-1, 0, 1, -1],
  distance: 48,
  probability: 0.2,
  distanceRank: 1,
  deltaFromOptimal: 0,
  isValid: true,
};

const routeB: RouteCandidate = {
  ...routeA,
  order: [-1, 1, 0, -1],
  distance: 60,
};

describe('routeMetrics', () => {
  it('estimates display delivery time from distance', () => {
    expect(estimateDeliveryMinutes(DELIVERY_SPEED_DISTANCE_PT_PER_MIN)).toBe(1);
    expect(estimateDeliveryMinutes(48)).toBe(2);
  });

  it('detects whether the route order changed', () => {
    expect(sameRoute(routeA, { ...routeA })).toBe(true);
    expect(sameRoute(routeA, routeB)).toBe(false);
  });

  it('compares route outcomes against a previous run', () => {
    const delta = compareRouteOutcome(routeA, routeB, 2.5, 1.5);
    expect(delta).toEqual({
      routeChanged: true,
      distanceDelta: -12,
      amplificationDelta: 1,
    });
  });

  it('formats depot and delivery ids for display order', () => {
    expect(describeRouteOrder(routeA)).toBe('倉庫 → 1 → 2 → 倉庫');
  });
});
