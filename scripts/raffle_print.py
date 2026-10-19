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
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from raffle_ops import aware_time, canonical_json, reconcile, revenue_accounting, strict_json

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
      CREATE TABLE IF NOT EXISTS snapshot_documents (
        digest TEXT PRIMARY KEY, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS campaign_state (
        campaign TEXT PRIMARY KEY, digest TEXT NOT NULL, source_as_of TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS order_history (
        snapshot TEXT NOT NULL, campaign TEXT NOT NULL, transaction_id TEXT NOT NULL,
        payload TEXT NOT NULL, PRIMARY KEY(snapshot,campaign,transaction_id));
      CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY, occurred_at TEXT NOT NULL, action TEXT NOT NULL,
        operator TEXT, witness TEXT, payload TEXT NOT NULL);
    ''')
    # Existing reservations never become printable again during migration.
    for table, name, declaration in [
        ('entries', 'physical_state', "TEXT NOT NULL DEFAULT 'unprepared'"),
        ('entries', 'custody_ref', 'TEXT'),
        ('batches', 'sample_only', 'INTEGER NOT NULL DEFAULT -1'),
        ('batches', 'manifest_sha256', 'TEXT'),
    ]:
        if name not in {r['name'] for r in db.execute('PRAGMA table_info(' + table + ')')}:
            db.execute('ALTER TABLE ' + table + ' ADD COLUMN ' + name + ' ' + declaration)
            if name == 'physical_state':
                db.execute("UPDATE entries SET physical_state='removal_required' WHERE batch IS NOT NULL")
    db.commit()
    return db


def now():
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def atomic(db):
    if db.in_transaction:
        raise ValueError('Commit or roll back the caller transaction first')
    db.execute('BEGIN IMMEDIATE')
    try:
        yield
        db.commit()
    except BaseException:
        db.rollback()
        raise


def audit(db, action, payload, operator=None, witness=None):
    db.execute('INSERT INTO audit_events(occurred_at,action,operator,witness,payload) VALUES(?,?,?,?,?)',
               (now(), action, operator, witness, canonical_json(payload)))


def validate_envelope(document, campaign):
    """Require a reviewed complete authoritative single-campaign USD snapshot.

    Metadata: campaign_id, source_reference, source_as_of and reviewed_at (explicit
    UTC offsets), reviewed_by, currency='USD', and these literal true attestations:
    complete_snapshot_verified, authoritative_snapshot_verified, native_ids_verified,
    person_references_verified, ticket_statuses_verified. Transactions are complete
    normalized orders, never appended historical events. A review follows capture;
    neither timestamp may be in the future. Attestations are human evidence, not
    verification of a populated native Zeffy export by this tool.
    Legacy normalized rows can omit ticket_status (treated as active); the
    ticket_statuses_verified attestation still requires human native-status review.
    """
    if (not isinstance(campaign, str) or not campaign or campaign.strip() != campaign
            or not isinstance(document, dict) or document.get('campaign_id') != campaign):
        raise ValueError('Wrong campaign: use a complete single-campaign snapshot')
    source = document.get('source_reference')
    rows = document.get('transactions')
    if not isinstance(source, str) or not source.strip() or not isinstance(rows, list):
        raise ValueError('Source reference and complete transactions list required')
    for field in ('complete_snapshot_verified', 'authoritative_snapshot_verified',
                  'native_ids_verified', 'person_references_verified', 'ticket_statuses_verified'):
        if document.get(field) is not True:
            raise ValueError('Reviewed authoritative envelope requires ' + field)
    if document.get('currency') != 'USD':
        raise ValueError('Explicit USD raffle-only amounts required')
    if not isinstance(document.get('reviewed_by'), str) or not document['reviewed_by'].strip():
        raise ValueError('Named snapshot reviewer required')
    as_of, reviewed = aware_time(document.get('source_as_of')), aware_time(document.get('reviewed_at'))
    if reviewed < as_of or reviewed > datetime.now(timezone.utc) or as_of > datetime.now(timezone.utc):
        raise ValueError('Review must follow source capture; future timestamps refused')
    if any(not isinstance(t, dict) or t.get('campaign_id') != campaign for t in rows):
        raise ValueError('Mixed or wrong campaign records refused')
    return rows


def sync(db, document, campaign=CAMPAIGN):
    rows = validate_envelope(document, campaign)
    # Canonicalize row order and exact duplicates; retain every conflicting version.
    normalized = dict(document, transactions=[json.loads(t) for t in sorted({canonical_json(t) for t in rows})])
    payload = canonical_json(normalized)
    digest = hashlib.sha256(payload.encode()).hexdigest()
    result = reconcile(rows)
    with atomic(db):
        current = db.execute('SELECT * FROM campaign_state WHERE campaign=?', (campaign,)).fetchone()
        if current and current['digest'] != digest:
            if aware_time(document['source_as_of']) <= aware_time(current['source_as_of']):
                raise ValueError('Stale or conflicting same-time snapshot refused; obtain a fresh authoritative review')
        holds = {}
        for row in result['ledger']:
            existing = db.execute('SELECT * FROM entries WHERE campaign=? AND number=?',
                                  (campaign, row['ticket_number'])).fetchone()
            if existing and (existing['transaction_id'] != row['transaction_id'] or
                             existing['purchaser_ref'] != row['purchaser_ref']):
                for txid in (existing['transaction_id'], row['transaction_id']):
                    holds.setdefault((campaign, txid), []).append('register_ownership_conflict')
        if holds:
            result = reconcile(rows, holds)
        db.execute('INSERT OR IGNORE INTO snapshots VALUES(?,?,?)', (digest, now(), document['source_reference']))
        db.execute('INSERT OR IGNORE INTO snapshot_documents VALUES(?,?)', (digest, payload))
        db.execute('UPDATE entries SET eligible=0, reason=?, snapshot=? WHERE campaign=?',
                   ('absent_from_current_snapshot', digest, campaign))
        by_number = {}
        for row in result['ledger']:
            by_number.setdefault(row['ticket_number'], []).append(row)
        for number, candidates in by_number.items():
            row = candidates[0]
            existing = db.execute('SELECT * FROM entries WHERE campaign=? AND number=?',
                                  (campaign, number)).fetchone()
            ambiguous = len(candidates) != 1 or 'conflicting_transaction_versions' in row['reason']
            if ambiguous:
                row = dict(row, drawing_inclusion=False, reason=row['reason'] + ';ambiguous_native_owner')
            if existing:
                # Identity never changes, including during conflicting refreshes.
                db.execute('UPDATE entries SET eligible=?,reason=?,snapshot=? WHERE campaign=? AND number=?',
                           (int(row['drawing_inclusion']), row['reason'], digest, campaign, number))
            elif not ambiguous:
                person = row['purchaser_ref']
                db.execute('''INSERT INTO entries(campaign,number,transaction_id,purchaser_ref,
                  eligible,reason,snapshot) VALUES(?,?,?,?,?,?,?)''',
                       (campaign, number, row['transaction_id'], person if isinstance(person, str) else '',
                        int(row['drawing_inclusion']), row['reason'], digest))
        db.execute("""UPDATE entries SET physical_state='removal_required'
          WHERE campaign=? AND eligible=0 AND physical_state IN ('prepared','confirmed')""", (campaign,))
        for order in result['orders']:
            db.execute('INSERT OR REPLACE INTO order_history VALUES(?,?,?,?)',
                       (digest, campaign, order['transaction_id'], canonical_json(order)))
        db.execute('INSERT OR REPLACE INTO campaign_state VALUES(?,?,?)',
                   (campaign, digest, document['source_as_of']))
        if not current or current['digest'] != digest:
            audit(db, 'snapshot_sync', {'digest': digest, 'campaign': campaign,
                  'summary': result['summary'], 'accounting': result['accounting']}, document['reviewed_by'])
        result['physical_removal_required'] = unresolved_removals(db, campaign)
    result['snapshot_sha256'] = digest
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
    if type(sample) is not bool:
        raise ValueError('Explicit boolean sample mode required')
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    if db.in_transaction:
        raise ValueError('Commit or roll back the caller transaction first')
    db.execute('BEGIN IMMEDIATE')
    created = []
    try:
        rows = [dict(r) for r in db.execute('''SELECT * FROM entries WHERE campaign=?
          AND eligible=1 AND batch IS NULL ORDER BY length(number),number''', (campaign,))]
        if not rows:
            raise ValueError('No new eligible tickets: repeat printing refused')
        prior_modes = {r[0] for r in db.execute('SELECT DISTINCT sample_only FROM batches')}
        if prior_modes - {int(sample)}:
            raise ValueError('Legacy, sample and live batches require separate registers')
        sample_flags = [(r['purchaser_ref'].startswith('SAMPLE-'),
                         r['transaction_id'].startswith('SAMPLE-'),
                         r['campaign'].startswith('SAMPLE-')) for r in rows]
        if (sample and not all(person and order for person, order, _ in sample_flags)
                or not sample and any(any(flags) for flags in sample_flags)):
            raise ValueError('Fictional sample identities and live printing must remain separate')
        if unresolved_removals(db, campaign):
            raise ValueError('Previously prepared stubs require physical quarantine; resolve before new batches')
        if len({r['snapshot'] for r in rows}) != 1:
            raise ValueError('Refresh one complete snapshot before preparing stubs')
        snapshot = rows[0]['snapshot']
        ident = hashlib.sha256(canonical_json([campaign, snapshot, sample, [r['number'] for r in rows]]).encode()).hexdigest()[:24]
        file = output / (ident + '.html')
        manifest = output / (ident + '.json')
        content = document_for_batch(rows, ident, sample).encode()
        digest = hashlib.sha256(content).hexdigest()
        manifest_content = json.dumps({
            'batch': ident, 'campaign_id': campaign, 'snapshot_sha256': snapshot,
            'html_sha256': digest, 'count': len(rows), 'sample_only': sample,
            'ticket_numbers': [r['number'] for r in rows], 'physical_status': 'NOT CONFIRMED'
        }, indent=2).encode()
        for target, data in [(file, content), (manifest, manifest_content)]:
            with target.open('xb') as stream:
                created.append(target)
                stream.write(data)
        db.execute('''INSERT INTO batches(id,snapshot,created_at,file,sha256,count,sample_only,manifest_sha256)
          VALUES(?,?,?,?,?,?,?,?)''',
                   (ident, snapshot, now(), str(file), digest, len(rows), int(sample),
                    hashlib.sha256(manifest_content).hexdigest()))
        db.executemany("UPDATE entries SET batch=?,physical_state='prepared' WHERE campaign=? AND number=?",
                       [(ident, campaign, r['number']) for r in rows])
        audit(db, 'batch_prepared', {'batch': ident, 'campaign': campaign,
              'numbers': [r['number'] for r in rows], 'sample_only': sample})
        db.commit()
        return {'batch': ident, 'count': len(rows), 'file': str(file), 'manifest': str(manifest)}
    except BaseException:
        db.rollback()
        for file in created:
            file.unlink(missing_ok=True)
        raise


def check_people(operator, witness):
    if (not isinstance(operator, str) or not isinstance(witness, str)
            or not operator.strip() or not witness.strip()
            or ' '.join(operator.split()).casefold() == ' '.join(witness.split()).casefold()):
        raise ValueError('Two different named human checkers required')


def confirm(db, ident, operator, witness, custody_ref=None, campaign=CAMPAIGN):
    check_people(operator, witness)
    if not isinstance(custody_ref, str) or not custody_ref.strip():
        raise ValueError('Sealed container or secure custody reference required')
    with atomic(db):
        row = db.execute('SELECT * FROM batches WHERE id=?', (ident,)).fetchone()
        if not row or row['checked_at']:
            raise ValueError('Unknown or already confirmed batch')
        campaigns = [r[0] for r in db.execute('SELECT DISTINCT campaign FROM entries WHERE batch=?', (ident,))]
        if campaigns != [campaign]:
            raise ValueError('Batch does not belong to the selected campaign')
        if hashlib.sha256(Path(row['file']).read_bytes()).hexdigest() != row['sha256']:
            raise ValueError('Prepared file changed: investigate before confirming paper')
        manifest = Path(row['file']).with_suffix('.json')
        if (row['sample_only'] not in (0, 1) or not row['manifest_sha256']
                or hashlib.sha256(manifest.read_bytes()).hexdigest() != row['manifest_sha256']):
            raise ValueError('Missing, legacy or changed manifest requires investigation')
        if unresolved_removals(db, campaign):
            raise ValueError('Batch includes held entries; quarantine and resolve')
        db.execute('UPDATE batches SET checked_by=?,witnessed_by=?,checked_at=? WHERE id=?',
                   (operator.strip(), witness.strip(), now(), ident))
        db.execute("""UPDATE entries SET physical_state='confirmed',custody_ref=?
          WHERE batch=? AND eligible=1 AND physical_state='prepared'""", (custody_ref.strip(), ident))
        audit(db, 'paper_confirmed', {'batch': ident, 'custody_ref': custody_ref.strip()}, operator.strip(), witness.strip())


def unresolved_removals(db, campaign):
    return [dict(r) for r in db.execute('''SELECT e.* FROM entries e WHERE campaign=?
      AND physical_state='removal_required' ORDER BY length(number),number''', (campaign,))]


def confirm_quarantine(db, numbers, operator, witness, campaign=CAMPAIGN, custody_ref=None):
    check_people(operator, witness)
    if not isinstance(custody_ref, str) or not custody_ref.strip():
        raise ValueError('Secure quarantine custody reference required')
    with atomic(db):
        pending = {r['number']: r for r in unresolved_removals(db, campaign)}
        if not numbers or len(numbers) != len(set(numbers)) or any(n not in pending for n in numbers):
            raise ValueError('Only listed stubs requiring physical removal can be confirmed')
        for number in numbers:
            row = pending[number]
            db.execute('INSERT OR IGNORE INTO quarantine_log VALUES(?,?,?,?,?,?)',
                       (campaign, number, row['snapshot'], operator.strip(), witness.strip(), now()))
            db.execute("UPDATE entries SET physical_state='quarantined',custody_ref=? WHERE campaign=? AND number=?",
                       (custody_ref.strip(), campaign, number))
        audit(db, 'paper_quarantined', {'campaign': campaign, 'numbers': numbers,
              'custody_ref': custody_ref.strip()}, operator.strip(), witness.strip())


def physical_exception(db, numbers, action, operator, witness, reason, custody_ref, campaign=CAMPAIGN):
    """Witnessed damage hold, permanent void, or return of the SAME intact stubs.

    No replacement is generated: a void keeps its native reservation forever.
    Missing paper cannot be declared recovered by this operation.
    """
    check_people(operator, witness)
    if action not in ('damage_hold', 'void', 'restore'):
        raise ValueError('Unknown physical exception')
    if any(not isinstance(v, str) or not v.strip() for v in (reason, custody_ref)):
        raise ValueError('Reason and secure custody reference required')
    if not numbers or any(not isinstance(n, str) for n in numbers) or len(set(numbers)) != len(numbers):
        raise ValueError('Unique explicit native numbers required')
    with atomic(db):
        for number in numbers:
            row = db.execute('SELECT * FROM entries WHERE campaign=? AND number=?', (campaign, number)).fetchone()
            if not row or not row['batch']:
                raise ValueError('Unknown or unprepared stub')
            state = row['physical_state']
            if action == 'damage_hold':
                if state not in ('prepared', 'confirmed'):
                    raise ValueError('Only prepared or confirmed stubs may enter a damage hold')
                target = 'removal_required'
            else:
                if state != 'quarantined':
                    raise ValueError('First confirm physical recovery and quarantine with a witness')
                target = 'void'
                if action == 'restore':
                    checked = db.execute('SELECT checked_at FROM batches WHERE id=?', (row['batch'],)).fetchone()
                    if not row['eligible'] or not checked or not checked[0]:
                        raise ValueError('Restoration requires current eligibility and a confirmed original batch')
                    target = 'confirmed'
            db.execute('UPDATE entries SET physical_state=?,custody_ref=? WHERE campaign=? AND number=?',
                       (target, custody_ref.strip(), campaign, number))
        audit(db, action, {'campaign': campaign, 'numbers': numbers, 'reason': reason.strip(),
              'custody_ref': custody_ref.strip()}, operator.strip(), witness.strip())


def register_report(db, campaign=CAMPAIGN):
    """Current view plus durable order history. Ready means reviewed physical custody."""
    # A read transaction keeps status and order totals on the same snapshot.
    with atomic(db):
        state = db.execute('SELECT * FROM campaign_state WHERE campaign=?', (campaign,)).fetchone()
        orders = [] if not state else [json.loads(r[0]) for r in db.execute(
            'SELECT payload FROM order_history WHERE campaign=? AND snapshot=? ORDER BY transaction_id',
            (campaign, state['digest']))]
        entries = [dict(r) for r in db.execute('SELECT * FROM entries WHERE campaign=? ORDER BY length(number),number', (campaign,))]
        ready = [r for r in entries if r['eligible'] and r['physical_state'] == 'confirmed' and r['custody_ref']]
        modes = {r[0] for r in db.execute('''SELECT DISTINCT b.sample_only FROM batches b
          JOIN entries e ON e.batch=b.id WHERE e.campaign=?''', (campaign,))}
        return {'campaign_id': campaign, 'snapshot_sha256': state['digest'] if state else None,
                'orders': orders, 'entries': entries, 'ready_entries': ready,
                'accounting': revenue_accounting(orders),
                'sample_only': True if modes == {1} else False if modes == {0} else None,
                'physical_removal_required': [r for r in entries if r['physical_state'] == 'removal_required'],
                'official_draw_authorized': False}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--database', type=Path, required=True, help='Restricted KHG folder outside public website')
    parser.add_argument('--campaign', default=CAMPAIGN,
                        help='Exact campaign ID for every operation (default: %(default)s)')
    sub = parser.add_subparsers(dest='command', required=True)
    ingest = sub.add_parser('sync')
    ingest.add_argument('snapshot', type=Path)
    prepare = sub.add_parser('batch')
    prepare.add_argument('--output', type=Path, required=True)
    prepare.add_argument('--sample', action='store_true')
    checked = sub.add_parser('confirm-physical')
    checked.add_argument('batch')
    checked.add_argument('--operator', required=True)
    checked.add_argument('--witness', required=True)
    checked.add_argument('--custody-ref', required=True)
    removed = sub.add_parser('confirm-quarantine')
    removed.add_argument('numbers', nargs='+')
    removed.add_argument('--operator', required=True)
    removed.add_argument('--witness', required=True)
    removed.add_argument('--custody-ref', required=True)
    exception = sub.add_parser('physical-exception')
    exception.add_argument('action', choices=['damage_hold', 'void', 'restore'])
    exception.add_argument('numbers', nargs='+')
    exception.add_argument('--operator', required=True)
    exception.add_argument('--witness', required=True)
    exception.add_argument('--reason', required=True)
    exception.add_argument('--custody-ref', required=True)
    sub.add_parser('report')
    args = parser.parse_args()
    if not args.campaign or args.campaign.strip() != args.campaign:
        parser.error('--campaign requires a nonempty campaign ID without surrounding whitespace')
    database = connect(args.database)
    if args.command == 'sync':
        result = sync(database, strict_json(args.snapshot.read_text(encoding='utf-8-sig')), args.campaign)
        print(json.dumps({'summary': result['summary'], 'accounting': result['accounting'], 'snapshot_sha256': result['snapshot_sha256'],
                          'held_orders': [r for r in result['orders'] if not r['drawing_inclusion']],
                          'physical_removal_required': result['physical_removal_required']}, indent=2))
    elif args.command == 'batch':
        print(json.dumps(batch(database, args.output, campaign=args.campaign, sample=args.sample), indent=2))
    elif args.command == 'confirm-physical':
        confirm(database, args.batch, args.operator, args.witness, args.custody_ref, campaign=args.campaign)
        print('Human physical checks recorded. No ticket or winner was created.')
    elif args.command == 'confirm-quarantine':
        confirm_quarantine(database, args.numbers, args.operator, args.witness,
                           campaign=args.campaign, custody_ref=args.custody_ref)
        print('Human physical quarantine recorded. Preserve the removed stubs and audit log.')
    elif args.command == 'physical-exception':
        physical_exception(database, args.numbers, args.action, args.operator, args.witness,
                           args.reason, args.custody_ref, campaign=args.campaign)
        print('Witnessed physical exception recorded. No replacement was generated.')
    else:
        print(json.dumps(register_report(database, args.campaign), indent=2))
    database.close()
