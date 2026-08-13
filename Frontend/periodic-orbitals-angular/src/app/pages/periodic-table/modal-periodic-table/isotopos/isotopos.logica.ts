import { Isotopo } from './isotopos.models';

/** Cor padrão para isótopos radioativos quando nenhuma cor de categoria é aplicável ao decaimento. */
export const COR_RADIOATIVO_PADRAO = '#E08662';

/** Retorna a maior abundância natural entre os isótopos (mínimo 1 para evitar divisão por zero). */
export function calcularAbundanciaMaxima(isotopos: Isotopo[]): number {
  const maior = Math.max(...isotopos.map((i) => i.abundanciaNatural), 0);
  return maior > 0 ? maior : 1;
}

/**
 * Calcula a altura (%) da barra de um isótopo no gráfico tipo espectro de massa,
 * relativa à maior abundância do conjunto. Isótopos-traço/sintéticos recebem uma
 * altura mínima visível em vez de zero.
 */
export function calcularAlturaBarra(isotopo: Isotopo, abundanciaMaxima: number): number {
  const alturaMinima = isotopo.abundanciaNatural > 0 ? 4 : 2;
  const alturaProporcional = (isotopo.abundanciaNatural / abundanciaMaxima) * 100;
  return Math.max(alturaProporcional, alturaMinima);
}

/** Formata a abundância natural para exibição, tratando o caso de traço/sintético. */
export function formatarAbundancia(isotopo: Isotopo): string {
  return isotopo.abundanciaNatural > 0
    ? `${isotopo.abundanciaNatural.toFixed(2)}%`
    : 'traço';
}

/** Determina a cor de destaque de um isótopo: cor da categoria do elemento se estável, cor de decaimento caso contrário. */
export function corIsotopo(isotopo: Isotopo, corCategoria: string): string {
  return isotopo.estavel ? corCategoria : COR_RADIOATIVO_PADRAO;
}

/** Ordena isótopos por número de massa crescente — útil quando os dados vêm sem ordem garantida do backend. */
export function ordenarPorMassa(isotopos: Isotopo[]): Isotopo[] {
  return [...isotopos].sort((a, b) => a.numeroMassa - b.numeroMassa);
}
