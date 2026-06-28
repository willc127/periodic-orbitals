// ─────────────────────────────────────────────────────────────
//  orbital.models.ts
//  Tipos e dados estáticos do visualizador de orbitais quânticos
// ─────────────────────────────────────────────────────────────

export type ViewMode     = 'cloud' | 'surface';
export type DensityPlane = 'XY' | 'XZ' | 'YZ';
export type OrbitalGroup = 's' | 'p' | 'd' | 'f';

export interface OrbitalDef {
  label: string;   // identificador único, ex: '2px'
  tex:   string;   // texto display, ex: '2pₓ'
  n:     number;
  l:     number;
  m:     number;
  g:     OrbitalGroup;
}

export interface OrbitalInfoData {
  shape: string;
  radialNodes: (n: number) => number;
  desc: string;
}

// ── Lista completa de orbitais ────────────────────────────────
export const ORBITALS: OrbitalDef[] = [
  // s
  { label: '1s',      tex: '1s',       n: 1, l: 0, m:  0, g: 's' },
  { label: '2s',      tex: '2s',       n: 2, l: 0, m:  0, g: 's' },
  { label: '3s',      tex: '3s',       n: 3, l: 0, m:  0, g: 's' },
  { label: '4s',      tex: '4s',       n: 4, l: 0, m:  0, g: 's' },
  // p
  { label: '2px',     tex: '2p\u2093', n: 2, l: 1, m:  1, g: 'p' },
  { label: '2py',     tex: '2p\u1D67', n: 2, l: 1, m: -1, g: 'p' },
  { label: '2pz',     tex: '2p\u1D69', n: 2, l: 1, m:  0, g: 'p' },
  { label: '3px',     tex: '3p\u2093', n: 3, l: 1, m:  1, g: 'p' },
  { label: '3py',     tex: '3p\u1D67', n: 3, l: 1, m: -1, g: 'p' },
  { label: '3pz',     tex: '3p\u1D69', n: 3, l: 1, m:  0, g: 'p' },
  // d
  { label: '3dz2',    tex: '3dz²',     n: 3, l: 2, m:  0, g: 'd' },
  { label: '3dxz',    tex: '3dxz',     n: 3, l: 2, m:  1, g: 'd' },
  { label: '3dyz',    tex: '3dyz',     n: 3, l: 2, m: -1, g: 'd' },
  { label: '3dxy',    tex: '3dxy',     n: 3, l: 2, m:  2, g: 'd' },
  { label: '3dx2y2',  tex: '3dx²y²',   n: 3, l: 2, m: -2, g: 'd' },
  { label: '4dz2',    tex: '4dz²',     n: 4, l: 2, m:  0, g: 'd' },
  { label: '4dxy',    tex: '4dxy',     n: 4, l: 2, m:  2, g: 'd' },
  // f
  { label: '4fz3',    tex: '4fz³',     n: 4, l: 3, m:  0, g: 'f' },
  { label: '4fxyz',   tex: '4fxyz',    n: 4, l: 3, m:  2, g: 'f' },
  { label: '4fyz2',   tex: '4fyz²',    n: 4, l: 3, m: -1, g: 'f' },
];

// ── Cores por grupo ───────────────────────────────────────────
export const GROUP_COLOR: Record<OrbitalGroup, string> = {
  s: '#4fa3e3',
  p: '#5ecf6e',
  d: '#f0a03c',
  f: '#c06ee8',
};

// ── Info educativa por grupo (Davidson/Blauch) ────────────────
export const ORBITAL_INFO: Record<OrbitalGroup, OrbitalInfoData> = {
  s: {
    shape: 'Esférico',
    radialNodes: (n) => n - 1,
    desc: 'Sem nó angular. Simetria esférica perfeita em torno do núcleo. Os nós radiais criam camadas concêntricas.',
  },
  p: {
    shape: 'Bilobar (haltere)',
    radialNodes: (n) => n - 2,
    desc: '1 plano nodal angular. Dois lóbulos opostos em relação ao núcleo. Orientações x, y, z.',
  },
  d: {
    shape: '4 lóbulos / toroidal',
    radialNodes: (n) => n - 3,
    desc: '2 planos nodais angulares (exceto dz², com cone nodal). Os 5 orbitais d têm formas distintas com n ≥ 3.',
  },
  f: {
    shape: 'Complexo multi-lobar',
    radialNodes: (n) => n - 4,
    desc: '3 planos/superfícies nodais angulares. Formas altamente direcionais. Aparecem a partir de n = 4.',
  },
};
