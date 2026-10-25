export interface Isotopo {
  numeroMassa: number;
  simboloIsotopo: string; // ex: "²³⁵U"
  abundanciaNatural: number; // percentual, 0 se sintético/traço
  estavel: boolean;
  meiaVida: string | null; // ex: "703.8 milhões de anos"
  modoDecaimento: string | null; // ex: "α", "β⁻"
}

export interface DadosIsotoposElemento {
  numeroAtomico: number;
  simboloElemento: string;
  nomeElemento: string;
  isotopos: Isotopo[];
}

/** Escala do eixo Y do gráfico: valor máximo "redondo" e as marcas (ticks) entre 0 e o topo. */
export interface EscalaAbundancia {
  topo: number;
  ticks: number[];
}

/** Números agregados exibidos na faixa de resumo acima do gráfico. */
export interface ResumoIsotopos {
  total: number;
  estaveis: number;
  radioativos: number;
  maisAbundante: Isotopo | null;
}

/** Composição do núcleo do isótopo selecionado. */
export interface ComposicaoNucleo {
  protons: number;
  neutrons: number;
  razaoNZ: number;
  /** Percentual de prótons sobre o total de núcleons (0–100). */
  fracaoProtons: number;
}
