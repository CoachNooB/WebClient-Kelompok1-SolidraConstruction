import { expect, test } from "@playwright/test";

test("back-office login and core CMS browsing", async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  test.skip(!email || !password, "E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required");

  await page.goto("/back-office/login");
  await page.getByLabel(/email/i).fill(email!);
  await page.getByLabel(/password/i).fill(password!);
  await page.getByRole("button", { name: /login|sign in/i }).click();
  await expect(page).toHaveURL(/back-office/);

  for (const section of ["pages", "vacancies", "investor-documents", "messages", "applications", "media", "settings"]) {
    await page.goto(`/back-office/${section}`);
    await expect(page.locator("h1")).toBeVisible();
  }

  await page.goto("/back-office/settings");
  const name = page.locator('input[name="name"]');
  await name.fill(await name.inputValue());
  await page.getByRole("button", { name: /save settings/i }).click();
  await expect(page.getByRole("status")).toContainText(/saved/i);
});
