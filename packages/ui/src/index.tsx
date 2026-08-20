import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import {
  accountBalance,
  buildStory,
  formatMoney,
  monthKey,
  monthLabel,
  monthlySummaries,
  type Account,
  type StoryItem,
  type Transaction,
  type Workspace,
} from '@folyo/domain';
import { importCsv } from '@folyo/importers';

type FolyoWorkspaceProps = {
  initialWorkspace: Workspace;
  productSurface: 'website' | 'desktop';
  enableImport?: boolean;
};

const toneStyles: Record<StoryItem['tone'], CSSProperties> = {
  positive: { '--story-accent': '#4d8d78' } as CSSProperties,
  neutral: { '--story-accent': '#897a65' } as CSSProperties,
  attention: { '--story-accent': '#c16f49' } as CSSProperties,
};

function cloneWorkspace(workspace: Workspace): Workspace {
  return {
    accounts: workspace.accounts.map((account) => ({ ...account })),
    transactions: workspace.transactions.map((transaction) => ({ ...transaction })),
  };
}

function transactionLabel(transaction: Transaction): string {
  return transaction.displayMerchant || transaction.rawDescription;
}

function accountName(accounts: Account[], accountId: string): string {
  return accounts.find((account) => account.id === accountId)?.name ?? 'Unknown account';
}

export function FolyoWorkspace({
  initialWorkspace,
  productSurface,
  enableImport = false,
}: FolyoWorkspaceProps) {
  const [workspace, setWorkspace] = useState(() => cloneWorkspace(initialWorkspace));
  const [query, setQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stories = useMemo(() => buildStory(workspace), [workspace]);
  const summaries = useMemo(
    () => monthlySummaries(workspace.transactions),
    [workspace.transactions],
  );
  const latestSummary = summaries.at(-1);
  const availableMoney = useMemo(
    () =>
      workspace.accounts.reduce(
        (total, account) => total + accountBalance(account, workspace.transactions),
        0,
      ),
    [workspace],
  );
  const visibleTransactions = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();
    const filtered = workspace.transactions.filter((transaction) => {
      if (!normalisedQuery) return true;
      return [
        transactionLabel(transaction),
        transaction.category,
        transaction.kind,
        accountName(workspace.accounts, transaction.accountId),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalisedQuery);
    });
    return [...filtered].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 12);
  }, [query, workspace.accounts, workspace.transactions]);

  const selected = stories.find((story) => story.id === selectedStory);

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const result = importCsv(await file.text());
      const accountId = 'imported-account';
      const fingerprints = new Set(
        workspace.transactions.map(
          (transaction) =>
            `${transaction.accountId}|${transaction.occurredAt}|${transaction.amount}|${transaction.direction}|${transaction.rawDescription.toLowerCase()}`,
        ),
      );
      const fresh = result.transactions.filter((transaction) => {
        const fingerprint = `${transaction.accountId}|${transaction.occurredAt}|${transaction.amount}|${transaction.direction}|${transaction.rawDescription.toLowerCase()}`;
        if (fingerprints.has(fingerprint)) return false;
        fingerprints.add(fingerprint);
        return true;
      });
      setWorkspace((current) => ({
        accounts: current.accounts.some((account) => account.id === accountId)
          ? current.accounts
          : [
              ...current.accounts,
              {
                id: accountId,
                name: file.name.replace(/\.csv$/i, ''),
                kind: 'bank',
                currency: 'INR',
                openingBalance: 0,
              },
            ],
        transactions: [...current.transactions, ...fresh],
      }));
      setImportMessage(
        `${fresh.length} rows added from ${file.name}${result.errors.length ? ` · ${result.errors.length} rows need attention` : ''}.`,
      );
    } catch {
      setImportMessage('This file could not be read as CSV. Your existing workspace is unchanged.');
    }
  }

  const latestMonth = latestSummary?.month;
  const latestTransactions = latestMonth
    ? workspace.transactions.filter(
        (transaction) => monthKey(transaction.occurredAt) === latestMonth,
      )
    : [];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href={productSurface === 'website' ? '#top' : undefined}>
          <span className="brand-mark">F</span>
          <span>folyo</span>
        </a>
        <div className="topbar-meta">
          <span className="privacy-chip">
            <span className="status-dot" /> local workspace
          </span>
          <span className="surface-chip">
            {productSurface === 'website' ? 'sample demo' : 'desktop preview'}
          </span>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">A quieter way to understand money</p>
          <h1>Your money, remembered.</h1>
          <p className="hero-description">
            Folyo turns the records you already have into a clear, searchable story. See what
            changed without maintaining another daily habit.
          </p>
          <div className="hero-actions">
            {enableImport ? (
              <>
                <button
                  className="primary-button"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  Import a CSV <span aria-hidden="true">↗</span>
                </button>
                <input
                  ref={fileInputRef}
                  className="visually-hidden"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleImport}
                />
              </>
            ) : (
              <button
                className="primary-button"
                onClick={() =>
                  document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })
                }
                type="button"
              >
                Explore the demo <span aria-hidden="true">↓</span>
              </button>
            )}
            <span className="hero-note">No account · no cloud upload</span>
          </div>
          {importMessage && (
            <p className="import-message" role="status">
              {importMessage}
            </p>
          )}
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core">
            <span>₹</span>
            <small>clarity</small>
          </div>
          <span className="orbit-label label-one">remember</span>
          <span className="orbit-label label-two">understand</span>
          <span className="orbit-label label-three">decide</span>
        </div>
      </section>

      <section className="summary-grid" aria-label="Financial summary">
        <article className="metric-card metric-primary">
          <p className="metric-label">Available across accounts</p>
          <p className="metric-value">{formatMoney(availableMoney)}</p>
          <p className="metric-caption">A simple view of what is here now</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">
            Money in · {latestSummary ? monthLabel(latestSummary.month) : 'this period'}
          </p>
          <p className="metric-value">{formatMoney(latestSummary?.income ?? 0)}</p>
          <p className="metric-caption">Transfers stay out of the total</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">
            Money out · {latestSummary ? monthLabel(latestSummary.month) : 'this period'}
          </p>
          <p className="metric-value">{formatMoney(latestSummary?.spending ?? 0)}</p>
          <p className="metric-caption">
            {latestSummary?.transactionCount ?? 0} events in the latest month
          </p>
        </article>
      </section>

      <section className="story-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A factual monthly review</p>
            <h2>What changed?</h2>
          </div>
          <span className="section-period">
            {latestSummary ? monthLabel(latestSummary.month) : 'No period yet'}
          </span>
        </div>
        <div className="story-grid">
          {stories.map((story) => (
            <button
              className={`story-card ${selectedStory === story.id ? 'story-selected' : ''}`}
              key={story.id}
              onClick={() => setSelectedStory(selectedStory === story.id ? null : story.id)}
              style={toneStyles[story.tone]}
              type="button"
            >
              <span className="story-marker" />
              <span className="story-title">{story.title}</span>
              <span className="story-detail">{story.detail}</span>
              <span className="story-link">
                {story.transactionIds.length} supporting transactions{' '}
                <span aria-hidden="true">↗</span>
              </span>
            </button>
          ))}
        </div>
        {selected && (
          <div className="story-evidence">
            <div>
              <p className="eyebrow">Evidence</p>
              <h3>Transactions behind this observation</h3>
            </div>
            <div className="evidence-list">
              {workspace.transactions
                .filter((transaction) => selected.transactionIds.includes(transaction.id))
                .slice(0, 8)
                .map((transaction) => (
                  <div className="evidence-row" key={transaction.id}>
                    <span>{transactionLabel(transaction)}</span>
                    <span>
                      {formatMoney(transaction.amount, { currency: transaction.currency })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      <section className="timeline-section" id="timeline">
        <div className="section-heading timeline-heading">
          <div>
            <p className="eyebrow">Your searchable memory</p>
            <h2>Recent activity</h2>
          </div>
          <label className="search-field">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>
            <span className="visually-hidden">Search transactions</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search merchant, account..."
            />
          </label>
        </div>
        <div className="timeline-list">
          {visibleTransactions.map((transaction) => {
            const isIncome = transaction.direction === 'in';
            return (
              <div className="transaction-row" key={transaction.id}>
                <div className={`transaction-icon ${transaction.kind}`} aria-hidden="true">
                  {isIncome ? '↙' : transaction.kind === 'transfer' ? '⇄' : '↗'}
                </div>
                <div className="transaction-main">
                  <strong>{transactionLabel(transaction)}</strong>
                  <span>
                    {new Date(`${transaction.occurredAt}T00:00:00Z`).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}{' '}
                    · {accountName(workspace.accounts, transaction.accountId)}
                  </span>
                </div>
                <span className={`transaction-kind kind-${transaction.kind}`}>
                  {transaction.kind}
                </span>
                <strong className={`transaction-amount ${isIncome ? 'amount-in' : ''}`}>
                  {isIncome ? '+' : '-'}
                  {formatMoney(transaction.amount, { currency: transaction.currency })}
                </strong>
              </div>
            );
          })}
          {visibleTransactions.length === 0 && (
            <div className="empty-state">Nothing matched that search.</div>
          )}
        </div>
        <p className="timeline-footnote">
          Showing {visibleTransactions.length} of {workspace.transactions.length} transactions ·{' '}
          {latestTransactions.length} in the latest period
        </p>
      </section>

      <footer className="footer-note">
        <span>Folyo is descriptive, not judgemental.</span>
        <span>
          <span className="status-dot" /> Your workspace stays on this device in this preview.
        </span>
      </footer>
    </main>
  );
}
