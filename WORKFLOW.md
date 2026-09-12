# Creative Provenance Workflow

Narrative Provenance is one implementation of a broader, platform-neutral method. The method helps people preserve creative and research evidence without turning interpretation, memory, or repetition into verified fact.

It can be used manually, with ordinary Markdown, in Obsidian, in a repository, in a research archive, or with the `creative-provenance-workflow` ChatGPT skill.

## Start here

Do not begin by reorganizing everything. Begin with one source.

1. **Capture it.** Save what the source is and where it came from. This is enough for an initial inbox entry.
2. **Preserve it.** Keep the original title, filename, wording, URL, dates, byline, and identifiers. Record when it was accessed or preserved separately.
3. **Identify it.** Record the creator or author only when supported. Use `unknown` or `attributed` rather than guessing.
4. **Classify each claim.** Mark what is verified, creator-stated, third-party, interpreted, inferred, or unresolved.
5. **Connect it.** Link the source to relevant projects, characters, releases, events, repositories, or archives. Give each relationship its own evidence and status.
6. **Check boundaries.** Keep rights, consent, participation, affiliation, and endorsement separate. Never infer one from another.
7. **Leave a return point.** Record what is complete, what remains uncertain, and the single next useful action.

## Evidence labels

| Label | Meaning |
| --- | --- |
| **Verified** | Directly supported by the cited primary or authoritative evidence. |
| **Creator-stated** | Said by the creator or project owner, but not independently verified. |
| **Third-party claim** | Said by a named outside person or publication and preserved with attribution. |
| **Interpretation** | A reading of meaning, theme, intent, or narrative function. |
| **Inference** | A conclusion drawn from listed evidence but not directly stated by a source. |
| **Unresolved** | Evidence is missing, inaccessible, ambiguous, or conflicting. |

Confidence describes the quality of support; it does not replace the label. Prefer `direct`, `corroborated`, `partial`, `conflicted`, or `insufficient` over invented numerical precision.

## Minimum source record

Only two fields are required at capture time:

- What is this?
- Where did it come from?

The rest can be completed later:

| Field | What to preserve |
| --- | --- |
| Record ID | Stable local identifier |
| Original title | Keep the source's wording; store normalized labels separately |
| Source type | Note, post, recording, image, manuscript, email, commit, dataset, etc. |
| Creator/author | Verified, attributed, creator-stated, or unknown |
| Creation date | Original date and time zone, or an explicit precision limit |
| Publication date | When different from creation |
| Access/preservation date | When this copy was retrieved or archived |
| Original location | Canonical URL, repository path, archive reference, or physical source |
| Preserved location | Snapshot, local path, archive URL, checksum, or commit |
| Version/state | Draft, revision, published version, edit history, or unknown |
| Rights and consent | Record separately; do not infer either |
| Evidence note | What establishes the metadata and what it does not establish |
| Ecosystem links | Related nodes, relationship types, evidence, and status |

A checksum can show that two copies are identical. It does not prove authorship or truth.

## Ecosystem relationships

For every meaningful connection, identify:

- the source node and related node;
- the relationship type;
- supporting evidence;
- status: verified, creator-stated, interpreted, inferred, or unresolved;
- any boundary, such as separate brand, adaptation, influence, proof of concept, or noncommercial study.

Useful relationship terms include `created-for`, `published-in`, `version-of`, `adapts`, `references`, `inspired-by`, `contemporaneous-with`, `archived-in`, `discussed-by`, `proposed-for`, and `thematically-related-to`.

Do not use `collaboration-with`, `endorsed-by`, `owned-by`, or `licensed-by` without direct support.

## Quality check

Before sharing a provenance record, confirm that:

- original dates and preservation dates are not conflated;
- authorship is sourced or qualified;
- verified facts and interpretations are visibly distinct;
- every important ecosystem connection has evidence and a status;
- third-party claims remain attributed;
- gaps and contradictions remain visible;
- nothing implies clearance, ownership, endorsement, or collaboration without evidence;
- original material remains intact;
- private or sensitive evidence has not been exposed.

## Use it anywhere

- **Repositories:** keep a source register or claim ledger; link to exact paths and commits where useful.
- **Obsidian:** store stable metadata in properties and keep evidence, interpretation, relationships, and open questions in separate sections.
- **Stories:** distinguish publication history and authorial statements from theme, character, canon, and structural interpretation.
- **Music:** distinguish composition, lyrics, master, performance, edit/remix, artwork, credits, licensing, and collection sequence.
- **Research archives:** preserve inventories, chronology, claim ledgers, relationship ledgers, search scope, and conflicting evidence.

The templates in [`templates/`](templates/) provide a low-friction starting point.

