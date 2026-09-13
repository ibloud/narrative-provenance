# Narrative Provenance

Narrative Provenance is a privacy-first Obsidian plugin for recording what a note is, where it came from, who created it, and what rights or permissions apply.

It is also the first software implementation of the broader [Creative Provenance Workflow](WORKFLOW.md): a platform-neutral method for preserving dates and authorship, separating evidence from interpretation, connecting sources to a wider project ecosystem, and labeling uncertain or third-party claims.

**[Visit the project website](https://ibloud.github.io/narrative-provenance/)** · [Read the workflow](WORKFLOW.md) · [Make the presentation your own](presentation/README.md) · [Join the collective](COLLECTIVE.md) · [View the current release](https://github.com/ibloud/narrative-provenance/releases/tag/0.1.2) · [Report an issue](https://github.com/ibloud/narrative-provenance/issues)

It helps writers, researchers, archivists, journalists, and collaborative worldbuilders distinguish:

- verified information from interpretation and fiction;
- authorship from source material;
- copyright or reuse status from personal consent;
- independent work from official affiliation.

All information remains in ordinary YAML frontmatter inside the user's vault. The plugin has no telemetry, accounts, advertising, payments, network requests, or external file access.

## Features

- Guided provenance editor for the active Markdown note
- Local completeness audit with actionable missing fields
- Sidebar that follows the active note
- Cautions for declined consent, unclear affiliation, and fair-use claims
- Human-readable, portable metadata
- Desktop and mobile support
- Guarded collaboration-project setup with separate control, private, working, review, public, and archive zones
- Local share audit that fails closed on unresolved rights, consent, provenance, release approval, or possible credentials

## Metadata format

```yaml
---
provenance-status: interpretation
provenance-authors:
  - Dominique Devereaux
provenance-created: 2026-09-10
provenance-sources:
  - https://example.org/primary-source
provenance-rights: original
provenance-consent: not-applicable
provenance-affiliation: independent
provenance-reviewed: 2026-09-10
provenance-notes: Distinguishes story analysis from verified provenance.
---
```

Versions before `0.1.1` stored the same values inside one nested `provenance` object. Opening and saving that record with the current editor automatically converts it to readable individual properties.

### Controlled values

| Field | Values |
| --- | --- |
| `status` | `unreviewed`, `verified`, `interpretation`, `fictional`, `mixed` |
| `rights` | `unknown`, `original`, `permission-requested`, `permission-granted`, `licensed`, `fair-use-claim`, `public-domain` |
| `consent` | `not-applicable`, `unknown`, `requested`, `granted`, `declined` |
| `affiliation` | `independent`, `official`, `unclear` |

Rights and consent are intentionally separate. Owning or licensing material does not automatically establish a person's consent, participation, or endorsement.

## Use

Open a Markdown note, then choose one of these commands from the command palette:

- **Edit current note provenance**
- **Audit current note provenance**
- **Open provenance sidebar**
- **Start guarded collaboration project**
- **Audit current note for sharing**

### Guarded collaboration projects

The project wizard creates a local-first folder system beneath `Collaborations/` by default:

- `00-Control` — charter, ownership map, collaborator register, and release gates
- `10-Private` — raw evidence and protected records; this folder is not encryption
- `20-Working` — active drafts that are not approved for publication
- `30-Share-Review` — redacted derivatives awaiting review
- `40-Public` — approved public derivatives only
- `90-Archive` — withdrawn, superseded, and closed records

The share audit reviews the active note's zone, release status, provenance, rights, consent, affiliation, and several high-risk content markers. Passing the audit is not automatic publication or legal clearance. Narrative Provenance does not upload or synchronize files and cannot prevent another plugin, sync provider, operating system, or person with device access from copying vault contents.

The ribbon's file-check icon opens the sidebar.

## Development installation

Use a separate test vault. Clone the repository into `.obsidian/plugins/narrative-provenance`, then run:

```bash
npm install
npm run build
```

Reload Obsidian and enable **Narrative Provenance** under Community plugins.

## Important boundaries

Narrative Provenance records a user's assessment. It does not independently authenticate sources, secure permission, determine copyright ownership, or provide legal advice. A `fair-use-claim` entry is not a guarantee that a use is lawful. Users remain responsible for review and publication decisions.

## Contributing and support

Bug reports and focused feature proposals are welcome through GitHub Issues. Please do not include private vault contents, confidential correspondence, personal health information, or unredacted evidence in a public issue.

People who do not write code can also test a template, improve a label, contribute a safely shareable example, or report an accessibility and interruption-recovery problem. See [A Beginning for the Collective](COLLECTIVE.md).

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## Acknowledgments

Narrative Provenance was created by Dominique Devereaux with development assistance from OpenAI Codex. This acknowledgment describes tool-assisted development and does not imply authorship, ownership, affiliation, or endorsement by OpenAI.

## License

MIT © 2026 Dominique Devereaux
