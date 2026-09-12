# Project Status

Last updated: 2026-09-12

## Current state

The platform-neutral Creative Provenance Workflow and its collective starter materials are complete and proposed in draft pull request [#1](https://github.com/ibloud/narrative-provenance/pull/1).

The work is committed on branch `codex/collective-workflow`. It has not yet been merged into `main`, so the current public plugin release remains unchanged.

## What is preserved

- [`WORKFLOW.md`](WORKFLOW.md): the reusable method, evidence labels, minimum record, ecosystem mapping, boundaries, and format adapters.
- [`COLLECTIVE.md`](COLLECTIVE.md): purpose, principles, unresolved design questions, and ways to participate without writing code.
- [`docs/neurodivergent-design.md`](docs/neurodivergent-design.md): capture-first interaction model, pause-and-resume checkpoints, language guidance, and accessibility test scenarios.
- [`presentation/openai-event.md`](presentation/openai-event.md): editable presentation source for an OpenAI event or another community setting.
- [`presentation/README.md`](presentation/README.md): adaptation order and presentation accessibility checklist.
- [`templates/source-record.md`](templates/source-record.md): two-question Provenance Inbox and complete source record.
- [`templates/claim-ledger.md`](templates/claim-ledger.md): claim classification ledger.
- [`templates/ecosystem-link.md`](templates/ecosystem-link.md): relationship evidence and boundary record.
- Updated repository README, contribution guidance, and project website navigation.
- The reusable ChatGPT skill is named `creative-provenance-workflow`.

## Decisions preserved

- The workflow is broader than the Obsidian plugin; the plugin is one implementation.
- Capture begins with only “What is this?” and “Where did it come from?”
- Classification can happen later. `Unknown`, `not reviewed`, and `return later` are valid states.
- Verified provenance, creator statements, third-party claims, interpretation, inference, and unresolved claims remain distinct.
- Ecosystem connections must record evidence, status, and boundaries.
- Rights, consent, affiliation, participation, and endorsement are separate questions.
- The experience must support interruption, mobile use, cognitive load, assistive technology, emotional safety, and one clear next action.
- Collective examples must be consensual, fictional, public-domain, or safely redacted.
- The presentation is adaptable and must not imply endorsement by OpenAI, Obsidian, or third parties.

## Verification completed

- Six automated plugin tests passed.
- Production build passed.
- Relative Markdown links were checked.
- Git whitespace validation passed.
- No plugin runtime behavior or provenance metadata schema was changed.

## Next action

Review draft pull request [#1](https://github.com/ibloud/narrative-provenance/pull/1). When the language and structure are satisfactory, mark it ready and merge it into `main`.

