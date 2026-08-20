# Folyo

Folyo is a private financial memory that turns the records you already have into a clear, searchable story of your money.

The project is currently an early desktop-first product demonstration. It includes a synthetic-data website demo and a local CSV import flow in the desktop application. It does not yet provide a production encrypted vault, bank connections, sync, or mobile capture.

## Run locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer
- Rust and Cargo for the desktop application

Install dependencies:

```bash
npm install
```

Run the website:

```bash
npm run dev:site
```

Build the website:

```bash
npm run build:site
```

Run the desktop frontend in a browser:

```bash
npm run dev:desktop
```

Run the Tauri desktop shell:

```bash
npm run tauri:dev
```

Run checks:

```bash
npm run typecheck
npm test
npm run format:check
```

## Privacy boundary

The public website uses synthetic data only. The desktop CSV flow reads files locally and does not upload them. This prototype is not yet the production encrypted local vault described in the implementation plan.

See [idea.md](./idea.md) for the product direction and [INITIAL_PUSH_PLAN.md](./INITIAL_PUSH_PLAN.md) for the implementation scope.
