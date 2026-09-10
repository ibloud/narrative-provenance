import type { AuditResult, ProvenanceRecord } from "./types";

export const PROVENANCE_KEY = "provenance";
export const PROVENANCE_FIELDS = {
  status: "provenance-status",
  authors: "provenance-authors",
  created: "provenance-created",
  sources: "provenance-sources",
  rights: "provenance-rights",
  consent: "provenance-consent",
  affiliation: "provenance-affiliation",
  reviewed: "provenance-reviewed",
  notes: "provenance-notes"
} as const;

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
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
};

const text = (value: unknown): string => typeof value === "string" ? value : "";

export function recordFromFrontmatter(frontmatter: Record<string, unknown> | null | undefined, defaultAuthor = ""): ProvenanceRecord {
  if (frontmatter && Object.values(PROVENANCE_FIELDS).some((key) => key in frontmatter)) {
    const base = emptyRecord(defaultAuthor);
    return {
      status: typeof frontmatter[PROVENANCE_FIELDS.status] === "string" ? frontmatter[PROVENANCE_FIELDS.status] as ProvenanceRecord["status"] : base.status,
      authors: strings(frontmatter[PROVENANCE_FIELDS.authors]).length ? strings(frontmatter[PROVENANCE_FIELDS.authors]) : base.authors,
      created: text(frontmatter[PROVENANCE_FIELDS.created]),
      sources: strings(frontmatter[PROVENANCE_FIELDS.sources]),
      rights: typeof frontmatter[PROVENANCE_FIELDS.rights] === "string" ? frontmatter[PROVENANCE_FIELDS.rights] as ProvenanceRecord["rights"] : base.rights,
      consent: typeof frontmatter[PROVENANCE_FIELDS.consent] === "string" ? frontmatter[PROVENANCE_FIELDS.consent] as ProvenanceRecord["consent"] : base.consent,
      affiliation: typeof frontmatter[PROVENANCE_FIELDS.affiliation] === "string" ? frontmatter[PROVENANCE_FIELDS.affiliation] as ProvenanceRecord["affiliation"] : base.affiliation,
      reviewed: text(frontmatter[PROVENANCE_FIELDS.reviewed]),
      notes: text(frontmatter[PROVENANCE_FIELDS.notes])
    };
  }
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

export function writeRecordToFrontmatter(frontmatter: unknown, record: ProvenanceRecord): void {
  if (typeof frontmatter !== "object" || frontmatter === null || Array.isArray(frontmatter)) return;
  const values = frontmatter as Record<string, unknown>;
  values[PROVENANCE_FIELDS.status] = record.status;
  values[PROVENANCE_FIELDS.authors] = record.authors;
  values[PROVENANCE_FIELDS.created] = record.created;
  values[PROVENANCE_FIELDS.sources] = record.sources;
  values[PROVENANCE_FIELDS.rights] = record.rights;
  values[PROVENANCE_FIELDS.consent] = record.consent;
  values[PROVENANCE_FIELDS.affiliation] = record.affiliation;
  values[PROVENANCE_FIELDS.reviewed] = record.reviewed;
  values[PROVENANCE_FIELDS.notes] = record.notes;
  delete values[PROVENANCE_KEY];
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
