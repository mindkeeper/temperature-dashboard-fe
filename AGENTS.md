# React Vite Boilerplate - Agent Guidelines

## Stack

React 19, React Router 7, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query, Axios, React Hook Form, Zod, Vitest, Playwright, MSW.

## Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build locally

# Testing
pnpm test             # Run unit/component tests in watch mode via Vitest
pnpm test:run         # Run unit/component tests once
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run E2E tests via Playwright
pnpm test:e2e:ui      # Run E2E tests with Playwright UI

# Code quality
pnpm typecheck        # Run TypeScript type checking
pnpm lint             # Run ESLint
pnpm format           # Run Prettier format & fix
pnpm format:check     # Check Prettier formatting without fixing
```

## Architecture Pattern (CRITICAL)

### Feature-Based Modules

- All feature logic lives in `src/modules/[feature-name]/`.
- A feature module can contain: `components/`, `hooks/`, `services/`, `store/`, `types/`, `utils/`.
- Only truly global UI or layouts go in `src/components/`.
- **Export Barrier**: Modules use an `index.ts` for cross-module communication and external use. However, `src/pages/` route files act as the composition layer and are allowed to make deep imports directly into a module's internal directories if necessary.
- Never allow modules to import from other feature modules directly avoiding `index.ts`, keep dependencies clean.

### Adapter Pattern

- **Network Requests:** NEVER import `axios` directly inside components or hooks outside of the designated `api` layer.
  - All external API calls must use the configured HTTP client exported from `src/lib/axios.ts`.
  - Example: `import { apiClient } from '@/lib/axios'`.

## Code Style

### TypeScript

- **Strict mode enabled**: `strict: true` in tsconfig.
- No `any` type allowed.
- Always use explicit types for function parameters and return types.

### Imports

- Always use `@/` path alias for imports that cross module boundaries or reference global items in `src` (like `@/components` or `@/lib`).
- Relative imports (`../`) are permitted ONLY if both the importing and imported files exist within the exact same feature module (e.g., inside `src/modules/auth/`).
- Example: `import { Button } from '@/components/ui/button'`

### File Naming

- All files MUST be: `kebab-case.ts` / `kebab-case.tsx`
- Hooks must start with `use-` (e.g., `use-session.ts`)
- Test files: `{name}.test.ts` or `{name}.test.tsx`
- Components: `PascalCase` function names but the file itself must be `kebab-case.tsx`

### Naming Conventions

- **Components**: PascalCase (e.g., `LoginForm`)
- **Functions**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase.

### Validation

- Always use Zod for validation schemas.
- Example:

  ```typescript
  export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  export type LoginInput = z.infer<typeof loginSchema>;
  ```

### State Management & Fetching

- **Server State:** Use TanStack Query (React Query) for fetching from the API.
- **Client Global State:** Use Zustand.
- **React Query Keys:** Use the Query Key Factory pattern (one factory per feature). Never inline `queryKey` arrays.
  - Example:
    ```typescript
    export const todoKeys = {
      all: ["todos"] as const,
      lists: () => [...todoKeys.all, "list"] as const,
      list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
      details: () => [...todoKeys.all, "detail"] as const,
      detail: (id: string) => [...todoKeys.details(), id] as const,
    };
    ```

### Forms

- Always use React Hook Form + Zod + shadcn Form components.
- Always call `form.reset()` inside mutation `onSuccess` when appropriate.
- Never use uncontrolled inputs for complex forms.

### Styling

- Use `cn()` utility for conditional classes from `src/lib/utils`.
- Use shadcn semantic colors (`bg-background`, `text-muted-foreground`, `bg-card`, etc.).
- Use Tailwind CSS v4 conventions (`@theme` variables, etc.).

## Testing & Mocking

- Co-locate tests in a `__tests__/` directory nested inside the related folder (e.g., `components/__tests__/`, `hooks/__tests__/`).
- Use `describe` block named after the component or function.
- Use `it` with a behavior description starting with a verb (e.g., `it('renders the login form')`).
- Prefer `getByRole` over `getByTestId` in React Testing Library.
- Use `userEvent` over `fireEvent`.
- Never test implementation details — test behavior.
- **Mocking API**: Use MSW (`src/mocks/handlers.ts` or feature-specific handlers) to mock API requests in tests and during development if needed.

## Forbidden Patterns

- The `any` type for anything.
- `useEffect` for data fetching (use TanStack Query).
- `console.log` in committed code (except where absolutely necessary).
- `@ts-ignore` or `@ts-expect-error` without a detailed comment explaining why.
- Arbitrary Tailwind values when a scale value exists.
- Default exports (except for Route pages inside `src/pages/` and React Router lazy loaded files).

## Project Structure

- **Routing:** `src/router.tsx` — All application route definitions.
- **Pages:** `src/pages/` — All page-level components used by the router.
- **Feature Modules:** `src/modules/[feature-name]/` — Encapsulates components, hooks, api, store, types.
- **Adapters (Core):** `src/lib/` — The only places allowed to configure core libraries (like `axios.ts`).
- **Global UI components:** `src/components/ui/` — shared shadcn components.
- **Global Layouts:** `src/components/layout/` — Navbar, Footer, etc.
- **Global Utils:** `src/utils/`
- **Global Types:** `src/types/`
- **Global Hooks:** `src/hooks/` — For hooks shared across multiple features.
- **Global Constants:** `src/constants/` — For constants shared across multiple features.
- **Mocking:** `src/mocks/` — MSW handlers and browser/server setup.
- **Feature Tests:** `__tests__/` folders nested inside their respective category folders.
- **Global Testing Infrastructure:** `tests/` (at project root) or `vitest.setup.ts` — Global configurations, fixtures, and mocks.
