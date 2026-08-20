# Contributing to Folyo

Folyo is early software. Contributions should keep the product calm, local-first, and useful without daily bookkeeping.

Before opening a pull request:

- run `npm run typecheck`, `npm test`, and `npm run format:check`;
- add or update deterministic tests for importer and summary changes;
- use synthetic or fully sanitised financial fixtures;
- preserve source values when adding transformations;
- document new permissions, network behaviour, or file access.

Avoid adding analytics, cloud services, AI dependencies, or large feature surfaces without updating `idea.md` and `INITIAL_PUSH_PLAN.md` first.
