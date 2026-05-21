import { routeDistance } from '@/engine/scoring';
import { indexToPermutation, numPermutations } from '@/engine/tsp';
import type { CityProblem } from '@/engine/types';

export interface ManualRouteScore {
  readonly distance: number;
  readonly rank: number;
  readonly totalRoutes: number;
  readonly bestDistance: number;
  readonly worstDistance: number;
  readonly deltaFromBest: number;
}

export function scoreManualRoute(
  problem: CityProblem,
  manualOrder: ReadonlyArray<number>,
): ManualRouteScore {
  if (manualOrder.length !== problem.deliveries.length) {
    throw new Error(
      `manualOrder must include all ${problem.deliveries.length} deliveries, got ${manualOrder.length}`,
    );
  }

  const seen = new Set(manualOrder);
  if (seen.size !== manualOrder.length) {
    throw new Error('manualOrder must contain unique delivery ids');
  }

  const total = numPermutations(problem.deliveries.length);
  const distances: number[] = [];
  for (let i = 0; i < total; i++) {
    const perm = indexToPermutation(i, problem.deliveries.length);
    distances.push(routeDistance(problem, perm));
  }

  const sorted = distances.slice().sort((a, b) => a - b);
  const userDistance = routeDistance(problem, manualOrder);

  // Rank: 1-based position when sorted ascending (1 = shortest).
  const rank =
    sorted.findIndex((d) => Math.abs(d - userDistance) < 1e-9) + 1;

  return {
    distance: userDistance,
    rank,
    totalRoutes: total,
    bestDistance: sorted[0],
    worstDistance: sorted[sorted.length - 1],
    deltaFromBest: userDistance - sorted[0],
  };
}
