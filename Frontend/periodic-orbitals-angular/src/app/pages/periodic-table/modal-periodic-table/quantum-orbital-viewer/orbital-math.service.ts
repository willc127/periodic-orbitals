import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════
//  SHADERS GLSL
//  Cloud: esferas impostoras (Slice of Curiosity)
//  Surface: iluminação tripla (Lisyarus + Slice of Curiosity)
// ═══════════════════════════════════════════════════════════

export const VERT_CLOUD = /* glsl */ `
  attribute float phase;
  varying  float vPhase;
  varying  float vDist;
  uniform  float uSize;

  void main() {
    vPhase = phase;
    vec4 mv  = modelViewMatrix * vec4(position, 1.0);
    vDist    = -mv.z;
    gl_Position  = projectionMatrix * mv;
    gl_PointSize = uSize * (180.0 / max(1.0, -mv.z));
  }
`;

export const FRAG_CLOUD = /* glsl */ `
  varying float vPhase;
  varying float vDist;
  uniform vec3  cPos;
  uniform vec3  cNeg;
  uniform float uOpacity;

  void main() {
    vec2  uv = gl_PointCoord * 2.0 - 1.0;
    float d  = dot(uv, uv);
    if (d > 1.0) discard;

    // Iluminação sobre esfera impostora
    float nz    = sqrt(max(0.0, 1.0 - d));
    vec3  nm    = normalize(vec3(uv.x, uv.y, nz));
    vec3  ld    = normalize(vec3(0.6, 0.8, 1.0));
    float diff  = max(dot(nm, ld), 0.0);
    float light = 0.3 + 0.7 * diff;

    vec3 col = vPhase > 0.0 ? cPos : cNeg;
    gl_FragColor = vec4(col * light, uOpacity * (1.0 - d * 0.25));
  }
`;

export const VERT_SURF = /* glsl */ `
  attribute float phase;
  varying  float vPhase;
  varying  vec3  vN;
  varying  vec3  vP;

  void main() {
    vPhase   = phase;
    vN       = normalMatrix * normal;
    vP       = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const FRAG_SURF = /* glsl */ `
  varying float vPhase;
  varying vec3  vN;
  varying vec3  vP;
  uniform vec3  cPos;
  uniform vec3  cNeg;

  void main() {
    vec3 col = vPhase > 0.0 ? cPos : cNeg;
    vec3 n   = normalize(vN);

    // Três luzes (câmera + topo + fill) — Slice of Curiosity
    vec3 lCam  = normalize(-vP);
    vec3 lTop  = normalize(vec3(0.3,  1.0,  0.5));
    vec3 lFill = normalize(vec3(-0.5, 0.3, -0.8));

    float d1    = max(dot(n, lCam),  0.0) * 0.55;
    float d2    = max(dot(n, lTop),  0.0) * 0.25;
    float d3    = max(dot(n, lFill), 0.0) * 0.10;
    float light = 0.12 + d1 + d2 + d3;

    gl_FragColor = vec4(col * light, 0.90);
  }
`;

// ═══════════════════════════════════════════════════════════
//  SERVICE
// ═══════════════════════════════════════════════════════════

export interface CloudResponse {
  positions: number[];
  phases: number[];
}
export interface CloudData {
  positions: Float32Array;
  phases: Float32Array;
}
export interface SurfaceResponse {
  vertices: number[];
  normals: number[];
  phases: number[];
}
export interface SurfaceData {
  vertices: Float32Array;
  normals: Float32Array;
  phaseColors: Float32Array;
}
export interface RadialResponse {
  radii: number[];
  values: number[];
}
export interface DensityResponse {
  plane: 'XY' | 'XZ' | 'YZ';
  size: number;
  values: number[][];
}

@Injectable({ providedIn: 'root' })
export class OrbitalMathService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/orbitals';

  // ─── Tokens de requisição para evitar corridas entre chamadas
  //     concorrentes ao mesmo canvas (ex.: effect() + ResizeObserver
  //     disparando drawRadial/drawDensity quase ao mesmo tempo) ───
  private radialRequestId = 0;
  private densityRequestId = 0;

  constructor(private readonly http: HttpClient) {}

  // ─── Amostragem Monte Carlo (Beloit + Lisyarus) ───────────
  async sampleOrbital(
    n: number,
    l: number,
    m: number,
    nPts: number,
    boxHalf: number,
  ): Promise<CloudData> {
    const params = new HttpParams()
      .set('n', n.toString())
      .set('l', l.toString())
      .set('m', m.toString())
      .set('points', nPts.toString())
      .set('boxHalf', boxHalf.toString());

    const response = await firstValueFrom(
      this.http.get<CloudData>(`${this.baseUrl}/cloud`, { params }),
    );

    return {
      positions: new Float32Array(response.positions),
      phases: new Float32Array(response.phases),
    };
  }

  // ─── Marching Cubes (ChemTube3D + Davidson) ───────────────
  async buildIsosurface(
    n: number,
    l: number,
    m: number,
    isoValue: number,
    gridN: number,
    boxHalf: number,
  ): Promise<SurfaceData> {
    const params = new HttpParams()
      .set('n', n.toString())
      .set('l', l.toString())
      .set('m', m.toString())
      .set('isoValue', isoValue.toString())
      .set('resolution', gridN.toString())
      .set('boxHalf', boxHalf.toString());

    const response = await firstValueFrom(
      this.http.get<SurfaceResponse>(`${this.baseUrl}/surface`, { params }),
    );

    return {
      vertices: new Float32Array(response.vertices),
      normals: new Float32Array(response.normals),
      phaseColors: new Float32Array(response.phases),
    };
  }

  // ─── Criar material de nuvem (ShaderMaterial) ─────────────
  createCloudMaterial(pointSize: number): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader: VERT_CLOUD,
      fragmentShader: FRAG_CLOUD,
      uniforms: {
        uSize: { value: pointSize },
        cPos: { value: new THREE.Color(0x4fa3e3) },
        cNeg: { value: new THREE.Color(0xe35040) },
        uOpacity: { value: 0.85 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  // ─── Criar material de superfície (ShaderMaterial) ────────
  createSurfaceMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      vertexShader: VERT_SURF,
      fragmentShader: FRAG_SURF,
      uniforms: {
        cPos: { value: new THREE.Color(0x4fa3e3) },
        cNeg: { value: new THREE.Color(0xe35040) },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  // ─── Distribuição radial para canvas 2D (Davidson) ────────
  async drawRadial(
    canvas: HTMLCanvasElement,
    n: number,
    l: number,
  ): Promise<void> {
    // Token desta chamada específica: se outra chamada mais nova
    // terminar depois, esta é descartada silenciosamente.
    const requestId = ++this.radialRequestId;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    // Evita desenhar (e resetar o canvas) quando o elemento ainda
    // não tem layout — ex.: dentro de uma aba/painel ainda oculto.
    if (cssW === 0 || cssH === 0) return;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d')!;
    // setTransform substitui a matriz inteira em vez de multiplicá-la
    // (como faz scale()), então cada chamada começa sempre de um
    // estado limpo e conhecido — não acumula escala entre execuções.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = cssW;
    const H = cssH;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#07070f';
    ctx.fillRect(0, 0, W, H);

    try {
      const params = new HttpParams()
        .set('n', n.toString())
        .set('l', l.toString());
      const response = await firstValueFrom(
        this.http.get<RadialResponse>(`${this.baseUrl}/radial`, { params }),
      );

      // Se uma chamada mais recente já assumiu o canvas enquanto
      // aguardávamos a resposta HTTP, descarta este resultado.
      if (requestId !== this.radialRequestId) return;

      const radii = response.radii;
      const values = response.values;
      const maxV = Math.max(...values, 1e-12);
      if (values.length === 0) return;

      // ---- Grid de fundo (4 linhas horizontais) ----
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = H - 28 - i * ((H - 44) / 4);
        ctx.beginPath();
        ctx.moveTo(36, y);
        ctx.lineTo(W - 8, y);
        ctx.stroke();
      }

      // ---- Eixos ----
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(36, 8);
      ctx.lineTo(36, H - 28);
      ctx.lineTo(W - 8, H - 28);
      ctx.stroke();

      // ---- Rótulos dos eixos ----
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '9px monospace';
      ctx.fillText('|\u03A8|\u00B2', 10, 14);
      ctx.fillText('r (a\u2080)', W - 34, H - 6);

      // ---- TICKS NO EIXO X (r) ----
      const numTicksX = 5;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 0; i < numTicksX; i++) {
        const frac = i / (numTicksX - 1);
        const rVal = radii[Math.floor(frac * (radii.length - 1))];
        const xPos = 36 + frac * (W - 50);
        ctx.beginPath();
        ctx.moveTo(xPos, H - 28);
        ctx.lineTo(xPos, H - 24);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        const label = rVal.toFixed(rVal < 1 ? 2 : rVal < 10 ? 1 : 0);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText(label, xPos, H - 22);
      }

      // ---- Curva ----
      ctx.beginPath();
      let first = true;
      for (let i = 0; i < radii.length; i++) {
        const r = radii[i];
        const v = values[i];
        const x = 36 + (r / radii[radii.length - 1]) * (W - 50);
        const y = H - 28 - (v / maxV) * (H - 44);
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        first = false;
      }
      ctx.strokeStyle = '#4fa3e3';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#4fa3e3';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ---- Área preenchida ----
      const grad = ctx.createLinearGradient(0, 8, 0, H - 28);
      grad.addColorStop(0, '#4fa3e3aa');
      grad.addColorStop(1, '#4fa3e308');
      ctx.beginPath();
      first = true;
      for (let i = 0; i < radii.length; i++) {
        const r = radii[i];
        const v = values[i];
        const x = 36 + (r / radii[radii.length - 1]) * (W - 50);
        const y = H - 28 - (v / maxV) * (H - 44);
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        first = false;
      }
      ctx.lineTo(36 + (W - 50), H - 28);
      ctx.lineTo(36, H - 28);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // ---- Título com n e l ----
      ctx.fillStyle = '#4fa3e3';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`n=${n}  l=${l}`, 44, 0);
    } catch (error) {
      // Só loga se ainda formos a chamada "vigente"; evita ruído
      // de erros de requisições já obsoletas.
      if (requestId === this.radialRequestId) {
        console.error('Erro ao buscar dados radiais:', error);
      }
    }
  }

  // ─── Mapa de densidade 2D (Davidson) ──────────────────────
  async drawDensity(
    canvas: HTMLCanvasElement,
    n: number,
    l: number,
    m: number,
    plane: string,
  ): Promise<void> {
    const requestId = ++this.densityRequestId;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    if (cssW === 0 || cssH === 0) return;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = cssW;
    const H = cssH;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#07070f';
    ctx.fillRect(0, 0, W, H);

    try {
      // Carrega apenas a imagem gerada pelo backend e a desenha.
      const proj = plane.toLowerCase();
      const imgUrl = `${this.baseUrl}/image?n=${n}&l=${l}&m=${m}&plane=${proj}&colormap=viridis`;

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (requestId !== this.densityRequestId) return resolve();

          const maxGridSide = Math.min(W, H);
          const gridWidth = maxGridSide;
          const gridHeight = maxGridSide;
          const gridLeft = Math.round((W - gridWidth) / 2);
          const gridTop = Math.round((H - gridHeight) / 2 + 8);

          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            gridLeft,
            gridTop,
            gridWidth,
            gridHeight,
          );

          ctx.strokeStyle = 'rgba(255,255,255,0.12)';
          ctx.lineWidth = 1;
          ctx.strokeRect(gridLeft, gridTop, gridWidth, gridHeight);

          ctx.fillStyle = '#4fa3e3';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(
            `Plano ${plane} — n=${n} l=${l} m=${m}`,
            gridLeft,
            gridTop - 12,
          );

          resolve();
        };

        img.onerror = () => {
          // Silencioso: se a imagem faltar, não tenta fallback.
          resolve();
        };

        img.src = imgUrl;
      });
    } catch (error) {
      if (requestId === this.densityRequestId) {
        console.error('Erro ao desenhar mapa de densidade:', error);
      }
    }
  }
}
