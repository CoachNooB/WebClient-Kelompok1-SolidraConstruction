import { describe, expect, it } from "vitest";
import { publicPagePaths } from "@/lib/cache/revalidation";

describe("public page cache revalidation", () => {
  it("maps the home page to locale roots", () => {
    expect(publicPagePaths("home")).toEqual(["/id", "/en"]);
  });

  it("maps content pages to localized slugs", () => {
    expect(publicPagePaths("about")).toEqual(["/id/about", "/en/about"]);
  });
});
