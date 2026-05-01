# 🎨 Frontend - Periodic Orbitals (Angular)

Interface web moderna para visualização interativa de orbitais atômicos do hidrogênio. Desenvolvida com **Angular 17+**, **Signals**, **Standalone Components** e **TypeScript** fortemente tipado.

**Stack Tecnológico:**

- Angular 17+ com Signals API
- Standalone Components (sem NgModules)
- TypeScript 5.2+
- Reactive Forms com validação
- HttpClient para integração com backend
- SCSS para estilização

**📚 [Instruções Completas de Frontend](.github/instructions/FRONTEND.instructions.md)**

---

## 🚀 Configuração Inicial

### 1. Verificar Versão do Node.js

```bash
node --version  # Deve ser v18.x ou superior
npm --version   # Deve ser 9.x ou superior
```

**Não tem Node.js?** Baixe em [nodejs.org](https://nodejs.org)

### 2. Instalar Dependências

```bash
cd Frontend/periodic-orbitals-angular
npm install
# Ou para reproduzibilidade garantida:
npm ci
```

### 3. Configurar Variáveis de Ambiente

Crie ou atualize `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8000", // URL do backend em desenvolvimento
  apiVersion: "v1",
};
```

Para produção, crie `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://api.seu-dominio.com", // URL do backend em produção
  apiVersion: "v1",
};
```

---

## 💻 Desenvolvimento Local

### Iniciar Servidor de Desenvolvimento

```bash
ng serve
# Ou com auto-reload e port customizado:
ng serve --port 4300
```

**Acesse:** http://localhost:4200

O servidor está configurado para fazer **auto-reload** sempre que você modifica arquivos. Simples editar → salvar → ver mudanças no navegador!

### Debugging

**Com Chrome DevTools:**

1. Abra o navegador (http://localhost:4200)
2. Pressione `F12` para abrir DevTools
3. Vá em `Sources` → `Webpack` → `.` → `src`
4. Coloque breakpoints e inspecione variáveis

**Com Angular DevTools Extension:**

1. Instale [Angular DevTools](https://chrome.google.com/webstore/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbco)
2. Abra DevTools (F12)
3. Vá em aba "Angular"
4. Inspecione componentes, signals e árvore de dependências

---

## 🏗️ Estrutura do Projeto

```
Frontend/periodic-orbitals-angular/
├── public/                          # Assets estáticos
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── app.ts                  # Componente raiz (standalone)
│   │   ├── app.routes.ts           # Rotas da aplicação
│   │   ├── app.config.ts           # Configuração global
│   │   │
│   │   ├── components/             # Componentes standalone
│   │   │   ├── orbital-viewer/     # Visualizador de orbital
│   │   │   │   ├── orbital-viewer.component.ts
│   │   │   │   ├── orbital-viewer.component.html
│   │   │   │   ├── orbital-viewer.component.scss
│   │   │   │   └── orbital-viewer.component.spec.ts
│   │   │   │
│   │   │   ├── orbital-selector/   # Seletor de parâmetros
│   │   │   │   ├── orbital-selector.component.ts
│   │   │   │   ├── orbital-selector.component.html
│   │   │   │   ├── orbital-selector.component.scss
│   │   │   │   └── orbital-selector.component.spec.ts
│   │   │   │
│   │   │   ├── periodic-table/     # Tabela periódica interativa
│   │   │   │   ├── periodic-table.component.ts
│   │   │   │   ├── periodic-table.component.html
│   │   │   │   ├── periodic-table.component.scss
│   │   │   │   └── periodic-table.component.spec.ts
│   │   │   │
│   │   │   └── ...outros componentes
│   │   │
│   │   ├── services/               # Serviços
│   │   │   ├── orbital.service.ts  # Integração com backend
│   │   │   ├── state.service.ts    # Gerenciamento de estado
│   │   │   └── ...outros serviços
│   │   │
│   │   ├── types/                  # Interfaces e tipos
│   │   │   ├── orbital.types.ts    # OrbitalParams, OrbitalResponse
│   │   │   ├── api.types.ts        # Tipos de API
│   │   │   └── ...outros tipos
│   │   │
│   │   └── shared/                 # Componentes e utilitários compartilhados
│   │       ├── components/
│   │       ├── pipes/
│   │       └── directives/
│   │
│   ├── assets/                     # Imagens, fontes, ícones
│   ├── environments/               # Configuração por ambiente
│   │   ├── environment.ts          # Desenvolvimento
│   │   └── environment.prod.ts     # Produção
│   │
│   ├── styles/                     # Estilos globais SCSS
│   │   ├── _variables.scss         # Variáveis de cor, tamanho
│   │   ├── _mixins.scss            # Mixins reutilizáveis
│   │   ├── _globals.scss           # Estilos globais
│   │   └── main.scss               # Importações principais
│   │
│   ├── main.ts                     # Ponto de entrada
│   ├── index.html                  # HTML principal
│   └── styles.scss                 # Estilos globais
│
├── tests/                          # Testes e2e
├── documentation/                  # Documentação gerada
├── coverage/                       # Relatório de cobertura de testes
│
├── angular.json                    # Configuração do Angular CLI
├── tsconfig.json                   # Configuração TypeScript
├── tsconfig.app.json               # Config TypeScript para app
├── tsconfig.spec.json              # Config TypeScript para testes
├── karma.conf.js                   # Configuração do Karma (testes)
├── package.json                    # Dependências
├── package-lock.json               # Lock file
└── README.md                       # Este arquivo
```

**Fluxo de Dados:**

```
User Interface (Components)
    ↓
Reactive Forms / Events
    ↓
Services (Orbital Service)
    ↓
HttpClient → Backend API
    ↓
Backend renderiza orbital
    ↓
Response (Base64 PNG)
    ↓
Display na UI
```

---

## 📦 Componentes Principais

### **OrbitalViewerComponent**

Exibe a imagem do orbital renderizada pelo backend.

```typescript
@Component({
  selector: "app-orbital-viewer",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="viewer">
      <img [src]="'data:image/png;base64,' + orbitalImage()" alt="Orbital renderizado" *ngIf="orbitalImage()" />
    </div>
  `,
})
export class OrbitalViewerComponent {
  orbitalImage = signal<string | null>(null);
}
```

### **OrbitalSelectorComponent**

Formulário para seleção de números quânticos (n, l, m) e parâmetros de renderização.

```typescript
@Component({
  selector: "app-orbital-selector",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="selectOrbital()">
      <!-- Inputs para n, l, m, plane, samples, cmap -->
    </form>
  `,
})
export class OrbitalSelectorComponent {
  @Output() paramsSelected = new EventEmitter<OrbitalParams>();

  form = this.fb.group({
    n: [1, [Validators.required, Validators.min(1), Validators.max(7)]],
    l: [0, Validators.required],
    m: [0, Validators.required],
    plane: ["xy", Validators.required],
    samples: [400, Validators.required],
  });
}
```

### **PeriodicTableComponent**

Tabela periódica interativa onde clicar em um elemento renderiza seu orbital.

---

## 🔌 Comunicação com Backend

### OrbitalService

Integração com API do backend:

```typescript
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class OrbitalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/${environment.apiVersion}`;

  renderOrbital(params: OrbitalParams) {
    return this.http.post<ImageResponse>(`${this.apiUrl}/orbitals/render`, params);
  }

  renderOrbitalStream(params: OrbitalParams) {
    return this.http.post(`${this.apiUrl}/orbitals/render-stream`, params, { responseType: "blob" });
  }
}
```

### URL base por ambiente

**Desenvolvimento (http://localhost:4200):**

```
Backend URL: http://localhost:8000
```

**Produção:**

```
Backend URL: https://api.seu-dominio.com
```

### Exemplo: Chamar Backend e Exibir Orbital

```typescript
export class AppComponent {
  private readonly orbitalService = inject(OrbitalService);
  orbitalImage = signal<string | null>(null);

  renderOrbital(params: OrbitalParams) {
    this.orbitalService.renderOrbital(params).subscribe({
      next: (response) => {
        this.orbitalImage.set(response.image_base64);
      },
      error: (error) => {
        console.error("Erro ao renderizar:", error);
      },
    });
  }
}
```

---

## 🎨 Estilos e Tema

### Preprocessador: SCSS

Todos os estilos usam **SCSS** com organização modular:

**`src/styles/_variables.scss`** - Variáveis globais:

```scss
// Cores
$primary-color: #007bff;
$success-color: #28a745;
$error-color: #dc3545;
$background-color: #f8f9fa;

// Tipografia
$font-family-base: "Segoe UI", Tahoma, Geneva, sans-serif;
$font-size-base: 1rem;
$line-height-base: 1.5;

// Espaçamento
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;
```

**`src/styles/_mixins.scss`** - Mixins reutilizáveis:

```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin button-reset {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}
```

### Convenção: BEM (Block Element Modifier)

```scss
// Block
.orbital-viewer {
  width: 100%;
  height: auto;

  // Element
  &__image {
    max-width: 100%;
    border-radius: 8px;

    // Modifier
    &--loading {
      opacity: 0.5;
    }
  }

  &__error {
    color: $error-color;
    padding: $spacing-md;
  }
}
```

### Adicionar Novo Componente com Estilos

```bash
ng generate component components/my-component
```

Crie `my-component.component.scss`:

```scss
@import "../../styles/variables";
@import "../../styles/mixins";

.my-component {
  padding: $spacing-md;
  background: $background-color;

  &__header {
    font-size: 1.25rem;
    font-weight: bold;
  }
}
```

---

## 🧪 Testes

### Rodar Testes Unitários

```bash
ng test
```

Abre o navegador e executa testes em tempo real com recarregamento automático.

### Rodar com Coverage

```bash
ng test --code-coverage
```

Relatório gerado em `coverage/index.html`

### Rodar Testes e2e

```bash
ng e2e
```

### Cobertura Esperada

- **Mínimo**: 75% para merge
- **Alvo**: 85%+
- **Componentes**: 80%+
- **Serviços**: 90%+

### Exemplo: Teste de Componente

```typescript
// orbital-selector.component.spec.ts
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OrbitalSelectorComponent } from "./orbital-selector.component";

describe("OrbitalSelectorComponent", () => {
  let component: OrbitalSelectorComponent;
  let fixture: ComponentFixture<OrbitalSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrbitalSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrbitalSelectorComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should emit paramsSelected when form is submitted", () => {
    spyOn(component.paramsSelected, "emit");
    component.form.patchValue({ n: 2, l: 1, m: 0 });
    component.selectOrbital();

    expect(component.paramsSelected.emit).toHaveBeenCalled();
  });
});
```

---

## 📦 Build e Deploy

### Build para Produção

```bash
ng build --configuration production
```

Artefatos compilados em `dist/periodic-orbitals-angular/`

**Otimizações automáticas:**

- ✅ Minificação de código
- ✅ Tree-shaking
- ✅ Lazy loading
- ✅ Compressão

### Servir Build Localmente

```bash
npx http-server dist/periodic-orbitals-angular -p 8080
```

Acesse: http://localhost:8080

### Deploy em Produção

**Opção 1: Vercel** (Recomendado)

```bash
npm install -g vercel
vercel
```

**Opção 2: Firebase Hosting**

```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

**Opção 3: Nginx/Apache**

```bash
# Copiar dist/ para servidor web
scp -r dist/periodic-orbitals-angular/* user@server:/var/www/html/
```

### Variáveis de Ambiente em Produção

Use `environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://api.seu-dominio.com",
  apiVersion: "v1",
};
```

---

## 📖 Documentação Adicional

- **[Instruções Frontend Completas](.github/instructions/FRONTEND.instructions.md)** - Convenções TypeScript, componentes, testes
- **[Angular Official Documentation](https://angular.io/docs)** - Guia oficial
- **[Angular CLI Reference](https://angular.io/cli)** - Comandos disponíveis
- **[Signals & Reactive Data](https://angular.io/guide/signals)** - Signal API
- **[Standalone Components](https://angular.io/guide/standalone-components)** - Estrutura moderna
- **[Reactive Forms](https://angular.io/guide/reactive-forms)** - Formulários tipados
- **[RxJS Documentation](https://rxjs.dev/)** - Programação reativa

---

## 🐛 Troubleshooting

### **"node_modules corrompido"**

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### **"Porta 4200 já em uso"**

```bash
# Usar porta diferente
ng serve --port 4300

# Ou encontrar processo (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### **"Erro: Cannot find module '@angular/...'**

```bash
# Reinstalar dependências
npm ci  # Usar ci para reproduzibilidade
npm install --legacy-peer-deps  # Se houver conflitos
```

### **"Componente não renderiza"**

- Verificar se está importado em `imports`
- Verificar se template está correto
- Abrir Angular DevTools para inspecionar árvore de componentes

### **"Testes falhando aleatoriamente"**

- Verificar se há race conditions com Promises/Observables
- Usar `fakeAsync` e `tick()` para testes assíncronos:

```typescript
it("should work", fakeAsync(() => {
  // código
  tick(1000);
  // assertions
}));
```

---

## 📝 Notas Importantes

### Convenções do Projeto

- ✅ **Componentes**: Sempre `standalone: true`
- ✅ **Type Safety**: Nunca use `any` — use `unknown` com type guards
- ✅ **Nomenclatura**: `kebab-case` para arquivos, `PascalCase` para classes
- ✅ **Testes**: Todo componente deve ter `.spec.ts`
- ✅ **Signals**: Usar para estado reativo (ao invés de @Input/@Output quando possível)

### Padrão de Component Moderno

```typescript
import { Component, Input, Output, EventEmitter, inject } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-example",
  standalone: true,
  imports: [CommonModule],
  template: `...`,
  styles: [`...`],
})
export class ExampleComponent {
  // Injeções
  private readonly service = inject(ExampleService);

  // Inputs
  @Input() title?: string;

  // Outputs
  @Output() action = new EventEmitter<void>();

  // Signals (estado reativo)
  readonly items = signal<Item[]>([]);

  // Métodos
  performAction() {
    this.action.emit();
  }
}
```

---

## 🚀 Próximos Passos

1. **Para Começar:**
   - `npm install` → instalar dependências
   - `ng serve` → iniciar servidor
   - Abra http://localhost:4200

2. **Para Desenvolver:**
   - Modifique componentes em `src/app/components`
   - Salve → reload automático
   - Use Angular DevTools para debugar

3. **Para Testar:**
   - `ng test` → testes unitários
   - `ng e2e` → testes e2e

4. **Para Deploy:**
   - `ng build --configuration production`
   - Deploy em Vercel, Firebase ou seu servidor

---

**Desenvolvido com ❤️ para visualizar orbitais atômicos**
