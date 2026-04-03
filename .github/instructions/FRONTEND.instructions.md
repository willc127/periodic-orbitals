# Instruções Frontend — Periodic Orbitals (Angular)

## Stack e Versões

| Tecnologia | Versão | Propósito |
|------------|--------|----------|
| **Angular** | 17+ | Framework principal com standalone components |
| **TypeScript** | 5.2+ | Linguagem tipada para o projeto |
| **Standalone Components** | 17+ | Componentes sem NgModules |
| **Signals API** | 17+ | Gerenciamento de estado reativo |
| **HttpClient** | Angular built-in | Chamadas HTTP ao backend |
| **Reactive Forms** | Angular built-in | Gerenciamento de formulários |
| **SCSS** | - | Preprocessador de CSS |
| **Angular CLI** | 17+ | Ferramenta de build e dev server |

---

## Convenções de Código

### Nomenclatura

- **Arquivos**: `kebab-case` (ex: `orbital-selector.component.ts`)
- **Classes**: `PascalCase` (ex: `OrbitalSelectorComponent`)
- **Métodos/Variáveis**: `camelCase` (ex: `loadOrbital()`, `orbitalParams`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `MAX_QUANTUM_NUMBER`)
- **Interfaces/Types**: `PascalCase` com prefixo (ex: `IOrbitalRequest`, `OrbitalState`)

### Tipagem

- **Não use `any`** — tipar sempre, inclusive respostas da API
- Use `unknown` apenas em casos excepcionais com type guards
- Definir interfaces para todas as estruturas de dados:
  ```typescript
  export interface OrbitalParams {
    n: number;
    l: number;
    m: number;
    plane: 'xz' | 'xy' | 'yz';
    samples?: number;
    cmap?: string;
  }
  ```
- Use `Readonly<T>` para dados imutáveis

### Componentes

**Sempre standalone:**
```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-orbital-viewer',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `...`,
  styles: [`...`]
})
export class OrbitalViewerComponent { }
```

**Estrutura de componente:**
- Usar `inject()` ao invés de constructor injection
- Definir `@Inputs` no início da classe
- Definir `@Outputs` após inputs
- Signals como properties privadas com `readonly`
- Métodos públicos após propriedades

**Exemplo:**
```typescript
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';

@Component({
  selector: 'app-orbital-selector',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `...`,
  styles: [`...`]
})
export class OrbitalSelectorComponent {
  @Input() initialParams?: OrbitalParams;
  @Output() paramsSelected = new EventEmitter<OrbitalParams>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.formBuilder.group({
    n: [1, [Validators.required, Validators.min(1), Validators.max(7)]],
    l: [0, Validators.required],
    m: [0, Validators.required],
    plane: ['xz', Validators.required],
    samples: [400, Validators.required]
  });

  selectOrbital() {
    if (this.form.valid) {
      this.paramsSelected.emit(this.form.getRawValue());
    }
  }
}
```

### Serviços

**Estrutura padrão:**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrbitalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  renderOrbital(params: OrbitalParams): Observable<Blob> {
    return this.http.post<Blob>(
      `${this.apiUrl}/orbitals/render/${params.n}/${params.l}/${params.m}`,
      {
        plane: params.plane,
        samples: params.samples || 400,
        cmap: params.cmap || 'magma'
      },
      { responseType: 'blob' }
    );
  }
}
```

**Boas práticas:**
- Usar `providedIn: 'root'` para injeção global
- Usar `inject()` para dependências
- Retornar `Observable` em vez de fazer subscribe no serviço
- Tratar erros HTTP com `catchError`
- Usar `shareReplay(1)` para caching de requests

### Signals e State Management

**Usar Signals para estado reativo:**
```typescript
readonly isLoading = signal(false);
readonly orbitalImage = signal<string | null>(null);
readonly errorMessage = signal<string | null>(null);

loadOrbital(params: OrbitalParams) {
  this.isLoading.set(true);
  
  this.orbitalService.renderOrbital(params)
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.isLoading.set(false)),
      catchError(err => {
        this.errorMessage.set('Erro ao renderizar orbital');
        return EMPTY;
      })
    )
    .subscribe(blob => {
      const url = URL.createObjectURL(blob);
      this.orbitalImage.set(url);
    });
}
```

**Computed para valores derivados:**
```typescript
readonly canRender = computed(() => {
  return this.form.valid && !this.isLoading();
});
```

**Effect para side effects:**
```typescript
constructor() {
  effect(() => {
    if (this.orbitalImage()) {
      console.log('Nova imagem carregada');
    }
  });
}
```

### Formulários (Reactive Forms)

**Validação com validadores customizados:**
```typescript
export const quantumValidators = {
  lValidator: (control: AbstractControl): ValidationErrors | null => {
    const form = control.parent;
    if (!form) return null;
    
    const n = form.get('n')?.value;
    const l = control.value;
    
    return l >= n ? { lInvalid: { n, l } } : null;
  },

  mValidator: (control: AbstractControl): ValidationErrors | null => {
    const form = control.parent;
    if (!form) return null;
    
    const l = form.get('l')?.value;
    const m = control.value;
    
    return Math.abs(m) > l ? { mInvalid: { l, m } } : null;
  }
};

// Uso:
readonly form = this.fb.group({
  n: [1, [Validators.required, Validators.min(1), Validators.max(7)]],
  l: [0, [Validators.required, quantumValidators.lValidator]],
  m: [0, [Validators.required, quantumValidators.mValidator]],
  plane: ['xz', Validators.required],
  samples: [400, [Validators.required, Validators.min(100), Validators.max(600)]],
  cmap: ['magma', Validators.required]
});
```

---

## Estrutura de Componentes

### Componente Principal: OrbitalViewerComponent

**Responsabilidades:**
- Exibir seletor de parâmetros
- Renderizar a imagem do orbital
- Mostrar estado de carregamento e erros
- Permitir baixar a imagem

**Template:**
```html
<div class="orbital-viewer">
  <app-orbital-selector 
    (paramsSelected)="onRenderOrbital($event)">
  </app-orbital-selector>

  <div class="viewer-container">
    <!-- Loading spinner -->
    <div *ngIf="isLoading()" class="spinner">
      <p>Renderizando orbital...</p>
    </div>

    <!-- Imagem -->
    <div *ngIf="orbitalImage() && !isLoading()" class="image-wrapper">
      <img [src]="orbitalImage()" alt="Orbital renderizado" />
      <button (click)="downloadImage()">Baixar</button>
    </div>

    <!-- Erro -->
    <div *ngIf="errorMessage()" class="error-message">
      {{ errorMessage() }}
    </div>
  </div>
</div>
```

### Componente: OrbitalSelectorComponent

**Responsabilidades:**
- Renderizar formulário com seleção de parâmetros
- Validar números quânticos em tempo real
- Emitir valores quando formulário for válido

### Componente: OrbitalImageComponent

**Responsabilidades:**
- Exibir imagem com URL object
- Gerenciar ciclo de vida da URL
- Cleanup com `revokeObjectURL`

```typescript
@Component({
  selector: 'app-orbital-image',
  standalone: true,
  template: `<img [src]="imageUrl()" alt="Orbital" />`
})
export class OrbitalImageComponent implements OnInit, OnDestroy {
  @Input() blob!: Blob;

  readonly imageUrl = signal<string | null>(null);
  private currentUrl: string | null = null;

  ngOnInit() {
    this.currentUrl = URL.createObjectURL(this.blob);
    this.imageUrl.set(this.currentUrl);
  }

  ngOnDestroy() {
    if (this.currentUrl) {
      URL.revokeObjectURL(this.currentUrl);
    }
  }
}
```

---

## Variáveis de Ambiente

**environment.ts (desenvolvimento):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000'
};
```

**environment.prod.ts (produção):**
```typescript
export const environment = {
  production: true,
  apiUrl: '/api'  // Proxy ou mesmo domínio
};
```

---

## Estilos SCSS

**Estrutura:**
- Usar `_variables.scss` para cores, tamanhos, fonts
- Usar `_mixins.scss` para padrões comuns
- Componentes com estilos escopo

**Exemplo:**
```scss
// _variables.scss
$color-primary: #1976d2;
$color-background: #fafafa;
$spacing-base: 8px;

// orbital-viewer.component.scss
.orbital-viewer {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: $spacing-base * 2;
  padding: $spacing-base * 3;

  .viewer-container {
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-background;
    border-radius: 8px;
    aspect-ratio: 1;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }
}
```

---

## Tratamento de Erros HTTP

**Usar interceptor para erros globais:**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMsg = error.status === 422 
          ? `Parâmetros inválidos: ${error.error.detail}`
          : `Erro ${error.status}: ${error.statusText}`;
        
        console.error(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}

// Registrar no app.config.ts (Angular 17+)
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([/* ... */])
    ),
    // ou usar HTTP_INTERCEPTORS para versões antigas
  ]
};
```

---

## Testes

**Estrutura de testes com Jasmine/Karma:**
```typescript
describe('OrbitalViewerComponent', () => {
  let component: OrbitalViewerComponent;
  let fixture: ComponentFixture<OrbitalViewerComponent>;
  let orbitalService: jasmine.SpyObj<OrbitalService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('OrbitalService', ['renderOrbital']);

    await TestBed.configureTestingModule({
      imports: [OrbitalViewerComponent],
      providers: [{ provide: OrbitalService, useValue: spy }]
    }).compileComponents();

    orbitalService = TestBed.inject(OrbitalService) as jasmine.SpyObj<OrbitalService>;
    fixture = TestBed.createComponent(OrbitalViewerComponent);
    component = fixture.componentInstance;
  });

  it('deve renderizar orbital válido', (done) => {
    const blob = new Blob(['test']);
    orbitalService.renderOrbital.and.returnValue(of(blob));

    component.onRenderOrbital({ n: 2, l: 1, m: 0, plane: 'xz' });

    setTimeout(() => {
      expect(component.orbitalImage()).toBeTruthy();
      done();
    }, 100);
  });

  it('deve mostrar erro para parâmetros inválidos', () => {
    orbitalService.renderOrbital.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 422 }))
    );

    component.onRenderOrbital({ n: 2, l: 2, m: 0, plane: 'xz' });

    expect(component.errorMessage()).toContain('inválido');
  });
});
```

---