// ─────────────────────────────────────────────────────────────
//  orbital.models.ts
//  Tipos e dados estáticos do visualizador de orbitais quânticos
// ─────────────────────────────────────────────────────────────
export type ViewMode = 'cloud' | 'surface';
export type DensityPlane = 'XY' | 'XZ' | 'YZ';
export type OrbitalGroup = 's' | 'p' | 'd' | 'f';

export interface OrbitalDef {
  label: string; // identificador único, ex: '2px'
  tex: string; // texto display, ex: '2pₓ'
  n: number;
  l: number;
  m: number;
  g: OrbitalGroup;
}

export interface OrbitalInfoData {
  shape: string;
  radialNodes: (n: number) => number;
  desc: string;
}

// ── Convenção de m usada neste projeto ────────────────────────
// Os orbitais reais (combinações lineares de harmônicos esféricos
// complexos) não têm um "m" físico único — aqui o campo m é usado
// apenas como identificador para diferenciar as formas reais dentro
// de cada subcamada, seguindo sempre a mesma convenção por grupo:
//   p: pz=0, px=1, py=-1
//   d: dz2=0, dxz=1, dyz=-1, dxy=2, dx²-y²=-2
//   f: fz3=0, fxz2=1, fyz2=-1, fxyz=2, fz(x²-y²)=-2, fx(x²-3y²)=3, fy(3x²-y²)=-3
// Isso garante que, para qualquer n, o conjunto de m usado é sempre
// {-l, ..., l} completo — o mesmo conjunto que o cálculo por número
// atômico (regra de Hund) percorre ao determinar o último elétron
// diferenciador. Assim, o .find() por (n, l, m, g) sempre tem chance
// de bater com uma entrada real deste array.

// ── Lista completa de orbitais ────────────────────────────────
export const ORBITALS: OrbitalDef[] = [
  // ── s (n = 1 a 7) ────────────────────────────────────────
  { label: '1s', tex: '1s', n: 1, l: 0, m: 0, g: 's' },
  { label: '2s', tex: '2s', n: 2, l: 0, m: 0, g: 's' },
  { label: '3s', tex: '3s', n: 3, l: 0, m: 0, g: 's' },
  { label: '4s', tex: '4s', n: 4, l: 0, m: 0, g: 's' },
  { label: '5s', tex: '5s', n: 5, l: 0, m: 0, g: 's' },
  { label: '6s', tex: '6s', n: 6, l: 0, m: 0, g: 's' },
  { label: '7s', tex: '7s', n: 7, l: 0, m: 0, g: 's' },

  // ── p (n = 2 a 7) ────────────────────────────────────────
  { label: '2px', tex: '2p\u2093', n: 2, l: 1, m: 1, g: 'p' },
  { label: '2py', tex: '2p\u1D67', n: 2, l: 1, m: -1, g: 'p' },
  { label: '2pz', tex: '2p\u1D69', n: 2, l: 1, m: 0, g: 'p' },

  { label: '3px', tex: '3p\u2093', n: 3, l: 1, m: 1, g: 'p' },
  { label: '3py', tex: '3p\u1D67', n: 3, l: 1, m: -1, g: 'p' },
  { label: '3pz', tex: '3p\u1D69', n: 3, l: 1, m: 0, g: 'p' },

  { label: '4px', tex: '4p\u2093', n: 4, l: 1, m: 1, g: 'p' },
  { label: '4py', tex: '4p\u1D67', n: 4, l: 1, m: -1, g: 'p' },
  { label: '4pz', tex: '4p\u1D69', n: 4, l: 1, m: 0, g: 'p' },

  { label: '5px', tex: '5p\u2093', n: 5, l: 1, m: 1, g: 'p' },
  { label: '5py', tex: '5p\u1D67', n: 5, l: 1, m: -1, g: 'p' },
  { label: '5pz', tex: '5p\u1D69', n: 5, l: 1, m: 0, g: 'p' },

  { label: '6px', tex: '6p\u2093', n: 6, l: 1, m: 1, g: 'p' },
  { label: '6py', tex: '6p\u1D67', n: 6, l: 1, m: -1, g: 'p' },
  { label: '6pz', tex: '6p\u1D69', n: 6, l: 1, m: 0, g: 'p' },

  { label: '7px', tex: '7p\u2093', n: 7, l: 1, m: 1, g: 'p' },
  { label: '7py', tex: '7p\u1D67', n: 7, l: 1, m: -1, g: 'p' },
  { label: '7pz', tex: '7p\u1D69', n: 7, l: 1, m: 0, g: 'p' },

  // ── d (n = 3 a 6; conjunto completo de 5 orbitais por n) ──
  { label: '3dz2', tex: '3dz²', n: 3, l: 2, m: 0, g: 'd' },
  { label: '3dxz', tex: '3dxz', n: 3, l: 2, m: 1, g: 'd' },
  { label: '3dyz', tex: '3dyz', n: 3, l: 2, m: -1, g: 'd' },
  { label: '3dxy', tex: '3dxy', n: 3, l: 2, m: 2, g: 'd' },
  { label: '3dx2y2', tex: '3dx²y²', n: 3, l: 2, m: -2, g: 'd' },

  { label: '4dz2', tex: '4dz²', n: 4, l: 2, m: 0, g: 'd' },
  { label: '4dxz', tex: '4dxz', n: 4, l: 2, m: 1, g: 'd' },
  { label: '4dyz', tex: '4dyz', n: 4, l: 2, m: -1, g: 'd' },
  { label: '4dxy', tex: '4dxy', n: 4, l: 2, m: 2, g: 'd' },
  { label: '4dx2y2', tex: '4dx²y²', n: 4, l: 2, m: -2, g: 'd' },

  { label: '5dz2', tex: '5dz²', n: 5, l: 2, m: 0, g: 'd' },
  { label: '5dxz', tex: '5dxz', n: 5, l: 2, m: 1, g: 'd' },
  { label: '5dyz', tex: '5dyz', n: 5, l: 2, m: -1, g: 'd' },
  { label: '5dxy', tex: '5dxy', n: 5, l: 2, m: 2, g: 'd' },
  { label: '5dx2y2', tex: '5dx²y²', n: 5, l: 2, m: -2, g: 'd' },

  { label: '6dz2', tex: '6dz²', n: 6, l: 2, m: 0, g: 'd' },
  { label: '6dxz', tex: '6dxz', n: 6, l: 2, m: 1, g: 'd' },
  { label: '6dyz', tex: '6dyz', n: 6, l: 2, m: -1, g: 'd' },
  { label: '6dxy', tex: '6dxy', n: 6, l: 2, m: 2, g: 'd' },
  { label: '6dx2y2', tex: '6dx²y²', n: 6, l: 2, m: -2, g: 'd' },

  // ── f (n = 4 a 5; conjunto completo de 7 orbitais por n) ──
  { label: '4fz3', tex: '4fz³', n: 4, l: 3, m: 0, g: 'f' },
  { label: '4fxz2', tex: '4fxz²', n: 4, l: 3, m: 1, g: 'f' },
  { label: '4fyz2', tex: '4fyz²', n: 4, l: 3, m: -1, g: 'f' },
  { label: '4fxyz', tex: '4fxyz', n: 4, l: 3, m: 2, g: 'f' },
  { label: '4fzx2y2', tex: '4fz(x²-y²)', n: 4, l: 3, m: -2, g: 'f' },
  { label: '4fx3y2', tex: '4fx(x²-3y²)', n: 4, l: 3, m: 3, g: 'f' },
  { label: '4fy3x2', tex: '4fy(3x²-y²)', n: 4, l: 3, m: -3, g: 'f' },

  { label: '5fz3', tex: '5fz³', n: 5, l: 3, m: 0, g: 'f' },
  { label: '5fxz2', tex: '5fxz²', n: 5, l: 3, m: 1, g: 'f' },
  { label: '5fyz2', tex: '5fyz²', n: 5, l: 3, m: -1, g: 'f' },
  { label: '5fxyz', tex: '5fxyz', n: 5, l: 3, m: 2, g: 'f' },
  { label: '5fzx2y2', tex: '5fz(x²-y²)', n: 5, l: 3, m: -2, g: 'f' },
  { label: '5fx3y2', tex: '5fx(x²-3y²)', n: 5, l: 3, m: 3, g: 'f' },
  { label: '5fy3x2', tex: '5fy(3x²-y²)', n: 5, l: 3, m: -3, g: 'f' },
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
