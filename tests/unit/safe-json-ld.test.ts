import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/lib/safe-json-ld";

describe("serializeJsonLd", () => {
  it("escapes script-breaking and HTML-sensitive characters", () => {
    const result = serializeJsonLd({
      value: '</script><script>alert("xss")</script>&',
    });

    expect(result).toContain("\\u003C/script\\u003E");
    expect(result).toContain("\\u003Cscript\\u003E");
    expect(result).toContain("\\u0026");
    expect(result).not.toContain("</script>");
    expect(result).not.toContain("<script>");
  });

  it("escapes unicode line and paragraph separators", () => {
    const result = serializeJsonLd({
      value: "line\u2028paragraph\u2029end",
    });

    expect(result).toContain("\\u2028");
    expect(result).toContain("\\u2029");
    expect(result).not.toContain("\u2028");
    expect(result).not.toContain("\u2029");
  });
});
