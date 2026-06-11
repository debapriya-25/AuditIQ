import { describe, it, expect } from 'vitest';
import { GEOMETRY_SHAPES } from '../components/hero/geometry-shapes';

describe('3D geometry generation', () => {
  for (const key of ['geosphere', 'dodecahedron'] as const) {
    it(`${key} is a valid true-3D wireframe (front + rear edges, in-range)`, () => {
      const shape = GEOMETRY_SHAPES[key];

      // Both an icosahedron and a dodecahedron have exactly 30 edges.
      const all = [...shape.edges, ...(shape.backEdges ?? [])];
      expect(all.length).toBe(30);

      // True 3D: some edges face the viewer, some are behind (rear).
      expect(shape.edges.length).toBeGreaterThan(0);
      expect(shape.backEdges?.length ?? 0).toBeGreaterThan(0);

      // Coordinates are finite and sit within (roughly) the 0..100 viewBox.
      for (const e of all) {
        for (const c of e) {
          expect(Number.isFinite(c)).toBe(true);
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThanOrEqual(100);
        }
      }

      // Front-facing vertices are dotted.
      expect(shape.vertices.length).toBeGreaterThan(0);
    });
  }
});
