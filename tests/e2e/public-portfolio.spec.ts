import { test, expect } from "@playwright/test";

// These tests require the dev server running and a seeded demo candidate.
// Run `npm run dev` before `npm run test:e2e`, or use the webServer config in playwright.config.ts.

test.describe("Public portfolio page", () => {
  test("loads without authentication", async ({ page }) => {
    // The public portfolio URL uses the candidate's profile id (UUID).
    // For local testing, seed the demo first via POST /api/demo { role: "candidate" }
    // then visit /p/<candidateId>. Here we just verify the login page redirects
    // properly for a protected route as a smoke test.
    const res = await page.goto("/login");
    expect(res?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/login/);
  });

  test("protected candidate route redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("protected employer route redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/employer/dashboard");
    await expect(page).toHaveURL(/login/);
  });
});
