'use client';

import { useMemo } from 'react';
import { Color, MeshStandardMaterial } from 'three';
import type { BuildingPlacement, CityBounds } from '@/engine/types';

interface CityGridProps {
  readonly buildings: ReadonlyArray<BuildingPlacement>;
  readonly bounds: CityBounds;
}

export function CityGrid({ buildings, bounds }: CityGridProps) {
  const groundMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color('#E8E1D2'),
        roughness: 0.95,
        metalness: 0.02,
      }),
    [],
  );

  const buildingMaterials = useMemo(() => {
    return buildings.map(
      (b) =>
        new MeshStandardMaterial({
          color: new Color().setHSL(
            ((b.hue + 200) % 360) / 360,
            0.18,
            0.32 + (b.height / 4) * 0.12,
          ),
          roughness: 0.62,
          metalness: 0.08,
        }),
    );
  }, [buildings]);

  const padding = 2.4;
  const width = bounds.maxX - bounds.minX + padding * 2;
  const depth = bounds.maxY - bounds.minY + padding * 2;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerZ = (bounds.minY + bounds.maxY) / 2;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[centerX, -0.02, centerZ]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <primitive object={groundMaterial} attach="material" />
      </mesh>

      {buildings.map((b, i) => (
        <mesh
          key={b.id}
          position={[b.x, b.height / 2, b.y]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[b.footprint * 2, b.height, b.footprint * 2]} />
          <primitive object={buildingMaterials[i]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
