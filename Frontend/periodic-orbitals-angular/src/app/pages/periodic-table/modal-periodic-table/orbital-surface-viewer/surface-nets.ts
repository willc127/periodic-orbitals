// ─────────────────────────────────────────────────────────────
//  surface-nets.ts
//  Extrai a isosuperfície f = 0 de um campo escalar em grade cúbica
//  (região interna: f > 0) com Naive Surface Nets. Gera malha indexada
//  com vértices compartilhados (normais suaves) e sem tabelas de lookup.
//  Winding: normais apontam para FORA da região f > 0.
// ─────────────────────────────────────────────────────────────

export interface MalhaIso {
  posicoes: Float32Array;
  indices: Uint32Array;
}

// Cantos da célula: bit0 = x, bit1 = y, bit2 = z
const ARESTAS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [2, 3], [4, 5], [6, 7], // eixo x
  [0, 2], [1, 3], [4, 6], [5, 7], // eixo y
  [0, 4], [1, 5], [2, 6], [3, 7], // eixo z
];

/**
 * @param f       campo (índice x + N·(y + N·z)); interior = f > 0
 * @param N       voxels por eixo
 * @param origem  coordenada do voxel 0 (em a₀)
 * @param passo   distância entre voxels (em a₀)
 * @param escala  fator aplicado às posições finais (normaliza p/ a cena)
 */
export function extrairIsosuperficie(
  f: Float32Array,
  N: number,
  origem: number,
  passo: number,
  escala: number,
): MalhaIso | null {
  const M = N - 1;
  const sN = N * N;
  const celulas = new Int32Array(M * M * M).fill(-1);
  const off = [0, 1, N, N + 1, sN, sN + 1, sN + N, sN + N + 1];
  const v = new Float32Array(8);
  const pos: number[] = [];
  let nv = 0;

  // 1) Um vértice por célula atravessada pela superfície
  for (let z = 0; z < M; z++) {
    for (let y = 0; y < M; y++) {
      for (let x = 0; x < M; x++) {
        const base = x + N * (y + N * z);
        let mascara = 0;
        for (let c = 0; c < 8; c++) {
          v[c] = f[base + off[c]];
          if (v[c] > 0) mascara |= 1 << c;
        }
        if (mascara === 0 || mascara === 255) continue;

        let sx = 0, sy = 0, sz = 0, cnt = 0;
        for (let e = 0; e < 12; e++) {
          const a = ARESTAS[e][0];
          const b = ARESTAS[e][1];
          const va = v[a];
          const vb = v[b];
          if (va > 0 === vb > 0) continue;
          const t = va / (va - vb);
          sx += (a & 1) + t * ((b & 1) - (a & 1));
          sy += ((a >> 1) & 1) + t * (((b >> 1) & 1) - ((a >> 1) & 1));
          sz += ((a >> 2) & 1) + t * (((b >> 2) & 1) - ((a >> 2) & 1));
          cnt++;
        }
        pos.push(
          (origem + (x + sx / cnt) * passo) * escala,
          (origem + (y + sy / cnt) * passo) * escala,
          (origem + (z + sz / cnt) * passo) * escala,
        );
        celulas[x + M * (y + M * z)] = nv++;
      }
    }
  }
  if (nv === 0) return null;

  // 2) Um quad por aresta que cruza a superfície, ligando as 4 células vizinhas
  const idx: number[] = [];
  const cel = (x: number, y: number, z: number) => celulas[x + M * (y + M * z)];
  const quad = (a: number, b: number, c: number, d: number, inicioDentro: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (inicioDentro) idx.push(a, b, c, a, c, d);
    else idx.push(a, c, b, a, d, c);
  };

  for (let z = 0; z < N; z++) {
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const base = x + N * (y + N * z);
        const dentro = f[base] > 0;

        // aresta em +x
        if (x < M && y >= 1 && y <= M - 1 && z >= 1 && z <= M - 1 && dentro !== f[base + 1] > 0) {
          quad(cel(x, y - 1, z - 1), cel(x, y, z - 1), cel(x, y, z), cel(x, y - 1, z), dentro);
        }
        // aresta em +y
        if (y < M && z >= 1 && z <= M - 1 && x >= 1 && x <= M - 1 && dentro !== f[base + N] > 0) {
          quad(cel(x - 1, y, z - 1), cel(x - 1, y, z), cel(x, y, z), cel(x, y, z - 1), dentro);
        }
        // aresta em +z
        if (z < M && x >= 1 && x <= M - 1 && y >= 1 && y <= M - 1 && dentro !== f[base + sN] > 0) {
          quad(cel(x - 1, y - 1, z), cel(x, y - 1, z), cel(x, y, z), cel(x - 1, y, z), dentro);
        }
      }
    }
  }
  if (idx.length === 0) return null;

  return { posicoes: new Float32Array(pos), indices: new Uint32Array(idx) };
}
