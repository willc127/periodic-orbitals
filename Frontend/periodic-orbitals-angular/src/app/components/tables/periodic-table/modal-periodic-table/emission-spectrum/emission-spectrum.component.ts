import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpectrumCanvasComponent } from './spectrum-canvas.component';
import { ELEMENTS, ElementData } from './elements.data';
import { wlToRGB, wlToCSS, pct } from './wl-utils';

@Component({
  selector: 'app-emission-spectrum',
  standalone: true,
  imports: [CommonModule, SpectrumCanvasComponent],
  templateUrl: './emission-spectrum.component.html',
  styleUrls: ['./emission-spectrum.component.css'],
})
export class EmissionSpectrumComponent implements OnInit {
  selected = 'H';
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

  // ── Helpers used in the template ─────────────────────────────────

  /** Dominant (highest-intensity) wavelength of a line set */
  dominantWl(lines: [number, number][]): number {
    return lines.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  }

  /** Color of the element name in the header */
  headerNameColor(): string {
    return wlToCSS(this.dominantWl(this.el.lines));
  }

  /** Left-position percentage for a wavelength tick */
  pct(wl: number): number {
    return pct(wl);
  }

  // ── Button styles ─────────────────────────────────────────────────

  buttonStyle(sym: string, lines: [number, number][]): Record<string, string> {
    const dominant  = this.dominantWl(lines);
    const isSel     = sym === this.selected;
    return {
      background:    isSel ? wlToCSS(dominant, 0.15) : 'transparent',
      color:         isSel ? wlToCSS(dominant)        : '#555',
      border:        `1px solid ${isSel ? wlToCSS(dominant, 0.6) : '#2a2a2a'}`,
      borderRadius:  '3px',
      padding:       '0.35rem 0.7rem',
      cursor:        'pointer',
      fontSize:      '0.85rem',
      fontFamily:    'inherit',
      letterSpacing: '0.05em',
      transition:    'all 0.15s ease',
      minWidth:      '42px',
      textAlign:     'center',
    };
  }

  buttonSymbolStyle(sym: string, lines: [number, number][]): Record<string, string> {
    return {
      fontSize:   '0.95rem',
      fontWeight: sym === this.selected ? '600' : '400',
    };
  }

  buttonZStyle(sym: string, lines: [number, number][]): Record<string, string> {
    const isSel = sym === this.selected;
    return {
      fontSize:  '0.55rem',
      color:     isSel ? wlToCSS(this.dominantWl(lines), 0.7) : '#333',
      marginTop: '1px',
    };
  }

  // ── Spectral line table styles ────────────────────────────────────

  lineCardStyle(wl: number, intensity: number): Record<string, string> {
    const [r, g, b] = wlToRGB(wl);
    return {
      display:        'flex',
      alignItems:     'center',
      gap:            '0.4rem',
      background:     '#0e0e0e',
      border:         `1px solid rgba(${r},${g},${b},0.25)`,
      borderRadius:   '2px',
      padding:        '0.3rem 0.6rem',
    };
  }

  lineBarStyle(wl: number, intensity: number): Record<string, string> {
    const [r, g, b] = wlToRGB(wl);
    const a = 0.4 + intensity * 0.6;
    return {
      width:      '3px',
      height:     '18px',
      background: `rgba(${r},${g},${b},${a})`,
      boxShadow:  `0 0 4px rgba(${r},${g},${b},0.5)`,
      flexShrink: '0',
    };
  }

  lineWlStyle(wl: number): Record<string, string> {
    const [r, g, b] = wlToRGB(wl);
    return {
      fontSize:      '0.75rem',
      color:         `rgba(${r},${g},${b},0.9)`,
      letterSpacing: '0.05em',
    };
  }
}
