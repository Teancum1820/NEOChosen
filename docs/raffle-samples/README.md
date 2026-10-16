# Fictional raffle rehearsal outputs

Every record here is fictional. None is a Zeffy transaction, issued ticket, or valid entry. These files are outside the website build. Do not import them into Zeffy or place their stubs in the drawing receptacle.

| Output | Meaning |
| --- | --- |
| `sample-transactions.json` | Normalized test input, not a claim about Zeffy's actual export schema |
| `sample-transaction-report.csv` | Three orders, $350 ticket revenue counted once per order |
| `sample-entry-ledger.csv` | 23 fictional numbers, one row per entry; two participant references |
| `sample-50-stubs.pdf` | $50, three stubs, numbers 1001-1003 |
| `sample-100-stubs.pdf` | $100, seven stubs, numbers 1004-1010 |
| `sample-multiple-stubs.pdf` | Two $50 bundles and one $100 bundle, 13 stubs, numbers 1011-1023 |
| `sample-all-stubs.pdf` | All three orders together, 23 stubs, numbers 1001-1023 |
| `sample-print-manifest.csv` | Counts, explicit numbers, file checksums; physical status remains NOT PRINTED |
| `sample-summary.json` | Reconciled count and revenue totals; launch authorization false |
| `sample-prize-calculation.json` | Separate fictional $10,000 eligible revenue illustration |
| `sample-confirmation.html` | Fictional $50 confirmation, with visible review warning |

The four PDFs are **alternative views of the same sample entries**. Do not combine the combined PDF with the individual PDFs in one rehearsal drawing. Every rectangle is the same 3.5 by 1.75 inches on US Letter paper. Print at 100%, cut on outlines, and compare the numbers against the ledger. No physical printer test has been performed.

For the one-prize-per-person rehearsal, SAMPLE-PERSON-A has two orders and 16 entries. Excluding that person leaves all seven entries owned by SAMPLE-PERSON-B. This is not a qualifying six-person draw.

Run `npm run test:raffle-ops` with Python 3.10 or later. To recreate PDFs, use Python with ReportLab installed and run `python scripts/raffle_ops.py sample` from the repository root. The sample CLI has no live-data import or production-print command. The standard-library reconciliation function is a reference validator, not a verified Zeffy export adapter. Production should prefer native e-ticket numbers and native detachable stubs after legal review.
