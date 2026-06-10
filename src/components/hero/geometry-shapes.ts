/**
 * Wireframe geometry definitions for the hero geometry system (Phase 6.1).
 *
 * Each shape is a hand-authored 2D projection of a polyhedron in a 0..100
 * coordinate space, drawn as line-art (edges) + vertex dots. These read as
 * premium "financial / efficiency" geometry rather than a hacker grid.
 *
 * Strokes use `vector-effect="non-scaling-stroke"` at render time so every
 * shape keeps a consistent ~1.5px line weight regardless of pixel size.
 */
export type GeometryType =
  | 'icosahedron'
  | 'octahedron'
  | 'cube'
  | 'tetrahedron'
  | 'prism';

/** [x1, y1, x2, y2] in a 0..100 viewBox. */
export type Edge = readonly [number, number, number, number];
/** [cx, cy] in a 0..100 viewBox. */
export type Vertex = readonly [number, number];

export interface ShapeDefinition {
  readonly edges: readonly Edge[];
  readonly vertices: readonly Vertex[];
}

export const GEOMETRY_SHAPES: Record<GeometryType, ShapeDefinition> = {
  // Two square pyramids base-to-base, viewed at a slight 3/4 angle.
  octahedron: {
    edges: [
      // equatorial square (in perspective)
      [14, 50, 50, 36],
      [50, 36, 86, 50],
      [86, 50, 50, 64],
      [50, 64, 14, 50],
      // top apex
      [50, 8, 14, 50],
      [50, 8, 50, 36],
      [50, 8, 86, 50],
      [50, 8, 50, 64],
      // bottom apex
      [50, 92, 14, 50],
      [50, 92, 50, 36],
      [50, 92, 86, 50],
      [50, 92, 50, 64],
    ],
    vertices: [
      [50, 8],
      [50, 92],
      [14, 50],
      [86, 50],
      [50, 36],
      [50, 64],
    ],
  },

  // Classic two-square cube with offset back face.
  cube: {
    edges: [
      // front face
      [28, 38, 68, 38],
      [68, 38, 68, 78],
      [68, 78, 28, 78],
      [28, 78, 28, 38],
      // back face
      [44, 24, 84, 24],
      [84, 24, 84, 64],
      [84, 64, 44, 64],
      [44, 64, 44, 24],
      // connectors
      [28, 38, 44, 24],
      [68, 38, 84, 24],
      [68, 78, 84, 64],
      [28, 78, 44, 64],
    ],
    vertices: [
      [28, 38],
      [68, 38],
      [68, 78],
      [28, 78],
      [44, 24],
      [84, 24],
      [84, 64],
      [44, 64],
    ],
  },

  // Tetrahedron in 3/4 view (apex up, triangular base toward viewer).
  tetrahedron: {
    edges: [
      [50, 10, 16, 82],
      [50, 10, 84, 82],
      [50, 10, 50, 66],
      [16, 82, 84, 82],
      [84, 82, 50, 66],
      [50, 66, 16, 82],
    ],
    vertices: [
      [50, 10],
      [16, 82],
      [84, 82],
      [50, 66],
    ],
  },

  // Triangular prism — two offset triangles connected.
  prism: {
    edges: [
      // front triangle
      [20, 40, 54, 40],
      [54, 40, 37, 72],
      [37, 72, 20, 40],
      // back triangle
      [46, 26, 80, 26],
      [80, 26, 63, 58],
      [63, 58, 46, 26],
      // connectors
      [20, 40, 46, 26],
      [54, 40, 80, 26],
      [37, 72, 63, 58],
    ],
    vertices: [
      [20, 40],
      [54, 40],
      [37, 72],
      [46, 26],
      [80, 26],
      [63, 58],
    ],
  },

  // Faceted ball — hexagon silhouette + crossing diagonals (icosahedron-ish).
  icosahedron: {
    edges: [
      // hexagon outline
      [50, 8, 87, 29],
      [87, 29, 87, 71],
      [87, 71, 50, 92],
      [50, 92, 13, 71],
      [13, 71, 13, 29],
      [13, 29, 50, 8],
      // main diagonals through centre
      [50, 8, 50, 92],
      [87, 29, 13, 71],
      [13, 29, 87, 71],
      // inner facet triangle
      [50, 30, 33, 62],
      [33, 62, 67, 62],
      [67, 62, 50, 30],
    ],
    vertices: [
      [50, 8],
      [87, 29],
      [87, 71],
      [50, 92],
      [13, 71],
      [13, 29],
    ],
  },
};
