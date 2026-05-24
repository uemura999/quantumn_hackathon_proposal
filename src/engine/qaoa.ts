import {
  indexToPermutation,
  numPermutations,
  permutationToIndex,
  routeFromPermutation,
} from './tsp';
import { routeDistance } from './scoring';
import type {
  CityProblem,
  QaoaParams,
  QaoaResult,
  RouteCandidate,
} from './types';

interface ValidState {
  readonly real: Float64Array;
  readonly imag: Float64Array;
}

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

  const costs = buildCostTable(problem, validCount);
  const phases = buildPhaseTable(costs, params.gamma);

  const state = createUniformState(validCount);
  const probabilityHistory: number[][] = [];
  probabilityHistory.push(snapshotProbs(state));

  for (let r = 0; r < params.reps; r++) {
    applyPhaseDiagonal(state, phases);
    probabilityHistory.push(snapshotProbs(state));
    applyPermutationMixer(state, n, params.beta);
    probabilityHistory.push(snapshotProbs(state));
  }
  const probs = amplitudesToProbabilities(state);

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
    trafficProfile: problem.layout.trafficProfile,
    uniformProbability: 1 / validCount,
    topAmplification: bestValid ? bestValid.probability * validCount : 0,
    probabilityHistory,
  };
}

export function sampleRouteCandidate(
  distribution: ReadonlyArray<RouteCandidate>,
  random: () => number = Math.random,
): RouteCandidate | null {
  const valid = distribution.filter((c) => c.isValid && c.probability > 0);
  if (valid.length === 0) return null;

  const total = valid.reduce((sum, c) => sum + c.probability, 0);
  let target = Math.min(Math.max(random(), 0), 1) * total;
  for (const candidate of valid) {
    target -= candidate.probability;
    if (target <= 0) return candidate;
  }
  return valid[valid.length - 1];
}

function createUniformState(size: number): ValidState {
  const real = new Float64Array(size);
  const imag = new Float64Array(size);
  const amp = 1 / Math.sqrt(size);
  real.fill(amp);
  return { real, imag };
}

function amplitudesToProbabilities(state: ValidState): Float64Array {
  const probs = new Float64Array(state.real.length);
  for (let i = 0; i < probs.length; i++) {
    probs[i] =
      state.real[i] * state.real[i] + state.imag[i] * state.imag[i];
  }
  return probs;
}

function snapshotProbs(state: ValidState): number[] {
  const probs = amplitudesToProbabilities(state);
  const out = new Array<number>(probs.length);
  let mass = 0;
  for (let i = 0; i < probs.length; i++) mass += probs[i];
  const renorm = mass > 0 ? 1 / mass : 0;
  for (let i = 0; i < probs.length; i++) out[i] = probs[i] * renorm;
  return out;
}

interface CostTable {
  readonly values: Float64Array;
  readonly ranks: Int32Array;
  readonly validMin: number;
  readonly validMax: number;
}

function buildCostTable(
  problem: CityProblem,
  validCount: number,
): CostTable {
  const values = new Float64Array(validCount);
  let validMin = Infinity;
  let validMax = -Infinity;

  for (let i = 0; i < validCount; i++) {
    const perm = indexToPermutation(i, problem.deliveries.length);
    const distance = routeDistance(problem, perm);
    values[i] = distance;
    if (distance < validMin) validMin = distance;
    if (distance > validMax) validMax = distance;
  }
  return { values, ranks: buildDistanceRanks(values), validMin, validMax };
}

function buildPhaseTable(costs: CostTable, gamma: number): Float64Array {
  const { values, validMin, validMax } = costs;
  const span = Math.max(validMax - validMin, 1e-9);
  const phases = new Float64Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const normalized = (values[i] - validMin) / span;
    phases[i] = gamma * (1 - normalized);
  }
  return phases;
}

function buildDistanceRanks(values: Readonly<Float64Array>): Int32Array {
  const sorted = Array.from(values).sort((a, b) => a - b);
  const ranks = new Int32Array(values.length);
  const eps = 1e-9;
  for (let i = 0; i < values.length; i++) {
    let better = 0;
    for (const distance of sorted) {
      if (distance < values[i] - eps) better += 1;
      else break;
    }
    ranks[i] = better + 1;
  }
  return ranks;
}

function applyPhaseDiagonal(
  state: ValidState,
  phases: Readonly<Float64Array>,
): void {
  if (phases.length !== state.real.length) {
    throw new Error(
      `phases length ${phases.length} does not match state size ${state.real.length}`,
    );
  }

  for (let i = 0; i < phases.length; i++) {
    const phi = phases[i];
    if (phi === 0) continue;
    const c = Math.cos(phi);
    const s = Math.sin(phi);
    const ar = state.real[i];
    const ai = state.imag[i];
    state.real[i] = c * ar + s * ai;
    state.imag[i] = c * ai - s * ar;
  }
}

function applyPermutationMixer(
  state: ValidState,
  permutationSize: number,
  beta: number,
): void {
  if (beta === 0) return;

  const angle = beta / Math.max(1, permutationSize - 1);
  for (let pos = 0; pos < permutationSize - 1; pos++) {
    const visited = new Uint8Array(state.real.length);
    for (let i = 0; i < state.real.length; i++) {
      if (visited[i]) continue;
      const perm = indexToPermutation(i, permutationSize).slice();
      const tmp = perm[pos];
      perm[pos] = perm[pos + 1];
      perm[pos + 1] = tmp;
      const j = permutationToIndex(perm);
      visited[i] = 1;
      visited[j] = 1;
      if (i !== j) rotatePair(state, i, j, angle);
    }
  }
}

function rotatePair(
  state: ValidState,
  a: number,
  b: number,
  angle: number,
): void {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  const ar = state.real[a];
  const ai = state.imag[a];
  const br = state.real[b];
  const bi = state.imag[b];

  state.real[a] = c * ar + s * bi;
  state.imag[a] = c * ai - s * br;
  state.real[b] = c * br + s * ai;
  state.imag[b] = c * bi - s * ar;
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
      distanceRank: costs.ranks[i],
      deltaFromOptimal: costs.values[i] - costs.validMin,
      isValid: true,
    });
  }

  const distribution = valid
    .slice()
    .sort((a, b) => {
      const probabilityDiff = b.probability - a.probability;
      if (Math.abs(probabilityDiff) > 1e-12) return probabilityDiff;
      return a.distance - b.distance;
    });
  const bestValid = distribution[0] ?? null;

  return { distribution, bestValid };
}
