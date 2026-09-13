# Changelog

## Unreleased

- Add guarded collaboration-project creation with control, private, working, review, public, and archive zones.
- Add local share audits that fail closed on unresolved provenance, rights, consent, release status, and possible secrets.
- Add founder-rights, collaborator, rights-map, and release-gate templates without adding accounts, telemetry, network access, or encryption claims.

## 0.1.2

- Corrected all blocking findings from the Obsidian community review scanner.
- Preserved sidebar placement when the plugin unloads and reloads.
- Added safe promise handling and stricter frontmatter validation.
- Replaced the deprecated build dependency and adopted searchable declarative settings.
- Added the official Obsidian ESLint rules to the release checks.

## 0.1.1

- Display provenance as readable individual Obsidian properties
- Automatically migrate the nested record written by version 0.1.0 when it is next saved
- Preserve support for reading existing 0.1.0 records

## 0.1.0

- Initial development release
- Guided provenance editor
- Active-note completeness audit
- Provenance sidebar
- Local YAML storage with no telemetry or network access
