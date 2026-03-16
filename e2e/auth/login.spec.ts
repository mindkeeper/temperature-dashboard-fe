import { expect, test } from "@playwright/test";

// Full E2E login flow — implemented in Phase 6
test("full login → dashboard → logout flow", async ({ page }) => {
  // 1. Navigate to app
  await page.goto("/");

  // 2. Click "Go to Dashboard" → redirected to /login (not authenticated)
  await page.click("text=Go to Dashboard");
  await expect(page).toHaveURL("/login");

  // 3. Fill login form and submit
  await page.fill("[name=email]", "user@example.com");
  await page.fill("[name=password]", "password123");
  await page.click("[type=submit]");

  // 4. Redirected to /dashboard
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("text=Welcome")).toBeVisible();

  // 5. Logout
  await page.click('[aria-label="User menu"]');
  await page.click("text=Logout");
  await expect(page).toHaveURL("/login");
});
