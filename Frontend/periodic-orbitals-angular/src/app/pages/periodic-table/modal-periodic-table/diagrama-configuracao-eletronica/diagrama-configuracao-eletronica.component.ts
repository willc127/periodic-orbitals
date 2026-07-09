import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  construirLinhasPeriodo,
  construirNotacaoConfiguracao,
  calcularEletronsPorSubcamada,
} from './diagrama-configuracao-eletronica.logica';

/**
 * Diagrama de caixas/spins (Aufbau) para a configuração eletrônica de um elemento.
 *
 * Uso:
 *   <app-diagrama-configuracao-eletronica [numeroAtomico]="79" />
 *
 * Observação: segue a regra de Madelung estrita. Elementos com exceções ao
 * Aufbau (Cr, Cu, Ag, Au, Pt, etc.) ainda não são tratados — pendência
 * conhecida do projeto (ver tabela de exceções a implementar futuramente).
 */
@Component({
  selector: 'app-diagrama-configuracao-eletronica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagrama-configuracao-eletronica.component.html',
  styleUrl: './diagrama-configuracao-eletronica.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramaConfiguracaoEletronicaComponent {
  numeroAtomico = input<number>(1);

  protected readonly linhasPeriodo = computed(() =>
    construirLinhasPeriodo(this.numeroAtomico()),
  );

  protected readonly notacaoConfiguracao = computed(() =>
    construirNotacaoConfiguracao(calcularEletronsPorSubcamada(this.numeroAtomico())),
  );
}
