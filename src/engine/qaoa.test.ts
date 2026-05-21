import { describe, expect, it } from 'vitest';
import { runQaoa } from './qaoa';
import {
  defaultCityProblem,
  indexToPermutation,
  numPermutations,
  routeFromPermutation,
} from './tsp';
import { routeDistance } from './scoring';

const problem = defaultCityProblem();
const n = problem.deliveries.length;
const totalPerms = numPermutations(n);

describe('runQaoa', () => {
  it('returns a probability distribution that sums to ~1', () => {
    const result = runQaoa(problem, { gamma: 0.8, beta: 0.4, reps: 2 });
    const sum = result.distribution.reduce((acc, c) => acc + c.probability, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
  });

  it('returns exactly n! valid permutations in the distribution', () => {
    const result = runQaoa(problem, { gamma: 0.8, beta: 0.4, reps: 1 });
    const validCount = result.distribution.filter((c) => c.isValid).length;
    expect(validCount).toBe(totalPerms);
  });

  it('with reps=1 and gamma=0/beta=0, distribution should be near-uniform on valid permutations', () => {
    const result = runQaoa(problem, { gamma: 0, beta: 0, reps: 1 });
    const validProbs = result.distribution
      .filter((c) => c.isValid)
      .map((c) => c.probability);
    const expected = 1 / totalPerms;
    for (const p of validProbs) {
      expect(Math.abs(p - expected)).toBeLessThan(1e-6);
    }
  });

  it('returns distribution sorted by probability descending', () => {
    const result = runQaoa(problem, { gamma: 1.2, beta: 0.5, reps: 2 });
    for (let i = 1; i < result.distribution.length; i++) {
      expect(result.distribution[i - 1].probability).toBeGreaterThanOrEqual(
        result.distribution[i].probability,
      );
    }
  });

  it('produces a non-uniform distribution when parameters are nontrivial', () => {
    const result = runQaoa(problem, { gamma: 1.0, beta: 0.4, reps: 2 });
    const validProbs = result.distribution
      .filter((c) => c.isValid)
      .map((c) => c.probability);
    const mean =
      validProbs.reduce((acc, p) => acc + p, 0) / validProbs.length;
    const variance =
      validProbs.reduce((acc, p) => acc + (p - mean) * (p - mean), 0) /
      validProbs.length;
    // Non-uniform: at least some spread in probability mass.
    expect(variance).toBeGreaterThan(1e-6);
  });

  it('changes the distribution when gamma changes', () => {
    const a = runQaoa(problem, { gamma: 0.3, beta: 0.4, reps: 2 });
    const b = runQaoa(problem, { gamma: 1.5, beta: 0.4, reps: 2 });
    const mapA = new Map(
      a.distribution
        .filter((c) => c.isValid)
        .map((c) => [c.order.join(','), c.probability]),
    );
    let tv = 0;
    for (const c of b.distribution.filter((x) => x.isValid)) {
      const key = c.order.join(',');
      const pa = mapA.get(key) ?? 0;
      tv += Math.abs(pa - c.probability);
    }
    tv = tv / 2;
    expect(tv).toBeGreaterThan(1e-3);
  });

  it('bestValid points to the highest-probability valid route', () => {
    const result = runQaoa(problem, { gamma: 1.0, beta: 0.4, reps: 2 });
    expect(result.bestValid).not.toBeNull();
    const top = result.distribution.find((c) => c.isValid);
    expect(result.bestValid?.order).toEqual(top?.order);
  });

  it('records elapsedMs and params back', () => {
    const params = { gamma: 0.7, beta: 0.3, reps: 1 };
    const result = runQaoa(problem, params);
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
    expect(result.params).toEqual(params);
  });

  it('produces routes whose distance matches scoring.routeDistance', () => {
    const result = runQaoa(problem, { gamma: 0.5, beta: 0.2, reps: 1 });
    for (const c of result.distribution.filter((x) => x.isValid)) {
      const expected = routeDistance(problem, c.order);
      expect(Math.abs(c.distance - expected)).toBeLessThan(1e-9);
    }
  });

  it('throws when reps is invalid', () => {
    expect(() =>
      runQaoa(problem, { gamma: 0.5, beta: 0.2, reps: 0 }),
    ).toThrow();
  });
});

describe('runQaoa: well-known smallest distance', () => {
  it('amplifies the analytically-shortest route above uniform on average', () => {
    const all = Array.from({ length: totalPerms }, (_, i) =>
      indexToPermutation(i, n),
    );
    const truths = all
      .map((p) => ({ order: p, distance: routeDistance(problem, p) }))
      .sort((a, b) => a.distance - b.distance);
    const trueBestWrapped = routeFromPermutation(truths[0].order);

    // Average over a small grid of parameters to smooth out QAOA quirks.
    let bestProb = 0;
    let count = 0;
    for (const gamma of [0.6, 0.9, 1.2]) {
      for (const beta of [0.2, 0.35, 0.5]) {
        const r = runQaoa(problem, { gamma, beta, reps: 3 });
        const validMap = new Map(
          r.distribution
            .filter((c) => c.isValid)
            .map((c) => [c.order.join(','), c.probability]),
        );
        bestProb += validMap.get(trueBestWrapped.join(',')) ?? 0;
        count += 1;
      }
    }
    const avgBest = bestProb / count;
    const uniform = 1 / totalPerms;
    expect(avgBest).toBeGreaterThan(uniform);
  });
});
