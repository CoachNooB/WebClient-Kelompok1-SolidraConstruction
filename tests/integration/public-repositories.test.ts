import { expect, it } from "vitest";
import {
  getCompanySettings,
  getNavigation,
  getPublishedPage,
} from "@/lib/repositories/public-content";
import { describeIntegration } from "./helpers";

describeIntegration("public repositories", () => {
  it("returns settings, fallback page, and navigation data", async () => {
    await expect(getCompanySettings()).resolves.toEqual(
      expect.objectContaining({ name: expect.any(String) }),
    );
    await expect(getPublishedPage("home", "ID")).resolves.not.toBeNull();
    await expect(getNavigation("ID")).resolves.toEqual(expect.any(Array));
  });
});
