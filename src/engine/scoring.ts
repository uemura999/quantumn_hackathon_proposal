import { DEPOT_INDEX } from './tsp';
import type { CityProblem, Point2D } from './types';

export function segmentDistance(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function nodeIdForRouteIndex(
  problem: CityProblem,
  index: number,
): string {
  if (index === DEPOT_INDEX) return problem.layout.depotNodeId;
  const delivery = problem.deliveries.find((d) => d.id === index);
  if (!delivery) {
    throw new Error(`unknown delivery id ${index}`);
  }
  return delivery.nodeId;
}

export function routeDistance(
  problem: CityProblem,
  route: ReadonlyArray<number>,
): number {
  const inner = stripDepotSentinels(route);
  if (inner.length === 0) return 0;

  const nodeSequence: string[] = [problem.layout.depotNodeId];
  for (const idx of inner) {
    nodeSequence.push(nodeIdForRouteIndex(problem, idx));
  }
  nodeSequence.push(problem.layout.depotNodeId);

  let total = 0;
  for (let i = 1; i < nodeSequence.length; i++) {
    const from = nodeSequence[i - 1];
    const to = nodeSequence[i];
    const row = problem.shortestPaths.distance.get(from);
    if (!row) throw new Error(`shortest path row missing for ${from}`);
    const d = row.get(to);
    if (d === undefined || !Number.isFinite(d)) {
      throw new Error(`no path from ${from} to ${to}`);
    }
    total += d;
  }
  return total;
}

export function euclideanRouteDistance(
  depot: Point2D,
  ordered: ReadonlyArray<Point2D>,
): number {
  if (ordered.length === 0) return 0;
  let total = segmentDistance(depot, ordered[0]);
  for (let i = 1; i < ordered.length; i++) {
    total += segmentDistance(ordered[i - 1], ordered[i]);
  }
  total += segmentDistance(ordered[ordered.length - 1], depot);
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
