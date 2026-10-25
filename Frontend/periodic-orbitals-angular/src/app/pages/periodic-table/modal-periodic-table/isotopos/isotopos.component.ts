import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, of, startWith, switchMap } from 'rxjs';
import { Isotopo } from './isotopos.models';
import {
  calcularAbundanciaMaxima,
  calcularAlturaBarra,
  calcularComposicao,
  calcularEscala,
  calcularLarguraMedidor,
  calcularPosicaoTick,
  corIsotopo,
  descreverDecaimento,
  formatarAbundancia,
  formatarTick,
  ordenarPorMassa,
  resumirIsotopos,
  textoTooltip,
} from './isotopos.logica';
import { IsotoposService } from './isotopos.service';

@Component({
  selector: 'app-isotopos',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './isotopos.component.html',
  styleUrl: './isotopos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsotoposComponent {
  private readonly isotoposService = inject(IsotoposService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Recebidos do componente pai (o modal de detalhes do elemento)
  numeroAtomico = input.required<number>();
  corCategoria = input<string>('#5EA8D9');
  protected readonly erroCarregamento = signal(false);

  // Refaz a requisição sempre que numeroAtomico mudar (ex: navegação entre elementos sem fechar o modal)
  private readonly dadosSignal = toSignal(
    toObservable(this.numeroAtomico).pipe(
      switchMap((numeroAtomico) => {
        this.erroCarregamento.set(false);
        return this.isotoposService.buscarIsotopos(numeroAtomico).pipe(
          catchError((error: unknown) => {
            this.erroCarregamento.set(true);
            console.error('Não foi possível carregar os isótopos.', error);
            return of(null);
          }),
          startWith(undefined),
        );
      }),
    ),
  );

  protected readonly carregando = computed(() => this.dadosSignal() === undefined);

  /** Dados do elemento (nome, símbolo...) ou null enquanto carrega/em erro. */
  protected readonly dados = computed(() => this.dadosSignal() ?? null);

  protected readonly isotopoAtivo = signal<Isotopo | null>(null);

  protected readonly isotoposOrdenados = computed(() => {
    const dados = this.dadosSignal();
    return dados ? ordenarPorMassa(dados.isotopos) : [];
  });

  protected readonly abundanciaMaxima = computed(() => calcularAbundanciaMaxima(this.isotoposOrdenados()));

  /** Eixo Y do gráfico (topo "redondo" + marcas). */
  protected readonly escala = computed(() => calcularEscala(this.abundanciaMaxima()));

  protected readonly resumo = computed(() => resumirIsotopos(this.isotoposOrdenados()));

  protected readonly isotopoSelecionado = computed(() => {
    const ativo = this.isotopoAtivo();
    const lista = this.isotoposOrdenados();
    if (ativo && lista.includes(ativo)) return ativo;
    return lista[0] ?? null;
  });

  protected readonly composicao = computed(() => {
    const ativo = this.isotopoSelecionado();
    return ativo ? calcularComposicao(ativo, this.numeroAtomico()) : null;
  });

  protected readonly descricaoDecaimento = computed(() =>
    descreverDecaimento(this.isotopoSelecionado()?.modoDecaimento ?? null),
  );

  protected selecionarIsotopo(isotopo: Isotopo): void {
    this.isotopoAtivo.set(isotopo);
  }

  /** Navegação por teclado entre os picos (← →, Home, End), movendo também o foco. */
  protected aoTeclar(evento: KeyboardEvent): void {
    const lista = this.isotoposOrdenados();
    const atual = lista.findIndex((i) => i === this.isotopoSelecionado());
    if (atual < 0) return;

    let destino: number;
    switch (evento.key) {
      case 'ArrowRight':
        destino = atual + 1;
        break;
      case 'ArrowLeft':
        destino = atual - 1;
        break;
      case 'Home':
        destino = 0;
        break;
      case 'End':
        destino = lista.length - 1;
        break;
      default:
        return;
    }

    evento.preventDefault();
    if (destino < 0 || destino >= lista.length || destino === atual) return;

    this.isotopoAtivo.set(lista[destino]);
    this.host.nativeElement.querySelectorAll<HTMLButtonElement>('.pico')[destino]?.focus();
  }

  protected alturaBarra(isotopo: Isotopo): number {
    return calcularAlturaBarra(isotopo, this.escala().topo);
  }

  protected posicaoTick(valor: number): number {
    return calcularPosicaoTick(valor, this.escala().topo);
  }

  protected formatarTick(valor: number): string {
    return formatarTick(valor);
  }

  protected corDoIsotopo(isotopo: Isotopo): string {
    return corIsotopo(isotopo, this.corCategoria());
  }

  protected abundanciaFormatada(isotopo: Isotopo): string {
    return formatarAbundancia(isotopo);
  }

  protected larguraMedidor(isotopo: Isotopo): number {
    return calcularLarguraMedidor(isotopo);
  }

  protected tooltip(isotopo: Isotopo): string {
    return textoTooltip(isotopo);
  }
}
