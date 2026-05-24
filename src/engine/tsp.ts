import {
  buildCityLayout,
  computeShortestPaths,
  deliveriesFromLayout,
  depotPoint,
  type TrafficProfileName,
} from './city-layout';
import type { CityProblem } from './types';

export const DEPOT_INDEX = -1;

export function numPermutations(n: number): number {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`n must be a positive integer, got ${n}`);
  }
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function indexToPermutation(
  index: number,
  size: number,
): ReadonlyArray<number> {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`index must be a non-negative integer, got ${index}`);
  }
  const total = numPermutations(size);
  if (index >= total) {
    throw new Error(
      `index ${index} out of range for size ${size} (max ${total - 1})`,
    );
  }

  const available: number[] = [];
  for (let i = 0; i < size; i++) available.push(i);

  const result: number[] = [];
  let rem = index;
  let fact = total;
  for (let pos = 0; pos < size; pos++) {
    fact = Math.floor(fact / (size - pos));
    const pickIdx = Math.floor(rem / fact);
    rem -= pickIdx * fact;
    result.push(available.splice(pickIdx, 1)[0]);
  }
  return result;
}

export function permutationToIndex(
  permutation: ReadonlyArray<number>,
): number {
  const size = permutation.length;
  const available: number[] = [];
  for (let i = 0; i < size; i++) available.push(i);

  let total = numPermutations(size);
  let index = 0;
  for (let pos = 0; pos < size; pos++) {
    const fact = Math.floor(total / (size - pos));
    const value = permutation[pos];
    const pickIdx = available.indexOf(value);
    if (pickIdx < 0) {
      throw new Error(
        `permutation contains invalid value ${value} at position ${pos}`,
      );
    }
    index += pickIdx * fact;
    available.splice(pickIdx, 1);
    total = fact;
  }
  return index;
}

export function routeFromPermutation(
  permutation: ReadonlyArray<number>,
): ReadonlyArray<number> {
  return [DEPOT_INDEX, ...permutation, DEPOT_INDEX];
}

export function buildCityProblem(
  profile: TrafficProfileName = 'midday',
): CityProblem {
  const layout = buildCityLayout(profile);
  const shortestPaths = computeShortestPaths(layout.graph, layout.graph.edges);
  return {
    depot: depotPoint(layout),
    deliveries: deliveriesFromLayout(layout),
    layout,
    shortestPaths,
  };
}

export function defaultCityProblem(): CityProblem {
  return buildCityProblem('midday');
}
