import type { ProvenanceRecord } from "./types";

export type StorageZone = "control" | "private" | "working" | "review" | "public" | "archive" | "outside";

export interface CollaborationProjectInput {
  name: string;
  founder: string;
  rootFolder: string;
  purpose: string;
}

export interface ProjectFile {
  path: string;
  content: string;
}

export interface ShareAudit {
  allowed: boolean;
  zone: StorageZone;
  blockers: string[];
  cautions: string[];
}

const ZONES: Array<[StorageZone, string]> = [
  ["control", "00-Control"],
  ["private", "10-Private"],
  ["working", "20-Working"],
  ["review", "30-Share-Review"],
  ["public", "40-Public"],
  ["archive", "90-Archive"]
];

export function projectSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function classifyStorageZone(path: string): StorageZone {
  const parts = path.replaceAll("\\", "/").split("/");
  for (const [zone, folder] of ZONES) if (parts.includes(folder)) return zone;
  return "outside";
}

export function buildCollaborationProject(input: CollaborationProjectInput, date: string): ProjectFile[] {
  const slug = projectSlug(input.name);
  if (!slug) throw new Error("Project name must contain letters or numbers.");
  const root = `${input.rootFolder.replace(/\/+$/, "")}/${slug}`;
  const header = `---\nproject: ${yaml(input.name)}\nproject-id: ${yaml(`${slug}-${date}`)}\nfounder: ${yaml(input.founder)}\ncreated: ${date}\nprivacy: private\nrelease-status: blocked\n---\n`;

  return [
    {
      path: `${root}/00-Control/PROJECT-CHARTER.md`,
      content: `${header}\n# ${input.name}: project charter\n\n## Purpose\n\n${input.purpose || "Describe the collaboration's purpose before inviting contributors."}\n\n## Foundational ownership\n\nPre-existing work remains with its existing owner. Participation, repository access, discussion, influence, and silence do not transfer ownership.\n\n## Collaboration rule\n\nNew work is not accepted for release until its scope, creator, rights, credit, compensation, permitted uses, and exit treatment are recorded in writing.\n\n## Authority\n\n- Founder/steward: ${input.founder || "Unassigned"}\n- Canon decision authority: ${input.founder || "Unassigned"}\n- Release authority: ${input.founder || "Unassigned"}\n`
    },
    {
      path: `${root}/00-Control/RIGHTS-MAP.md`,
      content: `${header}\n# Rights map\n\n| Asset or contribution | Creator | Pre-existing/new | Owner | License granted | Compensation | Evidence | Status |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n| Foundational project | ${input.founder || "Unassigned"} | Pre-existing | ${input.founder || "Unassigned"} | None recorded | N/A | Project charter | Recorded |\n\n## Stop condition\n\nDo not publish, license, transfer, train on, or commercially use an item whose ownership, permission, consent, or contributor authority is missing or disputed.\n`
    },
    {
      path: `${root}/00-Control/COLLABORATORS.md`,
      content: `${header}\n# Collaborators\n\nNo collaborator is attached merely because they were discussed, contacted, named publicly, or influenced the project.\n\n| Person | Proposed role | Accepted scope | Credit | Compensation | Public naming permission | Evidence locator | Status |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n`
    },
    {
      path: `${root}/00-Control/RELEASE-GATES.md`,
      content: `${header}\n# Release gates\n\n- [ ] Every included asset has an identified source and creator.\n- [ ] Pre-existing work is distinguished from new collaborative work.\n- [ ] Rights and permitted uses are recorded.\n- [ ] Consent and public naming permission are recorded separately.\n- [ ] Credit and compensation are approved.\n- [ ] AI use and training permissions are recorded.\n- [ ] Private evidence, correspondence, credentials, health information, and protected links are excluded.\n- [ ] The public derivative was reviewed independently from its private source.\n- [ ] No dispute or unresolved stop condition remains.\n- [ ] Release authority changed release-status to approved.\n`
    },
    zoneReadme(root, "10-Private", "Private evidence", "Raw correspondence, agreements, receipts, identifying information, source exports, and protected evidence. Never treat this folder as encrypted merely because it is inside Obsidian. Do not place it in a public repository or shared vault."),
    zoneReadme(root, "20-Working", "Working material", "Drafts and active collaboration material. Nothing here is approved for publication."),
    zoneReadme(root, "30-Share-Review", "Share review", "Redacted derivatives awaiting a deliberate rights, consent, privacy, and provenance review. Placement here is not approval."),
    zoneReadme(root, "40-Public", "Approved public derivatives", "Only independently reviewed derivatives with release-status: approved belong here. Never place raw private evidence here."),
    zoneReadme(root, "90-Archive", "Superseded and closed records", "Preserve decisions, withdrawals, rejected drafts, and custody history without presenting them as current or public."),
    {
      path: `${root}/START-HERE.md`,
      content: `${header}\n# Start here\n\n1. Read 00-Control/PROJECT-CHARTER.md.\n2. Complete the rights map before requesting work.\n3. Record a collaborator only after they accept a defined scope.\n4. Keep raw evidence in 10-Private; Obsidian is not encryption.\n5. Work in 20-Working.\n6. Create a redacted derivative in 30-Share-Review.\n7. Run **Audit current note for sharing**.\n8. Move only an approved derivative to 40-Public.\n9. Preserve withdrawn or superseded records in 90-Archive.\n\nThe plugin does not upload, publish, synchronize, encrypt, or grant permission. It provides local guardrails; the user remains responsible for device security, sync configuration, legal review, and release decisions.\n`
    }
  ];
}

export function auditForSharing(path: string, content: string, record: ProvenanceRecord, frontmatter: Record<string, unknown> | null | undefined): ShareAudit {
  const zone = classifyStorageZone(path);
  const blockers: string[] = [];
  const cautions: string[] = [];
  const releaseStatus = typeof frontmatter?.["release-status"] === "string" ? frontmatter["release-status"] : "";

  if (zone === "private") blockers.push("This note is in the private-evidence zone.");
  if (zone === "archive") blockers.push("This note is archived and must not be treated as a current public derivative.");
  if (zone !== "public") blockers.push("The note is not in an approved public-output zone.");
  if (releaseStatus !== "approved") blockers.push("Release status is not approved.");
  if (["unknown", "requested", "declined"].includes(record.consent)) blockers.push(`Consent is ${record.consent}.`);
  if (["unknown", "permission-requested"].includes(record.rights)) blockers.push(`Rights status is ${record.rights}.`);
  if (record.affiliation === "unclear") blockers.push("Affiliation is unclear.");
  if (record.status === "unreviewed") blockers.push("Narrative status is unreviewed.");
  if (!record.authors.length) blockers.push("No author or creator is recorded.");
  if (/(?:api[_-]?key|secret|password|authorization|bearer)\s*[:=]\s*\S+/i.test(content)) blockers.push("Possible credential or secret detected.");

  if (/https?:\/\/(?:drive\.google\.com|dropbox\.com|icloud\.com)\/\S+/i.test(content)) cautions.push("Cloud-storage link detected; confirm its access scope and remove protected links from public derivatives.");
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(content)) cautions.push("Email address detected; confirm public naming permission.");
  if (/\b(?:private|confidential|do not share|medical|health record)\b/i.test(content)) cautions.push("Potentially sensitive-language marker detected; inspect the note manually.");
  if (record.rights === "fair-use-claim") cautions.push("Fair use is a case-specific claim, not permission.");

  return { allowed: blockers.length === 0, zone, blockers, cautions };
}

function zoneReadme(root: string, folder: string, title: string, description: string): ProjectFile {
  return {
    path: `${root}/${folder}/README.md`,
    content: `---\nprivacy: ${folder === "40-Public" ? "public" : "private"}\nrelease-status: ${folder === "40-Public" ? "review-required" : "blocked"}\n---\n\n# ${title}\n\n${description}\n`
  };
}

function yaml(value: string): string {
  return JSON.stringify(value);
}
