import {
  applyHadamardAll,
  applyPhaseDiagonal,
  applyXRotationAll,
  createState,
  probabilities,
} from './statevector';
import {
  indexToPermutation,
  numPermutations,
  routeFromPermutation,
} from './tsp';
import { routeDistance } from './scoring';
import type {
  CityProblem,
  QaoaParams,
  QaoaResult,
  RouteCandidate,
} from './types';

const INVALID_PENALTY = 1e9;

export function runQaoa(
  problem: CityProblem,
  params: QaoaParams,
): QaoaResult {
  if (!Number.isInteger(params.reps) || params.reps < 1) {
    throw new Error(`reps must be a positive integer, got ${params.reps}`);
  }
  if (problem.deliveries.length < 2) {
    throw new Error('problem requires at least 2 delivery points');
  }

  const startedAt = performance.now();

  const n = problem.deliveries.length;
  const validCount = numPermutations(n);
  const numQubits = Math.max(1, Math.ceil(Math.log2(validCount)));
  const size = 1 << numQubits;

  const costs = buildCostTable(problem, validCount, size);
  const phases = buildPhaseTable(costs, params.gamma);

  const state = createState(numQubits);
  applyHadamardAll(state);
  for (let r = 0; r < params.reps; r++) {
    applyPhaseDiagonal(state, phases);
    applyXRotationAll(state, params.beta);
  }
  const probs = probabilities(state);

  const { distribution, bestValid } = buildDistribution(
    probs,
    costs,
    problem,
    validCount,
    n,
  );

  return {
    distribution,
    bestValid,
    elapsedMs: performance.now() - startedAt,
    params,
  };
}

interface CostTable {
  readonly values: Float64Array;
  readonly validMin: number;
  readonly validMax: number;
}

function buildCostTable(
  problem: CityProblem,
  validCount: number,
  size: number,
): CostTable {
  const values = new Float64Array(size);
  let validMin = Infinity;
  let validMax = -Infinity;

  for (let i = 0; i < size; i++) {
    if (i < validCount) {
      const perm = indexToPermutation(i, problem.deliveries.length);
      const distance = routeDistance(problem, perm);
      values[i] = distance;
      if (distance < validMin) validMin = distance;
      if (distance > validMax) validMax = distance;
    } else {
      values[i] = INVALID_PENALTY;
    }
  }
  return { values, validMin, validMax };
}

function buildPhaseTable(costs: CostTable, gamma: number): Float64Array {
  const { values, validMin, validMax } = costs;
  const span = Math.max(validMax - validMin, 1e-9);
  const phases = new Float64Array(values.length);
  // H_C eigenvalue = -cost (we minimize cost = maximize -cost).
  // applyPhaseDiagonal applies exp(-i phi). So phi = -gamma * (-cost_norm)
  //   = gamma * cost_norm gives the wrong sign for minimization.
  // Correct: phi = gamma * (-cost_norm) so short routes get LESS positive
  // phase and get constructively amplified by the mixer.
  // Invalid states are pinned at the worst (most positive) phase to suppress.
  for (let i = 0; i < values.length; i++) {
    if (values[i] >= INVALID_PENALTY) {
      phases[i] = gamma * 1.2;
      continue;
    }
    const normalized = (values[i] - validMin) / span;
    phases[i] = gamma * (1 - normalized);
  }
  return phases;
}

interface BuiltDistribution {
  readonly distribution: ReadonlyArray<RouteCandidate>;
  readonly bestValid: RouteCandidate | null;
}

function buildDistribution(
  probs: Readonly<Float64Array>,
  costs: CostTable,
  problem: CityProblem,
  validCount: number,
  n: number,
): BuiltDistribution {
  let validMass = 0;
  for (let i = 0; i < validCount; i++) validMass += probs[i];
  const renorm = validMass > 0 ? 1 / validMass : 0;

  const valid: RouteCandidate[] = [];
  for (let i = 0; i < validCount; i++) {
    const perm = indexToPermutation(i, n);
    const route = routeFromPermutation(perm);
    valid.push({
      order: route,
      distance: costs.values[i],
      probability: probs[i] * renorm,
      isValid: true,
    });
  }

  const distribution = valid
    .slice()
    .sort((a, b) => b.probability - a.probability);
  const bestValid = distribution[0] ?? null;

  return { distribution, bestValid };
}
