# Data model

The initial canonical model consists of accounts, transactions, workspaces, and import batches. Amounts are represented as integer minor units. Source descriptions and import identifiers are retained so normalisation can remain explainable and reversible.

Transfers are transactions in the timeline but are excluded from income and spending summaries. This distinction is a core Folyo invariant.
