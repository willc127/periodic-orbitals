import { ELEMENTOS } from './elementos-molecula';
import { Geometria3D, Molecula, OrdemLigacao, SimboloElemento, Vetor3 } from './molecula.models';

/** Pixels do editor 2D por angstrom (60 px ≈ 1,5 Å). */
const ESCALA_2D = 40;

const FATOR_ORDEM: Readonly<Record<OrdemLigacao, number>> = { 1: 1, 2: 0.9, 3: 0.8 };

/** Comprimento de ligação em Å a partir dos raios covalentes, encurtado para ligações múltiplas. */
export function comprimentoLigacao(a: SimboloElemento, b: SimboloElemento, ordem: OrdemLigacao): number {
  return (ELEMENTOS[a].raioCovalente + ELEMENTOS[b].raioCovalente) * FATOR_ORDEM[ordem];
}

/** Ângulo ideal (graus) entre ligações de um átomo central, pela contagem de pares de elétrons (VSEPR). */
export function anguloIdeal(elemento: SimboloElemento, nVizinhos: number, somaOrdens: number): number {
  const paresLivres = Math.max(0, Math.floor((ELEMENTOS[elemento].eletronsValencia - somaOrdens) / 2));
  const numeroEsterico = nVizinhos + paresLivres;
  if (numeroEsterico <= 2) return 180;
  if (numeroEsterico === 3) return 120;
  if (numeroEsterico === 4) {
    if (paresLivres === 0) return 109.47;
    return paresLivres === 1 ? 107 : 104.5;
  }
  return 90;
}

/** Pseudo-aleatório determinístico em [-0.5, 0.5) para quebrar simetrias sem variar entre execuções. */
function ruido(i: number): number {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s) - 0.5;
}

interface Restricao {
  readonly i: number;
  readonly j: number;
  readonly distancia: number;
}

/**
 * Gera coordenadas 3D (Å) a partir da topologia e do desenho 2D.
 * Usa relaxamento por restrições de distância (ligações, ângulos via distância 1-3 e repulsão
 * entre átomos não ligados). É determinístico e suficiente para moléculas pequenas; não resolve
 * estereoquímica (quiralidade, cis/trans em anéis). Para isso, usar RDKit no backend (etapa 3).
 */
export function gerarGeometria3D(mol: Molecula, iteracoes = 400): Geometria3D {
  const n = mol.atomos.length;
  const resultado = new Map<number, Vetor3>();
  if (n === 0) return resultado;

  const indice = new Map<number, number>(mol.atomos.map((a, i) => [a.id, i]));
  const vizinhos: { j: number; ordem: OrdemLigacao }[][] = mol.atomos.map(() => []);
  for (const l of mol.ligacoes) {
    const i = indice.get(l.a)!;
    const j = indice.get(l.b)!;
    vizinhos[i].push({ j, ordem: l.ordem });
    vizinhos[j].push({ j: i, ordem: l.ordem });
  }

  // ---- posições iniciais: desenho 2D (y invertido) + ruído. O ruído no plano é maior que o de z
  // para que ligações desenhadas em linha reta entortem dentro do plano e sistemas sp2 fiquem planares.
  const P = new Float64Array(n * 3);
  mol.atomos.forEach((a, i) => {
    P[i * 3] = a.x / ESCALA_2D + ruido(a.id + 7) * 0.03;
    P[i * 3 + 1] = -a.y / ESCALA_2D + ruido(a.id + 13) * 0.03;
    P[i * 3 + 2] = ruido(a.id) * 0.01;
  });

  // ---- restrições
  const ligacoes: Restricao[] = [];
  const angulos: Restricao[] = [];
  const excluidos = new Set<number>();
  const chave = (i: number, j: number) => (i < j ? i * n + j : j * n + i);

  for (const l of mol.ligacoes) {
    const i = indice.get(l.a)!;
    const j = indice.get(l.b)!;
    ligacoes.push({
      i,
      j,
      distancia: comprimentoLigacao(mol.atomos[i].elemento, mol.atomos[j].elemento, l.ordem),
    });
    excluidos.add(chave(i, j));
  }

  mol.atomos.forEach((centro, c) => {
    const vs = vizinhos[c];
    if (vs.length < 2) return;
    const soma = vs.reduce((s, v) => s + v.ordem, 0);
    const graus = anguloIdeal(centro.elemento, vs.length, soma);
    const cosTheta = Math.cos((graus * Math.PI) / 180);

    // sp3 com 3+ vizinhos: alterna z dos vizinhos para a molécula sair do plano do desenho
    if (graus > 100 && graus < 110 && vs.length >= 3) {
      vs.forEach((v, k) => {
        P[v.j * 3 + 2] += k % 2 === 0 ? 0.5 : -0.5;
      });
    }

    for (let p = 0; p < vs.length; p++) {
      for (let q = p + 1; q < vs.length; q++) {
        const i = vs[p].j;
        const j = vs[q].j;
        excluidos.add(chave(i, j));
        if (ligacoes.some((r) => chave(r.i, r.j) === chave(i, j))) continue; // anel triangular
        const a = comprimentoLigacao(centro.elemento, mol.atomos[i].elemento, vs[p].ordem);
        const b = comprimentoLigacao(centro.elemento, mol.atomos[j].elemento, vs[q].ordem);
        angulos.push({ i, j, distancia: Math.sqrt(a * a + b * b - 2 * a * b * cosTheta) });
      }
    }
  });

  const repulsoes: Restricao[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (excluidos.has(chave(i, j))) continue;
      const vdw = ELEMENTOS[mol.atomos[i].elemento].raioVdw + ELEMENTOS[mol.atomos[j].elemento].raioVdw;
      repulsoes.push({ i, j, distancia: vdw * 0.75 });
    }
  }

  // ---- relaxamento (position-based dynamics)
  const resolver = (r: Restricao, rigidez: number, apenasSeMenor: boolean) => {
    const dx = P[r.j * 3] - P[r.i * 3];
    const dy = P[r.j * 3 + 1] - P[r.i * 3 + 1];
    const dz = P[r.j * 3 + 2] - P[r.i * 3 + 2];
    let d = Math.hypot(dx, dy, dz);
    if (apenasSeMenor && d >= r.distancia) return;
    if (d < 1e-9) d = 1e-9;
    const f = ((d - r.distancia) / d) * 0.5 * rigidez;
    P[r.i * 3] += dx * f;
    P[r.i * 3 + 1] += dy * f;
    P[r.i * 3 + 2] += dz * f;
    P[r.j * 3] -= dx * f;
    P[r.j * 3 + 1] -= dy * f;
    P[r.j * 3 + 2] -= dz * f;
  };

  for (let it = 0; it < iteracoes; it++) {
    for (const r of angulos) resolver(r, 0.5, false);
    for (const r of repulsoes) resolver(r, 0.5, true);
    for (const r of ligacoes) resolver(r, 1, false);
  }

  // ---- centraliza na origem
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < n; i++) {
    cx += P[i * 3];
    cy += P[i * 3 + 1];
    cz += P[i * 3 + 2];
  }
  cx /= n; cy /= n; cz /= n;
  mol.atomos.forEach((a, i) => {
    resultado.set(a.id, { x: P[i * 3] - cx, y: P[i * 3 + 1] - cy, z: P[i * 3 + 2] - cz });
  });
  return resultado;
}
