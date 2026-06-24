import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { AxisSelectorComponent } from './axis-selector/axis-selector.component';
import { ScatterChartComponent } from './charts/scatter/scatter-chart.component';
import { PlotRequest } from '../../interfaces/IAxisSelector';
import { ELEMENT_PROPERTIES } from './charts/scatter/scatter-chart.data';

@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [AxisSelectorComponent, ScatterChartComponent],
  templateUrl: './graphics.html',
  styleUrls: ['./graphics.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphicsComponent {

  readonly properties = ELEMENT_PROPERTIES;

  readonly plotRequest = signal<PlotRequest | null>(null);

  onPlotRequest(request: PlotRequest): void {
    this.plotRequest.set(request);
  }
}