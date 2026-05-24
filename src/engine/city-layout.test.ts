import { describe, expect, it } from 'vitest';
import {
  assertNoCollisions,
  buildCityLayout,
  computeShortestPaths,
  deliveriesFromLayout,
  depotPoint,
  reconstructPath,
} from './city-layout';

describe('buildCityLayout', () => {
  it('builds a 25-node grid with the depot at origin', () => {
    const layout = buildCityLayout('midday');
    expect(layout.graph.nodes).toHaveLength(25);
    const depot = depotPoint(layout);
    expect(depot.x).toBe(0);
    expect(depot.y).toBe(0);
  });

  it('produces exactly 6 deliveries with unique ids', () => {
    const layout = buildCityLayout('midday');
    const deliveries = deliveriesFromLayout(layout);
    expect(deliveries).toHaveLength(6);
    const ids = new Set(deliveries.map((d) => d.id));
    expect(ids.size).toBe(6);
  });

  it('produces a fully connected road graph', () => {
    const layout = buildCityLayout('midday');
    const table = computeShortestPaths(layout.graph, layout.graph.edges);
    for (const a of layout.graph.nodes) {
      for (const b of layout.graph.nodes) {
        const d = table.distance.get(a.id)?.get(b.id);
        expect(d).toBeDefined();
        expect(Number.isFinite(d as number)).toBe(true);
      }
    }
  });

  it('changes traffic levels across profiles', () => {
    const morning = buildCityLayout('morning_rush');
    const midday = buildCityLayout('midday');
    const diffs = morning.graph.edges.reduce((acc, e, i) => {
      return acc + (e.traffic === midday.graph.edges[i].traffic ? 0 : 1);
    }, 0);
    expect(diffs).toBeGreaterThan(0);
  });

  it('is deterministic across calls', () => {
    const a = buildCityLayout('midday');
    const b = buildCityLayout('midday');
    expect(a.graph.edges.map((e) => e.traffic)).toEqual(
      b.graph.edges.map((e) => e.traffic),
    );
    expect(a.buildings.map((b2) => `${b2.x},${b2.y},${b2.height.toFixed(3)}`)).toEqual(
      b.buildings.map((b2) => `${b2.x},${b2.y},${b2.height.toFixed(3)}`),
    );
  });
});

describe('assertNoCollisions', () => {
  it('passes for the generated layout', () => {
    const layout = buildCityLayout('midday');
    const report = assertNoCollisions(layout);
    if (!report.ok) {
      throw new Error(
        `expected no collisions, got: ${report.issues.join('; ')}`,
      );
    }
    expect(report.ok).toBe(true);
  });
});

describe('reconstructPath', () => {
  it('returns the same node for self path', () => {
    const layout = buildCityLayout('midday');
    const table = computeShortestPaths(layout.graph, layout.graph.edges);
    expect(reconstructPath(table, 'depot', 'depot')).toEqual(['depot']);
  });

  it('returns a sequence of adjacent nodes for a known pair', () => {
    const layout = buildCityLayout('midday');
    const table = computeShortestPaths(layout.graph, layout.graph.edges);
    const deliveries = deliveriesFromLayout(layout);
    const target = deliveries[0];
    const path = reconstructPath(table, 'depot', target.nodeId);
    expect(path.length).toBeGreaterThanOrEqual(2);
    expect(path[0]).toBe('depot');
    expect(path[path.length - 1]).toBe(target.nodeId);
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      const neighbours = layout.graph.adjacency.get(a) ?? [];
      expect(neighbours).toContain(b);
    }
  });
});
