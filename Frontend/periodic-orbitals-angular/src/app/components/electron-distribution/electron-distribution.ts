import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { chemicals, chemicalColors, Chemical } from '../../types/chemicals';
import { ScopeConfig } from '../../types/scopeConfig';

@Component({
  selector: 'app-my-painting',
  template: `<canvas #canvas width="400" height="400"></canvas>`,
  styles: [
    `
      canvas {
        display: block;
        margin: 0 auto;
        background: #111;
        border: 1px solid #222;
      }
    `,
  ],
})
export class MyPainting implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx2D!: CanvasRenderingContext2D;
  $scope!: ScopeConfig;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx2D = canvas.getContext('2d')!;
    this.initScope();
    this.beforeInit();
    this.loop();
  }

  private initScope() {
    const canvas = this.canvasRef.nativeElement;
    this.$scope = {
      background: '#333',
      orbitColor: '#DDD',
      textColor: '#FFF',
      atomicNumber: 2,
      shells: [],
      size: (Math.max(canvas.width, canvas.height) * 9) / 20,
      offset: 0,
      animate: true,
    };
  }

  private normalizeString(name: string): string {
    return name.toLowerCase();
  }

  private getChemical(search: number | string) {
    let chemical: Chemical | undefined;

    if (typeof search === 'number' && chemicals[search - 1]) {
      chemical = chemicals[search - 1];
    } else {
      const normSearch = this.normalizeString(search.toString());
      chemical = chemicals.find((ch) => {
        if (!ch) return false;
        for (let i = 0; i < ch.length - 1; i++) {
          const element = ch[i];
          if (typeof element !== 'string') continue;
          if (this.normalizeString(element).startsWith(normSearch)) return true;
        }
        return false;
      });
    }

    if (!chemical)
      throw new Error(`Elemento químico não encontrado: ${search}`);

    const [symbol, latin, name, colorCode] = chemical;
    const atomicNumber = chemicals.indexOf(chemical) + 1;
    const color = chemicalColors[colorCode];

    return { symbol, atomicNumber, latin, name, color };
  }

  draw() {
    const {
      background,
      orbitColor,
      textColor,
      atomicNumber,
      shells,
      size,
      offset,
    } = this.$scope;
    const { symbol, latin, name, color } = this.getChemical(atomicNumber);

    const ctx = this.ctx2D;
    const originX = this.canvasRef.nativeElement.width / 2;
    const originY = this.canvasRef.nativeElement.height / 2;
    const alpha = 2 * Math.PI;

    const minOrbitRadius = size / 3;
    const orbitLineWidth = size / 2 ** 7;
    const electronRadius = size / 30;
    const electronClearRadius = electronRadius * 2;
    const nucleusRadius = size / 6;

    let layerRotationSpeed = 1;

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

    ctx.font = '32px sans-serif';
    ctx.fillStyle = color;
    ctx.fillText('[', 16, 42);
    ctx.fillStyle = textColor;
    ctx.fillText(symbol, 28, 45);
    const symbolWidth = ctx.measureText(symbol).width;
    ctx.fillStyle = color;
    ctx.fillText(']', 30 + symbolWidth, 42);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(atomicNumber.toString(), 42 + symbolWidth, 28);
    ctx.font = '22px sans-serif';
    ctx.fillText(name, 16, 75);
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText(latin, 16, 95);

    ctx.restore();
  }

  beforeInit() {
    this.$scope.shells = [1, 0]; // shells de teste
  }

  loop() {
    if (!this.$scope.animate) return;
    this.$scope.offset = (this.$scope.offset + 2 ** -8) % (2 * Math.PI);
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}
