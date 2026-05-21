'use client';

import { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { CityProblem } from '@/engine/types';

interface DeliveryPinsProps {
  readonly problem: CityProblem;
  readonly visitedIds?: ReadonlySet<number>;
  readonly nextPickId?: number | null;
  readonly onPinClick?: (deliveryId: number) => void;
}

const ACCENT = '#D97757';
const DEPOT_COLOR = '#0F1B3D';
const VISITED_COLOR = '#9DBDB4';
const NEXT_COLOR = '#FFD37A';

export function DeliveryPins({
  problem,
  visitedIds,
  nextPickId,
  onPinClick,
}: DeliveryPinsProps) {
  const interactive = useMemo(
    () => onPinClick !== undefined,
    [onPinClick],
  );

  return (
    <group>
      <mesh position={[problem.depot.x, 0.4, problem.depot.y]}>
        <cylinderGeometry args={[0.45, 0.5, 0.8, 12]} />
        <meshStandardMaterial
          color={DEPOT_COLOR}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[problem.depot.x, 0.95, problem.depot.y]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.6}
        />
      </mesh>

      {problem.deliveries.map((d) => {
        const isVisited = visitedIds?.has(d.id) ?? false;
        const isNext = nextPickId === d.id;
        const color = isVisited ? VISITED_COLOR : isNext ? NEXT_COLOR : ACCENT;
        const emissive = isNext ? NEXT_COLOR : isVisited ? VISITED_COLOR : ACCENT;
        const emissiveIntensity = isNext ? 0.9 : 0.35;
        const scale = isNext ? 1.15 : 1;

        const handleClick = (e: ThreeEvent<MouseEvent>): void => {
          if (!onPinClick) return;
          e.stopPropagation();
          onPinClick(d.id);
        };

        const handlePointerOver = (e: ThreeEvent<PointerEvent>): void => {
          if (!interactive) return;
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        };

        const handlePointerOut = (): void => {
          if (!interactive) return;
          document.body.style.cursor = '';
        };

        return (
          <group
            key={d.id}
            position={[d.x, 0, d.y]}
            scale={scale}
            onClick={interactive ? handleClick : undefined}
            onPointerOver={interactive ? handlePointerOver : undefined}
            onPointerOut={interactive ? handlePointerOut : undefined}
          >
            <mesh position={[0, 0.6, 0]}>
              <coneGeometry args={[0.25, 0.9, 12]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <torusGeometry args={[0.32, 0.06, 8, 24]} />
              <meshStandardMaterial color={color} emissiveIntensity={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
