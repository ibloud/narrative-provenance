import { describe, expect, it } from "vitest";
import { auditRecord, emptyRecord, recordFromFrontmatter, writeRecordToFrontmatter } from "../src/provenance";
import { auditForSharing, buildCollaborationProject, classifyStorageZone, projectSlug } from "../src/collaboration";

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

describe("guarded collaboration projects", () => {
  it("creates portable project paths and control records", () => {
    const files = buildCollaborationProject({ name: "Veiled Dominion", founder: "Dominique", rootFolder: "Collaborations", purpose: "Build without founder erasure." }, "2026-09-13");
    expect(projectSlug("Veiled Dominion!")).toBe("veiled-dominion");
    expect(files.some((file) => file.path.endsWith("00-Control/RIGHTS-MAP.md"))).toBe(true);
    expect(files.some((file) => file.path.endsWith("40-Public/README.md"))).toBe(true);
  });

  it("classifies guarded storage zones", () => {
    expect(classifyStorageZone("Collaborations/project/10-Private/evidence.md")).toBe("private");
    expect(classifyStorageZone("Collaborations/project/40-Public/statement.md")).toBe("public");
  });

  it("blocks private notes and unresolved permission", () => {
    const record = { ...emptyRecord("Dominique"), status: "interpretation" as const, rights: "permission-requested" as const, consent: "requested" as const };
    const result = auditForSharing("Collaborations/project/10-Private/note.md", "private correspondence", record, { "release-status": "blocked" });
    expect(result.allowed).toBe(false);
    expect(result.blockers.join(" ")).toContain("private-evidence");
  });

  it("passes only an approved public derivative with resolved provenance", () => {
    const record = { ...emptyRecord("Dominique"), status: "interpretation" as const, rights: "original" as const, consent: "not-applicable" as const, affiliation: "independent" as const };
    const result = auditForSharing("Collaborations/project/40-Public/statement.md", "Public statement", record, { "release-status": "approved" });
    expect(result.allowed).toBe(true);
  });

  it("flags possible secrets and protected cloud links", () => {
    const record = { ...emptyRecord("Dominique"), status: "verified" as const, rights: "original" as const, consent: "granted" as const };
    const result = auditForSharing("Collaborations/project/40-Public/note.md", "api_key=do-not-publish https://drive.google.com/example", record, { "release-status": "approved" });
    expect(result.blockers.join(" ")).toContain("credential");
    expect(result.cautions.join(" ")).toContain("Cloud-storage");
  });
});
