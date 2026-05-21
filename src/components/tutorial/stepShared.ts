import type { ComponentType } from 'react';
import type { CityProblem, RouteCandidate } from '@/engine/types';

export interface CitySceneShape {
  readonly problem: CityProblem;
  readonly distribution: ReadonlyArray<RouteCandidate>;
  readonly truckRoute: RouteCandidate | null;
  readonly truckRunning: boolean;
  readonly pulsing: boolean;
  readonly onTruckComplete?: () => void;
  readonly showLabels?: boolean;
  readonly visitedIds?: ReadonlySet<number>;
  readonly nextPickId?: number | null;
  readonly onPinClick?: (deliveryId: number) => void;
  readonly manualRouteOrder?: ReadonlyArray<number>;
}

export type CitySceneComponent = ComponentType<CitySceneShape>;

export interface StepBaseProps {
  readonly problem: CityProblem;
  readonly CityScene: CitySceneComponent;
}
