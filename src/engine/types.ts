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
}

export interface CityProblem {
  readonly depot: Point2D;
  readonly deliveries: ReadonlyArray<DeliveryPoint>;
}

export interface RouteCandidate {
  readonly order: ReadonlyArray<number>;
  readonly distance: number;
  readonly probability: number;
  readonly isValid: boolean;
}

export interface QaoaResult {
  readonly distribution: ReadonlyArray<RouteCandidate>;
  readonly bestValid: RouteCandidate | null;
  readonly elapsedMs: number;
  readonly params: QaoaParams;
}
