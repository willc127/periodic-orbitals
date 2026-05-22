import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
} from '@angular/core';
import { ScopeConfig } from '../../../../interfaces/scopeConfig';
import { Distributor } from './electron-distributor';

@Component({
  selector: 'app-electron-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './electron-distribution.html',
  styleUrls: ['./electron-distribution.scss'],
})
export class ElectronDistribution implements AfterViewInit {
  @Input() atomicNumber: number | null = 1;
  @Input() elementType = '';
  @ViewChild('wrapper', { static: true })
  wrapperRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  scope!: ScopeConfig;
  private ctx2D!: CanvasRenderingContext2D;
  private resizeObserver?: ResizeObserver;

  private readonly elementTypeColors: Record<string, string> = {
    Hydrogen: '#a8d8ea',
    'Noble-Gas': '#ff00aa',
    'Alkali-Metal': '#ff6b35',
    'Alkaline-Earth-Metal': '#f4a900',
    'Transition-Metal': '#88bff2',
    Metalloid: '#88e6d1',
    Nonmetal: '#f2e474',
    Lanthanide: '#f2b57a',
    Actinide: '#8ef876',
    'Poor-Metal': '#3aafa9',
    Halogen: '#cc92f2',
  };

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx2D = canvas.getContext('2d')!;
    this.beforeInit();
    this.observeResize();
    this.loop();
  }

  private observeResize() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    this.resizeObserver.observe(container);
  }

  //
  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement as HTMLElement | null;
    if (!container) {
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    this.ctx2D.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (this.scope) {
      this.scope.size = (Math.max(width, height) * 4) / 10;
    }
  }

  beforeInit() {
    this.scope = {
      orbitColor: '#DDDDDD',
      atomicNumber: this.atomicNumber || 1,
      shells: [],
      size: 0,
      offset: 0,
      animate: true,
    };

    this.resizeCanvas();

    const distributeElectrons = (atomicNumber: number) => {
      const atom = new Distributor(atomicNumber);
      this.scope.shells = atom.shells;
    };
    distributeElectrons(this.scope.atomicNumber);
  }

  get elementClass(): string {
    return this.mapElementTypeToCssClass(this.elementType);
  }

  private mapElementTypeToCssClass(tipo: string): string {
    if (!tipo) return '';

    const normalized = tipo
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ');

    const map: Record<string, string> = {
      hydrogen: 'Hydrogen',
      'noble gas': 'Noble-Gas',
      'noble-gas': 'Noble-Gas',
      alkali: 'Alkali-Metal',
      'alkali metal': 'Alkali-Metal',
      alkaline: 'Alkaline-Earth-Metal',
      'alkaline earth': 'Alkaline-Earth-Metal',
      'alkaline earth metal': 'Alkaline-Earth-Metal',
      'transition metal': 'Transition-Metal',
      transition: 'Transition-Metal',
      metalloid: 'Metalloid',
      nonmetal: 'Nonmetal',
      'non-metal': 'Nonmetal',
      halogen: 'Halogen',
      lanthanide: 'Lanthanide',
      actinide: 'Actinide',
      'poor metal': 'Poor-Metal',
      'post transition metal': 'Poor-Metal',
      'post-transition metal': 'Poor-Metal',
    };

    return map[normalized] ?? tipo;
  }

  private getColorForElementType(elementClass: string): string {
    if (!elementClass) {
      return '#DDDDDD';
    }

    return (
      this.elementTypeColors[elementClass] ??
      this.elementTypeColors['Nonmetal'] ??
      '#DDDDDD'
    );
  }

  draw() {
    const { orbitColor, shells, size, offset } = this.scope;
    const color = this.getColorForElementType(this.elementClass);

    const ctx = this.ctx2D;
    const originX = this.canvasRef.nativeElement.width / 2;
    const originY = this.canvasRef.nativeElement.height / 2;
    const alpha = 2 * Math.PI;

    const minOrbitRadius = size / 3;
    const orbitLineWidth = size / 2 ** 7;
    const electronRadius = size / 30;
    const electronClearRadius = electronRadius * 2;
    const nucleusRadius = size / 6;

    let layerRotationSpeed = 2;

    ctx.clearRect(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height,
    );

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = orbitColor;
    ctx.lineWidth = orbitLineWidth;
    ctx.lineCap = 'round';

    shells.forEach((electrons, i) => {
      const radius =
        (i / (shells.length - 1)) * (size - minOrbitRadius) + minOrbitRadius;
      const layerRotation = offset * layerRotationSpeed;

      if (electrons === 0) {
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        ctx.arc(originX, originY, radius, 0, alpha);
        ctx.stroke();
        return;
      }

      ctx.globalAlpha = 1;

      for (let j = 0; j < electrons; j++) {
        const phi1 = (j / electrons) * alpha + layerRotation;
        const phi2 = phi1 + (1 / electrons) * alpha;
        const posX = originX + radius * Math.cos(phi1);
        const posY = originY + radius * Math.sin(phi1);
        const orbitalSpacing = electronClearRadius / radius;

        if (phi2 - phi1 - 2 * orbitalSpacing > 0) {
          ctx.beginPath();
          ctx.arc(
            originX,
            originY,
            radius,
            phi1 + orbitalSpacing,
            phi2 - orbitalSpacing,
          );
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(posX, posY, electronRadius, 0, alpha);
        ctx.fill();
      }
      layerRotationSpeed *= -1;
    });

    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(originX, originY, nucleusRadius, 0, alpha);
    ctx.fill();

    ctx.restore();
  }

  loop() {
    if (!this.scope.animate) return;
    this.scope.offset = (this.scope.offset + 2 ** -8) % (2 * Math.PI);
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
