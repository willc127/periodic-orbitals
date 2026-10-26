import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal, viewChild } from '@angular/core';
import { Editor2dComponent } from './editor-2d/editor-2d.component';
import { ELEMENTOS, LISTA_ELEMENTOS, gradienteCss, corTextoSobre } from './elementos-molecula';
import { gerarGeometria3D } from './geometria3d.logica';
import {
  completarHidrogenios,
  composicaoMolecular,
  criarMoleculaVazia,
  massaMolar,
  removerHidrogenios,
  resumirValencias,
} from './molecula.logica';
import {
  EstiloMolecular,
  Ferramenta,
  Geometria3D,
  Molecula,
  ModoVisualizacao,
  OrdemLigacao,
  SimboloElemento,
} from './molecula.models';
import { Visualizador3dComponent } from './visualizador-3d/visualizador-3d.component';

const TECLAS_ELEMENTO: Readonly<Record<string, SimboloElemento>> = {
  h: 'H', c: 'C', n: 'N', o: 'O', f: 'F', p: 'P', s: 'S', l: 'Cl', b: 'Br', i: 'I',
};
const TECLAS_FERRAMENTA: Readonly<Record<string, Ferramenta>> = { d: 'desenhar', m: 'mover', e: 'apagar' };
const LIMITE_HISTORICO = 100;
const DURACAO_AVISO_MS = 4500;

@Component({
  selector: 'app-construtor-moleculas',
  standalone: true,
  imports: [Editor2dComponent, Visualizador3dComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './construtor-moleculas.component.html',
  styleUrl: './construtor-moleculas.component.scss',
  host: { '(window:keydown)': 'aoTeclar($event)' },
})
export class ConstrutorMoleculasComponent {
  protected readonly elementos = LISTA_ELEMENTOS;
  protected readonly gradienteCss = gradienteCss;
  protected readonly corTextoSobre = corTextoSobre;

  protected readonly modo = signal<ModoVisualizacao>('2d');
  protected readonly molecula = signal<Molecula>(criarMoleculaVazia());
  protected readonly elementoSelecionado = signal<SimboloElemento>('C');
  protected readonly ordemSelecionada = signal<OrdemLigacao>(1);
  protected readonly ferramenta = signal<Ferramenta>('desenhar');
  protected readonly estilo = signal<EstiloMolecular>('bola-e-vareta');
  protected readonly mostrarHidrogenios = signal(true);
  protected readonly aviso = signal<string | null>(null);

  private readonly passado = signal<readonly Molecula[]>([]);
  private readonly futuro = signal<readonly Molecula[]>([]);
  protected readonly podeDesfazer = computed(() => this.passado().length > 0);
  protected readonly podeRefazer = computed(() => this.futuro().length > 0);

  protected readonly composicao = computed(() => composicaoMolecular(this.molecula()));
  protected readonly massa = computed(() => massaMolar(this.molecula()));
  protected readonly resumo = computed(() => resumirValencias(this.molecula()));
  protected readonly vazia = computed(() => this.molecula().atomos.length === 0);
  protected readonly nomeElemento = computed(() => ELEMENTOS[this.elementoSelecionado()].nome);

  /** A geometria só é calculada quando a visão 3D está aberta. */
  protected readonly geometria = computed<Geometria3D>(() =>
    this.modo() === '3d' ? gerarGeometria3D(this.molecula()) : new Map(),
  );

  protected readonly estilos: readonly { valor: EstiloMolecular; rotulo: string }[] = [
    { valor: 'bola-e-vareta', rotulo: 'Bola e vareta' },
    { valor: 'vareta', rotulo: 'Vareta' },
    { valor: 'espaco-preenchido', rotulo: 'Espaço preenchido' },
  ];
  protected readonly ordens: readonly { valor: OrdemLigacao; rotulo: string }[] = [
    { valor: 1, rotulo: 'Simples' },
    { valor: 2, rotulo: 'Dupla' },
    { valor: 3, rotulo: 'Tripla' },
  ];
  protected readonly ferramentas: readonly { valor: Ferramenta; rotulo: string; tecla: string }[] = [
    { valor: 'desenhar', rotulo: 'Desenhar', tecla: 'D' },
    { valor: 'mover', rotulo: 'Mover', tecla: 'M' },
    { valor: 'apagar', rotulo: 'Apagar', tecla: 'E' },
  ];

  private readonly visualizador = viewChild(Visualizador3dComponent);
  private temporizadorAviso?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizadorAviso));
  }

  // ------------------------------------------------------------ edição

  /** Chamado pelo editor antes de cada alteração: guarda o estado atual para desfazer. */
  protected registrarHistorico(): void {
    this.passado.update((p) => [...p.slice(-(LIMITE_HISTORICO - 1)), this.molecula()]);
    this.futuro.set([]);
  }

  protected aoAlterar(nova: Molecula): void {
    this.molecula.set(nova);
    this.limparAviso();
  }

  protected desfazer(): void {
    const p = this.passado();
    if (p.length === 0) return;
    this.futuro.update((f) => [...f, this.molecula()]);
    this.molecula.set(p[p.length - 1]);
    this.passado.set(p.slice(0, -1));
  }

  protected refazer(): void {
    const f = this.futuro();
    if (f.length === 0) return;
    this.passado.update((p) => [...p, this.molecula()]);
    this.molecula.set(f[f.length - 1]);
    this.futuro.set(f.slice(0, -1));
  }

  protected completarH(): void {
    this.transformar(completarHidrogenios);
  }

  protected removerH(): void {
    this.transformar(removerHidrogenios);
  }

  protected limpar(): void {
    this.transformar(() => criarMoleculaVazia());
  }

  protected enquadrar(): void {
    this.visualizador()?.enquadrar();
  }

  protected avisar(mensagem: string): void {
    clearTimeout(this.temporizadorAviso);
    this.aviso.set(mensagem);
    this.temporizadorAviso = setTimeout(() => this.aviso.set(null), DURACAO_AVISO_MS);
  }

  private limparAviso(): void {
    clearTimeout(this.temporizadorAviso);
    this.aviso.set(null);
  }

  private transformar(fn: (m: Molecula) => Molecula): void {
    const atual = this.molecula();
    const nova = fn(atual);
    if (nova === atual) return;
    this.registrarHistorico();
    this.aoAlterar(nova);
  }

  // ------------------------------------------------------------ teclado

  protected aoTeclar(e: KeyboardEvent): void {
    const alvo = e.target as HTMLElement | null;
    if (alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable)) return;

    const tecla = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && tecla === 'z') {
      e.preventDefault();
      if (e.shiftKey) this.refazer();
      else this.desfazer();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && tecla === 'y') {
      e.preventDefault();
      this.refazer();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || this.modo() !== '2d') return;

    const elemento = TECLAS_ELEMENTO[tecla];
    if (elemento) {
      this.elementoSelecionado.set(elemento);
      return;
    }
    const ferramenta = TECLAS_FERRAMENTA[tecla];
    if (ferramenta) {
      this.ferramenta.set(ferramenta);
      return;
    }
    if (tecla === '1' || tecla === '2' || tecla === '3') this.ordemSelecionada.set(Number(tecla) as OrdemLigacao);
  }
}
