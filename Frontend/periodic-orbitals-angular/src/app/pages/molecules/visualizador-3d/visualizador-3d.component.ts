import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ELEMENTOS } from '../elementos-molecula';
import { EstiloMolecular, Geometria3D, Molecula, OrdemLigacao, SimboloElemento } from '../molecula.models';

interface ParametrosVareta {
  /** Raio do cilindro por ordem de ligação (Å). */
  readonly raio: Readonly<Record<OrdemLigacao, number>>;
  /** Distância de cada cilindro ao eixo da ligação, por ordem (Å). */
  readonly deslocamento: Readonly<Record<OrdemLigacao, number>>;
}

const PARAMETROS: Readonly<Record<Exclude<EstiloMolecular, 'espaco-preenchido'>, ParametrosVareta>> = {
  'bola-e-vareta': {
    raio: { 1: 0.09, 2: 0.065, 3: 0.055 },
    deslocamento: { 1: 0, 2: 0.11, 3: 0.14 },
  },
  vareta: {
    raio: { 1: 0.14, 2: 0.09, 3: 0.07 },
    deslocamento: { 1: 0, 2: 0.15, 3: 0.19 },
  },
};

/** Fração do raio de van der Waals usada como raio da esfera no estilo bola-e-vareta. */
const FRACAO_VDW_BOLA = 0.25;
const RAIO_ATOMO_VARETA = 0.14;

@Component({
  selector: 'app-visualizador-3d',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualizador-3d.component.html',
  styleUrl: './visualizador-3d.component.scss',
})
export class Visualizador3dComponent {
  readonly molecula = input.required<Molecula>();
  readonly geometria = input.required<Geometria3D>();
  readonly estilo = input<EstiloMolecular>('bola-e-vareta');
  readonly mostrarHidrogenios = input(true);

  private readonly tela = viewChild.required<ElementRef<HTMLCanvasElement>>('tela');
  private readonly recipiente = viewChild.required<ElementRef<HTMLElement>>('recipiente');
  private readonly pronto = signal(false);

  private renderizador?: THREE.WebGLRenderer;
  private readonly cena = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300);
  private controles?: OrbitControls;
  private observador?: ResizeObserver;
  private readonly grupo = new THREE.Group();
  private readonly geoEsfera = new THREE.SphereGeometry(1, 48, 32);
  private readonly geoCilindro = new THREE.CylinderGeometry(1, 1, 1, 24, 1, false);
  private readonly materiais = new Map<SimboloElemento, THREE.MeshStandardMaterial>();
  private quadroPendente = false;
  private totalAtomosAnterior = -1;

  constructor() {
    afterNextRender(() => {
      this.iniciar();
      this.pronto.set(true);
    });

    effect(() => {
      if (!this.pronto()) return;
      this.reconstruir(this.molecula(), this.geometria(), this.estilo(), this.mostrarHidrogenios());
    });

    inject(DestroyRef).onDestroy(() => this.destruir());
  }

  /** Reposiciona a câmera para enquadrar a molécula inteira, mantendo a direção de visão atual. */
  enquadrar(): void {
    if (!this.controles) return;
    const posicoes = this.posicoesVisiveis(this.molecula(), this.geometria(), this.mostrarHidrogenios());
    if (posicoes.size === 0) return;

    const centro = new THREE.Vector3();
    posicoes.forEach((p) => centro.add(p));
    centro.divideScalar(posicoes.size);
    let raio = 0;
    posicoes.forEach((p) => (raio = Math.max(raio, p.distanceTo(centro))));
    raio += 2.2; // folga para o tamanho dos átomos

    const fovVertical = THREE.MathUtils.degToRad(this.camera.fov);
    const fovHorizontal = 2 * Math.atan(Math.tan(fovVertical / 2) * this.camera.aspect);
    const distancia = raio / Math.sin(Math.min(fovVertical, fovHorizontal) / 2);

    const direcao = this.camera.position.clone().sub(this.controles.target);
    if (direcao.lengthSq() < 1e-6) direcao.set(0, 0, 1);
    direcao.normalize();

    this.controles.target.copy(centro);
    this.camera.position.copy(centro).addScaledVector(direcao, distancia);
    this.camera.near = Math.max(0.05, distancia / 100);
    this.camera.far = distancia * 20;
    this.camera.updateProjectionMatrix();
    this.controles.update();
    this.solicitarRender();
  }

  // ------------------------------------------------------------ cena

  private iniciar(): void {
    const tela = this.tela().nativeElement;
    this.renderizador = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
    this.renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderizador.setClearColor(0x000000, 0);

    this.camera.position.set(0, 0, 10);

    this.controles = new OrbitControls(this.camera, tela);
    this.controles.enableDamping = false;
    this.controles.minDistance = 1.5;
    this.controles.maxDistance = 120;
    this.controles.addEventListener('change', () => this.solicitarRender());

    this.cena.add(new THREE.HemisphereLight(0xffffff, 0x3a4058, 1.1));
    const principal = new THREE.DirectionalLight(0xffffff, 2.2);
    principal.position.set(5, 8, 7);
    const preenchimento = new THREE.DirectionalLight(0xbcd2ff, 0.7);
    preenchimento.position.set(-6, -3, -4);
    this.cena.add(principal, preenchimento, this.grupo);

    this.observador = new ResizeObserver(() => this.ajustarTamanho());
    this.observador.observe(this.recipiente().nativeElement);
    this.ajustarTamanho();
  }

  private ajustarTamanho(): void {
    if (!this.renderizador) return;
    const caixa = this.recipiente().nativeElement.getBoundingClientRect();
    if (caixa.width < 1 || caixa.height < 1) return;
    this.renderizador.setSize(caixa.width, caixa.height, false);
    this.camera.aspect = caixa.width / caixa.height;
    this.camera.updateProjectionMatrix();
    this.solicitarRender();
  }

  private solicitarRender(): void {
    if (this.quadroPendente) return;
    this.quadroPendente = true;
    requestAnimationFrame(() => {
      this.quadroPendente = false;
      this.renderizador?.render(this.cena, this.camera);
    });
  }

  private destruir(): void {
    this.observador?.disconnect();
    this.controles?.dispose();
    this.geoEsfera.dispose();
    this.geoCilindro.dispose();
    this.materiais.forEach((m) => m.dispose());
    this.materiais.clear();
    this.renderizador?.dispose();
    this.renderizador = undefined;
  }

  private material(elemento: SimboloElemento): THREE.MeshStandardMaterial {
    let m = this.materiais.get(elemento);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: ELEMENTOS[elemento].cor, roughness: 0.38, metalness: 0.05 });
      this.materiais.set(elemento, m);
    }
    return m;
  }

  // ------------------------------------------------------------ molécula

  private posicoesVisiveis(mol: Molecula, geo: Geometria3D, mostrarH: boolean): Map<number, THREE.Vector3> {
    const posicoes = new Map<number, THREE.Vector3>();
    for (const a of mol.atomos) {
      if (!mostrarH && a.elemento === 'H') continue;
      const p = geo.get(a.id);
      if (p) posicoes.set(a.id, new THREE.Vector3(p.x, p.y, p.z));
    }
    return posicoes;
  }

  private reconstruir(mol: Molecula, geo: Geometria3D, estilo: EstiloMolecular, mostrarH: boolean): void {
    if (!this.renderizador) return;
    this.grupo.clear();

    const posicoes = this.posicoesVisiveis(mol, geo, mostrarH);

    for (const a of mol.atomos) {
      const p = posicoes.get(a.id);
      if (!p) continue;
      const vdw = ELEMENTOS[a.elemento].raioVdw;
      const raio =
        estilo === 'espaco-preenchido' ? vdw : estilo === 'vareta' ? RAIO_ATOMO_VARETA : vdw * FRACAO_VDW_BOLA;
      const esfera = new THREE.Mesh(this.geoEsfera, this.material(a.elemento));
      esfera.position.copy(p);
      esfera.scale.setScalar(raio);
      this.grupo.add(esfera);
    }

    if (estilo !== 'espaco-preenchido') {
      const vizinhos = new Map<number, number[]>();
      for (const l of mol.ligacoes) {
        if (!posicoes.has(l.a) || !posicoes.has(l.b)) continue;
        (vizinhos.get(l.a) ?? vizinhos.set(l.a, []).get(l.a)!).push(l.b);
        (vizinhos.get(l.b) ?? vizinhos.set(l.b, []).get(l.b)!).push(l.a);
      }
      const parametros = PARAMETROS[estilo];
      const elementoDe = new Map(mol.atomos.map((a) => [a.id, a.elemento]));

      for (const l of mol.ligacoes) {
        const pa = posicoes.get(l.a);
        const pb = posicoes.get(l.b);
        if (!pa || !pb) continue;
        const perpendicular = this.perpendicular(l.a, l.b, posicoes, vizinhos);
        const deslocamento = parametros.deslocamento[l.ordem];
        const passos = l.ordem === 1 ? [0] : l.ordem === 2 ? [-1, 1] : [-1, 0, 1];
        for (const passo of passos) {
          const desvio = perpendicular.clone().multiplyScalar(passo * deslocamento);
          const inicio = pa.clone().add(desvio);
          const fim = pb.clone().add(desvio);
          const meio = inicio.clone().add(fim).multiplyScalar(0.5);
          this.adicionarCilindro(inicio, meio, parametros.raio[l.ordem], elementoDe.get(l.a)!);
          this.adicionarCilindro(meio, fim, parametros.raio[l.ordem], elementoDe.get(l.b)!);
        }
      }
    }

    if (mol.atomos.length !== this.totalAtomosAnterior) {
      this.totalAtomosAnterior = mol.atomos.length;
      this.enquadrar();
    }
    this.solicitarRender();
  }

  private adicionarCilindro(p0: THREE.Vector3, p1: THREE.Vector3, raio: number, elemento: SimboloElemento): void {
    const direcao = p1.clone().sub(p0);
    const comprimento = direcao.length();
    if (comprimento < 1e-6) return;
    const malha = new THREE.Mesh(this.geoCilindro, this.material(elemento));
    malha.position.copy(p0).add(p1).multiplyScalar(0.5);
    malha.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direcao.normalize());
    malha.scale.set(raio, comprimento, raio);
    this.grupo.add(malha);
  }

  /**
   * Direção perpendicular à ligação usada para afastar as linhas de ligações duplas e triplas.
   * Fica no plano formado com um vizinho (assim, em sistemas planares, as linhas ficam no plano da molécula).
   */
  private perpendicular(
    idA: number,
    idB: number,
    posicoes: ReadonlyMap<number, THREE.Vector3>,
    vizinhos: ReadonlyMap<number, readonly number[]>,
  ): THREE.Vector3 {
    const pa = posicoes.get(idA)!;
    const pb = posicoes.get(idB)!;
    const eixo = pb.clone().sub(pa).normalize();

    const candidatos: [number, THREE.Vector3][] = [
      ...(vizinhos.get(idA) ?? []).filter((v) => v !== idB).map((v): [number, THREE.Vector3] => [v, pa]),
      ...(vizinhos.get(idB) ?? []).filter((v) => v !== idA).map((v): [number, THREE.Vector3] => [v, pb]),
    ];
    for (const [idVizinho, base] of candidatos) {
      const lado = posicoes.get(idVizinho)!.clone().sub(base);
      const normal = new THREE.Vector3().crossVectors(eixo, lado);
      if (normal.length() > 0.2) {
        return new THREE.Vector3().crossVectors(normal.normalize(), eixo).normalize();
      }
    }
    const referencia = Math.abs(eixo.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    return new THREE.Vector3().crossVectors(eixo, referencia).normalize();
  }
}
