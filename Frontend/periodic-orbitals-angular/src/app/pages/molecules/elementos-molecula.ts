import { DadosElemento, SimboloElemento } from './molecula.models';

export const ELEMENTOS: Readonly<Record<SimboloElemento, DadosElemento>> = {
  H: {
    simbolo: 'H', nome: 'Hidrogênio', numeroAtomico: 1, massaAtomica: 1.008,
    cor: '#FFFFFF', raioCovalente: 0.31, raioVdw: 1.20, eletronsValencia: 1, valencias: [1],
  },
  C: {
    simbolo: 'C', nome: 'Carbono', numeroAtomico: 6, massaAtomica: 12.011,
    cor: '#444444', raioCovalente: 0.76, raioVdw: 1.70, eletronsValencia: 4, valencias: [4],
  },
  N: {
    simbolo: 'N', nome: 'Nitrogênio', numeroAtomico: 7, massaAtomica: 14.007,
    cor: '#3050F8', raioCovalente: 0.71, raioVdw: 1.55, eletronsValencia: 5, valencias: [3],
  },
  O: {
    simbolo: 'O', nome: 'Oxigênio', numeroAtomico: 8, massaAtomica: 15.999,
    cor: '#E8161B', raioCovalente: 0.66, raioVdw: 1.52, eletronsValencia: 6, valencias: [2],
  },
  F: {
    simbolo: 'F', nome: 'Flúor', numeroAtomico: 9, massaAtomica: 18.998,
    cor: '#4FD1C5', raioCovalente: 0.57, raioVdw: 1.47, eletronsValencia: 7, valencias: [1],
  },
  P: {
    simbolo: 'P', nome: 'Fósforo', numeroAtomico: 15, massaAtomica: 30.974,
    cor: '#FF8000', raioCovalente: 1.07, raioVdw: 1.80, eletronsValencia: 5, valencias: [3, 5],
  },
  S: {
    simbolo: 'S', nome: 'Enxofre', numeroAtomico: 16, massaAtomica: 32.06,
    cor: '#F2C500', raioCovalente: 1.05, raioVdw: 1.80, eletronsValencia: 6, valencias: [2, 4, 6],
  },
  Cl: {
    simbolo: 'Cl', nome: 'Cloro', numeroAtomico: 17, massaAtomica: 35.45,
    cor: '#1FC41F', raioCovalente: 1.02, raioVdw: 1.75, eletronsValencia: 7, valencias: [1],
  },
  Br: {
    simbolo: 'Br', nome: 'Bromo', numeroAtomico: 35, massaAtomica: 79.904,
    cor: '#9C2A2A', raioCovalente: 1.20, raioVdw: 1.85, eletronsValencia: 7, valencias: [1],
  },
  I: {
    simbolo: 'I', nome: 'Iodo', numeroAtomico: 53, massaAtomica: 126.904,
    cor: '#7A1FA0', raioCovalente: 1.39, raioVdw: 1.98, eletronsValencia: 7, valencias: [1],
  },
};

/** Ordem de exibição na paleta: os mais comuns primeiro. */
export const LISTA_ELEMENTOS: readonly DadosElemento[] = (
  ['H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I'] as const
).map((s) => ELEMENTOS[s]);

/** Cor de texto legível sobre a cor do elemento (luminância relativa aproximada). */
export function corTextoSobre(corHex: string): string {
  const n = parseInt(corHex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.6 ? '#111111' : '#FFFFFF';
}

/** Mistura duas cores hex (`t` = 0 devolve `corHex`, 1 devolve `alvoHex`). */
export function misturar(corHex: string, alvoHex: string, t: number): string {
  const a = parseInt(corHex.slice(1), 16);
  const b = parseInt(alvoHex.slice(1), 16);
  const canal = (deslocamento: number) => {
    const va = (a >> deslocamento) & 255;
    const vb = (b >> deslocamento) & 255;
    return Math.round(va + (vb - va) * t);
  };
  return `#${((canal(16) << 16) | (canal(8) << 8) | canal(0)).toString(16).padStart(6, '0')}`;
}

/** Tons de realce e sombra usados para dar volume de esfera aos átomos nas interfaces 2D. */
export function tonsDoElemento(cor: string): { claro: string; escuro: string } {
  return { claro: misturar(cor, '#FFFFFF', 0.45), escuro: misturar(cor, '#000000', 0.38) };
}

export function gradienteCss(cor: string): string {
  const { claro, escuro } = tonsDoElemento(cor);
  return `radial-gradient(circle at 35% 30%, ${claro} 0%, ${cor} 55%, ${escuro} 100%)`;
}
