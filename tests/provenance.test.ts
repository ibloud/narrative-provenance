import { describe, expect, it } from "vitest";
import { auditRecord, emptyRecord, recordFromFrontmatter } from "../src/provenance";

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

  it("requires sources for verified claims", () => {
    const record = { ...emptyRecord("A"), status: "verified" as const, created: "2026-09-10", rights: "original" as const, consent: "not-applicable" as const, reviewed: "2026-09-10" };
    expect(auditRecord(record).missing).toContain("Sources");
  });

  it("flags declined consent", () => {
    const record = { ...emptyRecord(), consent: "declined" as const };
    expect(auditRecord(record).cautions[0]).toContain("declined");
  });
});
