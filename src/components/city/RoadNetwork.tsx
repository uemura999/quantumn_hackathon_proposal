'use client';

import { useMemo } from 'react';
import { Color, MeshStandardMaterial } from 'three';
import type { RoadEdge, RoadGraph, TrafficLevel } from '@/engine/types';

interface RoadNetworkProps {
  readonly graph: RoadGraph;
  readonly showTraffic?: boolean;
  readonly roadWidth?: number;
}

const TRAFFIC_COLOR: Readonly<Record<TrafficLevel, string>> = {
  clear: '#A6BFA8',
  light: '#D7C76A',
  moderate: '#E69B4B',
  heavy: '#C8533C',
};

const BASE_ROAD_COLOR = '#7E7464';

interface EdgeRender {
  readonly edge: RoadEdge;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly length: number;
  readonly angle: number;
}

export function RoadNetwork({
  graph,
  showTraffic = true,
  roadWidth = 0.55,
}: RoadNetworkProps) {
  const renders = useMemo<ReadonlyArray<EdgeRender>>(() => {
    const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
    return graph.edges
      .map((edge) => {
        const from = nodeById.get(edge.from);
        const to = nodeById.get(edge.to);
        if (!from || !to) return null;
        const dx = to.x - from.x;
        const dz = to.y - from.y;
        const length = Math.hypot(dx, dz);
        const cx = (from.x + to.x) / 2;
        const cz = (from.y + to.y) / 2;
        const angle = Math.atan2(dz, dx);
        return {
          edge,
          x: cx,
          y: 0.005,
          z: cz,
          length,
          angle,
        };
      })
      .filter((r): r is EdgeRender => r !== null);
  }, [graph]);

  const baseMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(BASE_ROAD_COLOR),
        roughness: 0.9,
        metalness: 0.05,
      }),
    [],
  );

  return (
    <group>
      {renders.map((r) => (
        <group
          key={r.edge.id}
          position={[r.x, r.y, r.z]}
          rotation={[0, -r.angle, 0]}
        >
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[r.length + 0.1, roadWidth]} />
            <primitive object={baseMaterial} attach="material" />
          </mesh>
          {showTraffic && (
            <mesh
              receiveShadow
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.005, 0]}
            >
              <planeGeometry args={[r.length + 0.1, roadWidth * 0.55]} />
              <meshStandardMaterial
                color={TRAFFIC_COLOR[r.edge.traffic]}
                roughness={0.55}
                metalness={0.05}
                emissive={TRAFFIC_COLOR[r.edge.traffic]}
                emissiveIntensity={
                  r.edge.traffic === 'heavy'
                    ? 0.45
                    : r.edge.traffic === 'moderate'
                      ? 0.28
                      : r.edge.traffic === 'light'
                        ? 0.15
                        : 0.08
                }
                transparent
                opacity={0.92}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export const TRAFFIC_PALETTE = TRAFFIC_COLOR;
