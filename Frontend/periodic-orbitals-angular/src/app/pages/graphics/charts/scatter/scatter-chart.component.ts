import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import {
  Chart,
  ChartConfiguration,
  ScatterController,
  LineController,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PlotRequest } from '../../../../interfaces/IAxisSelector';
import { SERIES_CONFIG } from './scatter-chart.config';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

Chart.register(
  ScatterController,
  LineController,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

// Tipo que reflete o JSON bruto do backend
type ElementRaw = Record<string, number | string | null>;

@Component({
  selector: 'app-scatter-chart',
  standalone: true,
  imports: [MatIconButton, MatIconModule, MatTooltipModule],
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.scss'],
})
export class ScatterChartComponent implements OnDestroy {
  request = input.required<PlotRequest>();

  private readonly _http = inject(HttpClient);
  private readonly _canvasRef =
    viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private _chart: Chart | null = null;

  private readonly _elements = toSignal(
    this._http.get<ElementRaw[]>('http://localhost:8000/elements-data'),
    { initialValue: [] as ElementRaw[] },
  );

  // ─── Aba ativa ────────────────────────────────────────────────────────────
  readonly activeTab = signal<string>('all');

  // ─── Metadados ────────────────────────────────────────────────────────────
  readonly xConfig = computed(
    () => SERIES_CONFIG.find((s) => s.id === this.request().x) ?? null,
  );

  readonly yConfigs = computed(() =>
    this.request()
      .y.map((id) => SERIES_CONFIG.find((s) => s.id === id))
      .filter((s): s is (typeof SERIES_CONFIG)[number] => Boolean(s)),
  );

  readonly isEmpty = computed(
    () => !this.xConfig() || this.yConfigs().length === 0,
  );

  readonly visibleYConfigs = computed(() => {
    const tab = this.activeTab();
    return tab === 'all'
      ? this.yConfigs()
      : this.yConfigs().filter((s) => s.id === tab);
  });

  readonly tabs = computed(() => [
    { id: 'all', label: 'Todas' },
    ...this.yConfigs().map((s) => ({
      id: s.id,
      label: s.label,
      color: s.color,
    })),
  ]);

  // ----- Unir pontos--------------
  readonly showLine = signal(false);

  toggleLine(): void {
    this.showLine.set(!this.showLine());
  }

  // ─── Effects ──────────────────────────────────────────────────────────────
  constructor() {
    effect(() => {
      const _ = this.request();
      this.activeTab.set('all');
    });

    effect(() => {
      const canvas = this._canvasRef();
      const empty = this.isEmpty();
      const data = this._elements();
      const yCfgs = this.visibleYConfigs();
      const line = this.showLine();

      if (!canvas) {
        console.warn('[ScatterChart] sem canvas');
        return;
      }
      if (empty) {
        console.warn('[ScatterChart] isEmpty = true');
        return;
      }
      if (data.length === 0) {
        console.warn('[ScatterChart] dados ainda vazios');
        return;
      }

      this._buildChart(canvas.nativeElement, yCfgs, data, line);
    });
  }

  selectTab(id: string): void {
    this.activeTab.set(id);
  }

  // ─── Chart.js ─────────────────────────────────────────────────────────────
  private _buildChart(
    canvas: HTMLCanvasElement,
    yCfgs: readonly (typeof SERIES_CONFIG)[number][],
    elements: ElementRaw[],
    showLine: boolean,
  ): void {
    this._chart?.destroy();

    const xCfg = this.xConfig()!;
    const req = this.request();

    const datasets = yCfgs.map((yCfg) => ({
      label: `${yCfg.label}${yCfg.unit ? ' (' + yCfg.unit + ')' : ''}`,
      data: elements
        .filter((el) => el[req.x] != null && el[yCfg.id] != null)
        .sort((a, b) => (a[req.x] as number) - (b[req.x] as number)) // ordena X para a linha ficar correta
        .map((el) => ({
          x: el[req.x] as number,
          y: el[yCfg.id] as number,
          label: `${el['symbol']} - ${el['name']}`,
        })),
      backgroundColor: yCfg.color + 'bb',
      borderColor: yCfg.color,
      borderWidth: showLine ? 1.5 : 0, // <── linha ligada/desligada
      showLine,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointStyle: yCfg.pointStyle as any,
    }));

    const showLegend = yCfgs.length > 1;
    const singleY = yCfgs.length === 1 ? yCfgs[0] : null;
    const config: ChartConfiguration<'scatter'> = {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        plugins: {
          legend: {
            display: showLegend,
            position: 'top',
            labels: { boxWidth: 10, font: { size: 12 }, color: '#EDEDED' },
          },
          tooltip: {
            callbacks: {
              title: (items) => (items[0].raw as any).label ?? '',
              label: (item) => {
                const raw = item.raw as any;
                const yLabel = item.dataset.label?.split(' (')[0] ?? '';
                return `${xCfg.label}: ${(+raw.x).toFixed(3)} ${xCfg.unit}  |  ${yLabel}: ${(+raw.y).toFixed(3)}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xCfg.unit ? `${xCfg.label} (${xCfg.unit})` : xCfg.label,
              font: { size: 12 },
              color: '#EDEDED',
            },
            ticks: { font: { size: 10 }, maxTicksLimit: 8, color: '#EDEDED' },
            grid: { color: 'rgba(128,128,128,0.1)' },
          },
          y: {
            title: {
              display: !!singleY,
              text: singleY
                ? singleY.unit
                  ? `${singleY.label} (${singleY.unit})`
                  : singleY.label
                : '',
              font: { size: 12 },
              color: '#EDEDED',
            },
            ticks: {
              font: { size: 10 },
              maxTicksLimit: 6,
              color: '#EDEDED',
              callback: (v) =>
                Math.abs(+v) >= 1000
                  ? (+v / 1000).toFixed(1) + 'k'
                  : (+v).toFixed(1),
            },
            grid: { color: 'rgba(128,128,128,0.1)' },
          },
        },
      },
    };

    this._chart = new Chart(canvas, config);
  }

  ngOnDestroy(): void {
    this._chart?.destroy();
  }
}
