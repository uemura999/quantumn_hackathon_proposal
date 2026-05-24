import { describe, expect, it } from 'vitest';
import {
  indexToPermutation,
  permutationToIndex,
  numPermutations,
  routeFromPermutation,
  defaultCityProblem,
} from './tsp';

describe('numPermutations', () => {
  it('returns n! for small n', () => {
    expect(numPermutations(1)).toBe(1);
    expect(numPermutations(2)).toBe(2);
    expect(numPermutations(3)).toBe(6);
    expect(numPermutations(4)).toBe(24);
    expect(numPermutations(5)).toBe(120);
    expect(numPermutations(6)).toBe(720);
  });
});

describe('indexToPermutation / permutationToIndex (Lehmer code)', () => {
  it('index 0 maps to sorted identity', () => {
    expect(Array.from(indexToPermutation(0, 4))).toEqual([0, 1, 2, 3]);
  });

  it('last index maps to reversed identity', () => {
    expect(Array.from(indexToPermutation(23, 4))).toEqual([3, 2, 1, 0]);
  });

  it('round-trips for all 24 permutations of size 4', () => {
    for (let i = 0; i < 24; i++) {
      const perm = indexToPermutation(i, 4);
      expect(permutationToIndex(perm)).toBe(i);
    }
  });

  it('produces 24 unique permutations for n=4', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 24; i++) {
      seen.add(Array.from(indexToPermutation(i, 4)).join(','));
    }
    expect(seen.size).toBe(24);
  });

  it('round-trips for all 720 permutations of size 6', () => {
    for (let i = 0; i < 720; i++) {
      const perm = indexToPermutation(i, 6);
      expect(permutationToIndex(perm)).toBe(i);
    }
  });
});

describe('routeFromPermutation', () => {
  it('wraps permutation with depot at both ends', () => {
    const route = routeFromPermutation([2, 0, 1, 3]);
    expect(route).toEqual([-1, 2, 0, 1, 3, -1]);
  });
});

describe('defaultCityProblem', () => {
  it('returns 6 delivery points + depot', () => {
    const problem = defaultCityProblem();
    expect(problem.depot).toBeDefined();
    expect(problem.deliveries).toHaveLength(6);
    const ids = problem.deliveries.map((d) => d.id);
    expect(new Set(ids).size).toBe(6);
  });

  it('binds each delivery to a graph node id', () => {
    const problem = defaultCityProblem();
    for (const d of problem.deliveries) {
      const node = problem.layout.graph.nodes.find((n) => n.id === d.nodeId);
      expect(node).toBeDefined();
      expect(node?.kind).toBe('delivery');
    }
  });
});
