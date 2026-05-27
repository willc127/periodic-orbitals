export interface IElement {
  simbolo: string;
  nome: string;
  numeroAtomico: number | null;
  massaAtomica: number;
  grupo: number;
  serie: string;
  periodo: number;
  configuracaoEletronica: string;
  descricao?: string;
  tipo: string;
  link?: string;
  link_nist?: string;
  spectral_lines?: [number, number][];
}
