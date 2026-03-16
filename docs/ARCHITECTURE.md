# Architecture Document

## Overview

This project is a React Single Page Application (SPA) built with Vite, utilizing a feature-driven architectural pattern. The core philosophy is to minimize coupling across different domains of the application, thereby making it highly scalable, maintainable, and predictable.

## Tech Stack Overview

- **Core**: React 19, Vite, TypeScript
- **Routing**: React Router 7
- **State Management**:
  - Server State: TanStack Query (React Query)
  - Client State: Zustand
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Forms & Validation**: React Hook Form, Zod
- **Networking**: Axios
- **Testing**: Vitest (Unit/Component), Playwright (E2E), MSW (API Mocking)

## Directory Structure Strategy

We explicitly divide the application into three primary categories:

1. **Routing & Composition Layer (`src/router.tsx`, `src/pages/`)**: Contains the application router and the page-level components corresponding to the URL structure. Pages are responsible for composing feature modules together.
2. **Feature Modules (`src/modules/`)**: Self-contained domains (e.g., `auth`, `users`, `products`). Each module encapsulates its own UI, state, logic, and networking.
3. **Global Core (`src/components`, `src/lib`, `src/utils`, `src/hooks`, `src/constants`)**: Truly application-wide utilities, hooks, constants, layout components, and configured library instances.

### Visual Architecture

```text
src/
├── components/          # Global UI components (e.g., shadcn/ui) and Layouts
├── lib/                 # Core framework configuration (e.g., configured axios instance)
├── modules/             # Feature-based domains (See MODULES.md)
│   ├── auth/            # E.g., Authentication feature
│   └── _template/       # Blueprint for generating new modules
├── pages/               # React Router page components
├── router.tsx           # Application route definitions
├── hooks/               # App-wide shared custom hooks
├── constants/           # App-wide shared constants
├── store/               # Global state (only for cross-module states like Theme/Session)
├── types/               # App-wide global TypeScript types
├── utils/               # App-wide helper functions
└── mocks/               # MSW mock server setup and handlers
```

## Core Patterns

### 1. Feature-Driven Architecture (Vertical Slicing)

Rather than organizing code by technical concern (e.g., all hooks in one folder, all types in another), code is organized by **Feature Domain**.

If a piece of logic or a component is only used within the `auth` domain, it stays inside `src/modules/auth/`. If it eventually needs to be shared across multiple unrelated modules, it is "promoted" to the global `src/components` or `src/utils` directories.

**Benefits:**

- **Encapsulation**: Modifying a feature rarely breaks another feature.
- **Mental Overload**: Developers (and AI) only need to context-switch into one folder to understand a domain.
- **Scalability**: New features are simply new folders, rather than modifying 6 different root-level directories.

### 2. The Adapter Pattern for External Services

We isolate external libraries from our business logic by creating an **Adapter**. This is most critical for Network Requests.

- **Rule**: Never import `axios` directly into a React component or a feature's custom hook.
- **Implementation**: We export a pre-configured `apiClient` from `src/lib/axios.ts`. All feature services (`src/modules/[feature]/services/`) must use this client.
- **Why?**: If we need to change our HTTP client (e.g., from Axios to fetch), or if we need to globally intercept requests (e.g., appending auth tokens or handling 401s), we only update the single `src/lib/axios.ts` adapter, not hundreds of files across the app.

### 3. Server State vs. Client State Separation

We treat data fetched from the API (Server State) entirely differently than data created by the user within the browser (Client State).

- **Server State (TanStack Query)**: Data that lives on the backend. We use React Query to cache, background-fetch, and synchronize this data. We treat the React Query cache as the single source of truth for remote data.
- **Client State (Zustand)**: UI state that lives entirely in the browser (e.g., is a modal open? the current chosen theme, optimistic local UI state).

### 4. Query Key Factories

React Query heavily relies on unique string arrays (Query Keys) to manage its cache. To prevent typos, cache invalidation bugs, and duplication, we strictly utilize the **Query Key Factory Pattern**.

Every feature module that fetches data contains a central hook/service file declaring its keys:

```ts
export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};
```

This guarantees that when you call `queryClient.invalidateQueries({ queryKey: authKeys.session() })`, you are accurately targeting the exact cache key used by the `useAuthSession` hook.

## Next Steps for Developers / AI Agents

Before writing new code, ensure you:

1. Have read `AGENTS.md` to understand syntax constraints and forbidden patterns.
2. Are placing functionality inside the correct `src/modules/[feature]/` directory.
