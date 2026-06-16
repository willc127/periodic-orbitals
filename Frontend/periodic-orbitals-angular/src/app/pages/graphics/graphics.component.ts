import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxisSelectorComponent } from './axis-selector/axis-selector.component';
import { ElementProperty, PlotRequest } from '../../interfaces/IAxisSelector';
import { ScatterChartComponent } from './charts/scatter/scatter-chart.component';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [CommonModule, AxisSelectorComponent, ScatterChartComponent],
  templateUrl: './graphics.html',
  styleUrls: ['./graphics.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphicsComponent {
  /** Lista de propriedades disponíveis para seleção */
  readonly properties = signal<ElementProperty[]>([
    { id: 'atomic_number', label: 'Número Atômico' },
    { id: 'atomic_mass', label: 'Massa Atômica', unit: 'u' },
    { id: 'electronegativity', label: 'Eletronegatividade' },
    { id: 'ionization_energy', label: 'Energia de Ionização', unit: 'eV' },
    { id: 'atomic_radius', label: 'Raio Atômico', unit: 'pm' },
    { id: 'density', label: 'Densidade', unit: 'g/cm³' },
    { id: 'boiling_point', label: 'Ponto de Ebulição', unit: 'K' },
    { id: 'melting_point', label: 'Ponto de Fusão', unit: 'K' },
    { id: 'electron_affinity', label: 'Afinidade Eletrônica', unit: 'eV' },
  ]);

  /** Request de plotagem atual (atualizado pelo AxisSelector) */
  readonly plotRequest = signal<PlotRequest | null>(null);

  /**
   * Recebe o request de plotagem do AxisSelectorComponent
   * e atualiza o sinal para o ScatterChartComponent
   */
  onPlotRequest(request: PlotRequest): void {
    this.plotRequest.set(request);
  }
}
