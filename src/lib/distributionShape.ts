import type { RouteCandidate } from '@/engine/types';

export const FLAT_AMPLIFICATION_THRESHOLD = 1.02;
export const FLAT_PROBABILITY_SPREAD = 1e-9;

export interface DistributionShape {
  readonly validCount: number;
  readonly meanProbability: number;
  readonly minProbability: number;
  readonly maxProbability: number;
  readonly topAmplification: number;
  readonly flat: boolean;
}

export function analyzeDistributionShape(
  distribution: ReadonlyArray<RouteCandidate>,
): DistributionShape {
  const valid = distribution.filter((c) => c.isValid);
  if (valid.length === 0) {
    return {
      validCount: 0,
      meanProbability: 0,
      minProbability: 0,
      maxProbability: 0,
      topAmplification: 0,
      flat: false,
    };
  }

  let minProbability = Infinity;
  let maxProbability = -Infinity;
  let totalProbability = 0;
  for (const candidate of valid) {
    minProbability = Math.min(minProbability, candidate.probability);
    maxProbability = Math.max(maxProbability, candidate.probability);
    totalProbability += candidate.probability;
  }

  const meanProbability = totalProbability / valid.length;
  const topAmplification =
    meanProbability > 0 ? maxProbability / meanProbability : 0;
  const flat =
    topAmplification <= FLAT_AMPLIFICATION_THRESHOLD ||
    maxProbability - minProbability <= FLAT_PROBABILITY_SPREAD;

  return {
    validCount: valid.length,
    meanProbability,
    minProbability,
    maxProbability,
    topAmplification,
    flat,
  };
}

export function isFlatDistribution(
  distribution: ReadonlyArray<RouteCandidate>,
): boolean {
  return analyzeDistributionShape(distribution).flat;
}
