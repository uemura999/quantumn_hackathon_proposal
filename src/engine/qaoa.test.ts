import { describe, expect, it } from 'vitest';
import { runQaoa, sampleRouteCandidate } from './qaoa';
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
    const uniform = 1 / validProbs.length;
    const maxProb = Math.max(...validProbs);
    // Non-uniform: the best-amplified route is at least 1.5x the uniform baseline.
    expect(maxProb / uniform).toBeGreaterThan(1.5);
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

  it('reports uniform probability and top amplification', () => {
    const result = runQaoa(problem, { gamma: 1.0, beta: 0.4, reps: 2 });
    expect(result.uniformProbability).toBeCloseTo(1 / totalPerms);
    expect(result.topAmplification).toBeCloseTo(
      (result.bestValid?.probability ?? 0) / result.uniformProbability,
    );
    expect(result.topAmplification).toBeGreaterThan(1);
  });

  it('reports expected distance as the probability-weighted route distance', () => {
    const result = runQaoa(problem, { gamma: 1.0, beta: 0.4, reps: 2 });
    const weightedMean = result.distribution.reduce(
      (sum, candidate) => sum + candidate.distance * candidate.probability,
      0,
    );

    expect(result.expectedDistance).toBeCloseTo(weightedMean);
  });

  it('can improve expected distance by tuning QAOA parameters', () => {
    const uniform = runQaoa(problem, { gamma: 0, beta: 0, reps: 1 });
    const tuned = runQaoa(problem, {
      gamma: Math.PI,
      beta: Math.PI / 2,
      reps: 3,
    });

    expect(tuned.expectedDistance).toBeLessThan(uniform.expectedDistance);
  });

  it('produces routes whose distance matches scoring.routeDistance', () => {
    const result = runQaoa(problem, { gamma: 0.5, beta: 0.2, reps: 1 });
    for (const c of result.distribution.filter((x) => x.isValid)) {
      const expected = routeDistance(problem, c.order);
      expect(Math.abs(c.distance - expected)).toBeLessThan(1e-9);
    }
  });

  it('adds distance rank and delta from the shortest route', () => {
    const result = runQaoa(problem, { gamma: 0.5, beta: 0.2, reps: 1 });
    const shortest = result.distribution.reduce(
      (min, c) => Math.min(min, c.distance),
      Infinity,
    );
    const topByDistance = result.distribution
      .slice()
      .sort((a, b) => a.distance - b.distance)[0];

    expect(topByDistance.distanceRank).toBe(1);
    expect(topByDistance.deltaFromOptimal).toBeCloseTo(0);
    for (const c of result.distribution) {
      expect(c.distanceRank).toBeGreaterThanOrEqual(1);
      expect(c.deltaFromOptimal).toBeCloseTo(c.distance - shortest);
    }
  });

  it('samples a route from the probability distribution', () => {
    const result = runQaoa(problem, { gamma: 1.0, beta: 0.4, reps: 2 });
    const first = sampleRouteCandidate(result.distribution, () => 0);
    const last = sampleRouteCandidate(result.distribution, () => 1);

    expect(first).toEqual(result.distribution[0]);
    expect(last).toEqual(result.distribution[result.distribution.length - 1]);
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
