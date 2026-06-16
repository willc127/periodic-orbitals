import {
  Component,
  computed,
  EventEmitter,
  input,
  Output,
  signal,
} from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ElementProperty,
  PlotRequest,
} from '../../../interfaces/IAxisSelector';

@Component({
  selector: 'app-axis-selector',
  standalone: true,
  imports: [
    CdkDrag,
    CdkDropList,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './axis-selector.component.html',
  styleUrls: ['./axis-selector.component.scss'],
})
export class AxisSelectorComponent {
  /** Lista completa de propriedades fornecida pelo pai */
  properties = input.required<ElementProperty[]>();

  @Output() plot = new EventEmitter<PlotRequest>();

  // ─── Estado interno ────────────────────────────────────────────────────────

  /** Eixo X: exatamente uma propriedade ou null */
  private readonly _axisX = signal<ElementProperty | null>(null);

  /** Eixo Y: zero ou mais propriedades, sem duplicatas */
  private readonly _axisY = signal<ElementProperty[]>([]);

  readonly axisX = this._axisX.asReadonly();
  readonly axisY = this._axisY.asReadonly();

  /** Propriedades ainda não alocadas em nenhum eixo */
  readonly availableProps = computed(() => {
    const usedIds = new Set<string>(
      [this._axisX()?.id, ...this._axisY().map((p) => p.id)].filter(
        Boolean,
      ) as string[],
    );
    return this.properties().filter((p) => !usedIds.has(p.id));
  });

  readonly canPlot = computed(
    () => !!this._axisX() && this._axisY().length > 0,
  );

  // ─── Drop no eixo X ───────────────────────────────────────────────────────
  // Aceita exatamente uma propriedade; se já havia uma, devolve ao pool via signal.

  onDropToAxisX(event: CdkDragDrop<ElementProperty[]>): void {
    if (event.previousContainer === event.container) return;
    const dropped: ElementProperty =
      event.previousContainer.data[event.previousIndex];
    // A prop anterior (se houver) volta ao pool automaticamente pelo computed
    this._axisX.set(dropped);
  }

  // ─── Drop no eixo Y ───────────────────────────────────────────────────────
  // Aceita múltiplas propriedades; ignora duplicatas silenciosamente.

  onDropToAxisY(event: CdkDragDrop<ElementProperty[]>): void {
    if (event.previousContainer === event.container) return;
    const dropped: ElementProperty =
      event.previousContainer.data[event.previousIndex];
    const already = this._axisY().some((p) => p.id === dropped.id);
    if (already) return;
    this._axisY.update((list) => [...list, dropped]);
  }

  // ─── Drop de volta ao pool ────────────────────────────────────────────────

  onDropToPool(event: CdkDragDrop<ElementProperty[]>): void {
    if (event.previousContainer === event.container) return;
    const fromId = event.previousContainer.id;
    if (fromId === 'axis-x') {
      this._axisX.set(null);
    } else if (fromId === 'axis-y') {
      const removed: ElementProperty =
        event.previousContainer.data[event.previousIndex];
      this._axisY.update((list) => list.filter((p) => p.id !== removed.id));
    }
  }

  // ─── Remoção por botão ────────────────────────────────────────────────────

  removeFromAxisX(): void {
    this._axisX.set(null);
  }

  removeFromAxisY(propId: string): void {
    this._axisY.update((list) => list.filter((p) => p.id !== propId));
  }

  // ─── Emitir plot ──────────────────────────────────────────────────────────

  onPlot(): void {
    const x = this._axisX();
    const ys = this._axisY();
    if (x && ys.length > 0) {
      this.plot.emit({ x: x.id, y: ys.map((p) => p.id) });
    }
  }
}
