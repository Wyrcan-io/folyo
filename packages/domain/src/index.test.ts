import { describe, expect, it } from 'vitest';
import { buildStory, monthlySummaries, transactionFingerprint } from './index';
import type { Transaction, Workspace } from './index';

const item = (overrides: Partial<Transaction>): Transaction => ({
  id: 'test',
  accountId: 'bank',
  occurredAt: '2025-06-01',
  amount: 10000,
  currency: 'INR',
  direction: 'out',
  rawDescription: 'Test merchant',
  kind: 'spending',
  source: 'sample',
  ...overrides,
});

describe('domain summaries', () => {
  it('keeps transfers out of income and spending', () => {
    const summaries = monthlySummaries([
      item({ id: 'income', direction: 'in', kind: 'income', amount: 100000 }),
      item({ id: 'spend', amount: 20000 }),
      item({ id: 'transfer', kind: 'transfer', amount: 50000 }),
    ]);

    expect(summaries[0]).toMatchObject({ income: 100000, spending: 20000, transfers: 50000 });
  });

  it('builds a useful story for a populated workspace', () => {
    const workspace: Workspace = {
      accounts: [],
      transactions: [
        item({ id: 'old', occurredAt: '2025-05-01', amount: 10000 }),
        item({ id: 'new', occurredAt: '2025-06-01', amount: 20000 }),
      ],
    };

    expect(buildStory(workspace)[0].title).toContain('higher');
  });

  it('creates stable fingerprints from source facts', () => {
    const first = transactionFingerprint(item({}));
    const second = transactionFingerprint(item({ id: 'different-id' }));
    expect(first).toBe(second);
  });
});
