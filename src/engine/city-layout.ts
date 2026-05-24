import type {
  BuildingPlacement,
  CityBounds,
  CityLayout,
  DeliveryPoint,
  RoadEdge,
  RoadGraph,
  RoadNode,
  ShortestPathTable,
  TrafficLevel,
} from './types';
import { TRAFFIC_MULTIPLIER } from './types';

const GRID_VALUES = [-6, -3, 0, 3, 6] as const;
const DEPOT_ID = 'depot';
const MIN_PIN_SEPARATION = 1.5;
const MIN_BUILDING_SEPARATION = 1.2;

interface DeliverySpec {
  readonly gx: number;
  readonly gy: number;
  readonly label: string;
}

const DELIVERY_SPECS: ReadonlyArray<DeliverySpec> = [
  { gx: -6, gy: 6, label: '北西工場' },
  { gx: 6, gy: 6, label: '北東病院' },
  { gx: 6, gy: 0, label: '東モール' },
  { gx: -6, gy: 0, label: '西駅' },
  { gx: -6, gy: -6, label: '南西商店街' },
  { gx: 6, gy: -6, label: '南東スタジアム' },
];

export type TrafficProfileName = 'morning_rush' | 'midday' | 'evening_rush';

interface EdgeTrafficSeed {
  readonly key: string;
  readonly profiles: Readonly<Record<TrafficProfileName, TrafficLevel>>;
}

function nodeIdForGrid(gx: number, gy: number): string {
  if (gx === 0 && gy === 0) return DEPOT_ID;
  return `n_${gx}_${gy}`;
}

function edgeId(from: string, to: string): string {
  return from < to ? `${from}~${to}` : `${to}~${from}`;
}

function buildNodes(): ReadonlyArray<RoadNode> {
  const nodes: RoadNode[] = [];
  for (const gy of GRID_VALUES) {
    for (const gx of GRID_VALUES) {
      const id = nodeIdForGrid(gx, gy);
      if (gx === 0 && gy === 0) {
        nodes.push({
          id,
          x: gx,
          y: gy,
          kind: 'depot',
          label: '倉庫',
        });
        continue;
      }
      const delivery = DELIVERY_SPECS.findIndex(
        (d) => d.gx === gx && d.gy === gy,
      );
      if (delivery >= 0) {
        nodes.push({
          id,
          x: gx,
          y: gy,
          kind: 'delivery',
          deliveryId: delivery,
          label: DELIVERY_SPECS[delivery].label,
        });
      } else {
        nodes.push({ id, x: gx, y: gy, kind: 'intersection' });
      }
    }
  }
  return nodes;
}

function trafficForEdge(
  edgeKey: string,
  profile: TrafficProfileName,
): TrafficLevel {
  let hash = 2166136261;
  for (let i = 0; i < edgeKey.length; i++) {
    hash = (hash ^ edgeKey.charCodeAt(i)) >>> 0;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const profileShift =
    profile === 'morning_rush' ? 0 : profile === 'midday' ? 7 : 13;
  const slot = (hash + profileShift) % 100;

  if (profile === 'morning_rush') {
    if (slot < 18) return 'heavy';
    if (slot < 50) return 'moderate';
    if (slot < 78) return 'light';
    return 'clear';
  }
  if (profile === 'evening_rush') {
    if (slot < 14) return 'heavy';
    if (slot < 42) return 'moderate';
    if (slot < 74) return 'light';
    return 'clear';
  }
  if (slot < 6) return 'heavy';
  if (slot < 24) return 'moderate';
  if (slot < 62) return 'light';
  return 'clear';
}

function buildEdges(
  nodes: ReadonlyArray<RoadNode>,
  profile: TrafficProfileName,
): ReadonlyArray<RoadEdge> {
  const byCoord = new Map<string, RoadNode>();
  for (const n of nodes) byCoord.set(`${n.x},${n.y}`, n);

  const edges: RoadEdge[] = [];
  const spacing = 3;
  for (const node of nodes) {
    const eastKey = `${node.x + spacing},${node.y}`;
    const east = byCoord.get(eastKey);
    if (east) {
      const id = edgeId(node.id, east.id);
      edges.push({
        id,
        from: node.id,
        to: east.id,
        baseCost: spacing,
        traffic: trafficForEdge(id, profile),
      });
    }
    const northKey = `${node.x},${node.y + spacing}`;
    const north = byCoord.get(northKey);
    if (north) {
      const id = edgeId(node.id, north.id);
      edges.push({
        id,
        from: node.id,
        to: north.id,
        baseCost: spacing,
        traffic: trafficForEdge(id, profile),
      });
    }
  }
  return edges;
}

function buildAdjacency(
  nodes: ReadonlyArray<RoadNode>,
  edges: ReadonlyArray<RoadEdge>,
): ReadonlyMap<string, ReadonlyArray<string>> {
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.from)!.push(e.to);
    adj.get(e.to)!.push(e.from);
  }
  return adj;
}

function buildBuildings(
  occupied: ReadonlyArray<RoadNode>,
): ReadonlyArray<BuildingPlacement> {
  const blockCenters: Array<{ x: number; y: number }> = [];
  for (let gy = 0; gy < GRID_VALUES.length - 1; gy++) {
    for (let gx = 0; gx < GRID_VALUES.length - 1; gx++) {
      blockCenters.push({
        x: (GRID_VALUES[gx] + GRID_VALUES[gx + 1]) / 2,
        y: (GRID_VALUES[gy] + GRID_VALUES[gy + 1]) / 2,
      });
    }
  }

  const buildings: BuildingPlacement[] = [];
  for (let i = 0; i < blockCenters.length; i++) {
    const center = blockCenters[i];
    const heightSeed = ((i * 2654435761) >>> 0) % 1000;
    const height = 0.8 + (heightSeed / 1000) * 1.6;
    const hue = (i * 47) % 360;
    const tooCloseToNode = occupied.some(
      (n) =>
        Math.hypot(n.x - center.x, n.y - center.y) <
        MIN_PIN_SEPARATION + 0.3,
    );
    if (tooCloseToNode) continue;
    const tooCloseToBuilding = buildings.some(
      (b) =>
        Math.hypot(b.x - center.x, b.y - center.y) < MIN_BUILDING_SEPARATION,
    );
    if (tooCloseToBuilding) continue;
    buildings.push({
      id: `b_${i}`,
      x: center.x,
      y: center.y,
      height,
      footprint: 0.7,
      hue,
    });
  }
  return buildings;
}

function buildBounds(nodes: ReadonlyArray<RoadNode>): CityBounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }
  return { minX, maxX, minY, maxY };
}

export function buildCityLayout(
  profile: TrafficProfileName = 'midday',
): CityLayout {
  const nodes = buildNodes();
  const edges = buildEdges(nodes, profile);
  const adjacency = buildAdjacency(nodes, edges);
  const buildings = buildBuildings(nodes);
  const bounds = buildBounds(nodes);

  return {
    graph: { nodes, edges, adjacency },
    buildings,
    depotNodeId: DEPOT_ID,
    bounds,
    trafficProfile: profile,
  };
}

export function depotPoint(layout: CityLayout): { x: number; y: number } {
  const depot = layout.graph.nodes.find((n) => n.id === layout.depotNodeId);
  if (!depot) throw new Error('depot node missing from layout');
  return { x: depot.x, y: depot.y };
}

export function deliveriesFromLayout(
  layout: CityLayout,
): ReadonlyArray<DeliveryPoint> {
  return layout.graph.nodes
    .filter((n): n is RoadNode & { deliveryId: number; label: string } =>
      n.kind === 'delivery' &&
      typeof n.deliveryId === 'number' &&
      typeof n.label === 'string',
    )
    .sort((a, b) => a.deliveryId - b.deliveryId)
    .map((n) => ({
      id: n.deliveryId,
      label: n.label,
      nodeId: n.id,
      x: n.x,
      y: n.y,
    }));
}

export function computeShortestPaths(
  graph: RoadGraph,
  edges: ReadonlyArray<RoadEdge>,
): ShortestPathTable {
  const nodeIds = graph.nodes.map((n) => n.id);
  const index = new Map<string, number>();
  nodeIds.forEach((id, i) => index.set(id, i));

  const size = nodeIds.length;
  const dist: number[][] = Array.from({ length: size }, () =>
    new Array(size).fill(Infinity),
  );
  const next: Array<Array<string | null>> = Array.from({ length: size }, () =>
    new Array(size).fill(null),
  );

  for (let i = 0; i < size; i++) {
    dist[i][i] = 0;
    next[i][i] = nodeIds[i];
  }

  for (const e of edges) {
    const i = index.get(e.from)!;
    const j = index.get(e.to)!;
    const cost = e.baseCost * TRAFFIC_MULTIPLIER[e.traffic];
    if (cost < dist[i][j]) {
      dist[i][j] = cost;
      dist[j][i] = cost;
      next[i][j] = e.to;
      next[j][i] = e.from;
    }
  }

  for (let k = 0; k < size; k++) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const alt = dist[i][k] + dist[k][j];
        if (alt < dist[i][j]) {
          dist[i][j] = alt;
          next[i][j] = next[i][k];
        }
      }
    }
  }

  const distance = new Map<string, Map<string, number>>();
  const nextHop = new Map<string, Map<string, string>>();
  for (let i = 0; i < size; i++) {
    const dRow = new Map<string, number>();
    const nRow = new Map<string, string>();
    for (let j = 0; j < size; j++) {
      dRow.set(nodeIds[j], dist[i][j]);
      const hop = next[i][j];
      if (hop) nRow.set(nodeIds[j], hop);
    }
    distance.set(nodeIds[i], dRow);
    nextHop.set(nodeIds[i], nRow);
  }
  return { distance, nextHop };
}

export function reconstructPath(
  table: ShortestPathTable,
  from: string,
  to: string,
): ReadonlyArray<string> {
  if (from === to) return [from];
  const path: string[] = [from];
  let current = from;
  const safety = 256;
  for (let step = 0; step < safety; step++) {
    if (current === to) return path;
    const row = table.nextHop.get(current);
    if (!row) return [];
    const hop = row.get(to);
    if (!hop || hop === current) return [];
    path.push(hop);
    current = hop;
  }
  return [];
}

export interface CollisionReport {
  readonly ok: boolean;
  readonly issues: ReadonlyArray<string>;
}

export function assertNoCollisions(layout: CityLayout): CollisionReport {
  const issues: string[] = [];
  const pins = layout.graph.nodes.filter(
    (n) => n.kind === 'depot' || n.kind === 'delivery',
  );

  for (let i = 0; i < pins.length; i++) {
    for (let j = i + 1; j < pins.length; j++) {
      const d = Math.hypot(pins[i].x - pins[j].x, pins[i].y - pins[j].y);
      if (d < MIN_PIN_SEPARATION) {
        issues.push(
          `pins ${pins[i].id} and ${pins[j].id} too close: ${d.toFixed(2)}`,
        );
      }
    }
  }

  for (const pin of pins) {
    for (const b of layout.buildings) {
      const d = Math.hypot(pin.x - b.x, pin.y - b.y);
      if (d < MIN_PIN_SEPARATION) {
        issues.push(
          `pin ${pin.id} too close to building ${b.id}: ${d.toFixed(2)}`,
        );
      }
    }
  }

  for (let i = 0; i < layout.buildings.length; i++) {
    for (let j = i + 1; j < layout.buildings.length; j++) {
      const a = layout.buildings[i];
      const b = layout.buildings[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < MIN_BUILDING_SEPARATION) {
        issues.push(
          `buildings ${a.id} and ${b.id} too close: ${d.toFixed(2)}`,
        );
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

export const COLLISION_THRESHOLDS = {
  MIN_PIN_SEPARATION,
  MIN_BUILDING_SEPARATION,
} as const;

export interface RoutePolyline {
  readonly nodeIds: ReadonlyArray<string>;
  readonly points: ReadonlyArray<{ x: number; y: number }>;
}

export function polylineForRoute(
  layout: CityLayout,
  table: ShortestPathTable,
  nodeIdSequence: ReadonlyArray<string>,
): RoutePolyline {
  if (nodeIdSequence.length === 0) {
    return { nodeIds: [], points: [] };
  }
  const nodeById = new Map<string, RoadNode>(
    layout.graph.nodes.map((n) => [n.id, n]),
  );
  const nodeIds: string[] = [nodeIdSequence[0]];
  for (let i = 1; i < nodeIdSequence.length; i++) {
    const segment = reconstructPath(
      table,
      nodeIdSequence[i - 1],
      nodeIdSequence[i],
    );
    for (let s = 1; s < segment.length; s++) {
      nodeIds.push(segment[s]);
    }
  }
  const points = nodeIds
    .map((id) => nodeById.get(id))
    .filter((n): n is RoadNode => n !== undefined)
    .map((n) => ({ x: n.x, y: n.y }));
  return { nodeIds, points };
}
