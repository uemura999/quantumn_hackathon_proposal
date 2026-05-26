export interface QaoaParams {
  readonly gamma: number;
  readonly beta: number;
  readonly reps: number;
}

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface DeliveryPoint extends Point2D {
  readonly id: number;
  readonly label: string;
  readonly nodeId: string;
}

export type TrafficLevel = 'clear' | 'light' | 'moderate' | 'heavy';

export interface RoadNode extends Point2D {
  readonly id: string;
  readonly kind: 'depot' | 'delivery' | 'intersection';
  readonly label?: string;
  readonly deliveryId?: number;
}

export interface RoadEdge {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly baseCost: number;
  readonly traffic: TrafficLevel;
}

export interface BuildingPlacement {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly footprint: number;
  readonly hue: number;
}

export interface CityBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

export interface RoadGraph {
  readonly nodes: ReadonlyArray<RoadNode>;
  readonly edges: ReadonlyArray<RoadEdge>;
  readonly adjacency: ReadonlyMap<string, ReadonlyArray<string>>;
}

export interface CityLayout {
  readonly graph: RoadGraph;
  readonly buildings: ReadonlyArray<BuildingPlacement>;
  readonly depotNodeId: string;
  readonly bounds: CityBounds;
  readonly trafficProfile: string;
}

export interface ShortestPathTable {
  readonly distance: ReadonlyMap<string, ReadonlyMap<string, number>>;
  readonly nextHop: ReadonlyMap<string, ReadonlyMap<string, string>>;
}

export interface CityProblem {
  readonly depot: Point2D;
  readonly deliveries: ReadonlyArray<DeliveryPoint>;
  readonly layout: CityLayout;
  readonly shortestPaths: ShortestPathTable;
}

export interface RouteCandidate {
  readonly order: ReadonlyArray<number>;
  readonly distance: number;
  readonly probability: number;
  readonly distanceRank: number;
  readonly deltaFromOptimal: number;
  readonly isValid: boolean;
}

export interface QaoaResult {
  readonly distribution: ReadonlyArray<RouteCandidate>;
  readonly bestValid: RouteCandidate | null;
  readonly expectedDistance: number;
  readonly elapsedMs: number;
  readonly params: QaoaParams;
  readonly trafficProfile: string;
  readonly uniformProbability: number;
  readonly topAmplification: number;
  readonly probabilityHistory: ReadonlyArray<ReadonlyArray<number>>;
}

export const TRAFFIC_MULTIPLIER: Readonly<Record<TrafficLevel, number>> = {
  clear: 1.0,
  light: 1.25,
  moderate: 1.7,
  heavy: 2.4,
};
