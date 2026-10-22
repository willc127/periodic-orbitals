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
