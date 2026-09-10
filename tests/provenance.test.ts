import { describe, expect, it } from "vitest";
import { auditRecord, emptyRecord, recordFromFrontmatter, writeRecordToFrontmatter } from "../src/provenance";

describe("provenance records", () => {
  it("creates a privacy-safe empty local record", () => {
    expect(emptyRecord("Dominique").authors).toEqual(["Dominique"]);
    expect(emptyRecord().affiliation).toBe("independent");
  });

  it("normalizes scalar and list fields from frontmatter", () => {
    const record = recordFromFrontmatter({ provenance: { authors: "A, B", sources: ["one", "two"] } });
    expect(record.authors).toEqual(["A", "B"]);
    expect(record.sources).toEqual(["one", "two"]);
  });

  it("reads flat Obsidian properties before legacy nested data", () => {
    const record = recordFromFrontmatter({
      "provenance-status": "fictional",
      "provenance-authors": ["Dominique"],
      provenance: { status: "verified" }
    });
    expect(record.status).toBe("fictional");
    expect(record.authors).toEqual(["Dominique"]);
  });

  it("writes readable properties and removes the legacy object", () => {
    const frontmatter: Record<string, unknown> = { provenance: { status: "verified" } };
    writeRecordToFrontmatter(frontmatter, { ...emptyRecord("Dominique"), status: "fictional" });
    expect(frontmatter["provenance-status"]).toBe("fictional");
    expect(frontmatter["provenance-authors"]).toEqual(["Dominique"]);
    expect(frontmatter.provenance).toBeUndefined();
  });

  it("requires sources for verified claims", () => {
    const record = { ...emptyRecord("A"), status: "verified" as const, created: "2026-09-10", rights: "original" as const, consent: "not-applicable" as const, reviewed: "2026-09-10" };
    expect(auditRecord(record).missing).toContain("Sources");
  });

  it("flags declined consent", () => {
    const record = { ...emptyRecord(), consent: "declined" as const };
    expect(auditRecord(record).cautions[0]).toContain("declined");
  });
});
