// ─────────────────────────────────────────────────────────────
//  orbital-surface.logica.ts
//  Funções puras (sem Angular / sem Three.js) do visualizador de
//  superfícies de orbitais atômicos. Tudo em unidades atômicas (a₀).
//
//  ψ_nlm(x,y,z) = N · (2Z/n)^l · e^(-ρ/2) · L^(2l+1)_(n-l-1)(ρ) · P_lm(x,y,z)
//  com ρ = 2Zr/n e P_lm um polinômio HOMOGÊNEO de grau l. Assim não há
//  divisão por r (sem singularidade na origem) e o campo 3D fica barato.
// ─────────────────────────────────────────────────────────────
import type { OrbitalGroup } from './orbital.models';

export type ModoVisual = 'translucido' | 'solido' | 'densidade';
export type FuncaoAngular = (x: number, y: number, z: number) => number;

// ── Parâmetros de qualidade ───────────────────────────────────
export const GRADE = 96; // voxels por eixo (~885 mil avaliações)
export const MASSA_ISO = 0.9; // a superfície engloba ~90 % da probabilidade
export const ESCALA_CENA = 10; // o orbital é sempre normalizado p/ caber em ±10
export const PONTOS_POR_E = 5000; // nuvem: pontos = E × 5000

// ── Metadados por orbital (chave `${l}:${m}`, convenção do projeto) ──
export interface MetaOrbital {
  sub: string;
  sup?: string;
  orientacao: string;
  forma: string;
}

export const META_ORBITAL: Record<string, MetaOrbital> = {
  '0:0': { sub: '', orientacao: 'esférica (sem eixo)', forma: 'Esférico' },

  '1:0': {
    sub: 'z',
    orientacao: 'ao longo do eixo z',
    forma: 'Haltere ao longo de z',
  },
  '1:1': {
    sub: 'x',
    orientacao: 'ao longo do eixo x',
    forma: 'Haltere ao longo de x',
  },
  '1:-1': {
    sub: 'y',
    orientacao: 'ao longo do eixo y',
    forma: 'Haltere ao longo de y',
  },

  '2:0': {
    sub: 'z',
    sup: '2',
    orientacao: 'ao longo do eixo z',
    forma: 'Haltere + toro',
  },
  '2:1': {
    sub: 'xz',
    orientacao: 'no plano xz, entre os eixos',
    forma: '4 lóbulos',
  },
  '2:-1': {
    sub: 'yz',
    orientacao: 'no plano yz, entre os eixos',
    forma: '4 lóbulos',
  },
  '2:2': {
    sub: 'xy',
    orientacao: 'no plano xy, entre os eixos',
    forma: '4 lóbulos',
  },
  '2:-2': {
    sub: 'x²−y²',
    orientacao: 'no plano xy, sobre os eixos',
    forma: '4 lóbulos',
  },

  '3:0': {
    sub: 'z',
    sup: '3',
    orientacao: 'ao longo do eixo z',
    forma: '2 lóbulos + 2 anéis',
  },
  '3:1': { sub: 'xz²', orientacao: 'ao longo do eixo x', forma: '6 lóbulos' },
  '3:-1': { sub: 'yz²', orientacao: 'ao longo do eixo y', forma: '6 lóbulos' },
  '3:2': { sub: 'xyz', orientacao: 'nos octantes', forma: '8 lóbulos' },
  '3:-2': {
    sub: 'z(x²−y²)',
    orientacao: 'ao redor do eixo z',
    forma: '8 lóbulos, 4+4',
  },
  '3:3': { sub: 'x(x²−3y²)', orientacao: 'no plano xy', forma: '6 lóbulos' },
  '3:-3': { sub: 'y(3x²−y²)', orientacao: 'no plano xy', forma: '6 lóbulos' },
};

export const COR_TITULO: Record<OrbitalGroup, string> = {
  s: '#8472c4',
  p: '#c4655c',
  d: '#4f86cc',
  f: '#3fa77a',
};

// Cores das fases (+ / −) por subcamada
export const PALETA_FASE: Record<OrbitalGroup, { pos: string; neg: string }> = {
  s: { pos: '#8f7bff', neg: '#ffc83d' },
  p: { pos: '#ef5a4f', neg: '#4a9df0' },
  d: { pos: '#3b82f6', neg: '#ffe600' },
  f: { pos: '#17b890', neg: '#f27b1d' },
};

// ── Harmônicos esféricos reais (polinômios homogêneos) ────────
const K_S = 0.28209479177387814;
const K_P = 0.4886025119029199;
const K_D0 = 0.31539156525252005;
const K_D1 = 1.0925484305920792;
const K_D2 = 0.5462742152960396;
const K_F0 = 0.3731763325901154;
const K_F1 = 0.4570457994644658;
const K_F2 = 1.4453057213202771;
const K_F3 = 0.5900435899266435;

/**
 * Convenção de m idêntica à de orbital.models.ts:
 *   p: z=0, x=1, y=-1
 *   d: z²=0, xz=1, yz=-1, xy=2, x²-y²=-2
 *   f: z³=0, xz²=1, yz²=-1, xyz=2, z(x²-y²)=-2, x(x²-3y²)=3, y(3x²-y²)=-3
 */
export function harmonicoReal(l: number, m: number): FuncaoAngular {
  switch (l) {
    case 0:
      return () => K_S;
    case 1:
      if (m === 0) return (_x, _y, z) => K_P * z;
      if (m === 1) return (x) => K_P * x;
      return (_x, y) => K_P * y;
    case 2:
      switch (m) {
        case 0:
          return (x, y, z) => K_D0 * (2 * z * z - x * x - y * y);
        case 1:
          return (x, _y, z) => K_D1 * x * z;
        case -1:
          return (_x, y, z) => K_D1 * y * z;
        case 2:
          return (x, y) => K_D1 * x * y;
        default:
          return (x, y) => K_D2 * (x * x - y * y);
      }
    case 3:
      switch (m) {
        case 0:
          return (x, y, z) => K_F0 * z * (2 * z * z - 3 * x * x - 3 * y * y);
        case 1:
          return (x, y, z) => K_F1 * x * (4 * z * z - x * x - y * y);
        case -1:
          return (x, y, z) => K_F1 * y * (4 * z * z - x * x - y * y);
        case 2:
          return (x, y, z) => 2 * K_F2 * x * y * z;
        case -2:
          return (x, y, z) => K_F2 * z * (x * x - y * y);
        case 3:
          return (x, y) => K_F3 * x * (x * x - 3 * y * y);
        default:
          return (x, y) => K_F3 * y * (3 * x * x - y * y);
      }
    default:
      return () => 0;
  }
}

// ── Parte radial ──────────────────────────────────────────────
function fatorial(k: number): number {
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return f;
}

/** Polinômio de Laguerre generalizado L_k^α(x) por recorrência. */
export function laguerre(k: number, alpha: number, x: number): number {
  if (k === 0) return 1;
  let anterior = 1;
  let atual = 1 + alpha - x;
  for (let i = 1; i < k; i++) {
    const prox =
      ((2 * i + 1 + alpha - x) * atual - (i + alpha) * anterior) / (i + 1);
    anterior = atual;
    atual = prox;
  }
  return atual;
}

export interface ModeloOrbital {
  n: number;
  l: number;
  m: number;
  z: number;
  /** ψ completo em (x, y, z) [a₀]. */
  psi: FuncaoAngular;
  /** R_nl(r), normalizado: ∫ R² r² dr = 1. */
  radial: (r: number) => number;
  /** Parte angular avaliada em um vetor (use vetores unitários). */
  angular: FuncaoAngular;
}

export function criarModeloOrbital(
  n: number,
  l: number,
  m: number,
  z = 1,
): ModeloOrbital {
  const k = n - l - 1;
  const alpha = 2 * l + 1;
  const esc = (2 * z) / n;
  const norm = Math.sqrt(
    (Math.pow(esc, 3) * fatorial(k)) / (2 * n * fatorial(n + l)),
  );
  const fator = norm * Math.pow(esc, l);
  const angular = harmonicoReal(l, m);

  return {
    n,
    l,
    m,
    z,
    angular,
    radial: (r) =>
      norm *
      Math.pow(esc * r, l) *
      Math.exp(-esc * r * 0.5) *
      laguerre(k, alpha, esc * r),
    psi: (x, y, zz) => {
      const r = Math.sqrt(x * x + y * y + zz * zz);
      return (
        fator *
        Math.exp(-esc * r * 0.5) *
        laguerre(k, alpha, esc * r) *
        angular(x, y, zz)
      );
    },
  };
}

// ── Tabela da distribuição radial P(r) = r²R² ─────────────────
export interface TabelaRadial {
  r: Float64Array;
  p: Float64Array;
  /** Probabilidade acumulada normalizada (0..1). */
  acum: Float64Array;
  /** Raio que contém 99,5 % da probabilidade [a₀]. */
  r995: number;
}

export type PlanoSecao = 'XY' | 'XZ' | 'YZ';

export function tabelaRadial(mod: ModeloOrbital, passos = 2400): TabelaRadial {
  const rMax = (3.5 * mod.n * mod.n + 12) / mod.z;
  const dr = rMax / passos;
  const r = new Float64Array(passos + 1);
  const p = new Float64Array(passos + 1);
  const acum = new Float64Array(passos + 1);

  let soma = 0;
  for (let i = 0; i <= passos; i++) {
    const ri = i * dr;
    const R = mod.radial(ri);
    r[i] = ri;
    p[i] = ri * ri * R * R;
    if (i > 0) soma += 0.5 * (p[i - 1] + p[i]) * dr;
    acum[i] = soma;
  }
  for (let i = 0; i <= passos; i++) acum[i] /= soma;

  return { r, p, acum, r995: raioParaProbabilidade(r, acum, 0.995) };
}

export function tabelaRadialSecao(
  mod: ModeloOrbital,
  plano: PlanoSecao,
  offset: number,
  rMax: number,
  limiarDensidade: number,
  passos = 1024,
  amostrasAngulares = 1024,
): Pick<TabelaRadial, 'r' | 'p'> {
  const r = new Float64Array(passos + 1);
  const p = new Float64Array(passos + 1);
  const dr = rMax / passos;
  const dPhi = (2 * Math.PI) / amostrasAngulares;
  const cosPhi = new Float64Array(amostrasAngulares);
  const sinPhi = new Float64Array(amostrasAngulares);
  for (let j = 0; j < amostrasAngulares; j++) {
    const phi = j * dPhi;
    cosPhi[j] = Math.cos(phi);
    sinPhi[j] = Math.sin(phi);
  }

  for (let i = 0; i <= passos; i++) {
    const rho = i * dr;
    let densidadeAngular = 0;
    for (let j = 0; j < amostrasAngulares; j++) {
      const u = rho * cosPhi[j];
      const v = rho * sinPhi[j];
      const psi =
        plano === 'XY'
          ? mod.psi(u, v, offset)
          : plano === 'XZ'
            ? mod.psi(u, offset, v)
            : mod.psi(offset, u, v);
      const densidade = psi * psi;
      if (densidade >= limiarDensidade) densidadeAngular += densidade;
    }
    r[i] = rho;
    p[i] = rho * densidadeAngular * dPhi;
  }

  let integral = 0;
  for (let i = 1; i <= passos; i++) {
    integral += 0.5 * (p[i - 1] + p[i]) * dr;
  }
  if (integral > 0) {
    for (let i = 0; i <= passos; i++) p[i] /= integral;
  }

  return { r, p };
}

function raioParaProbabilidade(
  r: Float64Array,
  acum: Float64Array,
  u: number,
): number {
  let lo = 0;
  let hi = acum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (acum[mid] < u) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0) return r[0];
  const t = (u - acum[lo - 1]) / Math.max(acum[lo] - acum[lo - 1], 1e-30);
  return r[lo - 1] + t * (r[lo] - r[lo - 1]);
}

// ── Campo escalar 3D + limiar de isosuperfície ────────────────
/** Avalia ψ numa grade cúbica N³ centrada na origem. Índice: x + N·(y + N·z). */
export function amostrarCampo(
  mod: ModeloOrbital,
  meio: number,
  N: number,
): Float32Array {
  const out = new Float32Array(N * N * N);
  const passo = (2 * meio) / (N - 1);
  let i = 0;
  for (let k = 0; k < N; k++) {
    const z = -meio + k * passo;
    for (let j = 0; j < N; j++) {
      const y = -meio + j * passo;
      for (let ii = 0; ii < N; ii++) {
        out[i++] = mod.psi(-meio + ii * passo, y, z);
      }
    }
  }
  return out;
}

/** |ψ| mínimo tal que a região |ψ| ≥ limiar contém `massa` da probabilidade. */
export function limiarProbabilidade(
  campo: Float32Array,
  massa = MASSA_ISO,
): number {
  const rho = new Float32Array(campo.length);
  let total = 0;
  for (let i = 0; i < campo.length; i++) {
    const a = campo[i];
    rho[i] = a * a;
    total += rho[i];
  }
  rho.sort();
  const alvo = total * (1 - massa);
  let acc = 0;
  for (let i = 0; i < rho.length; i++) {
    acc += rho[i];
    if (acc >= alvo) return Math.sqrt(rho[i]);
  }
  return Math.sqrt(rho[rho.length - 1]);
}

// ── Nuvem de pontos (amostragem exata de |ψ|²) ────────────────
// |ψ|² é separável: r é sorteado pela CDF radial e a direção por
// rejeição sobre |Y|² — sem desperdício de pontos em regiões vazias.
export interface NuvemPontos {
  posicoes: Float32Array;
  cores: Float32Array;
}

const GRADIENTE: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.0, 0.16, 0.02, 0.36],
  [0.25, 0.46, 0.06, 0.55],
  [0.5, 0.8, 0.14, 0.45],
  [0.75, 0.97, 0.45, 0.15],
  [1.0, 1.0, 0.82, 0.25],
];

function corGradiente(t: number, out: Float32Array, i: number): void {
  const c = Math.min(Math.max(t, 0), 1);
  for (let s = 1; s < GRADIENTE.length; s++) {
    const b = GRADIENTE[s];
    if (c <= b[0]) {
      const a = GRADIENTE[s - 1];
      const u = (c - a[0]) / (b[0] - a[0]);
      out[i] = a[1] + u * (b[1] - a[1]);
      out[i + 1] = a[2] + u * (b[2] - a[2]);
      out[i + 2] = a[3] + u * (b[3] - a[3]);
      return;
    }
  }
  const f = GRADIENTE[GRADIENTE.length - 1];
  out[i] = f[1];
  out[i + 1] = f[2];
  out[i + 2] = f[3];
}

export function amostrarNuvem(
  mod: ModeloOrbital,
  tab: TabelaRadial,
  quantidade: number,
  escala: number,
): NuvemPontos {
  // Máximo de |Y|² (para o teste de rejeição), varrendo uma espiral de Fibonacci
  let y2max = 0;
  const K = 4000;
  for (let i = 0; i < K; i++) {
    const z = 1 - (2 * (i + 0.5)) / K;
    const s = Math.sqrt(1 - z * z);
    const ph = i * 2.399963229728653;
    const y = mod.angular(s * Math.cos(ph), s * Math.sin(ph), z);
    if (y * y > y2max) y2max = y * y;
  }
  y2max *= 1.1;

  const posicoes = new Float32Array(quantidade * 3);
  const rho = new Float32Array(quantidade);
  let rhoMax = 0;

  for (let i = 0; i < quantidade; i++) {
    const r = raioParaProbabilidade(tab.r, tab.acum, Math.random());
    let dx = 0,
      dy = 0,
      dz = 1,
      y = 0;
    for (let t = 0; t < 200; t++) {
      dz = 2 * Math.random() - 1;
      const ph = 2 * Math.PI * Math.random();
      const s = Math.sqrt(1 - dz * dz);
      dx = s * Math.cos(ph);
      dy = s * Math.sin(ph);
      y = mod.angular(dx, dy, dz);
      if (y * y >= Math.random() * y2max) break;
    }
    const d = mod.radial(r) * y;
    rho[i] = d * d;
    if (rho[i] > rhoMax) rhoMax = rho[i];
    posicoes[i * 3] = dx * r * escala;
    posicoes[i * 3 + 1] = dy * r * escala;
    posicoes[i * 3 + 2] = dz * r * escala;
  }

  const cores = new Float32Array(quantidade * 3);
  const inv = 1 / Math.max(rhoMax, 1e-30);
  for (let i = 0; i < quantidade; i++) {
    corGradiente(Math.pow(rho[i] * inv, 0.3), cores, i * 3);
  }
  return { posicoes, cores };
}
