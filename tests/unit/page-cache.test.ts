import { describe, expect, it } from "vitest";
import {
  publicManagedContentPaths,
  publicPagePaths,
} from "@/lib/cache/revalidation";

describe("public page cache revalidation", () => {
  it("maps the home page to locale roots", () => {
    expect(publicPagePaths("home")).toEqual(["/id", "/en"]);
  });

  it("maps content pages to localized slugs", () => {
    expect(publicPagePaths("about")).toEqual(["/id/about", "/en/about"]);
  });

  it("maps shared managed content to every localized public page", () => {
    expect(publicManagedContentPaths()).toEqual([
      "/id",
      "/en",
      "/id/about",
      "/en/about",
      "/id/investors",
      "/en/investors",
      "/id/contact",
      "/en/contact",
      "/id/careers",
      "/en/careers",
    ]);
  });
});
