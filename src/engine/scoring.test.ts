import { describe, expect, it } from 'vitest';
import { routeDistance, segmentDistance } from './scoring';
import { defaultCityProblem } from './tsp';

describe('segmentDistance', () => {
  it('returns Euclidean distance between two points', () => {
    expect(segmentDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('is 0 for same point', () => {
    expect(segmentDistance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });
});

describe('routeDistance via road graph', () => {
  it('returns 0 for empty route', () => {
    const problem = defaultCityProblem();
    expect(routeDistance(problem, [])).toBe(0);
  });

  it('returns a positive total distance for the default 6-delivery tour', () => {
    const problem = defaultCityProblem();
    const distance = routeDistance(problem, [0, 1, 2, 3, 4, 5]);
    expect(distance).toBeGreaterThan(0);
    expect(Number.isFinite(distance)).toBe(true);
  });

  it('produces different distances for different permutations', () => {
    const problem = defaultCityProblem();
    const a = routeDistance(problem, [0, 1, 2, 3, 4, 5]);
    const b = routeDistance(problem, [5, 4, 3, 2, 1, 0]);
    // these two are reverses → same total by symmetry; pick truly different
    const c = routeDistance(problem, [0, 2, 4, 1, 3, 5]);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('accepts routes already wrapped with depot sentinels', () => {
    const problem = defaultCityProblem();
    const plain = routeDistance(problem, [0, 1, 2, 3, 4, 5]);
    const wrapped = routeDistance(problem, [-1, 0, 1, 2, 3, 4, 5, -1]);
    expect(wrapped).toBeCloseTo(plain, 9);
  });
});
