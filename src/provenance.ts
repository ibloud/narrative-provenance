import type { AuditResult, ProvenanceRecord } from "./types";

export const PROVENANCE_KEY = "provenance";

export const emptyRecord = (defaultAuthor = ""): ProvenanceRecord => ({
  status: "unreviewed",
  authors: defaultAuthor ? [defaultAuthor] : [],
  created: "",
  sources: [],
  rights: "unknown",
  consent: "unknown",
  affiliation: "independent",
  reviewed: "",
  notes: ""
});

const strings = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
};

export function recordFromFrontmatter(frontmatter: Record<string, unknown> | null | undefined, defaultAuthor = ""): ProvenanceRecord {
  const raw = frontmatter?.[PROVENANCE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyRecord(defaultAuthor);
  const value = raw as Record<string, unknown>;
  const base = emptyRecord(defaultAuthor);
  return {
    status: typeof value.status === "string" ? value.status as ProvenanceRecord["status"] : base.status,
    authors: strings(value.authors).length ? strings(value.authors) : base.authors,
    created: typeof value.created === "string" ? value.created : "",
    sources: strings(value.sources),
    rights: typeof value.rights === "string" ? value.rights as ProvenanceRecord["rights"] : base.rights,
    consent: typeof value.consent === "string" ? value.consent as ProvenanceRecord["consent"] : base.consent,
    affiliation: typeof value.affiliation === "string" ? value.affiliation as ProvenanceRecord["affiliation"] : base.affiliation,
    reviewed: typeof value.reviewed === "string" ? value.reviewed : "",
    notes: typeof value.notes === "string" ? value.notes : ""
  };
}

export function auditRecord(record: ProvenanceRecord): AuditResult {
  const checks: Array<[string, boolean]> = [
    ["Narrative status", record.status !== "unreviewed"],
    ["Author or creator", record.authors.length > 0],
    ["Creation date", Boolean(record.created)],
    ["Rights status", record.rights !== "unknown"],
    ["Consent status", record.consent !== "unknown"],
    ["Affiliation status", Boolean(record.affiliation)],
    ["Review date", Boolean(record.reviewed)]
  ];
  if (record.status === "verified" || record.status === "interpretation" || record.status === "mixed") {
    checks.push(["Sources", record.sources.length > 0]);
  }
  const complete = checks.filter(([, ok]) => ok).map(([label]) => label);
  const missing = checks.filter(([, ok]) => !ok).map(([label]) => label);
  const cautions: string[] = [];
  if (record.rights === "fair-use-claim") cautions.push("Fair use is a case-specific legal analysis, not a permission or automatic protection.");
  if (record.consent === "declined") cautions.push("Consent is recorded as declined. Do not imply participation or endorsement.");
  if (record.affiliation === "unclear") cautions.push("Affiliation is unclear. Use an explicit independent-project disclaimer until verified.");
  return { score: Math.round((complete.length / checks.length) * 100), complete, missing, cautions };
}
