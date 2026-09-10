export const NARRATIVE_STATUSES = ["unreviewed", "verified", "interpretation", "fictional", "mixed"] as const;
export const RIGHTS_STATUSES = ["unknown", "original", "permission-requested", "permission-granted", "licensed", "fair-use-claim", "public-domain"] as const;
export const CONSENT_STATUSES = ["not-applicable", "unknown", "requested", "granted", "declined"] as const;
export const AFFILIATION_STATUSES = ["independent", "official", "unclear"] as const;

export type NarrativeStatus = typeof NARRATIVE_STATUSES[number];
export type RightsStatus = typeof RIGHTS_STATUSES[number];
export type ConsentStatus = typeof CONSENT_STATUSES[number];
export type AffiliationStatus = typeof AFFILIATION_STATUSES[number];

export interface ProvenanceRecord {
  status: NarrativeStatus;
  authors: string[];
  created: string;
  sources: string[];
  rights: RightsStatus;
  consent: ConsentStatus;
  affiliation: AffiliationStatus;
  reviewed: string;
  notes: string;
}

export interface ProvenanceSettings {
  defaultAuthor: string;
  warnBeforeOverwrite: boolean;
}

export interface AuditResult {
  score: number;
  complete: string[];
  missing: string[];
  cautions: string[];
}
