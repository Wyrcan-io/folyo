# CSV importing

The first importer supports CSV files with either:

- `Date`, `Description`, `Debit`, and `Credit` columns; or
- `Date`, `Description`, and a signed `Amount` column.

The importer previews the first rows, infers common headers, validates each row, and retains errors with row numbers. The initial prototype uses INR as the default currency and does not yet support institution-specific profiles, PDF files, OFX, QFX, or QIF.

Use only synthetic or sanitised fixtures in the repository. Never commit an unredacted personal statement.
