import { DEPOT_INDEX } from './tsp';
import type { CityProblem, Point2D } from './types';

export function segmentDistance(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function routeDistance(
  problem: CityProblem,
  route: ReadonlyArray<number>,
): number {
  const inner = stripDepotSentinels(route);
  let total = 0;
  let prev: Point2D = problem.depot;
  for (const deliveryId of inner) {
    const point = problem.deliveries.find((d) => d.id === deliveryId);
    if (!point) {
      throw new Error(`unknown delivery id ${deliveryId}`);
    }
    total += segmentDistance(prev, point);
    prev = point;
  }
  total += segmentDistance(prev, problem.depot);
  return total;
}

function stripDepotSentinels(
  route: ReadonlyArray<number>,
): ReadonlyArray<number> {
  let start = 0;
  let end = route.length;
  if (end > 0 && route[0] === DEPOT_INDEX) start += 1;
  if (end > start && route[end - 1] === DEPOT_INDEX) end -= 1;
  return route.slice(start, end);
}
