import { describe, expect, it } from 'vitest';
import { runQaoa } from '@/engine/qaoa';
import { defaultCityProblem } from '@/engine/tsp';
import {
  analyzeDistributionShape,
  isFlatDistribution,
} from './distributionShape';

const problem = defaultCityProblem();

describe('distributionShape', () => {
  it('detects the initial uniform route distribution as flat', () => {
    const result = runQaoa(problem, { gamma: 0, beta: 0, reps: 1 });
    const shape = analyzeDistributionShape(result.distribution);

    expect(shape.flat).toBe(true);
    expect(shape.topAmplification).toBeCloseTo(1);
    expect(isFlatDistribution(result.distribution)).toBe(true);
  });

  it('detects a tuned distribution as non-flat', () => {
    const result = runQaoa(problem, { gamma: 1, beta: 0.4, reps: 2 });
    const shape = analyzeDistributionShape(result.distribution);

    expect(shape.flat).toBe(false);
    expect(shape.topAmplification).toBeGreaterThan(1.02);
  });
});
