# React Boilerplate

A modern, highly-scalable React 19 Single Page Application (SPA) boilerplate built with Vite. This repository is engineered with a modular architecture and strictly documented standards, ensuring that its structure and rules are explicit and consistent so that developers and tools can understand the codebase instantly and contribute effectively without architectural regressions.

## 🚀 Tech Stack

- **Framework**: React 19, Vite, TypeScript
- **Routing**: React Router 7
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State Management**:
  - Server State: TanStack Query (React Query)
  - Client State: Zustand
- **Forms & Validation**: React Hook Form, Zod
- **Networking**: Axios
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **Mocking**: MSW (Mock Service Worker)
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

## 🤖 AI-First Architecture

This codebase is explicitly designed to be read and understood by AI coding agents. If you are a developer or an AI assistant working on this repository, you **MUST** read and obey the rules in the following documents:

1. **[`AGENTS.md`](./AGENTS.md)**: The strict rulebook for AI. It defines allowed import paths, networking rules, naming conventions, and forbidden patterns. AI assistants read this first to understand _how_ to write code here.
2. **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)**: Explains the "Why" behind the app's structure (Feature Modules vs Global Core, the Adapter pattern for API calls).
3. **[`docs/MODULES.md`](./docs/MODULES.md)**: Documents the exact anatomical structure of a feature domain.
4. **`src/modules/_template`**: A physical scaffold skeleton. The AI can look at (or copy) this folder to perfectly mimic the project's established conventions when generating a new feature.

## 📂 Project Structure

```text
/
├── .husky/              # Git hooks for linting/formatting before commits
├── docs/                # Documentation (Architecture, modules)
│   ├── ARCHITECTURE.md  # High-level architecture docs
│   └── MODULES.md       # Documentation for the module structure
├── e2e/                 # Playwright E2E tests
├── public/              # Static assets directly served by Vite
├── src/
│   ├── components/      # Global UI components (shadcn) and Layouts
│   ├── lib/             # Core framework configuration (e.g. axios instance)
│   ├── mocks/           # MSW API mock handlers
│   ├── modules/         # Feature-based domains (See MODULES.md)
│   │   ├── auth/        # An example feature module
│   │   └── _template/   # The skeleton template for new modules
│   ├── pages/           # React Router page components (Composition layer)
│   ├── store/           # Global client state (Theme, etc.)
│   ├── styles/
│   │   └── global.css   # Global CSS (Tailwind entry point)
│   ├── types/           # App-wide global TypeScript types
│   ├── utils/           # App-wide pure utility functions
│   ├── app.tsx          # Main React Application tree
│   ├── main.tsx         # React Router and DOM entry point
│   ├── router.tsx       # Route definitions
│   └── vite-env.d.ts    # Vite environment types
├── tests/               # Global testing utilities (e.g. test-utils.tsx)
├── .env.example         # Template for environment variables
├── .prettierrc          # Prettier formatting rules
├── AGENTS.md            # LLM Assistant rulebook
├── commitlint.config.js # Git commit message linting config
├── components.json      # shadcn/ui configuration
├── eslint.config.js     # ESLint flat config file
├── index.html           # Main HTML entry point for Vite
├── package.json         # Dependencies and scripts
├── playwright.config.ts # Playwright E2E test configuration
├── tsconfig.*.json      # TypeScript configurations
├── vite.config.ts       # Vite bundler configuration
└── vitest.config.ts     # Vitest unit/component test configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- `pnpm` (Package manager)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Run unit and component tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run TypeScript type/check, linting, and formatting
pnpm typecheck
pnpm lint
pnpm format
```

## 🏗️ Generating a New Feature

When you want to add a new top-level domain feature to the app (e.g., `products`, `billing`):

1. Read the [`docs/MODULES.md`](./docs/MODULES.md) documentation.
2. Duplicate the `src/modules/_template/` folder and rename it to your feature name (`src/modules/products/`).
3. Replace the `.gitkeep` files with actual implementation files following the exact same subdirectory structure (`components`, `hooks`, `services`, `types`, etc.).
4. Export exactly what is needed for the rest of the application through `src/modules/products/index.ts` (The Export Barrier).
