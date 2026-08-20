export type AccountKind = 'bank' | 'card' | 'cash' | 'wallet';

export type TransactionKind = 'income' | 'spending' | 'transfer' | 'refund' | 'fee' | 'unknown';

export type TransactionSource = 'sample' | 'csv';

export type Account = {
  id: string;
  name: string;
  kind: AccountKind;
  currency: string;
  openingBalance: number;
};

export type Transaction = {
  id: string;
  accountId: string;
  occurredAt: string;
  amount: number;
  currency: string;
  direction: 'in' | 'out';
  rawDescription: string;
  displayMerchant?: string;
  category?: string;
  kind: TransactionKind;
  source: TransactionSource;
  sourceReference?: string;
  importBatchId?: string;
};

export type Workspace = {
  accounts: Account[];
  transactions: Transaction[];
};

export type MonthSummary = {
  month: string;
  income: number;
  spending: number;
  transfers: number;
  refunds: number;
  transactionCount: number;
};

export type StoryItem = {
  id: string;
  title: string;
  detail: string;
  tone: 'positive' | 'neutral' | 'attention';
  transactionIds: string[];
};

export type MoneyFormatterOptions = {
  currency?: string;
  locale?: string;
};

export function formatMoney(
  amount: number,
  { currency = 'INR', locale = 'en-IN' }: MoneyFormatterOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export function signedAmount(transaction: Transaction): number {
  return transaction.direction === 'in' ? transaction.amount : -transaction.amount;
}

export function transactionFingerprint(
  transaction: Pick<
    Transaction,
    'accountId' | 'occurredAt' | 'amount' | 'direction' | 'rawDescription'
  >,
): string {
  return [
    transaction.accountId,
    transaction.occurredAt,
    transaction.amount,
    transaction.direction,
    transaction.rawDescription.trim().toLowerCase(),
  ].join('|');
}

export function accountBalance(account: Account, transactions: Transaction[]): number {
  return (
    account.openingBalance +
    transactions
      .filter((item) => item.accountId === account.id)
      .reduce((total, item) => total + signedAmount(item), 0)
  );
}

export function totalAvailableMoney(workspace: Workspace): number {
  return workspace.accounts.reduce(
    (total, account) => total + accountBalance(account, workspace.transactions),
    0,
  );
}

export function monthKey(value: string): string {
  return value.slice(0, 7);
}

export function monthLabel(key: string, locale = 'en-IN'): string {
  const date = new Date(`${key}-01T00:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function monthlySummaries(transactions: Transaction[]): MonthSummary[] {
  const byMonth = new Map<string, MonthSummary>();

  for (const transaction of transactions) {
    const month = monthKey(transaction.occurredAt);
    const current = byMonth.get(month) ?? {
      month,
      income: 0,
      spending: 0,
      transfers: 0,
      refunds: 0,
      transactionCount: 0,
    };

    current.transactionCount += 1;
    if (transaction.kind === 'income') current.income += transaction.amount;
    if (transaction.kind === 'spending' || transaction.kind === 'fee')
      current.spending += transaction.amount;
    if (transaction.kind === 'transfer') current.transfers += transaction.amount;
    if (transaction.kind === 'refund') current.refunds += transaction.amount;
    byMonth.set(month, current);
  }

  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function buildStory(workspace: Workspace): StoryItem[] {
  const summaries = monthlySummaries(workspace.transactions);
  if (summaries.length === 0) {
    return [
      {
        id: 'empty',
        title: 'Your story starts here',
        detail: 'Import a statement or add a sample workspace to see meaningful changes.',
        tone: 'neutral',
        transactionIds: [],
      },
    ];
  }

  const latest = summaries.at(-1)!;
  const previous = summaries.at(-2);
  const story: StoryItem[] = [];

  if (previous) {
    const spendingChange = latest.spending - previous.spending;
    const direction = spendingChange >= 0 ? 'higher' : 'lower';
    story.push({
      id: 'spending-change',
      title: `Spending was ${formatMoney(Math.abs(spendingChange))} ${direction}`,
      detail: `${monthLabel(latest.month)} compared with ${monthLabel(previous.month)}. Transfers are excluded.`,
      tone: spendingChange > 0 ? 'attention' : 'positive',
      transactionIds: workspace.transactions
        .filter(
          (item) =>
            monthKey(item.occurredAt) === latest.month && ['spending', 'fee'].includes(item.kind),
        )
        .map((item) => item.id),
    });
  }

  const refunds = workspace.transactions.filter(
    (item) => monthKey(item.occurredAt) === latest.month && item.kind === 'refund',
  );
  if (refunds.length > 0) {
    story.push({
      id: 'refunds',
      title: `${refunds.length} refund${refunds.length === 1 ? '' : 's'} came back`,
      detail: `${formatMoney(refunds.reduce((total, item) => total + item.amount, 0))} was returned in ${monthLabel(latest.month)}.`,
      tone: 'positive',
      transactionIds: refunds.map((item) => item.id),
    });
  }

  const transferCount = workspace.transactions.filter(
    (item) => monthKey(item.occurredAt) === latest.month && item.kind === 'transfer',
  ).length;
  if (transferCount > 0) {
    story.push({
      id: 'transfers',
      title: `${transferCount} internal transfer${transferCount === 1 ? '' : 's'} kept your totals honest`,
      detail: 'Moving money between your own accounts is not counted as income or spending.',
      tone: 'neutral',
      transactionIds: workspace.transactions
        .filter((item) => monthKey(item.occurredAt) === latest.month && item.kind === 'transfer')
        .map((item) => item.id),
    });
  }

  if (story.length === 0) {
    story.push({
      id: 'first-month',
      title: `${monthLabel(latest.month)} is ready to explore`,
      detail: `${latest.transactionCount} transactions are in your local workspace.`,
      tone: 'neutral',
      transactionIds: workspace.transactions
        .filter((item) => monthKey(item.occurredAt) === latest.month)
        .map((item) => item.id),
    });
  }

  return story;
}
