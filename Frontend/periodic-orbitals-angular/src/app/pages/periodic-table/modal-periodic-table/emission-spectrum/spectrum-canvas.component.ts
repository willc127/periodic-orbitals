import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { wlToRGB, pct, WL_MIN, WL_MAX } from './wl-utils';

@Component({
  selector: 'app-spectrum-canvas',
  standalone: true,
  template: `
    <canvas
      #spectrumCanvas
      width="800"
      height="160"
      style="width: 100%; height: 100%; display: block;">
    </canvas>
  `,
})
export class SpectrumCanvasComponent implements AfterViewInit, OnChanges {
  @Input() lines: [number, number][] = [];

  @ViewChild('spectrumCanvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.draw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Redraw whenever the lines input changes (element switched)
    if (changes['lines'] && this.canvasRef) {
      this.draw();
    }
  }

  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Faint rainbow wash background
    const wash = ctx.createLinearGradient(0, 0, W, 0);
    for (let wl = WL_MIN; wl <= WL_MAX; wl += 10) {
      const [r, g, b] = wlToRGB(wl);
      wash.addColorStop(pct(wl) / 100, `rgba(${r},${g},${b},0.06)`);
    }
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);

    // Draw each emission line
    for (const [wl, intensity] of this.lines) {
      if (wl < WL_MIN || wl > WL_MAX) continue;

      const x   = (pct(wl) / 100) * W;
      const [r, g, b] = wlToRGB(wl);
      const alpha     = 0.35 + intensity * 0.65;
      const color     = `rgba(${r},${g},${b},${alpha})`;
      const glowColor = `rgba(${r},${g},${b},${alpha * 0.4})`;

      // Outer glow (wide)
      const gOuter = ctx.createLinearGradient(x - 18, 0, x + 18, 0);
      gOuter.addColorStop(0, 'transparent');
      gOuter.addColorStop(0.5, glowColor);
      gOuter.addColorStop(1, 'transparent');
      ctx.fillStyle = gOuter;
      ctx.fillRect(x - 18, 0, 36, H);

      // Inner glow
      const gInner = ctx.createLinearGradient(x - 6, 0, x + 6, 0);
      gInner.addColorStop(0, 'transparent');
      gInner.addColorStop(0.5, color);
      gInner.addColorStop(1, 'transparent');
      ctx.fillStyle = gInner;
      ctx.fillRect(x - 6, 0, 12, H);

      // Sharp line
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.6 + intensity * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  }
}
