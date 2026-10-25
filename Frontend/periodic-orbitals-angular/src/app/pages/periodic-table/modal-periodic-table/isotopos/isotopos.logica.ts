import { ComposicaoNucleo, EscalaAbundancia, Isotopo, ResumoIsotopos } from './isotopos.models';

/** Cor padrão para isótopos radioativos quando nenhuma cor de categoria é aplicável ao decaimento. */
export const COR_RADIOATIVO_PADRAO = '#E08662';

/** Valores "redondos" candidatos ao topo do eixo Y (em %). */
const TOPOS_ESCALA = [1, 2, 5, 10, 20, 25, 50, 100];

/** Descrições dos modos de decaimento mais comuns. Mantidas em minúsculas para uso no meio de frases. */
const DESCRICAO_DECAIMENTO: Record<string, string> = {
  α: 'emissão alfa',
  'β⁻': 'decaimento beta menos',
  'β-': 'decaimento beta menos',
  'β⁺': 'decaimento beta mais',
  'β+': 'decaimento beta mais',
  ε: 'captura eletrônica',
  EC: 'captura eletrônica',
  IT: 'transição isomérica',
  SF: 'fissão espontânea',
  n: 'emissão de nêutron',
  p: 'emissão de próton',
};

/** Retorna a maior abundância natural entre os isótopos (mínimo 1 para evitar divisão por zero). */
export function calcularAbundanciaMaxima(isotopos: Isotopo[]): number {
  const maior = Math.max(...isotopos.map((i) => i.abundanciaNatural), 0);
  return maior > 0 ? maior : 1;
}

/**
 * Define o eixo Y do gráfico: o topo é o menor valor "redondo" que comporta a maior abundância
 * e as marcas dividem o eixo em 4 intervalos iguais (ex: topo 100 → 0, 25, 50, 75, 100).
 */
export function calcularEscala(abundanciaMaxima: number): EscalaAbundancia {
  const topo = TOPOS_ESCALA.find((candidato) => candidato >= abundanciaMaxima) ?? 100;
  const passo = topo / 4;
  return { topo, ticks: [0, 1, 2, 3, 4].map((i) => i * passo) };
}

/** Formata uma marca do eixo Y: inteiros sem casas, fracionários sem zeros à direita. */
export function formatarTick(valor: number): string {
  const texto = Number.isInteger(valor) ? String(valor) : valor.toFixed(2).replace(/0+$/, '');
  return `${texto}%`;
}

/** Posição vertical (%) de uma marca dentro da área do gráfico. */
export function calcularPosicaoTick(valor: number, topoEscala: number): number {
  return (valor / topoEscala) * 100;
}

/**
 * Calcula a altura (%) da barra de um isótopo, relativa ao topo da escala do eixo Y.
 * Isótopos-traço/sintéticos recebem uma altura mínima visível em vez de zero.
 */
export function calcularAlturaBarra(isotopo: Isotopo, topoEscala: number): number {
  const alturaMinima = isotopo.abundanciaNatural > 0 ? 4 : 2;
  const alturaProporcional = (isotopo.abundanciaNatural / topoEscala) * 100;
  return Math.max(alturaProporcional, alturaMinima);
}

/** Formata a abundância natural para exibição, tratando o caso de traço/sintético. */
export function formatarAbundancia(isotopo: Isotopo): string {
  return isotopo.abundanciaNatural > 0 ? `${isotopo.abundanciaNatural.toFixed(2)}%` : 'traço';
}

/** Largura (%) do medidor de abundância no card de detalhe, limitada a 0–100. */
export function calcularLarguraMedidor(isotopo: Isotopo): number {
  return Math.min(Math.max(isotopo.abundanciaNatural, 0), 100);
}

/** Determina a cor de destaque de um isótopo: cor da categoria do elemento se estável, cor de decaimento caso contrário. */
export function corIsotopo(isotopo: Isotopo, corCategoria: string): string {
  return isotopo.estavel ? corCategoria : COR_RADIOATIVO_PADRAO;
}

/** Ordena isótopos por número de massa crescente — útil quando os dados vêm sem ordem garantida do backend. */
export function ordenarPorMassa(isotopos: Isotopo[]): Isotopo[] {
  return [...isotopos].sort((a, b) => a.numeroMassa - b.numeroMassa);
}

/** Texto do tooltip de cada pico: símbolo do isótopo e meia-vida quando radioativo. */
export function textoTooltip(isotopo: Isotopo): string {
  if (isotopo.estavel) return `${isotopo.simboloIsotopo} (estável)`;
  return isotopo.meiaVida
    ? `${isotopo.simboloIsotopo} (meia-vida: ${isotopo.meiaVida})`
    : `${isotopo.simboloIsotopo} (radioativo)`;
}

/** Calcula prótons, nêutrons, razão N/Z e a fração de prótons do núcleo de um isótopo. */
export function calcularComposicao(isotopo: Isotopo, numeroAtomico: number): ComposicaoNucleo {
  const protons = numeroAtomico;
  const neutrons = Math.max(isotopo.numeroMassa - protons, 0);
  return {
    protons,
    neutrons,
    razaoNZ: protons > 0 ? neutrons / protons : 0,
    fracaoProtons: isotopo.numeroMassa > 0 ? (protons / isotopo.numeroMassa) * 100 : 0,
  };
}

/** Agrega contagens e identifica o isótopo mais abundante. */
export function resumirIsotopos(isotopos: Isotopo[]): ResumoIsotopos {
  const estaveis = isotopos.filter((i) => i.estavel).length;
  const maisAbundante = isotopos.reduce<Isotopo | null>(
    (melhor, atual) =>
      atual.abundanciaNatural > (melhor?.abundanciaNatural ?? 0) ? atual : melhor,
    null,
  );

  return {
    total: isotopos.length,
    estaveis,
    radioativos: isotopos.length - estaveis,
    maisAbundante,
  };
}

/**
 * Traduz o modo de decaimento (ex: "α", "β⁻") para uma descrição em português.
 * Retorna null se o modo for desconhecido ou composto por símbolos sem descrição.
 */
export function descreverDecaimento(modo: string | null): string | null {
  if (!modo) return null;

  const partes = modo
    .split(/[,;]/)
    .map((parte) => parte.trim())
    .filter(Boolean);
  const descricoes = partes
    .map((parte) => DESCRICAO_DECAIMENTO[parte])
    .filter((descricao): descricao is string => !!descricao);

  return partes.length > 0 && descricoes.length === partes.length ? descricoes.join(' + ') : null;
}
