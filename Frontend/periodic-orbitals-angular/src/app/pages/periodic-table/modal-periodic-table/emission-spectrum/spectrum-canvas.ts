import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { wlToRGB, pct, WL_MIN, WL_MAX } from './wl-utils';

@Component({
  selector: 'app-spectrum-canvas',
  standalone: true,
  template: `
    <canvas #spectrumCanvas style="width: 100%; height: 100%; display: block;">
    </canvas>
  `,
})
export class SpectrumCanvasComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() lines: [number, number][] = [];

  @ViewChild('spectrumCanvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { inlineSize: width, blockSize: height } =
          entry.contentBoxSize[0];

        // Sincroniza dimensões intrínsecas com o tamanho CSS real
        if (canvas.width !== Math.round(width) || canvas.height !== Math.round(height)) {
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          this.draw();
        }
      }
    });

    this.resizeObserver.observe(canvas);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lines'] && this.canvasRef) {
      console.log('Linhas espectrais no canvas', this.lines);
      this.draw();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Evita desenhar em canvas com dimensão zero
    if (W === 0 || H === 0) return;

    const maxIntensity = Math.max(...this.lines.map(([, i]) => Number(i)), 1);
    const gamma = 0.5;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Rainbow wash background
    const wash = ctx.createLinearGradient(0, 0, W, 0);
    for (let wl = WL_MIN; wl <= WL_MAX; wl += 10) {
      const [r, g, b] = wlToRGB(wl);
      wash.addColorStop(pct(wl) / 100, `rgba(${r},${g},${b},0.04)`);
    }
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);

    for (const [wl, intensity] of this.lines) {
      const w = Number(wl);
      const normalized = Number(intensity) / maxIntensity;
      if (!isFinite(w) || !isFinite(normalized)) continue;
      if (w < WL_MIN || w > WL_MAX) continue;

      const i = Math.pow(normalized, gamma);
      const x = (pct(w) / 100) * W;
      const [r, g, b] = wlToRGB(w);
      const alpha = 0.2 + i * 0.8;
      const glowRadius = 4 + i * 12;

      // Glow externo
      const gOuter = ctx.createLinearGradient(x - glowRadius, 0, x + glowRadius, 0);
      gOuter.addColorStop(0, 'transparent');
      gOuter.addColorStop(0.5, `rgba(${r},${g},${b},${i * 0.3})`);
      gOuter.addColorStop(1, 'transparent');
      ctx.fillStyle = gOuter;
      ctx.fillRect(x - glowRadius, 0, glowRadius * 2, H);

      // Linha central
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = 0.5 + i * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  }
}