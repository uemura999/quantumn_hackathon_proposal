'use client';

import { Line } from '@react-three/drei';

interface HighlightedRouteLineProps {
  readonly points: ReadonlyArray<[number, number, number]>;
  readonly color?: string;
  readonly haloColor?: string;
  readonly lineWidth?: number;
  readonly haloWidth?: number;
  readonly opacity?: number;
  readonly renderOrder?: number;
}

export const ROUTE_HIGHLIGHT_Y = 0.24;
export const ROUTE_HIGHLIGHT_COLOR = '#142144';
export const ROUTE_HIGHLIGHT_HALO_COLOR = '#F8FAF5';

export function HighlightedRouteLine({
  points,
  color = ROUTE_HIGHLIGHT_COLOR,
  haloColor = ROUTE_HIGHLIGHT_HALO_COLOR,
  lineWidth = 5.5,
  haloWidth = 10,
  opacity = 1,
  renderOrder = 30,
}: HighlightedRouteLineProps) {
  if (points.length < 2) return null;

  return (
    <group renderOrder={renderOrder}>
      <Line
        points={points}
        color={haloColor}
        lineWidth={haloWidth}
        transparent
        opacity={0.92}
        depthTest={false}
        depthWrite={false}
        renderOrder={renderOrder}
      />
      <Line
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
        depthTest={false}
        depthWrite={false}
        renderOrder={renderOrder + 1}
      />
    </group>
  );
}
