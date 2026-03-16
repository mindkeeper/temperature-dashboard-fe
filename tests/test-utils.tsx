import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";
import { BrowserRouter } from "react-router";

/**
 * Creates a fresh QueryClient instance for each test
 * with retry disabled to make tests faster and more predictable
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllProvidersProps {
  children: ReactNode;
}

/**
 * Wrapper component that provides all necessary contexts for testing
 * - React Query for data fetching
 * - React Router for navigation
 */
// eslint-disable-next-line react-refresh/only-export-components
function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * Custom render function that wraps components with all necessary providers
 * Use this instead of RTL's render in your tests
 *
 * @example
 * import { render, screen } from '@/test/test-utils';
 *
 * test('renders component', () => {
 *   render(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from React Testing Library
// eslint-disable-next-line react-refresh/only-export-components
export * from "@testing-library/react";

// Override the default render with our custom one
export { customRender as render };

// Export the wrapper for hooks testing
export { AllProviders as wrapper };
