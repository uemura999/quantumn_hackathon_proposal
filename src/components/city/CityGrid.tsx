'use client';

import { useMemo } from 'react';
import { Color, MeshStandardMaterial } from 'three';

interface CityGridProps {
  readonly extent?: number;
}

const BUILDING_SEED: ReadonlyArray<{
  x: number;
  z: number;
  h: number;
}> = [
  { x: -4.5, z: -4.5, h: 1.4 },
  { x: -4.5, z: -2, h: 0.9 },
  { x: -4.5, z: 1, h: 1.8 },
  { x: -4.5, z: 4, h: 1.1 },
  { x: -2, z: -4.5, h: 1.2 },
  { x: -2, z: 4.5, h: 0.8 },
  { x: 1.5, z: -4.5, h: 1.6 },
  { x: 1.5, z: 4, h: 1.3 },
  { x: 4.2, z: -4.5, h: 0.9 },
  { x: 4.2, z: -2, h: 1.4 },
  { x: 4.2, z: 1.5, h: 1.0 },
  { x: 4.2, z: 4.2, h: 1.7 },
  { x: 0, z: -2.5, h: 0.6 },
  { x: 0, z: 2.5, h: 0.5 },
];

export function CityGrid({ extent = 6 }: CityGridProps) {
  const groundMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color('#E8E1D2'),
        roughness: 0.95,
        metalness: 0.02,
      }),
    [],
  );

  const buildingMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color('#3A4564'),
        roughness: 0.6,
        metalness: 0.1,
      }),
    [],
  );

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[extent * 2, extent * 2]} />
        <primitive object={groundMaterial} attach="material" />
      </mesh>

      <gridHelper
        args={[extent * 2, 12, '#A89F8D', '#C8C0B0']}
        position={[0, 0, 0]}
      />

      {BUILDING_SEED.map((b, i) => (
        <mesh
          key={i}
          position={[b.x, b.h / 2, b.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.0, b.h, 1.0]} />
          <primitive object={buildingMaterial} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
