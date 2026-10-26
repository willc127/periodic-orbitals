import { ELEMENTOS } from './elementos-molecula';
import {
  Atomo,
  ItemComposicao,
  Ligacao,
  Molecula,
  OrdemLigacao,
  ResultadoEdicao,
  ResumoValencias,
  SimboloElemento,
} from './molecula.models';

/** Comprimento padrão de uma ligação no editor 2D (px). */
export const COMPRIMENTO_LIGACAO_2D = 60;
/** Ligações com hidrogênio são desenhadas mais curtas. */
export const COMPRIMENTO_LIGACAO_H_2D = 45;

// ---------------------------------------------------------------- consultas

export function criarMoleculaVazia(): Molecula {
  return { atomos: [], ligacoes: [], proximoId: 1 };
}

export function obterAtomo(mol: Molecula, id: number): Atomo | undefined {
  return mol.atomos.find((a) => a.id === id);
}

export function ligacoesDoAtomo(mol: Molecula, id: number): Ligacao[] {
  return mol.ligacoes.filter((l) => l.a === id || l.b === id);
}

export function buscarLigacao(mol: Molecula, idA: number, idB: number): Ligacao | undefined {
  return mol.ligacoes.find((l) => (l.a === idA && l.b === idB) || (l.a === idB && l.b === idA));
}

export function vizinhosDoAtomo(mol: Molecula, id: number): { atomo: Atomo; ligacao: Ligacao }[] {
  const resultado: { atomo: Atomo; ligacao: Ligacao }[] = [];
  for (const ligacao of ligacoesDoAtomo(mol, id)) {
    const atomo = obterAtomo(mol, ligacao.a === id ? ligacao.b : ligacao.a);
    if (atomo) resultado.push({ atomo, ligacao });
  }
  return resultado;
}

// ----------------------------------------------------------------- valência

export function valenciaMaxima(elemento: SimboloElemento): number {
  const v = ELEMENTOS[elemento].valencias;
  return v[v.length - 1];
}

/** Soma das ordens das ligações do átomo. */
export function valenciaUsada(mol: Molecula, id: number): number {
  return ligacoesDoAtomo(mol, id).reduce((soma, l) => soma + l.ordem, 0);
}

/** Quantas ligações ainda faltam para chegar à próxima valência permitida (0 = átomo completo). */
export function valenciaAberta(mol: Molecula, id: number): number {
  const atomo = obterAtomo(mol, id);
  if (!atomo) return 0;
  const usada = valenciaUsada(mol, id);
  const alvo = ELEMENTOS[atomo.elemento].valencias.find((v) => v >= usada);
  return alvo === undefined ? 0 : alvo - usada;
}

export function resumirValencias(mol: Molecula): ResumoValencias {
  let atomosComValenciaAberta = 0;
  let hidrogeniosFaltantes = 0;
  for (const a of mol.atomos) {
    const aberta = valenciaAberta(mol, a.id);
    if (aberta > 0) {
      atomosComValenciaAberta++;
      if (a.elemento !== 'H') hidrogeniosFaltantes += aberta;
    }
  }
  return { atomosComValenciaAberta, hidrogeniosFaltantes };
}

// ------------------------------------------------------------------ edição

function erro(mensagem: string): ResultadoEdicao {
  return { ok: false, erro: mensagem };
}

function mensagemValencia(elemento: SimboloElemento): string {
  const e = ELEMENTOS[elemento];
  const max = valenciaMaxima(elemento);
  return max === 1
    ? `${e.nome} (${elemento}) faz apenas 1 ligação.`
    : `${e.nome} (${elemento}) já atingiu a valência máxima de ${max} ligações.`;
}

export function adicionarAtomo(
  mol: Molecula,
  elemento: SimboloElemento,
  x: number,
  y: number,
): { molecula: Molecula; id: number } {
  const id = mol.proximoId;
  return {
    id,
    molecula: { ...mol, atomos: [...mol.atomos, { id, elemento, x, y }], proximoId: id + 1 },
  };
}

export function removerAtomo(mol: Molecula, id: number): Molecula {
  return {
    ...mol,
    atomos: mol.atomos.filter((a) => a.id !== id),
    ligacoes: mol.ligacoes.filter((l) => l.a !== id && l.b !== id),
  };
}

export function removerLigacao(mol: Molecula, id: number): Molecula {
  return { ...mol, ligacoes: mol.ligacoes.filter((l) => l.id !== id) };
}

export function moverAtomo(mol: Molecula, id: number, x: number, y: number): Molecula {
  return { ...mol, atomos: mol.atomos.map((a) => (a.id === id ? { ...a, x, y } : a)) };
}

/**
 * Remove hidrogênios terminais do átomo para abrir espaço para outra ligação
 * (como o Avogadro faz ao aumentar a ordem de uma ligação).
 */
function liberarValencia(
  mol: Molecula,
  id: number,
  necessario: number,
  protegidos: ReadonlySet<number>,
): { molecula: Molecula; liberada: number } {
  let atual = mol;
  let liberada = 0;
  if (obterAtomo(mol, id)?.elemento === 'H') return { molecula: mol, liberada };
  for (const { atomo } of vizinhosDoAtomo(mol, id)) {
    if (liberada >= necessario) break;
    if (atomo.elemento !== 'H' || protegidos.has(atomo.id)) continue;
    if (ligacoesDoAtomo(atual, atomo.id).length !== 1) continue;
    atual = removerAtomo(atual, atomo.id);
    liberada++;
  }
  return { molecula: atual, liberada };
}

/** Cria a ligação entre dois átomos ou, se já existir, troca a ordem dela. */
export function ligar(mol: Molecula, idA: number, idB: number, ordem: OrdemLigacao): ResultadoEdicao {
  if (idA === idB) return erro('Não é possível ligar um átomo a ele mesmo.');
  if (!obterAtomo(mol, idA) || !obterAtomo(mol, idB)) return erro('Átomo não encontrado.');

  const existente = buscarLigacao(mol, idA, idB);
  if (existente?.ordem === ordem) return { ok: true, molecula: mol };
  const ordemAtual = existente?.ordem ?? 0;

  const protegidos = new Set([idA, idB]);
  let atual = mol;
  for (const id of [idA, idB]) {
    const elemento = obterAtomo(atual, id)!.elemento;
    const excesso = valenciaUsada(atual, id) - ordemAtual + ordem - valenciaMaxima(elemento);
    if (excesso <= 0) continue;
    const r = liberarValencia(atual, id, excesso, protegidos);
    if (r.liberada < excesso) return erro(mensagemValencia(elemento));
    atual = r.molecula;
  }

  if (existente) {
    return {
      ok: true,
      molecula: { ...atual, ligacoes: atual.ligacoes.map((l) => (l.id === existente.id ? { ...l, ordem } : l)) },
    };
  }
  const id = atual.proximoId;
  return {
    ok: true,
    idNovo: id,
    molecula: { ...atual, ligacoes: [...atual.ligacoes, { id, a: idA, b: idB, ordem }], proximoId: id + 1 },
  };
}

/** Cria um átomo novo já ligado a um átomo existente. Nada é alterado se a ligação for inválida. */
export function adicionarAtomoLigado(
  mol: Molecula,
  idOrigem: number,
  elemento: SimboloElemento,
  x: number,
  y: number,
  ordem: OrdemLigacao,
): ResultadoEdicao {
  const { molecula, id } = adicionarAtomo(mol, elemento, x, y);
  const r = ligar(molecula, idOrigem, id, ordem);
  return r.ok ? { ...r, idNovo: id } : r;
}

/** Simples → dupla → tripla → simples. Se não houver valência para subir, volta para simples. */
export function ciclarOrdemLigacao(mol: Molecula, idLigacao: number): ResultadoEdicao {
  const ligacao = mol.ligacoes.find((l) => l.id === idLigacao);
  if (!ligacao) return erro('Ligação não encontrada.');
  if (ligacao.ordem === 3) return ligar(mol, ligacao.a, ligacao.b, 1);
  const proxima = (ligacao.ordem + 1) as OrdemLigacao;
  const r = ligar(mol, ligacao.a, ligacao.b, proxima);
  if (r.ok || ligacao.ordem === 1) return r;
  return ligar(mol, ligacao.a, ligacao.b, 1);
}

export function substituirElemento(mol: Molecula, id: number, novo: SimboloElemento): ResultadoEdicao {
  const atomo = obterAtomo(mol, id);
  if (!atomo) return erro('Átomo não encontrado.');
  if (atomo.elemento === novo) return { ok: true, molecula: mol };

  let atual = mol;
  const excesso = valenciaUsada(mol, id) - valenciaMaxima(novo);
  if (excesso > 0) {
    const r = liberarValencia(mol, id, excesso, new Set());
    if (r.liberada < excesso) {
      return erro(`Este átomo tem ligações demais para virar ${ELEMENTOS[novo].nome} (${novo}).`);
    }
    atual = r.molecula;
  }
  return {
    ok: true,
    molecula: { ...atual, atomos: atual.atomos.map((a) => (a.id === id ? { ...a, elemento: novo } : a)) },
  };
}

// --------------------------------------------------------------- hidrogênios

/** Escolhe `n` ângulos (rad) nos maiores vãos entre os ângulos já ocupados. */
export function direcoesLivres(ocupados: readonly number[], n: number): number[] {
  const DOIS_PI = Math.PI * 2;
  if (ocupados.length === 0) {
    return Array.from({ length: n }, (_, i) => -Math.PI / 2 + (i * DOIS_PI) / n);
  }
  const todos = ocupados.map((a) => ((a % DOIS_PI) + DOIS_PI) % DOIS_PI).sort((a, b) => a - b);
  const novos: number[] = [];
  for (let k = 0; k < n; k++) {
    let melhorVao = -1;
    let melhorMeio = 0;
    for (let i = 0; i < todos.length; i++) {
      const inicio = todos[i];
      const fim = i + 1 < todos.length ? todos[i + 1] : todos[0] + DOIS_PI;
      const vao = fim - inicio;
      if (vao > melhorVao) {
        melhorVao = vao;
        melhorMeio = inicio + vao / 2;
      }
    }
    const angulo = ((melhorMeio % DOIS_PI) + DOIS_PI) % DOIS_PI;
    novos.push(angulo);
    todos.push(angulo);
    todos.sort((a, b) => a - b);
  }
  return novos;
}

/**
 * Ângulos (rad) para os hidrogênios novos de um átomo, pensando no desenho 2D:
 * espaça de forma uniforme quando há 0 ou 1 vizinho e usa os maiores vãos nos demais casos.
 * `linear` mantém o H oposto à ligação existente (usado após uma ligação tripla).
 */
export function direcoesParaHidrogenios(ocupados: readonly number[], n: number, linear = false): number[] {
  const GRAU = Math.PI / 180;
  const DOIS_PI = Math.PI * 2;
  if (ocupados.length === 0) {
    if (n === 1) return [-Math.PI / 2];
    if (n === 2) return [-90 * GRAU - 52.5 * GRAU, -90 * GRAU + 52.5 * GRAU];
    return Array.from({ length: n }, (_, i) => -Math.PI / 2 + (i * DOIS_PI) / n);
  }
  if (ocupados.length === 1) {
    const a0 = ocupados[0];
    if (n === 1) return [a0 + (linear ? Math.PI : 120 * GRAU)];
    return Array.from({ length: n }, (_, i) => a0 + ((i + 1) * DOIS_PI) / (n + 1));
  }
  return direcoesLivres(ocupados, n);
}

/** Completa a valência de todos os átomos (exceto H) com hidrogênios explícitos. */
export function completarHidrogenios(mol: Molecula): Molecula {
  let atual = mol;
  for (const base of mol.atomos) {
    if (base.elemento === 'H') continue;
    const faltam = valenciaAberta(atual, base.id);
    if (faltam <= 0) continue;
    const centro = obterAtomo(atual, base.id)!;
    const vizinhos = vizinhosDoAtomo(atual, base.id);
    const ocupados = vizinhos.map(({ atomo }) => Math.atan2(atomo.y - centro.y, atomo.x - centro.x));
    const linear = faltam === 1 && vizinhos.length === 1 && vizinhos[0].ligacao.ordem === 3;
    for (const angulo of direcoesParaHidrogenios(ocupados, faltam, linear)) {
      const { molecula, id } = adicionarAtomo(
        atual,
        'H',
        centro.x + Math.cos(angulo) * COMPRIMENTO_LIGACAO_H_2D,
        centro.y + Math.sin(angulo) * COMPRIMENTO_LIGACAO_H_2D,
      );
      const r = ligar(molecula, base.id, id, 1);
      if (r.ok) atual = r.molecula;
    }
  }
  return atual;
}

/** Remove os hidrogênios terminais ligados a átomos que não são H. */
export function removerHidrogenios(mol: Molecula): Molecula {
  let atual = mol;
  for (const a of mol.atomos) {
    if (a.elemento !== 'H') continue;
    const vizinhos = vizinhosDoAtomo(atual, a.id);
    if (vizinhos.length === 1 && vizinhos[0].atomo.elemento !== 'H') atual = removerAtomo(atual, a.id);
  }
  return atual;
}

// --------------------------------------------------------------- composição

/** Composição na ordem de Hill: C, H e depois os demais em ordem alfabética (sem C, tudo em ordem alfabética). */
export function composicaoMolecular(mol: Molecula): ItemComposicao[] {
  const contagem = new Map<SimboloElemento, number>();
  for (const a of mol.atomos) contagem.set(a.elemento, (contagem.get(a.elemento) ?? 0) + 1);
  const simbolos = [...contagem.keys()].sort((a, b) => a.localeCompare(b));
  const ordenados = contagem.has('C')
    ? [
        ...simbolos.filter((s) => s === 'C'),
        ...simbolos.filter((s) => s === 'H'),
        ...simbolos.filter((s) => s !== 'C' && s !== 'H'),
      ]
    : simbolos;
  return ordenados.map((simbolo) => ({ simbolo, quantidade: contagem.get(simbolo)! }));
}

export function formulaEmTexto(mol: Molecula): string {
  return composicaoMolecular(mol)
    .map((i) => (i.quantidade > 1 ? `${i.simbolo}${i.quantidade}` : i.simbolo))
    .join('');
}

/** g/mol */
export function massaMolar(mol: Molecula): number {
  return mol.atomos.reduce((soma, a) => soma + ELEMENTOS[a.elemento].massaAtomica, 0);
}
