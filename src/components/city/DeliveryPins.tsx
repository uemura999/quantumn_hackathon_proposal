'use client';

import type { CityProblem } from '@/engine/types';

interface DeliveryPinsProps {
  readonly problem: CityProblem;
}

const ACCENT = '#D97757';
const DEPOT_COLOR = '#0F1B3D';

export function DeliveryPins({ problem }: DeliveryPinsProps) {
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

      {problem.deliveries.map((d) => (
        <group key={d.id} position={[d.x, 0, d.y]}>
          <mesh position={[0, 0.6, 0]}>
            <coneGeometry args={[0.25, 0.9, 12]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.35}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <torusGeometry args={[0.32, 0.06, 8, 24]} />
            <meshStandardMaterial color={ACCENT} emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
