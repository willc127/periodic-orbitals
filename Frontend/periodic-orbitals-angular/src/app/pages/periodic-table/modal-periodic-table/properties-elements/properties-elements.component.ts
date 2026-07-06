import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ElectronDistribution } from './electron-distribution/electron-distribution.component';
import { DecimalPipe } from '@angular/common';

interface StatItem {
  label: string;
  valor: string | number;
  unidade?: string;
}
interface StatGroup {
  titulo: string;
  itens: StatItem[];
}

// Reaproveite este mesmo mapa na tabela periódica para manter a
// codificação de cores consistente entre a grade e este painel.
const CATEGORY_COLORS: Record<string, string> = {
  'Transition-Metal': '#5dcaa5',
  'Alkali-Metal': '#e2574a',
  'Alkaline-Earth-Metal': '#f2a154',
  Metalloid: '#c9a24b',
  Nonmetal: '#4fa3e3',
  'Noble-Gas': '#a390e0',
  Halogen: '#e07ba0',
  'Post-Transition-Metal': '#7fa8c9',
  Lanthanide: '#d99a5b',
  Actinide: '#c97878',
};
const FALLBACK_COLOR = '#4fa3e3';


@Component({
  selector: 'app-properties-elements',
  imports: [ElectronDistribution],
  providers: [DecimalPipe],
  templateUrl: './properties-elements.html',
  styleUrl: './properties-elements.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertiesElements {
  data = inject(MAT_DIALOG_DATA);
  private readonly decimalPipe = inject(DecimalPipe);

  categoryColor = computed(
    () => CATEGORY_COLORS[this.data.tipo] ?? FALLBACK_COLOR,
  );
  categoryLabel = computed(
    () => (this.data.tipo as string)?.replace(/-/g, ' ').toUpperCase() ?? '—',
  );
  isRadioativo = computed(() => !!this.data.radioativo);

  formatValue(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '—-';
    }
    if (typeof value === 'number') {
      return this.decimalPipe.transform(value, '1.2-2') ?? `${value}`;
    }
    const normalized = `${value}`.trim();
    if (/^-?\d+(\.\d+)?$/.test(normalized)) {
      const numericValue = Number(normalized.replace(',', '.'));
      return this.decimalPipe.transform(numericValue, '1.2-2') ?? normalized;
    }
    return normalized;
  }

  statGroups = computed<StatGroup[]>(() => {
    const d = this.data;
    return [
      {
        titulo: 'ESTRUTURA',
        itens: [
          {
            label: 'Configuração eletrônica',
            valor: this.formatValue(d.configuracaoEletronica),
          },
          {
            label: 'Eletronegatividade',
            valor: this.formatValue(d.eletronegatividade),
          },
          {
            label: 'Condutividade térmica',
            valor: this.formatValue(d.condutividadeTermica),
          },
        ],
      },
      {
        titulo: 'TEMPERATURAS',
        itens: [
          {
            label: 'Fusão',
            valor: this.formatValue(d.temperaturaFusao),
            unidade: 'K',
          },
          {
            label: 'Ebulição',
            valor: this.formatValue(d.temperaturaEbulicao),
            unidade: 'K',
          },
          {
            label: 'Crítica',
            valor: this.formatValue(d.temperaturaCritica),
            unidade: 'K',
          },
        ],
      },
      {
        titulo: 'CALOR & CAPACIDADE',
        itens: [
          { label: 'Calor de fusão', valor: this.formatValue(d.calorFusao) },
          {
            label: 'Calor de evaporação',
            valor: this.formatValue(d.calorEvaporacao),
          },
          {
            label: 'Capacidade calorífica',
            valor: this.formatValue(d.capacidadeCalorifica),
          },
          {
            label: 'Capacidade calorífica molar',
            valor: this.formatValue(d.capacidadeCalorificaMolar),
          },
          { label: 'Pressão crítica', valor: this.formatValue(d.pressaoCritica) },
        ],
      },
    ];
  });
}