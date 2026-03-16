import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/**
 * Node MSW Server
 *
 * This server will intercept requests in Node.js environments (e.g., tests).
 * Import and configure this in your test setup file when you add testing.
 *
 * Example usage in tests:
 * ```
 * import { server } from './mocks/server';
 *
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 */
export const server = setupServer(...handlers);
