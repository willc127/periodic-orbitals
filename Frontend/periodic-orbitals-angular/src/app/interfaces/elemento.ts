export interface Element {
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
}
