import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

/**
 * Browser MSW Worker
 *
 * This worker will intercept requests in the browser for development.
 * It is only initialized when VITE_ENABLE_MSW=true in development mode.
 */
export const worker = setupWorker(...handlers);

// Log handlers count for debugging
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log(`[MSW] Registered ${handlers.length} request handler(s)`);
}
