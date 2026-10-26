export type SimboloElemento = 'H' | 'C' | 'N' | 'O' | 'F' | 'P' | 'S' | 'Cl' | 'Br' | 'I';

export type OrdemLigacao = 1 | 2 | 3;

/** Coordenadas x/y em pixels do editor 2D (y cresce para baixo). */
export interface Atomo {
  readonly id: number;
  readonly elemento: SimboloElemento;
  readonly x: number;
  readonly y: number;
}

export interface Ligacao {
  readonly id: number;
  readonly a: number;
  readonly b: number;
  readonly ordem: OrdemLigacao;
}

/** Estrutura imutável: toda edição devolve uma nova molécula. Átomos e ligações compartilham o contador de ids. */
export interface Molecula {
  readonly atomos: readonly Atomo[];
  readonly ligacoes: readonly Ligacao[];
  readonly proximoId: number;
}

export interface Vetor3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** id do átomo -> posição 3D em angstroms. */
export type Geometria3D = ReadonlyMap<number, Vetor3>;

export type ResultadoEdicao =
  | { readonly ok: true; readonly molecula: Molecula; readonly idNovo?: number }
  | { readonly ok: false; readonly erro: string };

export type ModoVisualizacao = '2d' | '3d';
export type EstiloMolecular = 'bola-e-vareta' | 'vareta' | 'espaco-preenchido';
export type Ferramenta = 'desenhar' | 'mover' | 'apagar';

export interface DadosElemento {
  readonly simbolo: SimboloElemento;
  readonly nome: string;
  readonly numeroAtomico: number;
  /** g/mol */
  readonly massaAtomica: number;
  readonly cor: string;
  /** Å (Cordero et al., 2008) */
  readonly raioCovalente: number;
  /** Å (Bondi) */
  readonly raioVdw: number;
  readonly eletronsValencia: number;
  /** Valências permitidas em ordem crescente; a última é o máximo. */
  readonly valencias: readonly number[];
}

export interface ItemComposicao {
  readonly simbolo: SimboloElemento;
  readonly quantidade: number;
}

export interface ResumoValencias {
  readonly atomosComValenciaAberta: number;
  readonly hidrogeniosFaltantes: number;
}
