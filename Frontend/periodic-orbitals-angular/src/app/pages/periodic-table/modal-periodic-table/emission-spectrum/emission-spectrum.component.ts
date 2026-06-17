import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpectrumCanvasComponent } from './spectrum-canvas';
import { pct, rgbToHsl, wlToCSS, wlToRGB } from './wl-utils';
import { ISpectrum } from '../../../../interfaces/ISpectra';
import { DadosElementosService } from './emission-spectrum.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-emission-spectrum',
  standalone: true,
  imports: [CommonModule, SpectrumCanvasComponent],
  templateUrl: './emission-spectrum.component.html',
  styleUrls: ['./emission-spectrum.scss'],
})
export class EmissionSpectrumComponent implements OnInit {
  @Input() symbol!: string;
  spectrum!: ISpectrum;
  lines: [number, number][] = [];
  mainLines: [number, number][] = [];
  ticks: number[] = [];

  constructor(private spectrumService: DadosElementosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  carregarEspectros(symbol: string): void {
    this.spectrumService
      .obterDadosEspectro(symbol)
      .subscribe((resp: ISpectrum) => {
        this.spectrum = resp;
        this.lines = (resp.spectral_lines ?? []).map((l): [number, number] => [
          Number(l.w),
          Number(l.i),
        ]);

        this.mainLines = this.lines
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20) // escolher as 20 linhas mais intensas
          .sort((a, b) => a[0] - b[0]);
      });
  }

  abrirLinkNist(): void {
    window.open(this.data.link_nist, '_blank');
  }

  geraTicks(passo: number): number[] {
    for (let i = 380; i <= 780; i = i + passo) {
      this.ticks.push(i);
    }
    return this.ticks;
  }

  ngOnInit(): void {
    this.carregarEspectros(this.symbol);
    this.geraTicks(10);
  }

  /** Left-position percentage for a wavelength tick */
  pct(wl: number): number {
    return pct(wl);
  }

  // ── Spectral line table styles ────────────────────────────────────

  lineCardStyle(wl: number): Record<string, string> {
    const [r, g, b] = wlToRGB(wl);
    const { h, s } = rgbToHsl(r, g, b);
    return {
      display: 'flex',
      alignItems: 'center',
      background: `hsla(${h}, ${s}%, 60%, 0.10)`,
      border: `1px solid hsl(${h}, ${s}%, 60%)`,
      gap: '1rem',
      borderRadius: '4px',
      padding: '0.3rem 0.6rem',
      fontWeight: 'bold',
    };
  }

  lineBarStyle(wl: number, intensity: number): Record<string, string> {
    const [r, g, b] = wlToRGB(wl);
    const { h, s, l } = rgbToHsl(r, g, b);

    return {
      width: '5px',
      height: '18px',
      background: `hsl(${h}, ${s}%, ${l}%)`,
      boxShadow: `0 0 15px  ${intensity / 15}px hsl(${h}, ${s}%, 60%)`,
      flexShrink: '0',
    };
  }

  lineWlStyle(wl: number): Record<string, string> {
    const [r, g, b] = wlToRGB(wl);
    const { h } = rgbToHsl(r, g, b);
    return {
      fontSize: '1rem',
      color: `hsl(${h}, 100%, 80%)`,
      letterSpacing: '0.05em',
    };
  }
  lineWlStyleIntensity(wl: number): Record<string, string> {
    const [r, g, b] = wlToRGB(wl);
    const { h } = rgbToHsl(r, g, b);
    return {
      fontSize: '0.65rem',
      color: `hsl(${h}, 100%, 80%)`,
      letterSpacing: '0.05em',
    };
  }
}
