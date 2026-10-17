"""Private reviewed-ticket register and one-time printable drawing batches.

Input is the documented normalized snapshot, NOT a raw Zeffy workbook. A human
must verify native payment IDs, ticket numbers, settlement and eligibility first.
This tool does not issue tickets, take payments, select winners or print paper.
"""
import argparse
import hashlib
import html
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from raffle_ops import reconcile

CAMPAIGN = 'e2d45f03-d16e-4e0c-816b-464489fc4782'


def connect(file):
    file = Path(file)
    file.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(file)
    db.row_factory = sqlite3.Row
    db.executescript('''
      CREATE TABLE IF NOT EXISTS snapshots (
        digest TEXT PRIMARY KEY, imported_at TEXT NOT NULL, source TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS entries (
        campaign TEXT NOT NULL, number TEXT NOT NULL, transaction_id TEXT NOT NULL,
        purchaser_ref TEXT NOT NULL, eligible INTEGER NOT NULL, reason TEXT NOT NULL,
        snapshot TEXT NOT NULL, batch TEXT, PRIMARY KEY(campaign,number));
      CREATE TABLE IF NOT EXISTS batches (
        id TEXT PRIMARY KEY, snapshot TEXT NOT NULL, created_at TEXT NOT NULL,
        file TEXT NOT NULL, sha256 TEXT NOT NULL, count INTEGER NOT NULL,
        checked_by TEXT, witnessed_by TEXT, checked_at TEXT);
      CREATE TABLE IF NOT EXISTS quarantine_log (
        campaign TEXT, number TEXT, snapshot TEXT, operator TEXT, witness TEXT,
        checked_at TEXT, PRIMARY KEY(campaign,number,snapshot));
    ''')
    return db


def now():
    return datetime.now(timezone.utc).isoformat()


def sync(db, document, campaign=CAMPAIGN):
    if not isinstance(document, dict) or document.get('campaign_id') != campaign:
        raise ValueError('Wrong campaign: use a complete single-campaign snapshot')
    source = document.get('source_reference')
    rows = document.get('transactions')
    if not isinstance(source, str) or not source.strip() or not isinstance(rows, list):
        raise ValueError('Source reference and complete transactions list required')
    if document.get('complete_snapshot_verified') is not True:
        raise ValueError('Operator must verify all-time complete snapshot coverage')
    if any(t.get('campaign_id') != campaign for t in rows):
        raise ValueError('Mixed or wrong campaign records refused')
    result = reconcile(rows)
    # Ambiguous native numbers cannot be represented as one owner. Never pick one.
    if any('collision' in o['reason'] or 'conflicting' in o['reason'] for o in result['orders']):
        raise ValueError('Conflicting ownership or snapshots: resolve native source first')
    digest = hashlib.sha256(json.dumps(document, sort_keys=True).encode()).hexdigest()
    with db:
        db.execute('INSERT OR IGNORE INTO snapshots VALUES(?,?,?)', (digest, now(), source))
        db.execute('UPDATE entries SET eligible=0, reason=?, snapshot=? WHERE campaign=?',
                   ('absent_from_current_snapshot', digest, campaign))
        for row in result['ledger']:
            existing = db.execute('SELECT * FROM entries WHERE campaign=? AND number=?',
                                  (campaign, row['ticket_number'])).fetchone()
            if existing and (existing['transaction_id'] != row['transaction_id'] or
                             existing['purchaser_ref'] != row['purchaser_ref']):
                raise ValueError('Existing native ticket ownership changed; manual investigation required')
            db.execute('''INSERT INTO entries VALUES(?,?,?,?,?,?,?,NULL)
              ON CONFLICT(campaign,number) DO UPDATE SET eligible=excluded.eligible,
                reason=excluded.reason, snapshot=excluded.snapshot''',
                       (campaign, row['ticket_number'], row['transaction_id'], row['purchaser_ref'],
                        int(row['drawing_inclusion']), row['reason'], digest))
    result['snapshot_sha256'] = digest
    result['physical_removal_required'] = unresolved_removals(db, campaign)
    return result


def document_for_batch(rows, batch, sample=False):
    esc = lambda text: html.escape(str(text), quote=True)
    label = 'SAMPLE ONLY - NOT VALID ENTRIES' if sample else 'KHG CONTROLLED DRAWING STUBS'
    stubs = ''.join('<article><strong>NEO Chosen Cash Raffle</strong><p class="number">Ticket ' +
                    esc(r['number']) + '</p><p>Purchaser: ' + esc(r['purchaser_ref']) +
                    '</p><p>Order: ' + esc(r['transaction_id']) + '</p><small>' + esc(label) +
                    ' | Batch ' + esc(batch) + '</small></article>' for r in rows)
    return '''<!doctype html><html lang="en"><meta charset="utf-8"><title>Drawing-stub batch</title>
<style>@page{size:letter;margin:.5in}*{box-sizing:border-box}body{font:11px Arial;color:#000}
header{margin-bottom:16px}h1{font-size:18px}.stubs{display:grid;grid-template-columns:3.5in 3.5in}
article{width:3.5in;height:1.75in;border:1px dashed #555;padding:10px;break-inside:avoid;overflow-wrap:anywhere}
article p{margin:6px 0}.number{font-size:20px;font-weight:bold}small{font-size:9px}
@media print{header{display:none}body{margin:0}.stubs{display:block}article{float:left}}
</style><header><h1>''' + esc(label) + '</h1><p>Batch ' + esc(batch) + ' | ' + str(len(rows)) + ''' stubs.
Print at 100% on US Letter. Print once; count and check every number with an independent witness.
The register reserves these numbers when this file is prepared. Preparing a file does not confirm paper was printed.
Do not print a second copy. Quarantine any later canceled/refunded/held tickets before the drawing.</p></header>
<section class="stubs">''' + stubs + '</section></html>'


def batch(db, output, campaign=CAMPAIGN, sample=False):
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    db.execute('BEGIN IMMEDIATE')
    created = []
    try:
        rows = [dict(r) for r in db.execute('''SELECT * FROM entries WHERE campaign=?
          AND eligible=1 AND batch IS NULL ORDER BY length(number),number''', (campaign,))]
        if not rows:
            raise ValueError('No new eligible tickets: repeat printing refused')
        if unresolved_removals(db, campaign):
            raise ValueError('Previously prepared stubs require physical quarantine; resolve before new batches')
        if len({r['snapshot'] for r in rows}) != 1:
            raise ValueError('Refresh one complete snapshot before preparing stubs')
        snapshot = rows[0]['snapshot']
        ident = hashlib.sha256((snapshot + ';'.join(r['number'] for r in rows)).encode()).hexdigest()[:16]
        file = output / (ident + '.html')
        manifest = output / (ident + '.json')
        content = document_for_batch(rows, ident, sample).encode()
        digest = hashlib.sha256(content).hexdigest()
        for target, data in [(file, content), (manifest, json.dumps({
            'batch': ident, 'campaign_id': campaign, 'snapshot_sha256': snapshot,
            'html_sha256': digest, 'count': len(rows), 'sample_only': sample,
            'ticket_numbers': [r['number'] for r in rows], 'physical_status': 'NOT CONFIRMED'
        }, indent=2).encode())]:
            with target.open('xb') as stream:
                created.append(target)
                stream.write(data)
        db.execute('INSERT INTO batches(id,snapshot,created_at,file,sha256,count) VALUES(?,?,?,?,?,?)',
                   (ident, snapshot, now(), str(file), digest, len(rows)))
        db.executemany('UPDATE entries SET batch=? WHERE campaign=? AND number=?',
                       [(ident, campaign, r['number']) for r in rows])
        db.commit()
        return {'batch': ident, 'count': len(rows), 'file': str(file), 'manifest': str(manifest)}
    except Exception:
        db.rollback()
        for file in created:
            file.unlink(missing_ok=True)
        raise


def confirm(db, ident, operator, witness):
    if not operator.strip() or not witness.strip() or operator.strip().casefold() == witness.strip().casefold():
        raise ValueError('Two different named human checkers required')
    with db:
        row = db.execute('SELECT * FROM batches WHERE id=?', (ident,)).fetchone()
        if not row or row['checked_at']:
            raise ValueError('Unknown or already confirmed batch')
        if hashlib.sha256(Path(row['file']).read_bytes()).hexdigest() != row['sha256']:
            raise ValueError('Prepared file changed: investigate before confirming paper')
        campaign = db.execute('SELECT campaign FROM entries WHERE batch=? LIMIT 1', (ident,)).fetchone()[0]
        if unresolved_removals(db, campaign):
            raise ValueError('Batch includes held entries; quarantine and resolve')
        db.execute('UPDATE batches SET checked_by=?,witnessed_by=?,checked_at=? WHERE id=?',
                   (operator.strip(), witness.strip(), now(), ident))


def unresolved_removals(db, campaign):
    return [dict(r) for r in db.execute('''SELECT e.* FROM entries e WHERE campaign=?
      AND eligible=0 AND batch IS NOT NULL AND NOT EXISTS (SELECT 1 FROM quarantine_log q
      WHERE q.campaign=e.campaign AND q.number=e.number AND q.snapshot=e.snapshot)''', (campaign,))]


def confirm_quarantine(db, numbers, operator, witness, campaign=CAMPAIGN):
    if not operator.strip() or not witness.strip() or operator.strip().casefold() == witness.strip().casefold():
        raise ValueError('Two different named human checkers required')
    pending = {r['number']: r for r in unresolved_removals(db, campaign)}
    if not numbers or len(numbers) != len(set(numbers)) or any(n not in pending for n in numbers):
        raise ValueError('Only listed held stubs requiring physical removal can be confirmed')
    with db:
        for number in numbers:
            row = pending[number]
            db.execute('INSERT INTO quarantine_log VALUES(?,?,?,?,?,?)',
                       (campaign, number, row['snapshot'], operator.strip(), witness.strip(), now()))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--database', type=Path, required=True, help='Restricted KHG folder outside public website')
    sub = parser.add_subparsers(dest='command', required=True)
    ingest = sub.add_parser('sync')
    ingest.add_argument('snapshot', type=Path)
    prepare = sub.add_parser('batch')
    prepare.add_argument('--output', type=Path, required=True)
    checked = sub.add_parser('confirm-physical')
    checked.add_argument('batch')
    checked.add_argument('--operator', required=True)
    checked.add_argument('--witness', required=True)
    removed = sub.add_parser('confirm-quarantine')
    removed.add_argument('numbers', nargs='+')
    removed.add_argument('--operator', required=True)
    removed.add_argument('--witness', required=True)
    args = parser.parse_args()
    database = connect(args.database)
    if args.command == 'sync':
        result = sync(database, json.loads(args.snapshot.read_text(encoding='utf-8-sig')))
        print(json.dumps({'summary': result['summary'], 'snapshot_sha256': result['snapshot_sha256'],
                          'held_orders': [r for r in result['orders'] if not r['drawing_inclusion']],
                          'physical_removal_required': result['physical_removal_required']}, indent=2))
    elif args.command == 'batch':
        print(json.dumps(batch(database, args.output), indent=2))
    elif args.command == 'confirm-physical':
        confirm(database, args.batch, args.operator, args.witness)
        print('Human physical checks recorded. No ticket or winner was created.')
    else:
        confirm_quarantine(database, args.numbers, args.operator, args.witness)
        print('Human physical quarantine recorded. Preserve the removed stubs and audit log.')
