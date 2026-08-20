# Architecture

Folyo is currently a small desktop-first monorepo.

- `apps/site` contains the public synthetic-data demo.
- `apps/desktop` contains the Tauri shell and the desktop frontend.
- `packages/domain` contains framework-independent financial types and calculations.
- `packages/importers` contains deterministic local file parsing.
- `packages/sample-data` contains fictional records used by the demo.
- `packages/ui` contains the shared product interface.

The UI talks to domain operations through plain data and repository boundaries. The initial prototype uses in-memory state. SQLite and encrypted durable persistence should be introduced only after the import and review flows are validated.
