# Folyo

> A private financial memory that turns the records you already have into a clear, searchable story of your money.

## The idea

Folyo is a local-first personal money journal by Wyrcan. It helps people understand what happened to their money without asking them to become bookkeepers, maintain a daily habit, or hand their financial history to another cloud company.

The first product is a desktop application supported by a public website and an interactive sample-data demo. A user downloads Folyo, drops in one or more bank or card statements, and gets a useful view of their financial life within minutes. The application remembers previous imports, removes duplicates, recognises transfers and recurring payments, and makes the resulting history easy to search.

Android comes later as a capture companion. The desktop product must be valuable before automatic mobile capture exists.

Folyo is not primarily a budgeting app. It is a private financial memory that answers questions such as:

1. What changed since I last looked?
2. Where did my money come from and where did it go?
3. Which payments keep returning or have changed in price?
4. What do I owe, and what is owed to me?
5. Can I find the transaction, purchase, or decision I vaguely remember?

## Positioning

**Folyo remembers your money, so managing it does not become another chore.**

The strongest differentiation is the combination of:

- useful results from existing statements instead of required daily entry;
- local-first storage, offline operation, and no mandatory account;
- a chronological money story rather than a wall of dashboards;
- unusually good import, transfer detection, and duplicate handling;
- transparent rules that users can inspect and correct;
- optional manual tracking for cash, personal debts, and unsupported accounts;
- an open data format and open-source foundation.

Folyo should not win by having more features than every finance app. It should win by asking less effort from the user while giving them a more trustworthy memory of their money.

## Who it is for

The initial user is someone who:

- uses several bank accounts, cards, wallets, or payment services;
- occasionally wants to understand their money but dislikes budgeting rituals;
- has statements or transaction exports but rarely examines them;
- wants search, recurring-payment awareness, and a coherent history;
- is uncomfortable giving a hosted finance service permanent access to financial data;
- prefers a calm desktop review once or twice a month over logging every purchase.

Folyo is not initially for users who want active investment trading, tax preparation, strict zero-based budgeting, business accounting, or financial advice.

## Product principles

### Value before organisation

The first session must produce something useful before asking the user to configure categories, budgets, goals, tags, or account hierarchies.

### Review exceptions, not everything

Folyo should automatically accept obvious facts and ask about uncertain items. The user should review five ambiguous transactions, not approve five hundred correct ones.

### A periodic tool can still be a loved product

The product does not need an artificial daily streak. A tool that users trust during a monthly review, while searching for a purchase, or before making a decision can be valuable without demanding constant attention.

### Facts first, advice later if ever

Folyo should explain what changed using the user's own history. It should avoid pretending to know what a person ought to spend or invest.

### Every correction improves the future

When a user renames a merchant, identifies a transfer, or categorises a recurring payment, Folyo should remember the rule and reduce future work.

### Privacy must be visible

Local-first should be a product property the user can verify: no account, offline operation, open exports, clear network activity, and explicit opt-in for anything that leaves the device.

## The core experience

### 1. Bring in what already exists

On first launch, Folyo offers three simple choices:

- try the product with realistic sample data;
- import one or more CSV, OFX, QFX, or QIF files;
- start a small manual journal for cash, debts, or unsupported accounts.

The import flow previews columns, dates, amounts, balances, and account identity before saving anything. Mapping should be remembered for the next statement from the same institution.

There is no onboarding questionnaire before the user sees value. Account names, categories, and rules can be refined after the first useful result appears.

### 2. Clean the history quietly

Folyo performs the repetitive work locally:

- normalises merchant names;
- separates income, spending, fees, refunds, and transfers;
- detects duplicate rows across overlapping statements;
- links opposite sides of transfers between the user's own accounts;
- identifies recurring payments and changes in their amount;
- highlights transactions that genuinely need clarification.

Every inference has a confidence level and an explanation. Nothing should silently disappear.

### 3. Show a money story

The home view should answer “what changed?” rather than showing every possible chart. It may include:

- money in and money out since the previous period;
- the largest meaningful changes;
- new, cancelled, or more expensive recurring payments;
- unusual charges or refunds worth noticing;
- transfers that were correctly excluded from spending;
- people or commitments that remain unsettled;
- a small review inbox.

This is descriptive, not judgemental. The language should be “Dining was ₹2,400 higher than last month,” not “You overspent on dining.”

### 4. Let the user ask and remember

Search is a primary feature, not a utility hidden in a menu. A user should be able to find:

- “the laptop purchase from last year”;
- every payment to a merchant despite spelling variations;
- subscriptions between ₹500 and ₹1,000;
- money lent to a person that has not been repaid;
- all transfers into an investment account;
- a charge imported from a particular bank or statement.

Natural-language search can come later. Structured search, tolerant text matching, and useful filters should already feel excellent without AI.

### 5. Return only when it helps

A typical user might open Folyo:

- after downloading a monthly statement;
- when trying to remember a purchase or payment;
- before cancelling subscriptions;
- when reconciling money with a friend;
- when reviewing a year or life event;
- when moving to a new computer and restoring their history.

Folyo should respect this rhythm instead of manufacturing engagement.

## The mental model

The user should not need to understand accounting. The product exposes four simple ideas:

- **What I have:** bank accounts, cash, wallets, and optionally simple asset balances.
- **What I owe:** card balances, loans, borrowed money, and unpaid commitments.
- **What others owe me:** personal loans, deposits, reimbursements, and receivables.
- **What happened:** money arrived, left, moved, was lent, was borrowed, or was corrected.

Everything appears in one chronological log. Behind the interface, actions update the appropriate balances:

| User action | What Folyo records |
| --- | --- |
| Earn or receive | Money enters an account. |
| Spend or buy | Money leaves an account. Details remain optional. |
| Move money | Money moves between the user's accounts and is not counted as income or spending. |
| Borrow | Available money increases and an amount owed is created. |
| Repay | Available money and the amount owed both decrease. |
| Lend | Available money decreases and an amount owed to the user is created. |
| Get repaid | Available money increases and the receivable decreases. |
| Adjust | A correction changes a balance without erasing history. |

Cash remains a normal account, but daily cash entry is optional. The product should still be useful to someone who never tracks cash.

## First product: website and desktop

### Public website

The website is the front door, trust surface, and learning environment. It should contain:

- a clear explanation of the product in plain language;
- an interactive demo that uses synthetic financial data;
- screenshots or a guided “what changed?” story;
- a transparent explanation of where data is stored;
- supported import formats and institution-specific guides;
- desktop downloads and release notes;
- the open data schema and parser contribution documentation;
- no upload box for real statements until a browser-local implementation has been independently verified.

The first demo should let visitors experience the result without providing personal data. Its job is to prove that Folyo is useful before asking for trust.

### Desktop application

The desktop application is the first real product and the durable local data authority. It is suited to statement files, a larger screen, bulk review, local backups, and long-lived history.

It should open without signup and work offline after installation. The interface should feel like one calm workspace rather than accounting software.

### Browser edition

A functional browser edition may follow after the desktop workflow is proven. If built, it must process files entirely on-device, make persistence limitations obvious, and encourage open-format backups. The browser edition should reuse the desktop interface, but the desktop vault remains the recommended home for permanent financial history.

### Android later

Android becomes a companion for automatic notification or SMS capture, instant cash entry, and quick review. It should feed the same ledger and data format rather than defining a separate product.

Mobile development starts only when users value the desktop history enough to ask for easier capture between reviews.

## Focused desktop MVP

### Must have

- A sample-data mode that demonstrates the complete experience immediately.
- Local vault creation without an account.
- CSV, OFX, QFX, and QIF import with preview and reusable mappings.
- Safe duplicate detection across overlapping files.
- Accounts for bank, card, wallet, and cash balances.
- A unified timeline with fast search and filters.
- Transfer detection and one-click confirmation.
- Merchant cleanup and user-defined rules.
- Recurring-payment detection, including amount changes.
- A compact “what changed?” monthly view.
- A review inbox containing only uncertain items.
- Optional manual entries for cash, borrowing, lending, repayment, and adjustments.
- Open export, encrypted backup, and restore.
- A human-readable local activity log for network-capable features.

### Deliberately later

- Android notification and SMS capture.
- Managed or self-hosted multi-device sync.
- Browser persistence for real financial history.
- Account Aggregator and regional open-banking connections.
- Household sharing.
- Receipt OCR.
- Live investment prices and portfolio analytics.
- Detailed loan amortisation and EMI planning.
- Local or external LLM features.
- Plugin marketplace and public API.

### Explicit non-goals

- daily engagement, streaks, rewards, guilt, or gamification;
- mandatory budgets, categories, goals, or manual reconciliation;
- stock trading, tax filing, lending, or financial recommendations;
- business accounting or a visible double-entry bookkeeping interface;
- dozens of dashboards and configurable widgets;
- advertising or sale of financial data;
- simultaneous desktop, web, Android, and iOS development.

## Import strategy

Statement import is the first product's equivalent of automatic capture. It must be treated as a core experience rather than a settings feature.

| Source | Initial role | Product requirement |
| --- | --- | --- |
| CSV | Broadest desktop baseline | Excellent column mapping, locale handling, preview, and reusable import profiles. |
| OFX / QFX / QIF | Structured global baseline | Preserve identifiers and account metadata for stronger deduplication. |
| PDF | Later fallback | Difficult and error-prone; add institution-specific parsers only when real demand justifies them. |
| Manual entry | Optional gap filler | Fast enough for cash and personal debts, but never required for ordinary digital spending. |
| Open banking | Later convenience | Clearly disclose the provider, network use, data path, coverage, and cost. |
| Android capture | Later companion | Process selected notifications or permitted SMS data locally and sync into the same ledger. |

Import quality is a defensible asset. Build a sanitised fixture library covering date formats, debit and credit conventions, decimal separators, overlapping statements, missing identifiers, refunds, reversals, and multi-line descriptions.

## Privacy model

“Local-first” should be a verifiable property, not marketing language.

- The desktop application works offline and stores financial data on the user's device.
- No account is needed for local use.
- The local vault is encrypted and can lock automatically.
- No analytics or crash data leaves the device unless the user explicitly opts in.
- Every network-capable feature is separately enabled.
- A network activity screen explains what connected, why, and what fields were sent.
- Users can export a documented open format and delete the vault without contacting Wyrcan.
- Diagnostic bundles are generated locally and previewed before sharing.

The product has two clearly named modes:

- **Local mode:** nothing financial leaves the device.
- **Connected mode:** the user enables a specific external service with an explicit disclosure.

Self-hosted sync and local-only storage are not identical. Folyo should say **local-first with optional sync** and describe each mode precisely.

## Intelligence without an AI dependency

Most valuable “smart” behaviour does not require an LLM:

- deterministic parsers extract dates, amounts, directions, references, and descriptions;
- rules learn merchant aliases and categories from corrections;
- fuzzy matching joins merchant spelling variations;
- transfer matching finds corresponding entries across accounts;
- statistical detection identifies recurring payments and meaningful changes;
- confidence scores determine whether an item needs review;
- templates generate plain-language monthly explanations from verified facts.

AI should not appear in the MVP pitch. Optional local models may eventually improve search or explain patterns, but the product must remain fast and useful without a model.

## Technical direction

The technical plan should follow the desktop-first product instead of forcing premature cross-platform reuse.

- **Desktop shell:** Tauri with a lightweight web interface.
- **Database:** encrypted SQLite with versioned migrations.
- **Core logic:** Rust where it materially helps parsing, deduplication, search, and safe file processing.
- **Interface:** one web UI that can power the desktop application and synthetic website demo.
- **Imports:** versioned adapters with deterministic fixtures and reproducible results.
- **Backups:** encrypted archives plus an open, documented unencrypted export chosen explicitly by the user.
- **Website:** static deployment with no financial backend.
- **Sync:** no server until user demand proves the need.
- **Android later:** Kotlin and Jetpack Compose, reusing the data model and parser fixtures; share native code only where it earns the integration cost.

The product should market outcomes—fast imports, instant search, offline use, and low effort—not Rust, SQLite, or Tauri.

## Services and infrastructure

The first release does not require a cloud backend.

| Need | Initial choice | Why |
| --- | --- | --- |
| Source, issues, and releases | GitHub | Public development, downloadable builds, fixtures, and release history. |
| Product website and docs | Cloudflare Pages or equivalent static hosting | Fast, inexpensive, and no financial-data backend. |
| Desktop distribution | GitHub Releases initially | Avoid unnecessary infrastructure while the product is young. |
| Product analytics | None by default | Privacy is part of the product; use voluntary interviews and opt-in aggregate feedback. |
| Error reporting | Local logs and previewable diagnostic bundles | Prevent accidental disclosure of transaction content. |
| Data storage | Encrypted SQLite on the user's computer | Keeps the local vault independent of Wyrcan infrastructure. |

Suggested domain layout:

```text
wyrcan.io              Wyrcan company and product directory
folyo.wyrcan.io        Folyo product website, demo, and documentation
downloads.wyrcan.io    Optional release mirror if GitHub becomes insufficient
app.folyo.wyrcan.io    Reserved for a future browser edition, not an MVP dependency
```

## What makes Folyo defensible

Local-first storage and a clean interface can be copied. The harder assets are:

- import profiles that work reliably across institutions and years;
- a large, sanitised test corpus for messy financial records;
- excellent duplicate, transfer, refund, and reversal detection;
- a review workflow that resolves uncertainty with very little effort;
- user trust earned through transparent behaviour and open formats;
- a simple product language that does not expose accounting complexity;
- a community able to maintain adapters without seeing anyone's private data.

The moat is accumulated reliability and trust, not automatic capture, AI, or implementation language.

## Competitive reality

- [Actual Budget](https://actualbudget.org/) offers a fast, local-first budgeting experience with optional self-hosted sync.
- [Firefly III](https://www.firefly-iii.org/) is a mature self-hosted finance manager with imports, rules, reports, tags, and double-entry accounting.
- [Sure](https://sure.am/) continues the open-source, self-hosted personal-finance direction of the archived Maybe project.
- [Monarch](https://www.monarch.com/) and [Lunch Money](https://lunchmoney.app/) provide polished aggregation, recurring detection, search, and broad financial views as hosted services.
- Many desktop finance tools can import statements, and many mobile apps track expenses automatically.

Folyo's opening is not an absent feature. It is a different product posture: useful without a daily budgeting method, private without self-hosting expertise, and understandable without becoming accounting software.

## Main risks and responses

### The product still feels like work

Do not ask users to categorise historical transactions during onboarding. Show useful results first, keep categories optional, and review only low-confidence exceptions.

### Imports are inconsistent

Use previews, saved mappings, versioned parsers, strong fixtures, and reversible imports. Never make users repair a bad import row by row.

### Desktop use is too infrequent

Design for high-value moments rather than engagement. Search, recurring-payment changes, yearly review, and remembered context can create durable value even with monthly usage.

### Users do not trust a new finance product

Offer sample data before real data, publish the schema and privacy architecture, require no account, work offline, and show network activity in the product.

### Scope expands into accounting software

Judge every feature by one question: does this help an ordinary person remember or understand their money with less effort? If it mainly adds configuration, defer it.

### Investments consume the roadmap

Allow a simple manual balance or contribution record later. Avoid live prices, trading, tax lots, exchange handling, and portfolio advice until the core product has strong retention.

## Validation before monetisation

The immediate goal is not revenue. It is evidence that Folyo improves someone's life without becoming maintenance work.

Build and test in this order:

1. Create a believable sample-data experience showing the intended money story.
2. Build one excellent CSV import path and test it on sanitised statements from several institutions.
3. Give the desktop alpha to a small group and watch the entire first session.
4. Learn which output creates the first genuine “that is useful” moment.
5. Measure whether users return with their next statement without being pushed.
6. Expand formats and institutions only after the core loop is understood.

Useful success signals include:

- a first meaningful result within five minutes of opening Folyo;
- no required category setup before that result;
- users can answer a real question they could not answer easily before;
- a new monthly import takes less than two minutes including review;
- users trust the result enough to keep several months of history;
- users return because they remembered Folyo could help, not because of a streak or notification;
- users request easier mobile capture after valuing the desktop history.

The most valuable qualitative statements would be things like:

- “I finally found that payment.”
- “I did not realise this subscription had increased.”
- “I can see where the change came from without maintaining a spreadsheet.”
- “This showed me the answer without judging me.”

## Business model later

Do not optimise the first version around monetisation. Keep the architecture compatible with a future open-core model:

- free local application and open data format;
- optional paid managed encrypted sync and backups;
- family or household collaboration;
- a polished desktop and mobile convenience bundle;
- maintained regional connectors where provider costs exist;
- sponsorship and support for organisations that deploy Folyo themselves;
- no advertising and no sale of financial data.

Folyo should eventually sell convenience, continuity, and maintenance—not access to a person's own history. Monetisation becomes relevant only after people repeatedly use and trust the local product.

## Launch sequence

1. **Product website and story demo:** explain the problem, demonstrate “what changed?” using synthetic data, and publish the privacy model.
2. **Desktop import prototype:** one excellent CSV flow, unified timeline, search, and monthly story.
3. **Desktop alpha:** more structured formats, deduplication, transfer detection, recurring payments, review inbox, and backup.
4. **Reliable global core:** institution profiles, localisation, currencies, parser contribution workflow, and open exports.
5. **Browser-local edition if justified:** reuse the interface with clearly explained storage and backup limits.
6. **Android companion:** automatic local capture and quick entry after users have proven they value the ledger.
7. **Optional sync and regional connectors:** only after users ask for continuity across devices.

## Repository discovery

### Suggested GitHub description

> A private, local-first financial memory that turns statements into a clear, searchable story of your money.

### GitHub topics

`personal-finance` `money-manager` `financial-journal` `local-first` `offline-first` `privacy` `open-source` `desktop` `tauri` `rust` `sqlite` `statement-import` `csv-import` `ofx` `qfx` `qif` `transaction-parser` `recurring-payments` `financial-search`

### Search phrases and README terms

- private personal finance desktop app
- local-first money manager
- offline financial journal
- bank statement analyser
- private transaction search
- CSV OFX QFX QIF importer
- open-source personal finance app
- recurring-payment detector
- no-cloud finance software
- simple alternative to budgeting apps

## Refined pitch

**Folyo by Wyrcan is a private financial memory for people who want clarity without turning money management into a daily chore. Drop in the statements you already have and Folyo builds a clean, searchable timeline, recognises transfers and recurring payments, and explains what changed—all on your computer, without an account. It starts as a desktop product with an open data format and a transparent website demo. Android capture, sync, and connected services come later, only after the private desktop experience is useful on its own.**

## The product test

Folyo is succeeding when it feels less like maintaining finance software and more like opening a reliable memory:

> I give it records I already have. It quietly organises them. When I need an answer, the answer is there.
