import type { Transaction } from '@folyo/domain';
import { transactionFingerprint } from '@folyo/domain';

export type CsvMapping = {
  date: string;
  description: string;
  amount?: string;
  debit?: string;
  credit?: string;
};

export type CsvError = {
  row: number;
  message: string;
};

export type CsvImportResult = {
  headers: string[];
  previewRows: string[][];
  transactions: Transaction[];
  errors: CsvError[];
  mapping: CsvMapping;
};

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
      continue;
    }
    if (character === '"') {
      quoted = !quoted;
      continue;
    }
    if (character === ',' && !quoted) {
      row.push(field.trim());
      field = '';
      continue;
    }
    if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(field.trim());
      field = '';
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    field += character;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    if (row.some((value) => value.length > 0)) rows.push(row);
  }
  return rows;
}

function normaliseHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ');
}

function inferMapping(headers: string[]): CsvMapping {
  const find = (...names: string[]) =>
    headers.find((header) => names.includes(normaliseHeader(header)));
  return {
    date: find('date', 'transaction date', 'posted date') ?? headers[0] ?? '',
    description:
      find('description', 'merchant', 'details', 'narration', 'payee') ?? headers[1] ?? '',
    amount: find('amount', 'transaction amount', 'value'),
    debit: find('debit', 'withdrawal', 'money out'),
    credit: find('credit', 'deposit', 'money in'),
  };
}

function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[₹$€£,\s]/g, '').replace(/\(([^)]+)\)/, '-$1');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(Math.abs(parsed) * 100);
}

function parseDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.valueOf())) return null;
  return date.toISOString().slice(0, 10);
}

export function importCsv(
  text: string,
  accountId = 'imported-account',
  batchId = `csv-${Date.now()}`,
): CsvImportResult {
  const rows = parseRows(text);
  const headers = rows[0] ?? [];
  const data = rows.slice(1);
  const mapping = inferMapping(headers);
  const errors: CsvError[] = [];
  const transactions: Transaction[] = [];
  const indexOf = (header?: string) => (header ? headers.indexOf(header) : -1);
  const dateIndex = indexOf(mapping.date);
  const descriptionIndex = indexOf(mapping.description);
  const amountIndex = indexOf(mapping.amount);
  const debitIndex = indexOf(mapping.debit);
  const creditIndex = indexOf(mapping.credit);

  data.forEach((row, index) => {
    const rowNumber = index + 2;
    const date = parseDate(row[dateIndex] ?? '');
    const description = (row[descriptionIndex] ?? '').trim();
    const rawAmount = amountIndex >= 0 ? (row[amountIndex] ?? '') : '';
    const rawDebit = debitIndex >= 0 ? (row[debitIndex] ?? '') : '';
    const rawCredit = creditIndex >= 0 ? (row[creditIndex] ?? '') : '';
    const parsedAmount = amountIndex >= 0 ? parseAmount(rawAmount) : null;
    const debit = debitIndex >= 0 ? parseAmount(rawDebit) : null;
    const credit = creditIndex >= 0 ? parseAmount(rawCredit) : null;

    if (!date) {
      errors.push({ row: rowNumber, message: 'A valid date is required.' });
      return;
    }
    if (!description) {
      errors.push({ row: rowNumber, message: 'A description is required.' });
      return;
    }

    let amount = parsedAmount;
    let direction: Transaction['direction'] = 'out';
    if (credit !== null && credit > 0) {
      amount = credit;
      direction = 'in';
    } else if (debit !== null && debit > 0) {
      amount = debit;
      direction = 'out';
    } else if (amount !== null) {
      direction = /^-/.test(rawAmount.trim()) ? 'out' : 'in';
    }

    if (amount === null || amount === 0) {
      errors.push({ row: rowNumber, message: 'A non-zero amount is required.' });
      return;
    }

    const kind: Transaction['kind'] = direction === 'in' ? 'income' : 'spending';
    const item: Transaction = {
      id: `${batchId}-${index}`,
      accountId,
      occurredAt: date,
      amount,
      currency: 'INR',
      direction,
      rawDescription: description,
      displayMerchant: description,
      kind,
      source: 'csv',
      sourceReference: `${rowNumber}:${transactionFingerprint({ accountId, occurredAt: date, amount, direction, rawDescription: description })}`,
      importBatchId: batchId,
    };
    transactions.push(item);
  });

  return { headers, previewRows: data.slice(0, 5), transactions, errors, mapping };
}
