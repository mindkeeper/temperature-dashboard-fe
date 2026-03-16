# Feature Modules Anatomy

## Concept

This application organizes its features into modular, cohesive blocks found inside `src/modules/[feature-name]/`.

A feature module acts as a "mini-application" that encapsulates the logic required to implement a specific domain (e.g., `auth`, `products`, `users`).

**The Golden Rule:** The logic needed to build a feature domain should live in that feature domain.

## Directory Anatomy

The standard anatomy of a feature module looks like this:

```text
src/modules/[feature]/
├── components/              # Reusable UI React components used specifically in this feature
│   ├── [feature]-form.tsx
│   ├── [feature]-list.tsx
│   └── __tests__/           # Component tests (Vitest + React Testing Library)
├── hooks/                   # Custom React hooks containing presentation or data-fetching logic
│   ├── use-[feature].ts
│   └── __tests__/           # Hook tests
├── services/                # Business logic or API call functions using configured axios (or other adapters)
│   ├── [feature].service.ts
│   └── __tests__/           # Service tests
├── store/                   # Local module state management (Zustand or React Context)
│   ├── [feature].store.ts
│   └── __tests__/           # Store tests
├── types/                   # TypeScript interfaces, types, and Zod schemas
│   └── [feature].types.ts
├── utils/                   # Pure helper functions specific to this domain
│   ├── formatters.ts
│   └── __tests__/           # Utility function tests (Vitest)
└── index.ts                 # Public API definition - The "Export Barrier"
```

## The Public Interface (`index.ts`)

To prevent "spaghetti code" across feature modules, every module **must** declare a strict Public API via `src/modules/[feature]/index.ts`.

If an external file (e.g., a page or another feature) needs a component, hook, or type, it must be exported from `index.ts`.

### Why?

By enforcing the `index.ts` barrier, we conceal the internal structure and complexity of a module. We can refactor a module's internal directories without breaking the rest of the app, as long as the `index.ts` exports remain the same.

```ts
// ✅ Correct usage by an external file (e.g., a Route in src/pages)
import { useAuthSession, ProtectedRoute } from "@/modules/auth";

// ❌ Incorrect usage (bypassing the module's public API)
import { useAuthSession } from "@/modules/auth/hooks/use-auth-session";
import { ProtectedRoute } from "@/modules/auth/components/protected-route";
```

## Creating a new Feature Module

When generating a new module:

1. Copy the `src/modules/_template/` structure.
2. Replace all instances of `[feature]` with your module domain (e.g., `products`, `billing`).
3. Ensure you follow standard `kebab-case.ts` naming.
4. Export the specific public interfaces in `src/modules/[feature]/index.ts`.
5. Only import dependencies from `@/components` (shared), `@/lib`, `@/utils`, or other module public APIs.

## Best Practices

1. **Avoid Circular Dependencies:** Module A should never depend on Module B while Module B depends on Module A. If this occurs, the shared logic likely belongs in a global `src/store/` or `src/utils/` directory.
2. **Co-locate Tests:** Test files belong right next to their source files (nested in `__tests__/`).
3. **Mocking Dependencies (MSW):** The API responses for a feature module can be mocked using Mock Service Worker (MSW). Ensure your new feature registers its handlers in `src/mocks/handlers.ts` or creates a specific `[feature]-handlers.ts` file within the module if you prefer co-locating mock logic.
