/**
 * Lógica de cálculo do diagrama de caixas/spins da configuração eletrônica.
 * Extraída do componente para permitir testes unitários isolados (sem TestBed).
 */

export type Bloco = 's' | 'p' | 'd' | 'f';

export interface CaixaOrbital {
  possuiSetaCima: boolean;
  possuiSetaBaixo: boolean;
  vazia: boolean;
  destacada: boolean;
}

export interface GrupoSubcamada {
  rotulo: string;
  bloco: Bloco;
  caixas: CaixaOrbital[];
  existe: boolean; // false = placeholder (ex.: não existe 1p, 2d, 1f...)
}

export interface LinhaPeriodo {
  periodo: number;
  grupoS: GrupoSubcamada;
  grupoP: GrupoSubcamada;
  grupoD: GrupoSubcamada;
  grupoF: GrupoSubcamada;
}

interface UltimoEletron {
  n: number;
  l: number;
  indiceCaixa: number;
  spin: 'cima' | 'baixo';
}

const LETRA_BLOCO: Record<number, Bloco> = { 0: 's', 1: 'p', 2: 'd', 3: 'f' };

// Ordem de preenchimento de Madelung (regra n+l, depois n)
const ORDEM_MADELUNG: Array<[number, number]> = [
  [1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0],
  [4, 2], [5, 1], [6, 0], [4, 3], [5, 2], [6, 1], [7, 0], [5, 3], [6, 2], [7, 1],
];

// Subcamadas exibidas no diagrama (mesmo conjunto usado na referência visual)
const CONJUNTO_EXIBIDO: Array<[number, number]> = [
  ...Array.from({ length: 7 }, (_, i): [number, number] => [i + 1, 0]), // 1s..7s
  ...Array.from({ length: 6 }, (_, i): [number, number] => [i + 2, 1]), // 2p..7p
  ...Array.from({ length: 4 }, (_, i): [number, number] => [i + 3, 2]), // 3d..6d
  ...Array.from({ length: 2 }, (_, i): [number, number] => [i + 4, 3]), // 4f,5f
];

function chave(n: number, l: number): string {
  return `${n}-${l}`;
}

function capacidade(l: number): number {
  return 2 * (2 * l + 1);
}

function numeroCaixas(l: number): number {
  return 2 * l + 1;
}

function periodoExibido(n: number, l: number): number {
  return n;
}

export function converterSuperescrito(valor: number): string {
  const mapa: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };
  return String(valor).split('').map((c) => mapa[c] ?? c).join('');
}

export function calcularEletronsPorSubcamada(numeroAtomico: number): Map<string, number> {
  let restante = Math.max(0, Math.min(118, Math.floor(numeroAtomico)));
  const eletronsPorSubcamada = new Map<string, number>();

  for (const [n, l] of ORDEM_MADELUNG) {
    if (restante <= 0) break;
    const cap = capacidade(l);
    const quantidade = Math.min(restante, cap);
    if (quantidade <= 0) continue;
    eletronsPorSubcamada.set(chave(n, l), quantidade);
    restante -= quantidade;
  }
  return eletronsPorSubcamada;
}

function encontrarUltimoEletron(eletronsPorSubcamada: Map<string, number>): UltimoEletron | null {
  let ultimo: UltimoEletron | null = null;
  for (const [n, l] of ORDEM_MADELUNG) {
    const quantidade = eletronsPorSubcamada.get(chave(n, l));
    if (quantidade === undefined) continue;
    const caixas = numeroCaixas(l);
    const indice = quantidade - 1;
    ultimo = indice < caixas
      ? { n, l, indiceCaixa: indice, spin: 'cima' }
      : { n, l, indiceCaixa: indice - caixas, spin: 'baixo' };
  }
  return ultimo;
}

export function construirNotacaoConfiguracao(eletronsPorSubcamada: Map<string, number>): string {
  const entradas = Array.from(eletronsPorSubcamada.entries())
    .map(([k, quantidade]) => {
      const [n, l] = k.split('-').map(Number);
      return { n, l, quantidade };
    })
    .sort((a, b) => (a.n + a.l) - (b.n + b.l) || a.n - b.n);

  return entradas
    .map((e) => `${e.n}${LETRA_BLOCO[e.l]}${converterSuperescrito(e.quantidade)}`)
    .join(' ');
}

function montarGrupo(
  entrada: [number, number] | undefined,
  bloco: Bloco,
  eletronsPorSubcamada: Map<string, number>,
  ultimo: UltimoEletron | null,
): GrupoSubcamada {
  if (!entrada) {
    const caixasVazias = bloco === 's' ? 1 : bloco === 'p' ? 3 : bloco === 'd' ? 5 : 7;
    return {
      rotulo: '',
      bloco,
      existe: false,
      caixas: Array.from({ length: caixasVazias }, () => ({
        possuiSetaCima: false,
        possuiSetaBaixo: false,
        vazia: true,
        destacada: false,
      })),
    };
  }

  const [n, l] = entrada;
  const totalCaixas = numeroCaixas(l);
  const quantidade = eletronsPorSubcamada.get(chave(n, l)) ?? 0;
  const setasParaCima = Math.min(quantidade, totalCaixas);
  const setasParaBaixo = Math.max(0, quantidade - totalCaixas);

  const caixas: CaixaOrbital[] = Array.from({ length: totalCaixas }, (_, i) => {
    const possuiSetaCima = i < setasParaCima;
    const possuiSetaBaixo = i < setasParaBaixo;
    const destacada = !!ultimo && ultimo.n === n && ultimo.l === l && ultimo.indiceCaixa === i;
    return { possuiSetaCima, possuiSetaBaixo, vazia: !possuiSetaCima && !possuiSetaBaixo, destacada };
  });

  return { rotulo: `${n}${LETRA_BLOCO[l]}`, bloco, existe: true, caixas };
}

export function construirLinhasPeriodo(numeroAtomico: number): LinhaPeriodo[] {
  const eletronsPorSubcamada = calcularEletronsPorSubcamada(numeroAtomico);
  const ultimo = encontrarUltimoEletron(eletronsPorSubcamada);

  const linhas: LinhaPeriodo[] = [];
  for (let periodo = 7; periodo >= 1; periodo--) {
    const entradaS = CONJUNTO_EXIBIDO.find(([n, l]) => l === 0 && periodoExibido(n, l) === periodo);
    const entradaP = CONJUNTO_EXIBIDO.find(([n, l]) => l === 1 && periodoExibido(n, l) === periodo);
    const entradaD = CONJUNTO_EXIBIDO.find(([n, l]) => l === 2 && periodoExibido(n, l) === periodo);
    const entradaF = CONJUNTO_EXIBIDO.find(([n, l]) => l === 3 && periodoExibido(n, l) === periodo);

    linhas.push({
      periodo,
      grupoS: montarGrupo(entradaS, 's', eletronsPorSubcamada, ultimo),
      grupoP: montarGrupo(entradaP, 'p', eletronsPorSubcamada, ultimo),
      grupoD: montarGrupo(entradaD, 'd', eletronsPorSubcamada, ultimo),
      grupoF: montarGrupo(entradaF, 'f', eletronsPorSubcamada, ultimo),
    });
  }
  return linhas;
}
