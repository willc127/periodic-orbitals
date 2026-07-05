## graphify

For any question about this repo's architecture, structure, components, or how to add/modify/find
code, your first action should be `graphify query "<question>"` when `graphify-out/graph.json`
exists. Use `graphify path "<A>" "<B>"` for relationship questions and `graphify explain "<concept>"`
for focused-concept questions. These return a scoped subgraph, usually much smaller than the full
report or raw grep output.

Triggers: "how do I…", "where is…", "what does … do", "add/modify a <component>",
"explain the architecture", or anything that depends on how files or classes relate.

If `graphify-out/wiki/index.md` exists, use it for broad navigation. Read `graphify-out/GRAPH_REPORT.md`
only for broad architecture review or when query/path/explain do not surface enough context. Only read
source files when (a) modifying/debugging specific code, (b) the graph lacks the needed detail, or
(c) the graph is missing or stale.

Type `/graphify` in Copilot Chat to build or update the graph.


# GitHub Copilot Instructions

This file guides GitHub Copilot (Chat and inline suggestions) to generate code consistent with this project's standards. It should live at `.github/copilot-instructions.md` in the repository root.

## Project overview

<!-- ADJUST: project name and short description -->
**[Project Name]**: full-stack application with an **Angular** frontend and a **Python (FastAPI)** backend.

- **Frontend:** Angular (`/frontend` or `/client`) <!-- ADJUST path -->
- **Backend:** FastAPI (`/backend` or `/api`) <!-- ADJUST path -->
- **Database:** <!-- ADJUST: PostgreSQL / MySQL / MongoDB / SQLite -->
- **ORM/driver:** <!-- ADJUST: SQLAlchemy / SQLModel / Tortoise ORM / Prisma Client Python -->
- **Authentication:** <!-- ADJUST: JWT / OAuth2 / Auth0 / Keycloak -->
- **Package manager:** <!-- ADJUST: npm / pnpm / yarn (frontend), pip / poetry / uv (backend) -->

## Folder structure

<!-- ADJUST to match the actual repository structure -->
```
/frontend
  /src
    /app
      /core          # singleton services, guards, interceptors
      /shared         # reusable components, pipes, and directives
      /features       # feature modules (lazy-loaded)
      /models         # TypeScript interfaces and types
/backend
  /app
    /api              # routers/endpoints
    /core             # config, security, dependencies
    /models           # ORM models
    /schemas          # Pydantic schemas
    /services         # business logic
    /tests            # automated tests
```

---

## General conventions (both projects)

- Respond and comment code in **English**, unless the existing code is already in another language — follow the convention of the file being edited.
- Variable, function, class, and file names in **English**, following each language's convention.
- Always prefer simple, readable solutions over "clever" solutions that are hard to maintain.
- Do not introduce new dependencies without a clear need; if one is required, state it explicitly.
- Do not generate dead code, obvious comments (`// increment i`), or debug `console.log` / `print` statements in final code.
- Every public function must be fully typed (TypeScript on the frontend, type hints on the backend).

---

## Frontend (Angular)

### Code standards

- Use **standalone components** (modern Angular) unless the project already uses NgModules — in that case, follow the existing pattern. <!-- ADJUST based on the Angular version in use -->
- Prefer **Signals** for local component state when the project already uses them; otherwise, follow the existing pattern (RxJS/BehaviorSubject).
- File naming: `kebab-case` (e.g., `user-profile.component.ts`).
- Component selector naming: project prefix + kebab-case (e.g., `app-user-profile`). <!-- ADJUST prefix -->
- One component, one responsibility: extract business logic into **services**, keeping components focused on presentation.
- Always type data coming from the API using **interfaces** in `/models`, never `any`.
- HTTP calls should always go through injectable **services** (`providedIn: 'root'`), never directly in components.
- Handle HTTP request errors with `catchError`/interceptors — never leave promises/observables without error handling.
- Use the `async` pipe in templates instead of manual `subscribe()` whenever possible, to avoid memory leaks.
- Forms: use **Reactive Forms**, not Template-driven Forms.
- Styles: SCSS - follow the design system already adopted in the project.

### Testing (frontend)

- Unit tests with **Jasmine/Karma** (or Jest, if configured — <!-- ADJUST -->).
- Every new service must have unit tests covering the main flows (success and error).
- Components with non-trivial logic should have behavior tests, not just snapshots.

### Example service structure

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // centralized error handling
    return throwError(() => error);
  }
}
```

---

## Backend (FastAPI)

### Code standards

- Follow **PEP 8** and use type hints in 100% of functions and methods.
- Organize endpoints by **routers** (`APIRouter`), grouped by domain/resource.
- Every endpoint input and output must use **Pydantic schemas** (`schemas/`), never raw dictionaries.
- Keep layers clearly separated: **router** (HTTP) → **service** (business logic) → **repository/model** (data access). Do not put business logic directly in the router.
- Use FastAPI's **dependency injection** (`Depends`) for database sessions, authentication, and services, avoiding manual instantiation inside endpoints.
- Handle business exceptions with `HTTPException` (or custom exceptions mapped to a global exception handler) — never let a stack trace leak to the client.
- Every route must have an explicit `response_model`.
- Use `async def` for endpoints and I/O operations (database, external calls) whenever the database stack supports async. <!-- ADJUST: async driver (asyncpg, motor) or sync -->
- Centralize environment variables and settings in `core/config.py` using `pydantic-settings` (or `BaseSettings`), never scattered `os.environ` calls.
- Never expose secrets, keys, or credentials in code; always use environment variables.

### Testing (backend)

- Tests with **pytest** (+ `pytest-asyncio` if endpoints are asynchronous).
- Use `TestClient` (or `httpx.AsyncClient`) for endpoint integration tests.
- Every new route must come with tests covering the success case, validation error case, and business error case (when applicable).
- Use fixtures for an isolated test database (never test against the production/dev database).

### Example endpoint structure

```python
# app/api/users.py
router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
) -> UserOut:
    user = await service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

---

## Frontend ↔ Backend integration

- API contracts (Pydantic schemas) must stay aligned with the corresponding TypeScript interfaces — when a backend schema changes, flag the need to update the matching frontend model.
- CORS, authentication (token handling), and session refresh should follow the pattern already implemented in the Angular HTTP interceptors and the FastAPI auth dependencies.

---

## What to avoid

- Do not generate TypeScript code using `any` or Python code without type hints.
- Do not put business logic in Angular components or FastAPI routers.
- Do not suggest libraries that compete with what's already in use (e.g., suggesting Redux/NgRx without need, or SQLAlchemy when the project uses a different ORM) without asking first.
- Do not remove existing tests just to "make it pass" — fix the root cause.
- Do not auto-generate database migrations without explicit confirmation.