import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpectrumCanvasComponent } from './spectrum-canvas';
import { pct } from './wl-utils';
import { ISpectrum } from '../../../../interfaces/ISpectra';
import { DadosElementosService } from './emission-spectrum.service';

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
  ticks: number[] = [];

  constructor(private spectrumService: DadosElementosService) {}

  carregarEspectros(symbol: string): void {
    this.spectrumService
      .obterDadosEspectro(symbol)
      .subscribe((resp: ISpectrum) => {
        this.spectrum = resp; // se quiser manter o array
        this.lines = (resp.spectral_lines ?? []).map((l): [number, number] => [
          Number(l.w),
          Number(l.i),
        ]);
        console.log(this.lines);
      });
  }

  geraTicks(passo: number): number[] {
    for(let i = 380; i<=780; i = i + passo){
      this.ticks.push(i)
    }
    console.log('Ticks',this.ticks)
    return this.ticks;
  }

  ngOnInit(): void {
    this.carregarEspectros(this.symbol);
    this.geraTicks(20);
    
  }

  /** Left-position percentage for a wavelength tick */
  pct(wl: number): number {
    return pct(wl);
  }
}
