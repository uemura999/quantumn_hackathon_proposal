import { describe, expect, it } from 'vitest';
import { scoreManualRoute } from './manualScoring';
import { defaultCityProblem, indexToPermutation, numPermutations } from '@/engine/tsp';
import { routeDistance } from '@/engine/scoring';

const problem = defaultCityProblem();
const n = problem.deliveries.length;
const total = numPermutations(n);

describe('scoreManualRoute', () => {
  it('rank 1 for the shortest route', () => {
    const all = Array.from({ length: total }, (_, i) => ({
      order: indexToPermutation(i, n),
      distance: routeDistance(problem, indexToPermutation(i, n)),
    })).sort((a, b) => a.distance - b.distance);

    const score = scoreManualRoute(problem, all[0].order);
    expect(score.rank).toBe(1);
    expect(score.distance).toBeCloseTo(all[0].distance);
    expect(score.deltaFromBest).toBeCloseTo(0);
    expect(score.totalRoutes).toBe(total);
  });

  it('rank close to totalRoutes for the longest route (ties exist due to reverse symmetry)', () => {
    const all = Array.from({ length: total }, (_, i) => ({
      order: indexToPermutation(i, n),
      distance: routeDistance(problem, indexToPermutation(i, n)),
    })).sort((a, b) => a.distance - b.distance);

    const score = scoreManualRoute(problem, all[total - 1].order);
    // Routes come in reverse-pair equivalence classes with identical distance,
    // so the longest route ties with at least one other and sits at rank >= total - 1.
    expect(score.rank).toBeGreaterThanOrEqual(total - 1);
    expect(score.deltaFromBest).toBeGreaterThan(0);
  });

  it('produces consistent best/worst distances regardless of input', () => {
    const a = scoreManualRoute(problem, [0, 1, 2, 3]);
    const b = scoreManualRoute(problem, [3, 2, 1, 0]);
    expect(a.bestDistance).toBeCloseTo(b.bestDistance);
    expect(a.worstDistance).toBeCloseTo(b.worstDistance);
  });

  it('throws when order has wrong length', () => {
    expect(() => scoreManualRoute(problem, [0, 1, 2])).toThrow();
  });

  it('throws when order has duplicates', () => {
    expect(() => scoreManualRoute(problem, [0, 1, 1, 2])).toThrow();
  });

  it('returns deltaFromBest equal to distance - bestDistance', () => {
    const score = scoreManualRoute(problem, [0, 1, 2, 3]);
    expect(score.deltaFromBest).toBeCloseTo(score.distance - score.bestDistance);
  });
});
