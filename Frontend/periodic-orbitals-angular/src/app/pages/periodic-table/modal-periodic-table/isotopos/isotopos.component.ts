import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { switchMap } from 'rxjs';
import { Isotopo } from './isotopos.models';
import {
  calcularAbundanciaMaxima,
  calcularAlturaBarra,
  corIsotopo,
  formatarAbundancia,
  ordenarPorMassa,
} from './isotopos.logica';
import { IsotoposService } from './isotopos.service';

@Component({
  selector: 'app-isotopos',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './isotopos.component.html',
  styleUrl: './isotopos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsotoposComponent {
  private readonly isotoposService = inject(IsotoposService);

  // Recebidos do componente pai (o modal de detalhes do elemento)
  numeroAtomico = input.required<number>();
  corCategoria = input<string>('#5EA8D9');

  // Refaz a requisição sempre que numeroAtomico mudar (ex: navegação entre elementos sem fechar o modal)
  private readonly dadosSignal = toSignal(
    toObservable(this.numeroAtomico).pipe(
      switchMap((numeroAtomico) => this.isotoposService.buscarIsotopos(numeroAtomico)),
    ),
  );

  protected readonly carregando = computed(() => this.dadosSignal() === undefined);

  protected readonly isotopoAtivo = signal<Isotopo | null>(null);

  protected readonly isotoposOrdenados = computed(() => {
    const dados = this.dadosSignal();
    return dados ? ordenarPorMassa(dados.isotopos) : [];
  });

  protected readonly abundanciaMaxima = computed(() => calcularAbundanciaMaxima(this.isotoposOrdenados()));

  protected readonly isotopoSelecionado = computed(() => {
    const ativo = this.isotopoAtivo();
    const lista = this.isotoposOrdenados();
    if (ativo && lista.includes(ativo)) return ativo;
    return lista[0] ?? null;
  });

  protected selecionarIsotopo(isotopo: Isotopo): void {
    this.isotopoAtivo.set(isotopo);
  }

  protected alturaBarra(isotopo: Isotopo): number {
    return calcularAlturaBarra(isotopo, this.abundanciaMaxima());
  }

  protected corDoIsotopo(isotopo: Isotopo): string {
    return corIsotopo(isotopo, this.corCategoria());
  }

  protected abundanciaFormatada(isotopo: Isotopo): string {
    return formatarAbundancia(isotopo);
  }
}
