import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  signal,
  untracked,
} from '@angular/core';
import * as THREE from 'three';

import { ORBITALS, type OrbitalDef } from './orbital.models';
import {
  COR_TITULO,
  ESCALA_CENA,
  GRADE,
  META_ORBITAL,
  MASSA_ISO,
  MetaOrbital,
  ModeloOrbital,
  ModoVisual,
  PALETA_FASE,
  PlanoSecao,
  PONTOS_POR_E,
  TabelaRadial,
  amostrarCampo,
  amostrarNuvem,
  criarModeloOrbital,
  limiarProbabilidade,
  tabelaRadialSecao,
  tabelaRadial,
} from './orbital-surface.logica';
import { extrairIsosuperficie, MalhaIso } from './surface-nets';

interface ModeloCena {
  versao: number;
  mod: ModeloOrbital;
  tab: TabelaRadial;
  escala: number;
  limiar: number;
}

const FUNDO_SUPERFICIE = 0x07070f;
const FUNDO_DENSIDADE = 0x07070f;

@Component({
  selector: 'app-orbital-surface-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orbital-surface-viewer.html',
  styleUrls: ['./orbital-surface-viewer.scss'],
})
export class OrbitalSurfaceViewerComponent implements AfterViewInit, OnDestroy {
  // ── Entradas / saídas ─────────────────────────────────────
  private readonly _orbital = signal<OrbitalDef>(ORBITALS[0]);
  private readonly _z = signal(1);

  /** Orbital selecionado para visualização. */
  @Input({ required: true }) set orbital(o: OrbitalDef | null) {
    if (!o) return;
    this._orbital.set(o);
  }

  /** Carga nuclear efetiva (1 = hidrogenoide puro). Escala o tamanho radial. */
  @Input() set zEff(v: number | null | undefined) {
    this._z.set(v && v > 0 ? v : 1);
  }

  // ── Referências de template ───────────────────────────────
  @ViewChild('palco', { static: true }) palcoRef!: ElementRef<HTMLDivElement>;
  @ViewChild('threeCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radialCanvas', { static: true })
  radialRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sectionCanvas', { static: true })
  sectionRef!: ElementRef<HTMLCanvasElement>;

  // ── Estado ────────────────────────────────────────────────
  readonly modo = signal<ModoVisual>('solido');
  readonly escalaE = signal(3);
  readonly probabilidadeSuperficie = signal(Math.round(MASSA_ISO * 100));
  readonly plano = signal<PlanoSecao>('XY');
  readonly offsetSecao = signal(0);
  readonly mostrarPlanoCorte = signal(true);
  readonly autoRotacao = signal(
    typeof matchMedia === 'function'
      ? !matchMedia('(prefers-reduced-motion: reduce)').matches
      : true,
  );
  readonly ajudaAberta = signal(false);
  private readonly pronto = signal(false);
  private readonly limitesSuperficie = signal({ x: 0, y: 0, z: 0 });

  readonly modos: { id: ModoVisual; rotulo: string }[] = [
    { id: 'densidade', rotulo: 'Densidade' },
    { id: 'solido', rotulo: 'Sólido' },
    { id: 'translucido', rotulo: 'Translúcido' },
  ];
  readonly planos: readonly ('XY' | 'XZ' | 'YZ')[] = ['XY', 'XZ', 'YZ'];
  readonly limiteOffset = computed(() => {
    const eixo = this.eixoOffset();
    return Math.max(this.limitesSuperficie()[eixo] * 1.05, 0.1);
  });
  readonly passoOffset = computed(() =>
    Math.max(0.1, +(this.limiteOffset() / 100).toFixed(1)),
  );
  readonly eixoOffset = computed(
    () => ({ XY: 'z', XZ: 'y', YZ: 'x' } as const)[this.plano()],
  );

  // ── Derivados ─────────────────────────────────────────────
  readonly grupo = computed(() => this._orbital().g);
  readonly letra = computed(() => this.grupo().toUpperCase());
  readonly corTitulo = computed(() => COR_TITULO[this.grupo()]);
  readonly corPos = computed(() => PALETA_FASE[this.grupo()].pos);
  readonly corNeg = computed(() => PALETA_FASE[this.grupo()].neg);
  private readonly meta = computed<MetaOrbital>(() => {
    const o = this._orbital();
    return (
      META_ORBITAL[`${o.l}:${o.m}`] ?? { sub: '', orientacao: '—', forma: '—' }
    );
  });

  readonly formula = computed(() => ({ base: this.grupo(), ...this.meta() }));
  readonly rotuloOrbital = computed(() => {
    const orbital = this._orbital();
    const sub = this.meta().sub;
    return `${orbital.n}${orbital.g}${sub ? ` (${sub})` : ''}`;
  });
  readonly qnRows = computed(() => {
    const orbital = this._orbital();
    const n = orbital.n;
    return [
      ['n', String(n)],
      ['ℓ', String(orbital.l)],
      ['m', String(orbital.m)],
      ['Nós radiais', String(Math.max(0, n - orbital.l - 1))],
      ['Nós angulares', String(orbital.l)],
    ];
  });

  readonly linhasPrincipais = computed(() => {
    const l = this._orbital().l;
    const m = this.meta();
    return [
      {
        rotulo: 'Orbitais na subcamada',
        valor: String(2 * l + 1),
        texto: false,
      },
      { rotulo: 'Orientação', valor: m.orientacao, texto: true },
      { rotulo: 'Forma', valor: m.forma, texto: true },
      { rotulo: 'Elétrons por orbital', valor: '2 e⁻', texto: false },
    ];
  });

  /** Meia-aresta da caixa [a₀] (mesma regra usada para montar a grade). */
  readonly extensao = computed(() => {
    const o = this._orbital();
    const mod = criarModeloOrbital(o.n, o.l, o.m, this._z());
    return this.meiaAresta(tabelaRadial(mod));
  });

  // ── Three.js (fora do Angular zone) ───────────────────────
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private rafId = 0;
  private ro?: ResizeObserver;
  private roGraficos?: ResizeObserver;
  private sujo = true;
  private limpezas: Array<() => void> = [];

  private theta = 0.6;
  private phi = 1.15;
  private raio = 30;

  private readonly grupoSuperficies = new THREE.Group();
  private planoCorte: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial
  > | null = null;
  private linhaIntersecao: THREE.LineSegments | null = null;
  private meshPos: THREE.Mesh | null = null;
  private meshNeg: THREE.Mesh | null = null;
  private nuvem: THREE.Points | null = null;
  private chaveNuvem = '';
  private modelo: ModeloCena | null = null;
  private versao = 0;

  private readonly mats = {
    solido: {
      pos: new THREE.MeshPhongMaterial({
        shininess: 90,
        specular: 0x777777,
        side: THREE.DoubleSide,
      }),
      neg: new THREE.MeshPhongMaterial({
        shininess: 90,
        specular: 0x777777,
        side: THREE.DoubleSide,
      }),
    },
    translucido: {
      pos: new THREE.MeshPhongMaterial({
        shininess: 60,
        specular: 0x444444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
      neg: new THREE.MeshPhongMaterial({
        shininess: 60,
        specular: 0x444444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    },
  };
  private matNuvem!: THREE.PointsMaterial;
  private sprite!: THREE.CanvasTexture;

  constructor(private readonly ngZone: NgZone) {
    // 1) Reconstrói o modelo quando orbital, Z ou probabilidade mudam.
    effect(() => {
      const o = this._orbital();
      const z = this._z();
      this.probabilidadeSuperficie();
      if (!this.pronto()) return;
      untracked(() => {
        this.construirModelo(o, o.n, z);
        this.aplicarModo(this.modo(), this.escalaE());
      });
    });

    // 2) Troca de modo / quantidade de pontos: só troca materiais (sem recalcular).
    effect(() => {
      const modo = this.modo();
      const e = this.escalaE();
      if (!this.pronto()) return;
      untracked(() => this.aplicarModo(modo, e));
    });

    // 3) Gráfico da distribuição radial (2D, calculado aqui no frontend).
    effect(() => {
      this._orbital();
      this._z();
      this.plano();
      this.offsetSecao();
      this.probabilidadeSuperficie();
      this.corTitulo();
      this.pronto();
      untracked(() => this.desenharRadial());
    });

    effect(() => {
      this._orbital();
      this._z();
      this.plano();
      this.offsetSecao();
      this.probabilidadeSuperficie();
      this.corPos();
      this.corNeg();
      this.pronto();
      untracked(() => this.desenharSecao());
    });

    effect(() => {
      const limite = this.limiteOffset();
      untracked(() => {
        this.offsetSecao.update((offset) =>
          Math.min(limite, Math.max(-limite, offset)),
        );
      });
    });

    effect(() => {
      this.plano();
      this.offsetSecao();
      this.mostrarPlanoCorte();
      this.extensao();
      if (!this.pronto()) return;
      untracked(() => this.atualizarPlanoCorte());
    });
  }

  // ── Ciclo de vida ─────────────────────────────────────────
  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.iniciarThree());

    this.roGraficos = new ResizeObserver(() => {
      this.desenharRadial();
      this.desenharSecao();
    });
    this.roGraficos.observe(this.radialRef.nativeElement);
    this.roGraficos.observe(this.sectionRef.nativeElement);

    this.pronto.set(true);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.ro?.disconnect();
    this.roGraficos?.disconnect();
    this.limpezas.forEach((fn) => fn());
    this.limparSuperficies();
    this.limparNuvem();
    this.limparLinhaIntersecao();
    this.planoCorte?.geometry.dispose();
    this.planoCorte?.material.dispose();
    Object.values(this.mats).forEach((par) => {
      par.pos.dispose();
      par.neg.dispose();
    });
    this.matNuvem?.dispose();
    this.sprite?.dispose();
    this.renderer?.dispose();
  }

  // ── Inicialização da cena ─────────────────────────────────
  private iniciarThree(): void {
    const palco = this.palcoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const w = palco.clientWidth || 800;
    const h = palco.clientHeight || 500;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(FUNDO_SUPERFICIE);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 300);
    this.camera.up.set(0, 0, 1); // eixo z do orbital na vertical
    this.scene.add(this.camera);
    this.atualizarCamera();

    // Luzes presas à câmera: o brilho acompanha a rotação
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const chave = new THREE.DirectionalLight(0xffffff, 2.2);
    chave.position.set(1, 1.2, 2);
    const preench = new THREE.DirectionalLight(0xbfd4ff, 0.8);
    preench.position.set(-2, -1, 1);
    this.camera.add(chave, preench);

    this.scene.add(this.grupoSuperficies);
    this.planoCorte = new THREE.Mesh(
      new THREE.PlaneGeometry(ESCALA_CENA * 2, ESCALA_CENA * 2),
      new THREE.MeshBasicMaterial({
        color: 0xb8d8f0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
      }),
    );
    this.planoCorte.renderOrder = 3;
    this.planoCorte.visible = this.mostrarPlanoCorte();
    this.scene.add(this.planoCorte);

    this.sprite = this.criarSprite();
    this.matNuvem = new THREE.PointsMaterial({
      size: 0.11,
      sizeAttenuation: true,
      vertexColors: true,
      map: this.sprite,
      alphaTest: 0.5,
    });

    this.ro = new ResizeObserver(() => {
      const nw = palco.clientWidth;
      const nh = palco.clientHeight;
      if (!nw || !nh) return;
      this.renderer.setSize(nw, nh, false);
      this.camera.aspect = nw / nh;
      this.camera.updateProjectionMatrix();
      this.sujo = true;
    });
    this.ro.observe(palco);

    this.iniciarControles(canvas);

    // Só renderiza quando algo mudou ou durante a rotação automática
    const loop = () => {
      this.rafId = requestAnimationFrame(loop);
      if (this.autoRotacao()) {
        this.theta += 0.004;
        this.atualizarCamera();
        this.sujo = true;
      }
      if (this.sujo) {
        this.renderer.render(this.scene, this.camera);
        this.sujo = false;
      }
    };
    loop();
  }

  private criarSprite(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    g.beginPath();
    g.arc(32, 32, 30, 0, Math.PI * 2);
    g.fillStyle = '#fff';
    g.fill();
    return new THREE.CanvasTexture(c);
  }

  // ── Câmera orbital (z para cima) ──────────────────────────
  private atualizarCamera(): void {
    const sp = Math.sin(this.phi);
    this.camera.position.set(
      this.raio * sp * Math.cos(this.theta),
      this.raio * sp * Math.sin(this.theta),
      this.raio * Math.cos(this.phi),
    );
    this.camera.lookAt(0, 0, 0);
  }

  private iniciarControles(el: HTMLCanvasElement): void {
    let arrastando = false;
    let ultX = 0;
    let ultY = 0;

    const down = (e: PointerEvent) => {
      arrastando = true;
      ultX = e.clientX;
      ultY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!arrastando) return;
      this.theta -= (e.clientX - ultX) * 0.008;
      this.phi = Math.min(
        Math.PI - 0.05,
        Math.max(0.05, this.phi - (e.clientY - ultY) * 0.008),
      );
      ultX = e.clientX;
      ultY = e.clientY;
      this.atualizarCamera();
      this.sujo = true;
    };
    const up = (e: PointerEvent) => {
      arrastando = false;
      if (el.hasPointerCapture(e.pointerId))
        el.releasePointerCapture(e.pointerId);
    };
    const roda = (e: WheelEvent) => {
      e.preventDefault();
      this.raio = Math.min(
        70,
        Math.max(14, this.raio * Math.exp(e.deltaY * 0.001)),
      );
      this.atualizarCamera();
      this.sujo = true;
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', roda, { passive: false });
    this.limpezas.push(() => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', roda);
    });
  }

  // ── Modelo: campo ψ → duas isosuperfícies (+ψ e −ψ) ───────
  private meiaAresta(tab: TabelaRadial): number {
    return Math.max(tab.r995 * 1.04, 1.5);
  }

  private construirModelo(o: OrbitalDef, n: number, z: number): void {
    this.limparSuperficies();
    this.limparNuvem();

    const mod = criarModeloOrbital(n, o.l, o.m, z);
    const tab = tabelaRadial(mod);
    const meio = this.meiaAresta(tab);
    const passo = (2 * meio) / (GRADE - 1);
    const escala = ESCALA_CENA / meio;

    const campo = amostrarCampo(mod, meio, GRADE);
    const limiar = limiarProbabilidade(
      campo,
      this.probabilidadeSuperficie() / 100,
    );

    // Lóbulos de fase positiva: ψ − t > 0 | fase negativa: −ψ − t > 0
    const fPos = new Float32Array(campo.length);
    const fNeg = new Float32Array(campo.length);
    for (let i = 0; i < campo.length; i++) {
      fPos[i] = campo[i] - limiar;
      fNeg[i] = -campo[i] - limiar;
    }

    this.meshPos = this.criarMesh(
      extrairIsosuperficie(fPos, GRADE, -meio, passo, escala),
    );
    this.meshNeg = this.criarMesh(
      extrairIsosuperficie(fNeg, GRADE, -meio, passo, escala),
    );
    this.limitesSuperficie.set(this.calcularLimitesSuperficie(escala));

    const paleta = PALETA_FASE[o.g];
    (['solido', 'translucido'] as const).forEach((k) => {
      this.mats[k].pos.color.set(paleta.pos);
      this.mats[k].neg.color.set(paleta.neg);
    });

    this.modelo = { versao: ++this.versao, mod, tab, escala, limiar };
    this.atualizarPlanoCorte();
  }

  private criarMesh(malha: MalhaIso | null): THREE.Mesh | null {
    if (!malha) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(malha.posicoes, 3));
    geo.setIndex(new THREE.BufferAttribute(malha.indices, 1));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, this.mats.solido.pos);
    this.grupoSuperficies.add(mesh);
    return mesh;
  }

  private limparSuperficies(): void {
    this.limparLinhaIntersecao();
    [this.meshPos, this.meshNeg].forEach((m) => {
      if (!m) return;
      this.grupoSuperficies.remove(m);
      m.geometry.dispose();
    });
    this.meshPos = this.meshNeg = null;
  }

  private calcularLimitesSuperficie(escala: number): {
    x: number;
    y: number;
    z: number;
  } {
    const limites = { x: 0, y: 0, z: 0 };
    for (const mesh of [this.meshPos, this.meshNeg]) {
      if (!mesh) continue;
      mesh.geometry.computeBoundingBox();
      const caixa = mesh.geometry.boundingBox;
      if (!caixa) continue;
      limites.x = Math.max(limites.x, Math.abs(caixa.min.x), Math.abs(caixa.max.x));
      limites.y = Math.max(limites.y, Math.abs(caixa.min.y), Math.abs(caixa.max.y));
      limites.z = Math.max(limites.z, Math.abs(caixa.min.z), Math.abs(caixa.max.z));
    }
    return {
      x: limites.x / escala,
      y: limites.y / escala,
      z: limites.z / escala,
    };
  }

  private limparNuvem(): void {
    if (this.nuvem) {
      this.scene.remove(this.nuvem);
      this.nuvem.geometry.dispose();
      this.nuvem = null;
    }
    this.chaveNuvem = '';
  }

  private atualizarPlanoCorte(): void {
    const plano = this.planoCorte;
    const modelo = this.modelo;
    if (!plano || !modelo) return;

    const offset = this.offsetSecao() * modelo.escala;
    plano.rotation.set(0, 0, 0);
    plano.position.set(0, 0, 0);
    switch (this.plano()) {
      case 'XY':
        plano.position.z = offset;
        break;
      case 'XZ':
        plano.rotation.x = Math.PI / 2;
        plano.position.y = offset;
        break;
      case 'YZ':
        plano.rotation.y = Math.PI / 2;
        plano.position.x = offset;
        break;
    }
    plano.visible = this.mostrarPlanoCorte();
    this.atualizarLinhaIntersecao(modelo, offset);
    this.sujo = true;
  }

  private atualizarLinhaIntersecao(modelo: ModeloCena, offset: number): void {
    this.limparLinhaIntersecao();
    if (!this.mostrarPlanoCorte()) return;

    const eixo = ({ XY: 'z', XZ: 'y', YZ: 'x' } as const)[this.plano()];
    const segmentos = [this.meshPos, this.meshNeg]
      .filter((mesh): mesh is THREE.Mesh => mesh !== null)
      .flatMap((mesh) => this.intersecoesMalha(mesh, eixo, offset));
    if (segmentos.length === 0) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(segmentos, 3),
    );
    const material = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
    this.linhaIntersecao = new THREE.LineSegments(geometry, material);
    this.linhaIntersecao.renderOrder = 4;
    this.linhaIntersecao.visible = this.mostrarPlanoCorte();
    this.grupoSuperficies.add(this.linhaIntersecao);
    this.sujo = true;
  }

  private intersecoesMalha(
    mesh: THREE.Mesh,
    eixo: 'x' | 'y' | 'z',
    offset: number,
  ): number[] {
    const positions = mesh.geometry.getAttribute('position');
    const index = mesh.geometry.getIndex();
    const segmentos: number[] = [];
    const ponto = (i: number): THREE.Vector3 =>
      new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i),
      );
    const distancia = (p: THREE.Vector3): number => p[eixo] - offset;
    const tolerancia = 1e-6;
    const vertices = index?.array;
    const total = vertices ? index.count : positions.count;

    for (let i = 0; i + 2 < total; i += 3) {
      const indices = vertices
        ? [vertices[i], vertices[i + 1], vertices[i + 2]]
        : [i, i + 1, i + 2];
      const triangulo = indices.map(ponto);
      const intersecoes: THREE.Vector3[] = [];
      const adicionar = (p: THREE.Vector3): void => {
        if (
          !intersecoes.some((q) => q.distanceToSquared(p) < tolerancia ** 2)
        ) {
          intersecoes.push(p);
        }
      };

      for (let edge = 0; edge < 3; edge++) {
        const a = triangulo[edge];
        const b = triangulo[(edge + 1) % 3];
        const da = distancia(a);
        const db = distancia(b);
        if (Math.abs(da) <= tolerancia) adicionar(a);
        if (Math.abs(db) <= tolerancia) adicionar(b);
        if (da * db < 0) {
          adicionar(a.clone().lerp(b, da / (da - db)));
        }
      }

      if (intersecoes.length >= 2) {
        segmentos.push(
          intersecoes[0].x,
          intersecoes[0].y,
          intersecoes[0].z,
          intersecoes[1].x,
          intersecoes[1].y,
          intersecoes[1].z,
        );
      }
    }

    return segmentos;
  }

  private limparLinhaIntersecao(): void {
    const linha = this.linhaIntersecao;
    if (!linha) return;
    this.grupoSuperficies.remove(linha);
    linha.geometry.dispose();
    const materials = Array.isArray(linha.material)
      ? linha.material
      : [linha.material];
    materials.forEach((material) => material.dispose());
    this.linhaIntersecao = null;
  }

  // ── Modos: sólido | translúcido | densidade ───────────────
  private aplicarModo(modo: ModoVisual, e: number): void {
    if (!this.modelo) return;
    const superficie = modo !== 'densidade';
    this.grupoSuperficies.visible = superficie;

    if (superficie) {
      const jogo = modo === 'solido' ? this.mats.solido : this.mats.translucido;
      if (this.meshPos) {
        this.meshPos.material = jogo.pos;
        this.meshPos.renderOrder = 1;
      }
      if (this.meshNeg) {
        this.meshNeg.material = jogo.neg;
        this.meshNeg.renderOrder = 2;
      }
      if (this.nuvem) this.nuvem.visible = false;
    } else {
      this.garantirNuvem(e);
      if (this.nuvem) this.nuvem.visible = true;
    }

    this.renderer.setClearColor(
      superficie ? FUNDO_SUPERFICIE : FUNDO_DENSIDADE,
    );
    this.sujo = true;
  }

  private garantirNuvem(e: number): void {
    const m = this.modelo;
    if (!m) return;
    const chave = `${m.versao}:${e}`;
    if (this.nuvem && this.chaveNuvem === chave) return;

    if (this.nuvem) {
      this.scene.remove(this.nuvem);
      this.nuvem.geometry.dispose();
    }
    const { posicoes, cores } = amostrarNuvem(
      m.mod,
      m.tab,
      e * PONTOS_POR_E,
      m.escala,
    );
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(cores, 3));
    this.nuvem = new THREE.Points(geo, this.matNuvem);
    this.scene.add(this.nuvem);
    this.chaveNuvem = chave;
  }

  // ── Distribuição radial P(r) = r²R² (canvas 2D) ───────────
  private desenharRadial(): void {
    const canvas = this.radialRef?.nativeElement;
    if (!canvas) return;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;

    const o = this._orbital();
    const n = o.n;
    const mod = criarModeloOrbital(n, o.l, o.m, this._z());
    const tab = tabelaRadial(mod);
    const rPlot = tab.r995 * 1.1;
    const limiarDensidade = (this.modelo?.limiar ?? 0) ** 2;
    const secao = tabelaRadialSecao(
      mod,
      this.plano(),
      this.offsetSecao(),
      rPlot,
      limiarDensidade,
    );
    const cor = this.corTitulo();

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const X0 = 30,
      X1 = cssW - 8,
      Y0 = cssH - 24,
      Y1 = 8;
    let pMax = 1e-30;
    for (const p of secao.p) pMax = Math.max(pMax, p);

    const px = (r: number) => X0 + (r / rPlot) * (X1 - X0);
    const py = (p: number) => Y0 - (p / pMax) * (Y0 - Y1);

    // grade + eixos
    ctx.strokeStyle = 'rgba(255,255,255,0.11)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = Y0 - (i * (Y0 - Y1)) / 4;
      ctx.beginPath();
      ctx.moveTo(X0, y);
      ctx.lineTo(X1, y);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.moveTo(X0, Y1);
    ctx.lineTo(X0, Y0);
    ctx.lineTo(X1, Y0);
    ctx.stroke();

    // ticks em r
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < 5; i++) {
      const r = (i / 4) * rPlot;
      ctx.fillText(r.toFixed(r < 10 ? 1 : 0), px(r), Y0 + 5);
    }
    ctx.textAlign = 'right';
    ctx.fillText('ρ (a₀)', X1, cssH - 11);

    // curva + área
    const trilha = () => {
      ctx.beginPath();
      for (let i = 0; i < secao.r.length; i++) {
        const x = px(secao.r[i]);
        const y = py(secao.p[i]);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    };
    trilha();
    ctx.lineTo(px(secao.r[secao.r.length - 1]), Y0);
    ctx.lineTo(X0, Y0);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, Y1, 0, Y0);
    grad.addColorStop(0, cor + 'd9');
    grad.addColorStop(1, cor + '12');
    ctx.fillStyle = grad;
    ctx.fill();

    trilha();
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  private desenharSecao(): void {
    const canvas = this.sectionRef?.nativeElement;
    if (!canvas) return;
    const modeloCena = this.modelo;
    if (!modeloCena) return;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;

    const orbital = this._orbital();
    const modelo = criarModeloOrbital(
      orbital.n,
      orbital.l,
      orbital.m,
      this._z(),
    );
    const offset = this.offsetSecao();
    const limiarDensidade = modeloCena.limiar * modeloCena.limiar;
    const meio = this.meiaAresta(tabelaRadial(modelo));
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const width = Math.max(1, Math.round(cssW * dpr));
    const height = Math.max(1, Math.round(cssH * dpr));
    canvas.width = width;
    canvas.height = height;

    const densities = new Float32Array(width * height);
    const phases = new Int8Array(width * height);
    let maxDensity = 0;
    for (let y = 0; y < height; y++) {
      const vertical = (1 - (2 * y) / (height - 1)) * meio;
      for (let x = 0; x < width; x++) {
        const horizontal = ((2 * x) / (width - 1) - 1) * meio;
        const psi =
          this.plano() === 'XY'
            ? modelo.psi(horizontal, vertical, offset)
            : this.plano() === 'XZ'
              ? modelo.psi(horizontal, offset, vertical)
              : modelo.psi(offset, horizontal, vertical);
        const index = x + width * y;
        const density = psi * psi;
        densities[index] = density >= limiarDensidade ? density : 0;
        phases[index] = psi >= 0 ? 1 : -1;
        maxDensity = Math.max(maxDensity, densities[index]);
      }
    }

    const image = new ImageData(width, height);
    const positivo = this.rgb(this.corPos());
    const negativo = this.rgb(this.corNeg());
    for (let i = 0; i < densities.length; i++) {
      if (densities[i] === 0) continue;
      const intensity = Math.pow(
        (densities[i] - limiarDensidade) /
          Math.max(maxDensity - limiarDensidade, 1e-30),
        0.65,
      );
      const color = phases[i] > 0 ? positivo : negativo;
      const offset = i * 4;
      image.data[offset] = color[0] * (0.02 + 0.98 * intensity);
      image.data[offset + 1] = color[1] * (0.02 + 0.98 * intensity);
      image.data[offset + 2] = color[2] * (0.02 + 0.98 * intensity);
      image.data[offset + 3] = Math.round(8 + 247 * intensity);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(image, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cssW / 2, 0);
    ctx.lineTo(cssW / 2, cssH);
    ctx.moveTo(0, cssH / 2);
    ctx.lineTo(cssW, cssH / 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillText(this.plano()[0].toLowerCase(), cssW - 12, cssH / 2 - 5);
    ctx.fillText(this.plano()[1].toLowerCase(), cssW / 2 + 5, 12);
  }

  private rgb(hex: string): [number, number, number] {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  // ── Handlers de template ──────────────────────────────────
  aoMudarE(e: Event): void {
    this.escalaE.set(+(e.target as HTMLInputElement).value);
  }

  aoMudarProbabilidade(e: Event): void {
    this.probabilidadeSuperficie.set(
      +(e.target as HTMLInputElement).value,
    );
  }

  resetarProbabilidade(): void {
    this.probabilidadeSuperficie.set(Math.round(MASSA_ISO * 100));
  }

  aoMudarOffset(e: Event): void {
    this.offsetSecao.set(+(e.target as HTMLInputElement).value);
  }

  resetarOffset(): void {
    this.offsetSecao.set(0);
  }

  alternarRotacao(): void {
    this.autoRotacao.update((v) => !v);
  }

  alternarPlanoCorte(): void {
    this.mostrarPlanoCorte.update((visivel) => !visivel);
  }
}
