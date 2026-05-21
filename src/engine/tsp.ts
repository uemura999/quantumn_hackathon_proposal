import type { CityProblem, DeliveryPoint } from './types';

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

const DEFAULT_DELIVERIES: ReadonlyArray<DeliveryPoint> = [
  { id: 0, label: '北倉庫', x: -3, y: 4 },
  { id: 1, label: '中央駅', x: 3, y: 3 },
  { id: 2, label: '南マーケット', x: -2, y: -3 },
  { id: 3, label: '東モール', x: 4, y: -2 },
];

export function defaultCityProblem(): CityProblem {
  return {
    depot: { x: 0, y: 0 },
    deliveries: DEFAULT_DELIVERIES,
  };
}
