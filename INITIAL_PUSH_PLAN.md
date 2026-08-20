# Folyo Initial Push Implementation Plan

## Objective

The initial push should establish Folyo as a credible, runnable desktop-first project and prove its central product idea:

> A user can explore realistic sample finances or import a CSV statement and quickly receive a clear, searchable explanation of what changed—without creating an account or maintaining a budget.

This is a foundation release, not the complete MVP. It should demonstrate the product experience, data model, privacy boundary, and development workflow while keeping the implementation small enough to understand and change.

## Initial push outcome

After cloning the repository, a contributor should be able to:

1. Install dependencies with one documented command.
2. Run the product website locally.
3. Run the Tauri desktop application locally.
4. Open a realistic sample-data workspace.
5. View a timeline and a basic “what changed?” summary.
6. Import one documented CSV format through a preview screen.
7. Search imported or sample transactions.
8. Run formatting, type checks, unit tests, and build checks.

The website must never request or upload real financial files in this release. It demonstrates Folyo using synthetic data only. Real CSV import belongs to the desktop application and is processed locally.

## Product slice

### Included

- Public landing page explaining Folyo in plain language.
- Interactive website demo using synthetic financial data.
- Tauri desktop shell using the same visual language as the website demo.
- Sample workspace containing accounts, income, spending, transfers, refunds, and recurring payments.
- Canonical transaction and account domain models.
- Read-only timeline with search and basic filters.
- Basic “what changed?” summary generated from deterministic calculations.
- Desktop CSV selection, mapping preview, validation, and import confirmation.
- One reference CSV profile plus a generic column mapper.
- In-memory workspace state or disposable local persistence suitable for the prototype.
- Unit tests for parsing, normalisation, summaries, and search.
- Privacy, contribution, architecture, and local-development documentation.
- Continuous integration for formatting, tests, type checking, and builds.

### Excluded

- User accounts, authentication, or a cloud backend.
- Production encrypted vault and migrations.
- Automatic bank connections.
- PDF statement parsing.
- OFX, QFX, and QIF imports.
- Android or iOS applications.
- SMS or notification capture.
- Multi-device sync and backups.
- AI or natural-language search.
- Budgets, goals, investment prices, loan planning, or financial advice.
- Analytics, advertising, telemetry, or crash-data uploads.
- Plugin SDK or public extension marketplace.

## Recommended stack

These choices are defaults for the initial push and can be changed before implementation if a strong project constraint appears.

| Area | Choice | Reason |
| --- | --- | --- |
| Workspace | pnpm workspaces | Simple monorepo management and shared packages. |
| Web UI | React, TypeScript, and Vite | Fast local development and straightforward reuse inside Tauri. |
| Styling | CSS variables and small component primitives | Keeps the visual system understandable without adopting a large design dependency. |
| Desktop | Tauri 2 | Lightweight desktop shell with explicit native permissions. |
| Native core | Rust | Safe file access and a future home for import and deduplication logic. |
| Prototype state | TypeScript store with an in-memory repository boundary | Allows fast product iteration while preserving a path to SQLite. |
| Production persistence later | SQLite with encryption | Matches the local-first product model but is not required to prove the initial slice. |
| Unit tests | Vitest for TypeScript and Cargo tests for Rust | Fast tests close to each implementation layer. |
| End-to-end smoke tests | Playwright for the website; Tauri launch smoke test where CI permits | Verifies the primary paths without building a large test suite. |
| CI | GitHub Actions | Validates every push and pull request using public repository infrastructure. |

## Repository structure

```text
folyo/
├── apps/
│   ├── site/                    Public website and synthetic-data demo
│   └── desktop/                 Tauri desktop application
├── packages/
│   ├── domain/                  Accounts, transactions, summaries, and rules
│   ├── importers/               CSV parsing, mapping, validation, and fixtures
│   ├── sample-data/             Clearly synthetic demonstration workspace
│   ├── ui/                      Shared product components and visual tokens
│   └── config/                  Shared TypeScript, lint, and test configuration
├── docs/
│   ├── architecture.md          Boundaries and important implementation decisions
│   ├── data-model.md            Canonical entities and invariants
│   ├── privacy.md               What runs locally and what never leaves the device
│   └── importing.md             Supported prototype CSV shape and limitations
├── fixtures/
│   └── csv/                     Sanitised and synthetic import test files
├── .github/
│   └── workflows/               Formatting, tests, checks, and builds
├── idea.md                      Product direction
├── INITIAL_PUSH_PLAN.md         This implementation plan
├── README.md                    Product introduction and local setup
├── CONTRIBUTING.md              Contribution workflow and fixture safety rules
├── LICENSE                      Chosen open-source licence
├── SECURITY.md                  Private vulnerability reporting guidance
├── package.json                 Root scripts
├── pnpm-workspace.yaml          Workspace definition
└── rust-toolchain.toml           Pinned Rust toolchain
```

Do not create every empty directory in advance. Add a directory when the initial implementation places a meaningful file inside it.

## Domain model

The initial model should remain small and explicit.

### Account

```ts
type Account = {
  id: string;
  name: string;
  kind: "bank" | "card" | "cash" | "wallet";
  currency: string;
  openingBalance?: number;
};
```

### Transaction

```ts
type Transaction = {
  id: string;
  accountId: string;
  occurredAt: string;
  amount: number;
  currency: string;
  direction: "in" | "out";
  rawDescription: string;
  displayMerchant?: string;
  category?: string;
  kind: "income" | "spending" | "transfer" | "refund" | "fee" | "unknown";
  source: "sample" | "csv";
  sourceReference?: string;
  importBatchId?: string;
};
```

Money must not be represented with floating-point arithmetic in production. For the initial implementation, use integer minor units internally even if UI examples display decimal values. Every transaction retains its original description and source information so transformations remain explainable.

### Import batch

```ts
type ImportBatch = {
  id: string;
  fileName: string;
  importedAt: string;
  accountId: string;
  rowCount: number;
  acceptedCount: number;
  rejectedCount: number;
  mappingProfile: CsvMappingProfile;
};
```

### Initial invariants

- Amounts are positive minor-unit integers; direction carries the sign meaning.
- Every transaction belongs to exactly one account.
- Original imported text is retained.
- Transformations never destroy the source value.
- A failed row cannot silently become a zero-value transaction.
- Dates without a valid interpretation remain review errors.
- Transfers are excluded from income and spending totals.
- Sample records are visibly labelled as synthetic.

## Core user flows

### Flow A: Explore sample data

1. Visitor opens the website or desktop application.
2. Visitor selects `Explore sample data`.
3. Folyo opens a populated workspace immediately.
4. The home view explains three to five meaningful changes.
5. The visitor can inspect the timeline and search for a merchant.
6. Every screen clearly identifies the data as synthetic.

Acceptance criteria:

- No signup, questionnaire, or configuration appears before the sample workspace.
- The first useful screen renders in under two seconds on a normal development machine.
- At least one transfer is correctly excluded from spending.
- At least one refund and one recurring payment are represented.
- Search tolerates case differences and partial merchant names.

### Flow B: Import a CSV on desktop

1. User creates a temporary local workspace or selects an existing prototype workspace.
2. User chooses a CSV file through the native file picker.
3. Folyo displays headers and a small raw preview before parsing.
4. Folyo suggests mappings for date, description, debit, credit, amount, and balance columns.
5. User confirms the account and mapping.
6. Folyo validates rows and shows accepted, rejected, and warning counts.
7. User confirms the import.
8. Folyo opens the updated timeline and summary.

Acceptance criteria:

- The selected file is read locally through the desktop application.
- Nothing is sent over the network.
- The user can cancel before records are added.
- Invalid dates and amounts are shown with row numbers and explanations.
- Debit/credit columns and a single signed-amount column are both supported.
- Re-importing the exact same reference fixture does not duplicate accepted rows.
- Import can be undone as one batch during the current prototype session.

### Flow C: Understand what changed

1. Folyo compares the latest complete month with the preceding complete month.
2. It calculates income, spending, transfers, largest merchant changes, and recurring-payment changes.
3. It presents a small set of factual statements.
4. Selecting a statement reveals the transactions used to calculate it.

Acceptance criteria:

- The calculations are deterministic and covered by unit tests.
- Transfers do not inflate income or spending.
- Every statement links back to supporting transactions.
- The language remains descriptive and non-judgemental.
- Empty, partial, and single-month datasets have intentional fallback states.

## Work phases

### Phase 0: Repository foundation

Deliverables:

- Initialise pnpm workspace and root scripts.
- Create site, desktop, and shared package foundations.
- Pin supported Node, pnpm, and Rust versions.
- Add formatter, TypeScript strict mode, lint rules, and test configuration.
- Add README, licence, contributing, security, privacy, and architecture documents.
- Add CI checks for formatting, types, tests, and production website build.
- Add a desktop compile check on supported CI runners.

Exit criteria:

- A fresh clone can install and run both applications using documented commands.
- CI passes on a repository containing no generated build output.
- No secret, analytics key, remote database, or backend dependency exists.

### Phase 1: Shared visual and domain foundation

Deliverables:

- Define colour, typography, spacing, and focus tokens.
- Build accessible button, input, card, table/list, badge, and empty-state primitives.
- Add account, transaction, import batch, and summary types.
- Add minor-unit money formatting and date helpers.
- Define repository interfaces so UI code does not depend directly on persistence.
- Document domain invariants.

Exit criteria:

- Shared components render in the website and desktop application.
- Domain code has no browser, Tauri, or database dependency.
- Keyboard focus and basic screen-reader labels are present.

### Phase 2: Synthetic product demo

Deliverables:

- Create a realistic but entirely fictional three-month dataset.
- Build home, timeline, transaction detail, and search experiences.
- Implement deterministic summary calculations.
- Write the first set of “what changed?” templates.
- Add guided demo entry points to the website.
- Add responsive layouts for common desktop and tablet widths.

Exit criteria:

- The website tells the product story through the working demo.
- The desktop application can open the same sample workspace.
- All summary claims link to the records that produced them.
- The sample dataset cannot be mistaken for a real person or institution export.

### Phase 3: Desktop CSV import vertical slice

Deliverables:

- Add native file selection with the smallest required Tauri permission scope.
- Parse CSV safely with explicit encoding and delimiter handling.
- Build raw preview and mapping screens.
- Support signed amount and separate debit/credit formats.
- Validate dates, amounts, required values, and malformed rows.
- Create a stable fingerprint for exact-row deduplication.
- Add import confirmation, batch undo, and post-import summary.
- Add synthetic fixtures for expected and invalid formats.

Exit criteria:

- The reference CSV files import deterministically.
- Bad rows are explainable and do not corrupt accepted records.
- Exact re-imports are safely identified.
- The implementation has no network path.
- The complete flow works in a packaged development build.

### Phase 4: Hardening and first public push

Deliverables:

- Add loading, empty, error, and partial-data states.
- Test common locales, date formats, large files, and unusual descriptions.
- Add website metadata, social preview, favicon, and accessible page titles.
- Review every external request made by the website and desktop application.
- Document known limitations and unsupported formats.
- Record a short sample-data walkthrough or add equivalent screenshots.
- Produce checksummed preview builds for the first supported desktop operating system.
- Create initial issues for work intentionally deferred.

Exit criteria:

- All automated checks pass from a clean clone.
- The website contains no form that accepts real statements.
- The desktop application works offline after installation.
- No debug fixture contains real financial or personal information.
- A new contributor can reach the sample workspace in under ten minutes.
- Release notes describe the project as an early product demonstration, not a production financial vault.

## Testing strategy

### Unit tests

Prioritise tests for:

- integer money conversion and formatting;
- date parsing with explicit locale profiles;
- debit, credit, and signed-amount mappings;
- malformed and missing CSV values;
- transaction fingerprint stability;
- transfer exclusion from income and spending;
- month-over-month summary calculations;
- recurring-payment grouping on synthetic data;
- case-insensitive and partial-text search.

### Fixture tests

Every importer change should run against committed synthetic fixtures. A fixture must include a short README describing:

- the format it represents;
- whether it is synthetic or sanitised;
- the expected accepted and rejected row counts;
- known edge cases;
- the expected canonical output snapshot.

Never commit a user's raw statement, even temporarily.

### Integration tests

- Open the sample workspace and verify headline values.
- Search for a known synthetic merchant.
- Select a summary statement and inspect supporting transactions.
- Import a valid reference CSV.
- Reject or explain an invalid fixture.
- Undo an import batch.
- Re-import the same fixture and verify duplicate handling.

### Manual release checks

- Run the desktop application with networking disabled.
- Inspect outbound requests from both product surfaces.
- Confirm all sample-data labels remain visible.
- Verify keyboard navigation through import and review flows.
- Test fresh install and uninstall without leaving unexpected user data.
- Confirm exported logs do not include transaction descriptions by default.

## Privacy and security requirements

- No real statement upload on the public website.
- No analytics SDK in the initial push.
- No remote fonts, tracking pixels, or unnecessary third-party scripts.
- Desktop file access is user-initiated through a native picker.
- Tauri permissions are narrowly scoped and documented.
- File content and paths must not appear in ordinary application logs.
- Parser errors identify row numbers without logging complete sensitive rows.
- Synthetic data is generated specifically for Folyo and contains no copied personal records.
- Dependencies that handle file parsing receive an explicit security review before release.
- The project must state that prototype persistence is not yet a production encrypted vault.

## Accessibility and experience requirements

- All main flows are keyboard accessible.
- Focus states are visible.
- Colour is never the only indicator of income, spending, warnings, or errors.
- Currency values use tabular numerals where practical.
- Financial changes use neutral language.
- Empty states explain the next useful action.
- Dense transaction information remains readable at 200% zoom.
- Animations are subtle and respect reduced-motion settings.
- The sample demo does not imitate a real bank's branding.

## Initial issue breakdown

Create focused issues rather than one issue per file.

1. Set up pnpm workspace, shared scripts, and toolchain versions.
2. Scaffold the Vite website and Tauri desktop application.
3. Add CI for format, type, test, web build, and desktop compile checks.
4. Define domain entities, money representation, and repository boundaries.
5. Create the visual tokens and accessible component primitives.
6. Design and generate the fictional sample workspace.
7. Implement timeline, transaction detail, search, and filters.
8. Implement deterministic “what changed?” calculations and explanations.
9. Build the public landing page and guided sample-data demo.
10. Add desktop file-picker permissions and local CSV reading.
11. Build CSV preview, mapping, validation, and confirmation.
12. Add import batch undo and exact-file/row deduplication.
13. Add fixture, unit, and integration coverage.
14. Write architecture, privacy, importing, and contribution documentation.
15. Perform privacy, accessibility, dependency, and offline release reviews.
16. Package the first preview build and publish release notes.

## Decisions to record

Use short architecture decision records for choices that would be expensive to reverse:

- ADR-001: Why desktop is the first durable product surface.
- ADR-002: Why the website accepts only synthetic data initially.
- ADR-003: Integer minor units for monetary values.
- ADR-004: Repository boundary before introducing SQLite.
- ADR-005: Tauri permission and local file-access model.
- ADR-006: Transaction fingerprints and limits of initial deduplication.
- ADR-007: Open export format and source-data preservation.

## First public push checklist

### Repository

- [ ] README explains the problem, current capability, and project status.
- [ ] `idea.md` and this plan agree on desktop-first scope.
- [ ] Licence is explicitly chosen and committed.
- [ ] Contribution and security guidance is present.
- [ ] Generated files, local vaults, statements, and secrets are ignored.
- [ ] Node, pnpm, and Rust versions are pinned.

### Product

- [ ] Website opens directly into a clear product story.
- [ ] Synthetic demo works without signup.
- [ ] Desktop application opens the sample workspace.
- [ ] Timeline, search, and “what changed?” are functional.
- [ ] One CSV path works through preview, validation, import, and undo.
- [ ] Exact fixture re-import does not duplicate transactions.
- [ ] No real financial data leaves the desktop application.

### Quality

- [ ] Formatting, type checking, tests, and builds pass.
- [ ] Import edge cases have committed synthetic fixtures.
- [ ] Main flows are keyboard accessible.
- [ ] Empty and error states are intentional.
- [ ] Website and desktop external requests have been inspected.
- [ ] Known limitations are documented honestly.

### Release

- [ ] Preview build is clearly marked pre-production.
- [ ] Release notes explain that encrypted durable persistence is still upcoming.
- [ ] Screenshots and demo data contain no real personal information.
- [ ] Checksums are published for downloadable artifacts.
- [ ] Deferred work is captured as issues rather than hidden TODOs.

## Definition of done

The initial push is complete when Folyo is publicly understandable, locally runnable, and demonstrates one end-to-end promise:

> Open Folyo, use safe sample data or import a CSV locally, and receive a searchable money history with a small factual explanation of what changed.

It is not complete merely because the repository structure exists. The vertical slice must work, automated checks must pass, privacy boundaries must be documented, and the limitations must be clear.
