import { Injectable } from '@angular/core';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════
//  MATEMÁTICA — Funções de onda hidrogenóides reais (deletar quando os dados vierem do backend)
// ═══════════════════════════════════════════════════════════

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** Polinômio associado de Laguerre L_p^q(x) — recursão */
function assocLaguerre(p: number, q: number, x: number): number {
  if (p === 0) return 1;
  if (p === 1) return 1 + q - x;
  let l0 = 1,
    l1 = 1 + q - x;
  for (let k = 2; k <= p; k++) {
    const l2 = ((2 * k - 1 + q - x) * l1 - (k - 1 + q) * l0) / k;
    l0 = l1;
    l1 = l2;
  }
  return l1;
}

/** Função associada de Legendre P_l^|m|(cos θ) */
function assocLegendre(l: number, m: number, x: number): number {
  const abm = Math.abs(m);
  let pmm = 1.0;
  if (abm > 0) {
    const sq = Math.sqrt(1 - x * x);
    let fact = 1.0;
    for (let i = 1; i <= abm; i++) {
      pmm *= -fact * sq;
      fact += 2;
    }
  }
  if (l === abm) return pmm;
  let pmmp1 = x * (2 * abm + 1) * pmm;
  if (l === abm + 1) return pmmp1;
  let pll = 0;
  for (let ll = abm + 2; ll <= l; ll++) {
    pll = (x * (2 * ll - 1) * pmmp1 - (ll + abm - 1) * pmm) / (ll - abm);
    pmm = pmmp1;
    pmmp1 = pll;
  }
  return pll;
}

/** Constante de normalização Y_l^m */
function sphNorm(l: number, m: number): number {
  const abm = Math.abs(m);
  return Math.sqrt(
    ((2 * l + 1) * factorial(l - abm)) / (4 * Math.PI * factorial(l + abm)),
  );
}

/** Harmônico esférico real Y_l^m(θ, φ) */
function realSphericalHarmonic(
  l: number,
  m: number,
  theta: number,
  phi: number,
): number {
  const abm = Math.abs(m);
  const plm = assocLegendre(l, abm, Math.cos(theta));
  const norm = sphNorm(l, m);
  if (m === 0) return norm * plm;
  if (m > 0) return Math.SQRT2 * norm * plm * Math.cos(abm * phi);
  return Math.SQRT2 * norm * plm * Math.sin(abm * phi);
}

/** Parte radial R_nl(r) — unidades de Bohr, Z=1 */
export function radialWF(n: number, l: number, r: number): number {
  const rho = (2 * r) / n;
  const norm = Math.sqrt(
    (Math.pow(2 / n, 3) * factorial(n - l - 1)) /
      (2 * n * Math.pow(factorial(n + l), 3)),
  );
  return (
    norm *
    Math.exp(-rho / 2) *
    Math.pow(rho, l) *
    assocLaguerre(n - l - 1, 2 * l + 1, rho)
  );
}

/** ψ_nlm(r, θ, φ) — função de onda real completa */
export function psi(
  n: number,
  l: number,
  m: number,
  r: number,
  theta: number,
  phi: number,
): number {
  return radialWF(n, l, r) * realSphericalHarmonic(l, m, theta, phi);
}

/** Coordenadas cartesianas → esféricas */
export function cartToSph(
  x: number,
  y: number,
  z: number,
): [number, number, number] {
  const r = Math.sqrt(x * x + y * y + z * z);
  if (r < 1e-10) return [0, 0, 0];
  return [r, Math.acos(Math.max(-1, Math.min(1, z / r))), Math.atan2(y, x)];
}

// ═══════════════════════════════════════════════════════════
//  SHADERS GLSL
//  Cloud: esferas impostoras (Slice of Curiosity)
//  Surface: iluminação tripla (Lisyarus + Slice of Curiosity)
// ═══════════════════════════════════════════════════════════

export const VERT_CLOUD = /* glsl */ `
  attribute float phase;
  varying  float vPhase;
  varying  float vDist;
  uniform  float uSize;

  void main() {
    vPhase = phase;
    vec4 mv  = modelViewMatrix * vec4(position, 1.0);
    vDist    = -mv.z;
    gl_Position  = projectionMatrix * mv;
    gl_PointSize = uSize * (180.0 / max(1.0, -mv.z));
  }
`;

export const FRAG_CLOUD = /* glsl */ `
  varying float vPhase;
  varying float vDist;
  uniform vec3  cPos;
  uniform vec3  cNeg;
  uniform float uOpacity;

  void main() {
    vec2  uv = gl_PointCoord * 2.0 - 1.0;
    float d  = dot(uv, uv);
    if (d > 1.0) discard;

    // Iluminação sobre esfera impostora
    float nz    = sqrt(max(0.0, 1.0 - d));
    vec3  nm    = normalize(vec3(uv.x, uv.y, nz));
    vec3  ld    = normalize(vec3(0.6, 0.8, 1.0));
    float diff  = max(dot(nm, ld), 0.0);
    float light = 0.3 + 0.7 * diff;

    vec3 col = vPhase > 0.0 ? cPos : cNeg;
    gl_FragColor = vec4(col * light, uOpacity * (1.0 - d * 0.25));
  }
`;

export const VERT_SURF = /* glsl */ `
  attribute float phase;
  varying  float vPhase;
  varying  vec3  vN;
  varying  vec3  vP;

  void main() {
    vPhase   = phase;
    vN       = normalMatrix * normal;
    vP       = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const FRAG_SURF = /* glsl */ `
  varying float vPhase;
  varying vec3  vN;
  varying vec3  vP;
  uniform vec3  cPos;
  uniform vec3  cNeg;

  void main() {
    vec3 col = vPhase > 0.0 ? cPos : cNeg;
    vec3 n   = normalize(vN);

    // Três luzes (câmera + topo + fill) — Slice of Curiosity
    vec3 lCam  = normalize(-vP);
    vec3 lTop  = normalize(vec3(0.3,  1.0,  0.5));
    vec3 lFill = normalize(vec3(-0.5, 0.3, -0.8));

    float d1    = max(dot(n, lCam),  0.0) * 0.55;
    float d2    = max(dot(n, lTop),  0.0) * 0.25;
    float d3    = max(dot(n, lFill), 0.0) * 0.10;
    float light = 0.12 + d1 + d2 + d3;

    gl_FragColor = vec4(col * light, 0.90);
  }
`;

// ═══════════════════════════════════════════════════════════
//  TABELAS MARCHING CUBES (256 configurações)
// ═══════════════════════════════════════════════════════════

const EDGE_TABLE: number[] = [
  0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, 0x80c, 0x905, 0xa0f,
  0xb06, 0xc0a, 0xd03, 0xe09, 0xf00, 0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f,
  0x795, 0x69c, 0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90, 0x230,
  0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c, 0xa3c, 0xb35, 0x83f, 0x936,
  0xe3a, 0xf33, 0xc39, 0xd30, 0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5,
  0x4ac, 0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0, 0x460, 0x569,
  0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c, 0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a,
  0x963, 0xa69, 0xb60, 0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
  0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0, 0x650, 0x759, 0x453,
  0x55a, 0x256, 0x35f, 0x55, 0x15c, 0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53,
  0x859, 0x950, 0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc, 0xfcc,
  0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0, 0x8c0, 0x9c9, 0xac3, 0xbca,
  0xcc6, 0xdcf, 0xec5, 0xfcc, 0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9,
  0x7c0, 0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c, 0x15c, 0x55,
  0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650, 0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6,
  0xfff, 0xcf5, 0xdfc, 0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
  0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c, 0x36c, 0x265, 0x16f,
  0x66, 0x76a, 0x663, 0x569, 0x460, 0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af,
  0xaa5, 0xbac, 0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0, 0xd30,
  0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c, 0x53c, 0x435, 0x73f, 0x636,
  0x13a, 0x33, 0x339, 0x230, 0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895,
  0x99c, 0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190, 0xf00, 0xe09,
  0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c, 0x70c, 0x605, 0x50f, 0x406, 0x30a,
  0x203, 0x109, 0x0,
];

const TRI_TABLE: number[][] = [
  [],
  [0, 8, 3],
  [0, 1, 9],
  [1, 8, 3, 9, 8, 1],
  [1, 2, 10],
  [0, 8, 3, 1, 2, 10],
  [9, 2, 10, 0, 2, 9],
  [2, 8, 3, 2, 10, 8, 10, 9, 8],
  [3, 11, 2],
  [0, 11, 2, 8, 11, 0],
  [1, 9, 0, 2, 3, 11],
  [1, 11, 2, 1, 9, 11, 9, 8, 11],
  [3, 10, 1, 11, 10, 3],
  [0, 10, 1, 0, 8, 10, 8, 11, 10],
  [3, 9, 0, 3, 11, 9, 11, 10, 9],
  [9, 8, 10, 10, 8, 11],
  [4, 7, 8],
  [4, 3, 0, 7, 3, 4],
  [0, 1, 9, 8, 4, 7],
  [4, 1, 9, 4, 7, 1, 7, 3, 1],
  [1, 2, 10, 8, 4, 7],
  [3, 4, 7, 3, 0, 4, 1, 2, 10],
  [9, 2, 10, 9, 0, 2, 8, 4, 7],
  [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4],
  [8, 4, 7, 3, 11, 2],
  [11, 4, 7, 11, 2, 4, 2, 0, 4],
  [9, 0, 1, 8, 4, 7, 2, 3, 11],
  [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1],
  [3, 10, 1, 3, 11, 10, 7, 8, 4],
  [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4],
  [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3],
  [4, 7, 11, 4, 11, 9, 9, 11, 10],
  [9, 5, 4],
  [9, 5, 4, 0, 8, 3],
  [0, 5, 4, 1, 5, 0],
  [8, 5, 4, 8, 3, 5, 3, 1, 5],
  [1, 2, 10, 9, 5, 4],
  [3, 0, 8, 1, 2, 10, 4, 9, 5],
  [5, 2, 10, 5, 4, 2, 4, 0, 2],
  [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8],
  [9, 5, 4, 2, 3, 11],
  [0, 11, 2, 0, 8, 11, 4, 9, 5],
  [0, 5, 4, 0, 1, 5, 2, 3, 11],
  [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5],
  [10, 3, 11, 10, 1, 3, 9, 5, 4],
  [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10],
  [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3],
  [5, 4, 8, 5, 8, 10, 10, 8, 11],
  [9, 7, 8, 5, 7, 9],
  [9, 3, 0, 9, 5, 3, 5, 7, 3],
  [0, 7, 8, 0, 1, 7, 1, 5, 7],
  [1, 5, 3, 3, 5, 7],
  [9, 7, 8, 9, 5, 7, 10, 1, 2],
  [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3],
  [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2],
  [2, 10, 5, 2, 5, 3, 3, 5, 7],
  [7, 9, 5, 7, 8, 9, 3, 11, 2],
  [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11],
  [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7],
  [11, 2, 1, 11, 1, 7, 7, 1, 5],
  [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11],
  [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0],
  [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0],
  [11, 10, 5, 7, 11, 5],
  [10, 6, 5],
  [0, 8, 3, 5, 10, 6],
  [9, 0, 1, 5, 10, 6],
  [1, 8, 3, 1, 9, 8, 5, 10, 6],
  [1, 6, 5, 2, 6, 1],
  [1, 6, 5, 1, 2, 6, 3, 0, 8],
  [9, 6, 5, 9, 0, 6, 0, 2, 6],
  [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8],
  [2, 3, 11, 10, 6, 5],
  [11, 0, 8, 11, 2, 0, 10, 6, 5],
  [0, 1, 9, 2, 3, 11, 5, 10, 6],
  [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11],
  [6, 3, 11, 6, 5, 3, 5, 1, 3],
  [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6],
  [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9],
  [6, 5, 9, 6, 9, 11, 11, 9, 8],
  [5, 10, 6, 4, 7, 8],
  [4, 3, 0, 4, 7, 3, 6, 5, 10],
  [1, 9, 0, 5, 10, 6, 8, 4, 7],
  [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4],
  [6, 1, 2, 6, 5, 1, 4, 7, 8],
  [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7],
  [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6],
  [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9],
  [3, 11, 2, 7, 8, 4, 10, 6, 5],
  [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11],
  [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6],
  [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6],
  [8, 4, 5, 8, 5, 3, 8, 3, 7, 3, 5, 6],
  [0, 4, 5, 0, 5, 6, 0, 6, 3, 11, 3, 6],
  [8, 4, 5, 8, 5, 3, 3, 5, 6, 3, 6, 11, 0, 9, 5, 0, 5, 8],
  [7, 11, 4, 11, 6, 4, 4, 6, 5],
  [10, 4, 9, 6, 4, 10],
  [4, 10, 6, 4, 9, 10, 0, 8, 3],
  [10, 0, 1, 10, 6, 0, 6, 4, 0],
  [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10],
  [1, 4, 9, 1, 2, 4, 2, 6, 4],
  [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4],
  [0, 2, 4, 4, 2, 6],
  [8, 3, 2, 8, 2, 4, 4, 2, 6],
  [10, 4, 9, 10, 6, 4, 11, 2, 3],
  [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6],
  [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10],
  [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1],
  [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3],
  [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1],
  [3, 11, 6, 3, 6, 0, 0, 6, 4],
  [6, 4, 8, 11, 6, 8],
  [7, 10, 6, 7, 8, 10, 8, 9, 10],
  [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10],
  [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0],
  [10, 6, 7, 10, 7, 1, 1, 7, 3],
  [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7],
  [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9],
  [7, 8, 0, 7, 0, 6, 6, 0, 2],
  [7, 3, 2, 6, 7, 2],
  [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7],
  [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7],
  [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11],
  [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1],
  [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6],
  [0, 9, 1, 11, 6, 7],
  [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0],
  [7, 11, 6],
  [7, 6, 11],
  [3, 0, 8, 11, 7, 6],
  [0, 1, 9, 11, 7, 6],
  [8, 1, 9, 8, 3, 1, 11, 7, 6],
  [10, 1, 2, 6, 11, 7],
  [1, 2, 10, 3, 0, 8, 6, 11, 7],
  [2, 9, 0, 2, 10, 9, 6, 11, 7],
  [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8],
  [7, 2, 3, 6, 2, 7],
  [7, 0, 8, 7, 6, 0, 6, 2, 0],
  [2, 7, 6, 2, 3, 7, 0, 1, 9],
  [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6],
  [10, 7, 6, 10, 1, 7, 1, 3, 7],
  [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8],
  [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7],
  [7, 6, 10, 7, 10, 8, 8, 10, 9],
  [6, 8, 4, 11, 8, 6],
  [3, 6, 11, 3, 0, 6, 0, 4, 6],
  [8, 6, 11, 8, 4, 6, 9, 0, 1],
  [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6],
  [6, 8, 4, 6, 11, 8, 2, 10, 1],
  [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6],
  [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9],
  [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3],
  [8, 2, 3, 8, 4, 2, 4, 6, 2],
  [0, 4, 2, 4, 6, 2],
  [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8],
  [1, 9, 4, 1, 4, 2, 2, 4, 6],
  [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1],
  [10, 1, 0, 10, 0, 6, 6, 0, 4],
  [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3],
  [10, 9, 4, 6, 10, 4],
  [4, 9, 5, 7, 6, 11],
  [0, 8, 3, 4, 9, 5, 11, 7, 6],
  [5, 0, 1, 5, 4, 0, 7, 6, 11],
  [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5],
  [9, 5, 4, 10, 1, 2, 7, 6, 11],
  [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5],
  [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2],
  [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6],
  [7, 2, 3, 7, 6, 2, 5, 4, 9],
  [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7],
  [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0],
  [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8],
  [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7],
  [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4],
  [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10],
  [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10],
  [6, 9, 5, 6, 11, 9, 11, 8, 9],
  [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5],
  [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11],
  [6, 11, 3, 6, 3, 5, 5, 3, 1],
  [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6],
  [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10],
  [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5],
  [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3],
  [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2],
  [9, 5, 6, 9, 6, 0, 0, 6, 2],
  [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8],
  [1, 5, 6, 2, 1, 6],
  [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6],
  [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0],
  [0, 3, 8, 5, 6, 10],
  [10, 5, 6],
  [11, 5, 10, 7, 5, 11],
  [11, 5, 10, 11, 7, 5, 8, 3, 0],
  [5, 11, 7, 5, 10, 11, 1, 9, 0],
  [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1],
  [11, 1, 2, 11, 7, 1, 7, 5, 1],
  [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11],
  [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7],
  [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2],
  [2, 5, 10, 2, 3, 5, 3, 7, 5],
  [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5],
  [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2],
  [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2],
  [1, 3, 5, 3, 7, 5],
  [0, 8, 7, 0, 7, 1, 1, 7, 5],
  [9, 0, 3, 9, 3, 5, 5, 3, 7],
  [9, 8, 7, 5, 9, 7],
  [5, 8, 4, 5, 10, 8, 10, 11, 8],
  [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0],
  [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5],
  [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4],
  [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8],
  [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11],
  [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5],
  [9, 4, 5, 2, 11, 3],
  [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4],
  [5, 10, 2, 5, 2, 4, 4, 2, 0],
  [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9],
  [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2],
  [8, 4, 5, 8, 5, 3, 3, 5, 1],
  [0, 4, 5, 1, 0, 5],
  [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5],
  [9, 4, 5],
  [4, 11, 7, 4, 9, 11, 9, 10, 11],
  [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11],
  [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11],
  [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4],
  [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2],
  [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3],
  [11, 7, 4, 11, 4, 2, 2, 4, 0],
  [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4],
  [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9],
  [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7],
  [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10],
  [1, 10, 2, 8, 7, 4],
  [4, 9, 1, 4, 1, 7, 7, 1, 3],
  [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1],
  [4, 0, 3, 7, 4, 3],
  [4, 8, 7],
  [9, 10, 8, 10, 11, 8],
  [3, 0, 9, 3, 9, 11, 11, 9, 10],
  [0, 1, 10, 0, 10, 8, 8, 10, 11],
  [3, 1, 10, 11, 3, 10],
  [1, 2, 11, 1, 11, 9, 9, 11, 8],
  [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9],
  [0, 2, 11, 8, 0, 11],
  [3, 2, 11],
  [2, 3, 8, 2, 8, 10, 10, 8, 9],
  [9, 10, 2, 0, 9, 2],
  [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8],
  [1, 10, 2],
  [1, 3, 8, 9, 1, 8],
  [0, 9, 1],
  [0, 3, 8],
  [],
];

const EDGE_OFFSETS: number[][] = [
  [0, 0, 0, 1, 0, 0],
  [1, 0, 0, 1, 1, 0],
  [0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 1, 0],
  [0, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1],
  [0, 0, 1, 0, 1, 1],
  [0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 1],
  [1, 1, 0, 1, 1, 1],
  [0, 1, 0, 0, 1, 1],
];
const EDGE_PAIRS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];
const CORNERS: [number, number, number][] = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1],
];

// ═══════════════════════════════════════════════════════════
//  SERVICE
// ═══════════════════════════════════════════════════════════

export interface CloudData {
  positions: Float32Array;
  phases: Float32Array;
}
export interface SurfaceData {
  vertices: Float32Array;
  normals: Float32Array;
  phaseColors: Float32Array;
}

@Injectable({ providedIn: 'root' })
export class OrbitalMathService {
  // ─── Amostragem Monte Carlo (Beloit + Lisyarus) ───────────
  sampleOrbital(
    n: number,
    l: number,
    m: number,
    nPts: number,
    boxHalf: number,
  ): CloudData {
    const positions = new Float32Array(nPts * 3);
    const phases = new Float32Array(nPts);

    // Grid grosso para estimar pdfMax
    let pdfMax = 0;
    const gN = 28,
      step = (2 * boxHalf) / gN;
    for (let ix = 0; ix <= gN; ix++)
      for (let iy = 0; iy <= gN; iy++)
        for (let iz = 0; iz <= gN; iz++) {
          const [r, t, p] = cartToSph(
            -boxHalf + ix * step,
            -boxHalf + iy * step,
            -boxHalf + iz * step,
          );
          const v = psi(n, l, m, r, t, p);
          if (v * v > pdfMax) pdfMax = v * v;
        }
    pdfMax *= 1.3;

    let count = 0,
      attempts = 0;
    const maxAtt = nPts * 300;
    while (count < nPts && attempts < maxAtt) {
      attempts++;
      const x = (Math.random() * 2 - 1) * boxHalf;
      const y = (Math.random() * 2 - 1) * boxHalf;
      const z = (Math.random() * 2 - 1) * boxHalf;
      const [r, theta, phi] = cartToSph(x, y, z);
      const v = psi(n, l, m, r, theta, phi); // Esses dados tem que vir do backend
      if (Math.random() * pdfMax < v * v) {
        positions[count * 3] = x;
        positions[count * 3 + 1] = y;
        positions[count * 3 + 2] = z;
        phases[count] = v >= 0 ? 1 : -1;
        count++;
      }
    }
    // Preencher eventuais falhas de rejeição
    for (let i = count; i < nPts; i++) {
      positions[i * 3] = positions[(count - 1) * 3];
      positions[i * 3 + 1] = positions[(count - 1) * 3 + 1];
      positions[i * 3 + 2] = positions[(count - 1) * 3 + 2];
      phases[i] = phases[count - 1];
    }
    return { positions, phases };
  }

  // ─── Marching Cubes (ChemTube3D + Davidson) ───────────────
  buildIsosurface(
    n: number,
    l: number,
    m: number,
    isoValue: number,
    gridN: number,
    boxHalf: number,
  ): SurfaceData {
    const size = gridN + 1;
    const field = new Float32Array(size * size * size);
    const phaseFld = new Float32Array(size * size * size);
    const step = (2 * boxHalf) / gridN;
    const idx = (ix: number, iy: number, iz: number) =>
      ix * size * size + iy * size + iz;

    for (let ix = 0; ix <= gridN; ix++)
      for (let iy = 0; iy <= gridN; iy++)
        for (let iz = 0; iz <= gridN; iz++) {
          const [r, th, ph] = cartToSph(
            -boxHalf + ix * step,
            -boxHalf + iy * step,
            -boxHalf + iz * step,
          );
          const v = psi(n, l, m, r, th, ph); // esses dados tem que vir do backend
          field[idx(ix, iy, iz)] = v * v;
          phaseFld[idx(ix, iy, iz)] = v >= 0 ? 1 : -1;
        }

    const verts: number[] = [],
      norms: number[] = [],
      phases: number[] = [];

    const lerpV = (
      x0: number,
      y0: number,
      z0: number,
      f0: number,
      x1: number,
      y1: number,
      z1: number,
      f1: number,
      iso: number,
    ): [number, number, number] => {
      const t = Math.abs(f1 - f0) < 1e-10 ? 0.5 : (iso - f0) / (f1 - f0);
      return [x0 + t * (x1 - x0), y0 + t * (y1 - y0), z0 + t * (z1 - z0)];
    };

    for (let ix = 0; ix < gridN; ix++)
      for (let iy = 0; iy < gridN; iy++)
        for (let iz = 0; iz < gridN; iz++) {
          const cx = -boxHalf + ix * step,
            cy = -boxHalf + iy * step,
            cz = -boxHalf + iz * step;
          const fv = CORNERS.map(
            ([dx, dy, dz]) => field[idx(ix + dx, iy + dy, iz + dz)],
          );
          const pv = CORNERS.map(
            ([dx, dy, dz]) => phaseFld[idx(ix + dx, iy + dy, iz + dz)],
          );

          let ci = 0;
          fv.forEach((f, i) => {
            if (f < isoValue) ci |= 1 << i;
          });
          if (ci === 0 || ci === 255) continue;

          const em = EDGE_TABLE[ci];
          const ev: ([number, number, number] | null)[] = new Array(12).fill(
            null,
          );
          for (let e = 0; e < 12; e++) {
            if (!(em & (1 << e))) continue;
            const [ax, ay, az, bx, by, bz] = EDGE_OFFSETS[e];
            const [a, b] = EDGE_PAIRS[e];
            ev[e] = lerpV(
              cx + ax * step,
              cy + ay * step,
              cz + az * step,
              fv[a],
              cx + bx * step,
              cy + by * step,
              cz + bz * step,
              fv[b],
              isoValue,
            );
          }

          const tri = TRI_TABLE[ci];
          for (let t = 0; t < tri.length; t += 3) {
            const v0 = ev[tri[t]],
              v1 = ev[tri[t + 1]],
              v2 = ev[tri[t + 2]];
            if (!v0 || !v1 || !v2) continue;
            const ax = v1[0] - v0[0],
              ay = v1[1] - v0[1],
              az = v1[2] - v0[2];
            const bx = v2[0] - v0[0],
              by = v2[1] - v0[1],
              bz = v2[2] - v0[2];
            const nx = ay * bz - az * by,
              ny = az * bx - ax * bz,
              nz = ax * by - ay * bx;
            const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
            for (const v of [v0, v1, v2]) {
              verts.push(...v);
              norms.push(nx / nl, ny / nl, nz / nl);
            }
            phases.push(pv[0], pv[0], pv[0]);
          }
        }

    return {
      vertices: new Float32Array(verts),
      normals: new Float32Array(norms),
      phaseColors: new Float32Array(phases),
    };
  }

  // ─── Criar material de nuvem (ShaderMaterial) ─────────────
  createCloudMaterial(pointSize: number): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader: VERT_CLOUD,
      fragmentShader: FRAG_CLOUD,
      uniforms: {
        uSize: { value: pointSize },
        cPos: { value: new THREE.Color(0x4fa3e3) },
        cNeg: { value: new THREE.Color(0xe35040) },
        uOpacity: { value: 0.85 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  // ─── Criar material de superfície (ShaderMaterial) ────────
  createSurfaceMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader: VERT_SURF,
      fragmentShader: FRAG_SURF,
      uniforms: {
        cPos: { value: new THREE.Color(0x4fa3e3) },
        cNeg: { value: new THREE.Color(0xe35040) },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  // ─── Distribuição radial para canvas 2D (Davidson) ────────
  drawRadial(canvas: HTMLCanvasElement, n: number, l: number): void {
    // incluir os dados da função radial que vai vir do backend

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW > 0 && cssH > 0) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const W = cssW;
    const H = cssH;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#07070f';
    ctx.fillRect(0, 0, W, H);

    const rMax = n * n * 2.8 + 6;
    const steps = 500;
    let maxV = 0;
    const pts: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const r = (i / steps) * rMax;
      const R = radialWF(n, l, r);
      const v = 4 * Math.PI * r * r * R * R;
      if (v > maxV) maxV = v;
      pts.push([r, v]);
    }
    if (maxV < 1e-15) return;

    // ---- Grid de fundo (4 linhas horizontais) ----
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = H - 28 - i * ((H - 44) / 4);
      ctx.beginPath();
      ctx.moveTo(36, y);
      ctx.lineTo(W - 8, y);
      ctx.stroke();
    }

    // ---- Eixos ----
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(36, 8);
    ctx.lineTo(36, H - 28);
    ctx.lineTo(W - 8, H - 28);
    ctx.stroke();

    // ---- Rótulos dos eixos ----
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '9px monospace';
    ctx.fillText('|\u03A8|\u00B2', 10, 14);
    ctx.fillText('r (a\u2080)', W - 34, H - 6);

    // ---- TICKS NO EIXO X (r) ----
    const numTicksX = 5;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < numTicksX; i++) {
      const frac = i / (numTicksX - 1);
      const rVal = frac * rMax;
      const xPos = 36 + frac * (W - 50);
      // linha de tick
      ctx.beginPath();
      ctx.moveTo(xPos, H - 28);
      ctx.lineTo(xPos, H - 24);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // rótulo
      const label = rVal.toFixed(rVal < 1 ? 2 : rVal < 10 ? 1 : 0);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillText(label, xPos, H - 22);
    }

    // ---- Curva ----
    ctx.beginPath();
    let first = true;
    for (const [r, v] of pts) {
      const x = 36 + (r / rMax) * (W - 50);
      const y = H - 28 - (v / maxV) * (H - 44);
      first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      first = false;
    }
    ctx.strokeStyle = '#4fa3e3';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#4fa3e3';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ---- Área preenchida ----
    const grad = ctx.createLinearGradient(0, 8, 0, H - 28);
    grad.addColorStop(0, '#4fa3e3aa');
    grad.addColorStop(1, '#4fa3e308');
    ctx.beginPath();
    first = true;
    for (const [r, v] of pts) {
      const x = 36 + (r / rMax) * (W - 50);
      const y = H - 28 - (v / maxV) * (H - 44);
      first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      first = false;
    }
    ctx.lineTo(36 + (W - 50), H - 28);
    ctx.lineTo(36, H - 28);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // ---- Título com n e l ----
    ctx.fillStyle = '#4fa3e3';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`n=${n}  l=${l}`, 44, 0);
  }

  // ─── Mapa de densidade 2D (Davidson) ──────────────────────
  drawDensity(
    canvas: HTMLCanvasElement,
    n: number,
    l: number,
    m: number,
    plane: string,
  ): void {
    // Incluir aqui chamada para as imagens geradas no backend
  }
}
