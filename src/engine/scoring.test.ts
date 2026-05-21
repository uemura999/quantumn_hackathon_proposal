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

describe('routeDistance', () => {
  it('sums consecutive segment distances with depot at both ends', () => {
    const problem = defaultCityProblem();
    // depot (0,0) → 0:(-3,4) → 1:(3,3) → 2:(-2,-3) → 3:(4,-2) → depot
    const distance = routeDistance(problem, [0, 1, 2, 3]);
    const expected =
      Math.sqrt(9 + 16) +
      Math.sqrt(36 + 1) +
      Math.sqrt(25 + 36) +
      Math.sqrt(36 + 1) +
      Math.sqrt(16 + 4);
    expect(Math.abs(distance - expected)).toBeLessThan(1e-9);
  });

  it('produces different distances for different permutations', () => {
    const problem = defaultCityProblem();
    const a = routeDistance(problem, [0, 1, 2, 3]);
    const b = routeDistance(problem, [0, 2, 1, 3]);
    expect(a).not.toEqual(b);
  });
});
