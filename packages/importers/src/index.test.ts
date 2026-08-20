import { describe, expect, it } from 'vitest';
import { importCsv } from './index';

describe('CSV importer', () => {
  it('imports debit and credit columns', () => {
    const result = importCsv(
      ['Date,Description,Debit,Credit', '2025-06-01,Salary,,125000', '2025-06-02,Coffee,180,'].join(
        '\n',
      ),
      'bank',
    );

    expect(result.errors).toHaveLength(0);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]).toMatchObject({
      amount: 12500000,
      direction: 'in',
      kind: 'income',
    });
    expect(result.transactions[1]).toMatchObject({
      amount: 18000,
      direction: 'out',
      kind: 'spending',
    });
  });

  it('reports invalid rows without discarding valid rows', () => {
    const result = importCsv(
      ['Date,Description,Amount', '2025-06-01,Valid,100', 'not-a-date,Invalid,200'].join('\n'),
      'bank',
    );

    expect(result.transactions).toHaveLength(1);
    expect(result.errors).toMatchObject([{ row: 3 }]);
  });
});
