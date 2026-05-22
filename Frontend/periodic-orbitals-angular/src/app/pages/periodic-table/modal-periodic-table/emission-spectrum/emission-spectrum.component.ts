import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpectrumCanvasComponent } from './spectrum-canvas.component';
import { ELEMENTS, ElementData } from './emission.data';
import { wlToRGB, wlToCSS, pct } from './wl-utils';

@Component({
  selector: 'app-emission-spectrum',
  standalone: true,
  imports: [CommonModule, SpectrumCanvasComponent],
  templateUrl: './emission-spectrum.component.html',
  styleUrls: ['./emission-spectrum.scss'],
})
export class EmissionSpectrumComponent implements OnInit {
  selected = 'He';
  ticks = [400, 450, 500, 550, 600, 650, 700, 750];

  /** Elements sorted by atomic number Z */
  sortedElements: [string, ElementData][] = [];

  /** Currently selected element */
  get el(): ElementData {
    return ELEMENTS[this.selected];
  }

  ngOnInit(): void {
    this.sortedElements = Object.entries(ELEMENTS).sort(
      ([, a], [, b]) => a.Z - b.Z,
    );
  }

  selectElement(sym: string): void {
    this.selected = sym;
  }

  /** Left-position percentage for a wavelength tick */
  pct(wl: number): number {
    return pct(wl);
  }
}
