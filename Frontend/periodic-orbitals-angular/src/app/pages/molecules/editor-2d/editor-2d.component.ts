import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ELEMENTOS, LISTA_ELEMENTOS, corTextoSobre, tonsDoElemento } from '../elementos-molecula';
import {
  COMPRIMENTO_LIGACAO_2D,
  COMPRIMENTO_LIGACAO_H_2D,
  adicionarAtomo,
  adicionarAtomoLigado,
  ciclarOrdemLigacao,
  ligar,
  moverAtomo,
  obterAtomo,
  removerAtomo,
  removerLigacao,
  substituirElemento,
  valenciaAberta,
} from '../molecula.logica';
import {
  Atomo,
  Ferramenta,
  Ligacao,
  Molecula,
  OrdemLigacao,
  ResultadoEdicao,
  SimboloElemento,
} from '../molecula.models';

interface Ponto {
  readonly x: number;
  readonly y: number;
}

type Gesto =
  | { readonly tipo: 'ligar'; readonly origemId: number; readonly inicio: Ponto; readonly moveu: boolean }
  | { readonly tipo: 'mover'; readonly atomoId: number; readonly deslocamento: Ponto; readonly moveu: boolean }
  | { readonly tipo: 'vazio'; readonly inicio: Ponto; readonly moveu: boolean };

interface Segmento {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

const RAIO_ATOMO = 16;
const RAIO_ANEL_ABERTO = 21;
const TOLERANCIA_ATOMO = 4;
const TOLERANCIA_LIGACAO = 7;
const LIMIAR_ARRASTO = 5;
const PASSO_ANGULO = Math.PI / 6;
const ESPACO_LINHAS: Readonly<Record<OrdemLigacao, readonly number[]>> = {
  1: [0],
  2: [-3.5, 3.5],
  3: [-5.5, 0, 5.5],
};

@Component({
  selector: 'app-editor-2d',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editor-2d.component.html',
  styleUrl: './editor-2d.component.scss',
})
export class Editor2dComponent {
  readonly molecula = input.required<Molecula>();
  readonly ferramenta = input<Ferramenta>('desenhar');
  readonly elementoSelecionado = input<SimboloElemento>('C');
  readonly ordemSelecionada = input<OrdemLigacao>(1);

  /** Nova versão da molécula (emitida a cada alteração, inclusive durante o arrasto). */
  readonly moleculaChange = output<Molecula>();
  /** Emitido uma vez antes de cada edição, para o pai guardar o estado anterior no histórico. */
  readonly inicioEdicao = output<void>();
  readonly aviso = output<string>();

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private readonly gesto = signal<Gesto | null>(null);
  private readonly ponteiro = signal<Ponto | null>(null);

  protected readonly raioAtomo = RAIO_ATOMO;
  protected readonly raioAnelAberto = RAIO_ANEL_ABERTO;

  /** Gradientes de esfera por elemento, definidos uma vez no <defs> do SVG. */
  protected readonly gradientes = LISTA_ELEMENTOS.map((e) => ({
    simbolo: e.simbolo,
    base: e.cor,
    ...tonsDoElemento(e.cor),
  }));

  protected readonly atomoSobre = computed(() => {
    const p = this.ponteiro();
    return p ? (this.atomoEm(p)?.id ?? null) : null;
  });

  protected readonly atomosDesenho = computed(() =>
    this.molecula().atomos.map((a) => {
      const dados = ELEMENTOS[a.elemento];
      const aberta = valenciaAberta(this.molecula(), a.id);
      return {
        id: a.id,
        x: a.x,
        y: a.y,
        simbolo: a.elemento,
        corTexto: corTextoSobre(dados.cor),
        aberta,
        dica: aberta > 0 ? `${dados.nome}: faltam ${aberta} ligação(ões) para completar a valência.` : dados.nome,
      };
    }),
  );

  protected readonly ligacoesDesenho = computed(() => {
    const mol = this.molecula();
    return mol.ligacoes.flatMap((l) => {
      const a = obterAtomo(mol, l.a);
      const b = obterAtomo(mol, l.b);
      if (!a || !b) return [];
      return [{ id: l.id, segmentos: this.segmentosDaLigacao(a, b, l.ordem), alvo: { x1: a.x, y1: a.y, x2: b.x, y2: b.y } }];
    });
  });

  /** Linha tracejada e átomo fantasma mostrados enquanto se arrasta a partir de um átomo. */
  protected readonly previa = computed(() => {
    const g = this.gesto();
    const p = this.ponteiro();
    if (!g || g.tipo !== 'ligar' || !g.moveu || !p) return null;
    const origem = obterAtomo(this.molecula(), g.origemId);
    if (!origem) return null;
    const alvo = this.atomoEm(p, g.origemId);
    if (alvo) return { x1: origem.x, y1: origem.y, x2: alvo.x, y2: alvo.y, alvoId: alvo.id, novo: null };
    const pos = this.posicaoNovoAtomo(origem, p);
    const elemento = this.elementoSelecionado();
    return {
      x1: origem.x,
      y1: origem.y,
      x2: pos.x,
      y2: pos.y,
      alvoId: null,
      novo: { ...pos, simbolo: elemento, corTexto: corTextoSobre(ELEMENTOS[elemento].cor) },
    };
  });

  // ------------------------------------------------------------ eventos

  protected aoPressionar(e: PointerEvent): void {
    const p = this.ponto(e);
    if (e.button === 2) {
      this.apagarEm(p);
      return;
    }
    if (e.button !== 0) return;

    const mol = this.molecula();
    const ferramenta = this.ferramenta();
    this.svg().nativeElement.setPointerCapture(e.pointerId);
    this.ponteiro.set(p);

    const atomo = this.atomoEm(p);
    if (atomo) {
      if (ferramenta === 'apagar') this.confirmar(removerAtomo(mol, atomo.id));
      else if (ferramenta === 'mover') {
        this.gesto.set({
          tipo: 'mover',
          atomoId: atomo.id,
          deslocamento: { x: p.x - atomo.x, y: p.y - atomo.y },
          moveu: false,
        });
      } else this.gesto.set({ tipo: 'ligar', origemId: atomo.id, inicio: p, moveu: false });
      return;
    }

    const ligacao = this.ligacaoEm(p);
    if (ligacao) {
      if (ferramenta === 'apagar') this.confirmar(removerLigacao(mol, ligacao.id));
      else if (ferramenta === 'desenhar') this.aplicar(ciclarOrdemLigacao(mol, ligacao.id));
      return;
    }

    if (ferramenta === 'desenhar') this.gesto.set({ tipo: 'vazio', inicio: p, moveu: false });
  }

  protected aoMover(e: PointerEvent): void {
    const p = this.ponto(e);
    this.ponteiro.set(p);
    const g = this.gesto();
    if (!g) return;

    if (g.tipo === 'mover') {
      if (!g.moveu) {
        this.inicioEdicao.emit();
        this.gesto.set({ ...g, moveu: true });
      }
      this.moleculaChange.emit(moverAtomo(this.molecula(), g.atomoId, p.x - g.deslocamento.x, p.y - g.deslocamento.y));
      return;
    }
    if (!g.moveu && Math.hypot(p.x - g.inicio.x, p.y - g.inicio.y) > LIMIAR_ARRASTO) {
      this.gesto.set({ ...g, moveu: true });
    }
  }

  protected aoSoltar(e: PointerEvent): void {
    const g = this.gesto();
    this.gesto.set(null);
    if (!g || g.tipo === 'mover') return;
    const p = this.ponto(e);
    const mol = this.molecula();

    if (g.tipo === 'vazio') {
      if (g.moveu) return;
      this.confirmar(adicionarAtomo(mol, this.elementoSelecionado(), p.x, p.y).molecula);
      return;
    }

    const origem = obterAtomo(mol, g.origemId);
    if (!origem) return;

    if (!g.moveu) {
      this.aplicar(substituirElemento(mol, origem.id, this.elementoSelecionado()));
      return;
    }
    const alvo = this.atomoEm(p, origem.id);
    if (alvo) {
      this.aplicar(ligar(mol, origem.id, alvo.id, this.ordemSelecionada()));
    } else {
      const pos = this.posicaoNovoAtomo(origem, p);
      this.aplicar(
        adicionarAtomoLigado(mol, origem.id, this.elementoSelecionado(), pos.x, pos.y, this.ordemSelecionada()),
      );
    }
  }

  protected aoCancelar(): void {
    this.gesto.set(null);
  }

  protected aoSair(): void {
    if (!this.gesto()) this.ponteiro.set(null);
  }

  // ------------------------------------------------------------ auxiliares

  private ponto(e: PointerEvent): Ponto {
    const caixa = this.svg().nativeElement.getBoundingClientRect();
    return { x: e.clientX - caixa.left, y: e.clientY - caixa.top };
  }

  private confirmar(nova: Molecula): void {
    this.inicioEdicao.emit();
    this.moleculaChange.emit(nova);
  }

  private aplicar(resultado: ResultadoEdicao): void {
    if (!resultado.ok) {
      this.aviso.emit(resultado.erro);
      return;
    }
    if (resultado.molecula !== this.molecula()) this.confirmar(resultado.molecula);
  }

  private apagarEm(p: Ponto): void {
    const atomo = this.atomoEm(p);
    if (atomo) {
      this.confirmar(removerAtomo(this.molecula(), atomo.id));
      return;
    }
    const ligacao = this.ligacaoEm(p);
    if (ligacao) this.confirmar(removerLigacao(this.molecula(), ligacao.id));
  }

  private atomoEm(p: Ponto, ignorarId?: number): Atomo | undefined {
    let melhor: Atomo | undefined;
    let menor = RAIO_ATOMO + TOLERANCIA_ATOMO;
    for (const a of this.molecula().atomos) {
      if (a.id === ignorarId) continue;
      const d = Math.hypot(a.x - p.x, a.y - p.y);
      if (d <= menor) {
        menor = d;
        melhor = a;
      }
    }
    return melhor;
  }

  private ligacaoEm(p: Ponto): Ligacao | undefined {
    const mol = this.molecula();
    let melhor: Ligacao | undefined;
    let menor = TOLERANCIA_LIGACAO;
    for (const l of mol.ligacoes) {
      const a = obterAtomo(mol, l.a);
      const b = obterAtomo(mol, l.b);
      if (!a || !b) continue;
      const d = this.distanciaAoSegmento(p, a, b);
      if (d <= menor) {
        menor = d;
        melhor = l;
      }
    }
    return melhor;
  }

  private distanciaAoSegmento(p: Ponto, a: Ponto, b: Ponto): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const quadrado = dx * dx + dy * dy;
    const t = quadrado === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / quadrado));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  /** Posição do átomo novo: ângulo em múltiplos de 30° e comprimento padrão de ligação. */
  private posicaoNovoAtomo(origem: Atomo, p: Ponto): Ponto {
    const angulo = Math.round(Math.atan2(p.y - origem.y, p.x - origem.x) / PASSO_ANGULO) * PASSO_ANGULO;
    const comprimento =
      origem.elemento === 'H' || this.elementoSelecionado() === 'H'
        ? COMPRIMENTO_LIGACAO_H_2D
        : COMPRIMENTO_LIGACAO_2D;
    return { x: origem.x + Math.cos(angulo) * comprimento, y: origem.y + Math.sin(angulo) * comprimento };
  }

  private segmentosDaLigacao(a: Atomo, b: Atomo, ordem: OrdemLigacao): Segmento[] {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const comprimento = Math.hypot(dx, dy) || 1;
    const nx = -dy / comprimento;
    const ny = dx / comprimento;
    return ESPACO_LINHAS[ordem].map((d) => ({
      x1: a.x + nx * d,
      y1: a.y + ny * d,
      x2: b.x + nx * d,
      y2: b.y + ny * d,
    }));
  }
}
