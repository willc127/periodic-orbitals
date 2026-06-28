import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  NgZone,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';

import {
  ORBITALS,
  GROUP_COLOR,
  ORBITAL_INFO,
  OrbitalDef,
  OrbitalGroup,
  ViewMode,
  DensityPlane,
} from './orbital.models';
import { OrbitalMathService } from './orbital-math.service';

// ─────────────────────────────────────────────────────────────

@Component({
  selector: 'app-quantum-orbital-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quantum-orbital-viewer.html',
  styleUrls: ['./quantum-orbital-viewer.scss'],
})
export class QuantumOrbitalViewerComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  // ── ViewChildren ──────────────────────────────────────────
  @ViewChild('canvasWrap', { static: true })
  wrapRef!: ElementRef<HTMLDivElement>;
  @ViewChild('threeCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radialCanvas', { static: true })
  radialRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('densityCanvas', { static: true })
  densityRef!: ElementRef<HTMLCanvasElement>;

  // ── Signals de estado ─────────────────────────────────────
  selectedOrb = signal<OrbitalDef>(ORBITALS[0]);
  viewMode = signal<ViewMode>('cloud');
  nPts = signal(10000);
  ptSize = signal(1);
  isoVal = signal(0.0008);
  isoRes = signal(32);
  showAxes = signal(false);
  autoRotate = signal(true);
  densityPlane = signal<DensityPlane>('XY');
  loading = signal(false);

  // ── Computed ──────────────────────────────────────────────
  energy = computed(() => -13.61 / this.selectedOrb().n ** 2);

  qnRows = computed(() => {
    const o = this.selectedOrb();
    return [
      ['n', String(o.n)],
      ['l', String(o.l)],
      ['m', String(o.m)],
      ['Energia', `${this.energy().toFixed(2)} eV`],
    ];
  });

  orbInfo = computed(() => ORBITAL_INFO[this.selectedOrb().g]);

  infoChips = computed(() => {
    const o = this.selectedOrb();
    const info = ORBITAL_INFO[o.g];
    return [
      { key: 'Tipo', val: `Orbital ${o.g.toUpperCase()}` },
      { key: 'Forma', val: info.shape },
      { key: 'Nós radiais', val: String(Math.max(0, info.radialNodes(o.n))) },
      { key: 'Nós angulares', val: String(o.l) },
      { key: 'Nós totais', val: String(o.n - 1) },
    ];
  });

  // ── Dados estáticos expostos ao template ──────────────────
  readonly groups: OrbitalGroup[] = ['s', 'p', 'd', 'f'];
  readonly planes: DensityPlane[] = ['XY', 'XZ', 'YZ'];

  // ── Three.js state (fora do Angular zone) ─────────────────
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private axesHelper!: THREE.AxesHelper;
  private rafId = 0;
  private ro!: ResizeObserver;

  // Câmera orbital manual (sem OrbitControls para evitar import extra)
  private camTheta = 0.5;
  private camPhi = 0.9;
  private camRadius = 30;
  private isDrag = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private readonly math: OrbitalMathService,
    private readonly ngZone: NgZone,
  ) {
    // Effects reactivos

    // Rebuild orbital quando orbital ou modo muda
    effect(() => {
      const o = this.selectedOrb();
      const md = this.viewMode();
      // Leitura dos parâmetros dependentes para o effect escutar
      const np = this.nPts();
      const ps = this.ptSize();
      const iv = this.isoVal();
      const ir = this.isoRes();
      if (this.scene) {
        this.ngZone.runOutsideAngular(() =>
          this.rebuildOrbital(o, md, np, ps, iv, ir),
        );
      }
    });

    // Atualizar pointSize sem rebuild completo
    effect(() => {
      const ps = this.ptSize();
      if (!this.scene) return;
      this.scene.traverse((obj) => {
        if (
          obj.userData['orbital'] &&
          (obj as any).material?.uniforms?.['uSize']
        ) {
          (obj as any).material.uniforms['uSize'].value = ps;
        }
      });
    });

    // Axes
    effect(() => {
      if (this.axesHelper) this.axesHelper.visible = this.showAxes();
    });

    // Plots 2D — orital muda
    effect(() => {
      const o = this.selectedOrb();
      if (this.radialRef?.nativeElement) {
        this.math.drawRadial(this.radialRef.nativeElement, o.n, o.l);
      }
    });

    // Plots 2D — orbital ou plano muda
    effect(() => {
      const o = this.selectedOrb();
      const p = this.densityPlane();
      if (this.densityRef?.nativeElement) {
        setTimeout(
          () =>
            this.math.drawDensity(
              this.densityRef.nativeElement,
              o.n,
              o.l,
              o.m,
              p,
            ),
          10,
        );
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.initThree());
    // Desenhar plots iniciais
    const o = this.selectedOrb();
    this.math.drawRadial(this.radialRef.nativeElement, o.n, o.l);
    setTimeout(
      () =>
        this.math.drawDensity(
          this.densityRef.nativeElement,
          o.n,
          o.l,
          o.m,
          this.densityPlane(),
        ),
      20,
    );
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.ro?.disconnect();
    this.renderer?.dispose();
    this.removeDragListeners();
  }

  // ── Inicialização Three.js ────────────────────────────────
  private initThree(): void {
    const wrap = this.wrapRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
  // Obtém as dimensões atuais
  const rect = wrap.getBoundingClientRect();
  const W = rect.width || 800;
  const H = rect.height || 500;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(W, H);
    this.renderer.setClearColor(0x07070f);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
    this.updateCamera();

    this.axesHelper = new THREE.AxesHelper(9);
    this.axesHelper.visible = this.showAxes();
    this.scene.add(this.axesHelper);

    // Resize
    this.ro = new ResizeObserver(() => {
      const nW = wrap.clientWidth,
        nH = wrap.clientHeight;
      if (!nW || !nH) return;
      this.renderer.setSize(nW, nH);
      this.camera.aspect = nW / nH;
      this.camera.updateProjectionMatrix();
    });
    this.ro.observe(wrap);

    

    // Interação
    this.initDragControls(canvas);

    // Loop de renderização
    const animate = () => {
      this.rafId = requestAnimationFrame(animate);
      if (this.autoRotate()) {
        this.camTheta += 0.005;
        this.updateCamera();
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    // Build inicial
    const o = this.selectedOrb();
    this.rebuildOrbital(
      o,
      this.viewMode(),
      this.nPts(),
      this.ptSize(),
      this.isoVal(),
      this.isoRes(),
    );
  }

  // ── Câmera orbital manual ─────────────────────────────────
  private updateCamera(): void {
    this.camera.position.set(
      this.camRadius * Math.sin(this.camPhi) * Math.sin(this.camTheta),
      this.camRadius * Math.cos(this.camPhi),
      this.camRadius * Math.sin(this.camPhi) * Math.cos(this.camTheta),
    );
    this.camera.lookAt(0, 0, 0);
  }

  private _onMouseDown!: (e: MouseEvent) => void;
  private _onMouseMove!: (e: MouseEvent) => void;
  private _onMouseUp!: () => void;
  private _onWheel!: (e: WheelEvent) => void;
  private _onTouchStart!: (e: TouchEvent) => void;
  private _onTouchMove!: (e: TouchEvent) => void;
  private _onTouchEnd!: () => void;
  private _lastTouch: Touch | null = null;

  private initDragControls(el: HTMLCanvasElement): void {
    this._onMouseDown = (e: MouseEvent) => {
      this.isDrag = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    };
    this._onMouseMove = (e: MouseEvent) => {
      if (!this.isDrag) return;
      this.camTheta -= (e.clientX - this.lastX) * 0.008;
      this.camPhi = Math.max(
        0.05,
        Math.min(
          Math.PI - 0.05,
          this.camPhi - (e.clientY - this.lastY) * 0.008,
        ),
      );
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.updateCamera();
    };
    this._onMouseUp = () => {
      this.isDrag = false;
    };
    this._onWheel = (e: WheelEvent) => {
      this.camRadius = Math.max(
        5,
        Math.min(80, this.camRadius + e.deltaY * 0.04),
      );
      this.updateCamera();
    };
    this._onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.isDrag = true;
        this._lastTouch = e.touches[0];
      }
    };
    this._onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!this.isDrag || !this._lastTouch || e.touches.length !== 1) return;
      this.camTheta -= (e.touches[0].clientX - this._lastTouch.clientX) * 0.008;
      this.camPhi = Math.max(
        0.05,
        Math.min(
          Math.PI - 0.05,
          this.camPhi -
            (e.touches[0].clientY - this._lastTouch.clientY) * 0.008,
        ),
      );
      this._lastTouch = e.touches[0];
      this.updateCamera();
    };
    this._onTouchEnd = () => {
      this.isDrag = false;
      this._lastTouch = null;
    };

    el.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    el.addEventListener('wheel', this._onWheel, { passive: true });
    el.addEventListener('touchstart', this._onTouchStart, { passive: true });
    el.addEventListener('touchmove', this._onTouchMove, { passive: false });
    el.addEventListener('touchend', this._onTouchEnd, { passive: true });
  }

  private removeDragListeners(): void {
    const el = this.canvasRef?.nativeElement;
    if (!el) return;
    el.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    el.removeEventListener('wheel', this._onWheel);
    el.removeEventListener('touchstart', this._onTouchStart);
    el.removeEventListener('touchmove', this._onTouchMove);
    el.removeEventListener('touchend', this._onTouchEnd);
  }

  // ── Rebuild orbital 3D ───────────────────────────────────
  private rebuildOrbital(
    o: OrbitalDef,
    mode: ViewMode,
    nPts: number,
    ptSize: number,
    isoVal: number,
    isoRes: number,
  ): void {
    // Remover meshes anteriores
    const toRemove: THREE.Object3D[] = [];
    this.scene.traverse((obj) => {
      if (obj.userData['orbital']) toRemove.push(obj);
    });
    toRemove.forEach((obj) => {
      this.scene.remove(obj);
      (obj as any).geometry?.dispose();
      (obj as any).material?.dispose();
    });

    const boxHalf = Math.max(12, o.n * o.n * 1.7 + 4);
    this.ngZone.run(() => this.loading.set(true));

    setTimeout(() => {
      if (mode === 'cloud') {
        const { positions, phases } = this.math.sampleOrbital(
          o.n,
          o.l,
          o.m,
          nPts,
          boxHalf,
        );
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        const mat = this.math.createCloudMaterial(ptSize);
        const pts = new THREE.Points(geo, mat);
        pts.userData['orbital'] = true;
        this.scene.add(pts);
      } else {
        const { vertices, normals, phaseColors } = this.math.buildIsosurface(
          o.n,
          o.l,
          o.m,
          isoVal,
          isoRes,
          boxHalf,
        );
        if (vertices.length > 0) {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
          geo.setAttribute('phase', new THREE.BufferAttribute(phaseColors, 1));
          const mat = this.math.createSurfaceMaterial();
          const mesh = new THREE.Mesh(geo, mat);
          mesh.userData['orbital'] = true;
          this.scene.add(mesh);
        }
      }
      this.ngZone.run(() => this.loading.set(false));
    }, 30);
  }

  // ── Helpers de template ───────────────────────────────────
  getGroup(g: string): OrbitalDef[] {
    return ORBITALS.filter((o) => o.g === g);
  }

  groupColor(g: string): string {
    return GROUP_COLOR[g as OrbitalGroup] ?? '#4fa3e3';
  }

  // ── Handlers de evento ────────────────────────────────────
  selectOrbital(o: OrbitalDef): void {
    this.selectedOrb.set(o);
  }
  setMode(m: ViewMode): void {
    this.viewMode.set(m);
  }

  onNPts(e: Event): void {
    this.nPts.set(+(e.target as HTMLInputElement).value);
  }
  onPtSize(e: Event): void {
    this.ptSize.set(+(e.target as HTMLInputElement).value);
  }
  onIsoVal(e: Event): void {
    this.isoVal.set(+(e.target as HTMLInputElement).value);
  }
  onIsoRes(e: Event): void {
    this.isoRes.set(+(e.target as HTMLInputElement).value);
  }
}
