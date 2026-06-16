import {
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import {
  Chart,
  ChartConfiguration,
  ScatterController,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PlotRequest } from '../../../interfaces/IAxisSelector';
import { MOCK_ELEMENT_DATA, SERIES_CONFIG } from './scatter-chart.data';

Chart.register(ScatterController, LinearScale, PointElement, Tooltip, Legend);

@Component({
  selector: 'app-scatter-chart',
  standalone: true,
  templateUrl: './scatter-chart.component.html',
  styleUrls: ['./scatter-chart.component.scss'],
})
export class ScatterChartComponent implements OnDestroy {
  request = input.required<PlotRequest>();

  private readonly _canvasRef =
    viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private _chart: Chart | null = null;

  // ─── Aba ativa: 'all' ou id de uma série Y ────────────────────────────────
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

  /** Séries visíveis de acordo com a aba selecionada */
  readonly visibleYConfigs = computed(() => {
    const tab = this.activeTab();
    return tab === 'all'
      ? this.yConfigs()
      : this.yConfigs().filter((s) => s.id === tab);
  });

  // ─── Abas: "Todas" + uma por série Y ─────────────────────────────────────

  readonly tabs = computed(() => [
    { id: 'all', label: 'Todas' },
    ...this.yConfigs().map((s) => ({
      id: s.id,
      label: s.label.split(' ')[0], // primeira palavra: "Afinidade", "Raio"…
      color: s.color,
    })),
  ]);

  // ─── Reconstrói o gráfico quando request OU aba mudar ────────────────────

  constructor() {
    effect(() => {
      // Reseta para "Todas" quando chega um novo request
      const _ = this.request();
      this.activeTab.set('all');
    });

    effect(() => {
      const canvas = this._canvasRef();
      if (!canvas || this.isEmpty()) return;
      // lê activeTab e visibleYConfigs para reagir a mudanças
      const yCfgs = this.visibleYConfigs();
      this._buildChart(canvas.nativeElement, yCfgs);
    });
  }

  selectTab(id: string): void {
    this.activeTab.set(id);
  }

  // ─── Chart.js ─────────────────────────────────────────────────────────────

  private _buildChart(
    canvas: HTMLCanvasElement,
    yCfgs: readonly (typeof SERIES_CONFIG)[number][],
  ): void {
    this._chart?.destroy();

    const xCfg = this.xConfig()!;
    const req = this.request();

    const datasets = yCfgs.map((yCfg) => ({
      label: `${yCfg.label}${yCfg.unit ? ' (' + yCfg.unit + ')' : ''}`,
      data: MOCK_ELEMENT_DATA.filter(
        (el) => el[req.x] != null && el[yCfg.id] != null,
      ).map((el) => ({
        x: el[req.x] as number,
        y: el[yCfg.id] as number,
        label: el['symbol'],
      })),
      backgroundColor: yCfg.color + 'bb',
      borderColor: yCfg.color,
      borderWidth: 1,
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
            labels: { boxWidth: 10, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              title: (items) => (items[0].raw as any).label ?? '',
              label: (item) => {
                const raw = item.raw as any;
                const yLabel = item.dataset.label?.split(' (')[0] ?? '';
                return `${xCfg.label}: ${(+raw.x).toFixed(2)} ${xCfg.unit}  |  ${yLabel}: ${(+raw.y).toFixed(2)}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xCfg.unit ? `${xCfg.label} (${xCfg.unit})` : xCfg.label,
              font: { size: 11 },
            },
            ticks: { font: { size: 10 }, maxTicksLimit: 8 },
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
              font: { size: 11 },
            },
            ticks: {
              font: { size: 10 },
              maxTicksLimit: 6,
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
