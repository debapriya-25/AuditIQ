/**
 * Wireframe geometry definitions for the hero geometry system.
 *
 * Two kinds of shapes live here:
 *  1. Hand-authored 2D projections of simple polyhedra (octahedron, cube,
 *     tetrahedron, prism, icosahedron) — premium "financial / efficiency"
 *     line-art accents.
 *  2. Computed TRUE-3D polyhedra (geodesic sphere, dodecahedron): real 3D
 *     vertices, rotated into a 3/4 view, perspective-projected, with edges split
 *     into front (full opacity) and rear (`backEdges`, reduced opacity) so they
 *     read as solid objects with visible front and back structure.
 *
 * Strokes use `vector-effect="non-scaling-stroke"` at render time so every shape
 * keeps a consistent ~1.5px line weight regardless of pixel size.
 */
export type GeometryType =
  | 'icosahedron'
  | 'octahedron'
  | 'cube'
  | 'tetrahedron'
  | 'prism'
  | 'dodecahedron'
  | 'geosphere';

/** [x1, y1, x2, y2] in a 0..100 viewBox. */
export type Edge = readonly [number, number, number, number];
/** [cx, cy] in a 0..100 viewBox. */
export type Vertex = readonly [number, number];

export interface ShapeDefinition {
  readonly edges: readonly Edge[];
  readonly vertices: readonly Vertex[];
  /** Rear edges of a true-3D shape — drawn behind, at reduced opacity. */
  readonly backEdges?: readonly Edge[];
}

/* ──────────────────────────────────────────────────────
   True-3D polyhedron generator
   ────────────────────────────────────────────────────── */

type Vec3 = readonly [number, number, number];
type EdgeIdx = readonly [number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
const INV_PHI = 1 / PHI;

/**
 * Rotates each vertex into a 3/4 view, perspective-projects to a 0..100 viewBox,
 * and splits edges into front / rear by their average depth. The result reads as
 * a genuine 3D object rather than a flat outline.
 */
function generatePolyhedron(
  verts: readonly Vec3[],
  edges: readonly EdgeIdx[],
  rotX: number,
  rotY: number
): ShapeDefinition {
  const cx = Math.cos(rotX);
  const sx = Math.sin(rotX);
  const cy = Math.cos(rotY);
  const sy = Math.sin(rotY);
  const dist = 3.2; // camera distance (sphere radius = 1)
  const scale = 35; // viewBox units

  const rounded = (n: number) => Math.round(n * 100) / 100;

  const rotated: Vec3[] = verts.map(([x, y, z]) => {
    const m = Math.hypot(x, y, z) || 1;
    const ux = x / m;
    const uy = y / m;
    const uz = z / m;
    // rotate around X then around Y
    const ry = uy * cx - uz * sx;
    const rz = uy * sx + uz * cx;
    const rxv = ux * cy + rz * sy;
    const rzv = -ux * sy + rz * cy;
    return [rxv, ry, rzv];
  });

  const projected: Vertex[] = rotated.map(([x, y, z]) => {
    const p = dist / (dist - z);
    return [rounded(50 + x * p * scale), rounded(50 - y * p * scale)];
  });

  const frontEdges: Edge[] = [];
  const backEdges: Edge[] = [];
  for (const [a, b] of edges) {
    const pa = projected[a];
    const pb = projected[b];
    const va = rotated[a];
    const vb = rotated[b];
    if (!pa || !pb || !va || !vb) continue;
    const edge: Edge = [pa[0], pa[1], pb[0], pb[1]];
    if ((va[2] + vb[2]) / 2 < 0) backEdges.push(edge);
    else frontEdges.push(edge);
  }

  // Dot only the front-facing vertices to reinforce depth.
  const vertices: Vertex[] = [];
  rotated.forEach((v, i) => {
    const p = projected[i];
    if (p && v[2] >= -0.08) vertices.push(p);
  });

  return { edges: frontEdges, backEdges, vertices };
}

// Regular icosahedron (12 vertices, 30 edges) → reads as a geodesic sphere.
const ICOSA_VERTS: Vec3[] = [
  [0, 1, PHI], [0, 1, -PHI], [0, -1, PHI], [0, -1, -PHI],
  [1, PHI, 0], [1, -PHI, 0], [-1, PHI, 0], [-1, -PHI, 0],
  [PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, 1], [-PHI, 0, -1],
];
const ICOSA_EDGES: EdgeIdx[] = [
  [0, 2], [0, 4], [0, 6], [0, 8], [0, 10],
  [1, 3], [1, 4], [1, 6], [1, 9], [1, 11],
  [2, 5], [2, 7], [2, 8], [2, 10],
  [3, 5], [3, 7], [3, 9], [3, 11],
  [4, 6], [4, 8], [4, 9],
  [5, 7], [5, 8], [5, 9],
  [6, 10], [6, 11],
  [7, 10], [7, 11],
  [8, 9], [10, 11],
];

// Regular dodecahedron (20 vertices, 30 edges).
const DODECA_VERTS: Vec3[] = [
  [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
  [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
  [0, INV_PHI, PHI], [0, INV_PHI, -PHI], [0, -INV_PHI, PHI], [0, -INV_PHI, -PHI],
  [INV_PHI, PHI, 0], [INV_PHI, -PHI, 0], [-INV_PHI, PHI, 0], [-INV_PHI, -PHI, 0],
  [PHI, 0, INV_PHI], [PHI, 0, -INV_PHI], [-PHI, 0, INV_PHI], [-PHI, 0, -INV_PHI],
];
const DODECA_EDGES: EdgeIdx[] = [
  [0, 8], [0, 12], [0, 16],
  [1, 9], [1, 12], [1, 17],
  [2, 10], [2, 13], [2, 16],
  [3, 11], [3, 13], [3, 17],
  [4, 8], [4, 14], [4, 18],
  [5, 9], [5, 14], [5, 19],
  [6, 10], [6, 15], [6, 18],
  [7, 11], [7, 15], [7, 19],
  [8, 10], [9, 11], [12, 14], [13, 15], [16, 17], [18, 19],
];

export const GEOMETRY_SHAPES: Record<GeometryType, ShapeDefinition> = {
  // Two square pyramids base-to-base, viewed at a slight 3/4 angle.
  octahedron: {
    edges: [
      [14, 50, 50, 36],
      [50, 36, 86, 50],
      [86, 50, 50, 64],
      [50, 64, 14, 50],
      [50, 8, 14, 50],
      [50, 8, 50, 36],
      [50, 8, 86, 50],
      [50, 8, 50, 64],
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
      [28, 38, 68, 38],
      [68, 38, 68, 78],
      [68, 78, 28, 78],
      [28, 78, 28, 38],
      [44, 24, 84, 24],
      [84, 24, 84, 64],
      [84, 64, 44, 64],
      [44, 64, 44, 24],
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
      [20, 40, 54, 40],
      [54, 40, 37, 72],
      [37, 72, 20, 40],
      [46, 26, 80, 26],
      [80, 26, 63, 58],
      [63, 58, 46, 26],
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
      [50, 8, 87, 29],
      [87, 29, 87, 71],
      [87, 71, 50, 92],
      [50, 92, 13, 71],
      [13, 71, 13, 29],
      [13, 29, 50, 8],
      [50, 8, 50, 92],
      [87, 29, 13, 71],
      [13, 29, 87, 71],
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

  // True-3D objects (computed: rotation + perspective + front/back split).
  geosphere: generatePolyhedron(ICOSA_VERTS, ICOSA_EDGES, -0.46, 0.55),
  dodecahedron: generatePolyhedron(DODECA_VERTS, DODECA_EDGES, -0.36, 0.64),
};
