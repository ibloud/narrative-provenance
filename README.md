# Narrative Provenance

Narrative Provenance is a privacy-first Obsidian plugin for recording what a note is, where it came from, who created it, and what rights or permissions apply.

**[Visit the project website](https://ibloud.github.io/narrative-provenance/)** · [View the current release](https://github.com/ibloud/narrative-provenance/releases/tag/0.1.1) · [Report an issue](https://github.com/ibloud/narrative-provenance/issues)

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

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## Acknowledgments

Narrative Provenance was created by Dominique Devereaux with development assistance from OpenAI Codex. This acknowledgment describes tool-assisted development and does not imply authorship, ownership, affiliation, or endorsement by OpenAI.

## License

MIT © 2026 Dominique Devereaux
