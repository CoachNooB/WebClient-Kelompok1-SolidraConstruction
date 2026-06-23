import { expect, test } from "@playwright/test";

test("public browsing and locale switch", async ({ page }) => {
  await page.goto("/id");
  await expect(page).not.toHaveTitle(/404/i);

  for (const href of [
    "/id/about",
    "/id/investors",
    "/id/careers",
    "/id/contact",
  ]) {
    await page.goto(href);
    await expect(page.locator("body")).not.toContainText("404");
  }

  await page.goto("/en");
  await expect(page).toHaveURL(/\/en/);
  for (const href of [
    "/en/about",
    "/en/investors",
    "/en/careers",
    "/en/contact",
  ]) {
    await page.goto(href);
    await expect(page.locator("body")).not.toContainText("404");
  }
});
