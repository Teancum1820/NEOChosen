"""Offline electronic drawing candidate: review and signed approval required.

No provider calls, notifications, payments, or official drawing authorization.
Selection is authorized only by human approval, never by this program.
Use rehearse for synthetic data; see the operations guide before official use.
"""
import argparse
import copy
import csv
import hashlib
import json
import os
import secrets
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

PRIZES = (20, 6, 5, 4, 3, 2)
STATUSES = {'active', 'canceled', 'voided', 'refunded', 'invalid', 'ineligible'}
CAMPAIGN = 'e2d45f03-d16e-4e0c-816b-464489fc4782'
DRAW_AT = datetime(2026, 11, 15, 23, 0, tzinfo=timezone.utc)


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False)


def digest(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()


def load(path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError('Duplicate JSON key')
            result[key] = value
        return result
    return json.loads(Path(path).read_text(encoding='utf-8-sig'), object_pairs_hook=unique,
                      parse_constant=lambda _: (_ for _ in ()).throw(ValueError('Non-finite JSON')))


def identifier(value):
    return isinstance(value, str) and value == value.strip() and 0 < len(value) <= 150 and all(
        not unicodedata.category(char).startswith('C') for char in value)


def validate(snapshot):
    if not isinstance(snapshot, dict) or type(snapshot.get('schema_version')) is not int or snapshot['schema_version'] != 1:
        raise ValueError('Expected normalized schema_version 1')
    for key in ['campaign_id', 'source_sha256', 'reviewed_by', 'review_reference']:
        if not identifier(snapshot.get(key)):
            raise ValueError('Missing ' + key)
    if len(snapshot['source_sha256']) != 64 or any(c not in '0123456789abcdef' for c in snapshot['source_sha256']):
        raise ValueError('Invalid source SHA256')
    # These are human attestations, never inferred from emails or names.
    for key in ['complete_export_reviewed', 'identity_reconciliation_approved', 'statuses_reviewed']:
        if snapshot.get(key) is not True:
            raise ValueError('Review required: ' + key)
    tickets = snapshot.get('tickets')
    if not isinstance(tickets, list) or not tickets:
        raise ValueError('Nonempty ticket list required')
    seen, eligible, excluded, pending, orders = set(), [], [], [], {}
    for row in tickets:
        if not isinstance(row, dict):
            raise ValueError('Ticket row must be an object')
        for key in ['ticket_id', 'order_id', 'person_id']:
            if not identifier(row.get(key)):
                raise ValueError('Missing or invalid ' + key)
        if row['ticket_id'] in seen:
            raise ValueError('Duplicate ticket identifier: ' + row['ticket_id'])
        seen.add(row['ticket_id'])
        if not isinstance(row.get('status'), str) or row['status'] not in STATUSES:
            raise ValueError('Unmapped ticket status')
        if not isinstance(row.get('identity_status'), str) or row['identity_status'] not in {'verified', 'pending'}:
            raise ValueError('Explicit identity review status required')
        if row['identity_status'] == 'pending':
            pending.append(row['ticket_id'])
        previous = orders.setdefault(row['order_id'], row['person_id'])
        if previous != row['person_id']:
            raise ValueError('Conflicting person identity within an order')
        (eligible if row['status'] == 'active' else excluded).append(copy.deepcopy(row))
    if pending:
        raise ValueError('Human identity review required for ticket identifiers: ' + ', '.join(pending))
    return {'eligible': sorted(eligible, key=lambda x: x['ticket_id']),
            'excluded': excluded, 'unique_people': len({r['person_id'] for r in eligible}),
            'snapshot_sha256': digest(snapshot)}


def file_sha256(path):
    """Hash exact original bytes, without rewriting or decoding the source."""
    hasher = hashlib.sha256()
    with Path(path).open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            hasher.update(chunk)
    return hasher.hexdigest()


def preflight(snapshot, source_path, campaign_id):
    """Read-only integrity checks; reviewer attestations remain human decisions."""
    result = validate(snapshot)
    if not identifier(campaign_id) or snapshot['campaign_id'] != campaign_id:
        raise ValueError('Campaign does not match the independently supplied expected campaign')
    if file_sha256(source_path) != snapshot['source_sha256']:
        raise ValueError('Original source SHA256 does not match the reviewed snapshot')
    if result['unique_people'] < 6:
        raise ValueError('At least six eligible verified people required')
    return {'eligible_tickets': len(result['eligible']), 'excluded_tickets': len(result['excluded']),
            'unique_people': result['unique_people'], 'snapshot_sha256': result['snapshot_sha256'],
            'source_sha256_verified': True, 'campaign_id_verified': True,
            'official_draw_authorized': False}


def rehearse(snapshot):
    # This rehearsal entry point rejects real-campaign records, even on import.
    if not isinstance(snapshot, dict) or snapshot.get('campaign_id') != 'SYNTHETIC-NO-PRIZES' or snapshot.get('synthetic') is not True:
        raise ValueError('Only synthetic rehearsal selection is enabled; official use requires separate review')
    return _select(snapshot, rehearsal=True)


def _select(snapshot, *, rehearsal, event_sink=None):
    # Private shared mechanism. The public official path must pass approval_check.
    result = validate(snapshot)
    pool = result['eligible']
    if result['unique_people'] < 6:
        raise ValueError('At least six eligible verified people required before any selection')
    selections, previous = [], result['snapshot_sha256']
    for rank, percentage in enumerate(PRIZES, 1):
        if not pool:
            raise ValueError('Eligible participants exhausted')
        index = secrets.randbelow(len(pool))
        chosen = pool[index]
        removed = [r['ticket_id'] for r in pool if r['person_id'] == chosen['person_id']]
        event = {'rank': rank, 'percentage': percentage, 'pool_size': len(pool),
                 'pool_sha256': digest(pool), 'selected_index': index,
                 'ticket_id': chosen['ticket_id'], 'order_id': chosen['order_id'],
                 'person_id': chosen['person_id'], 'removed_ticket_ids': removed,
                 'timestamp_utc': datetime.now(timezone.utc).isoformat(), 'previous_event_sha256': previous}
        previous = digest(event)
        event['event_sha256'] = previous
        selections.append(event)
        if event_sink is not None:
            event_sink(event)
        pool = [r for r in pool if r['person_id'] != chosen['person_id']]
    return {'rehearsal_only': rehearsal, 'official_draw_authorized': False,
            **({'human_approval_required': True} if not rehearsal else {}),
            'randomness': 'Python secrets.randbelow: OS cryptographic randomness, rejection sampling',
            'source_sha256': snapshot['source_sha256'], 'snapshot_sha256': result['snapshot_sha256'],
            'excluded_ticket_ids': [r['ticket_id'] for r in result['excluded']],
            'selections': selections, 'final_event_sha256': previous}


def approval_check(snapshot, approval, source_path, operator):
    """Verify recorded gates and exact reviewed inputs, not human signatures."""
    result = preflight(snapshot, source_path, CAMPAIGN)
    if snapshot.get('synthetic') is not False:
        raise ValueError('Official snapshot must explicitly declare synthetic: false')
    if not isinstance(approval, dict) or type(approval.get('schema_version')) is not int or approval['schema_version'] != 1:
        raise ValueError('Expected approval schema_version 1')
    bindings = {'campaign_id': CAMPAIGN, 'snapshot_sha256': result['snapshot_sha256'],
                'source_sha256': snapshot['source_sha256'], 'tool_sha256': file_sha256(__file__),
                'prize_percentages': list(PRIZES), 'drawing_at_utc': DRAW_AT.isoformat()}
    for key, value in bindings.items():
        if canonical(approval.get(key)) != canonical(value):
            raise ValueError('Approval binding mismatch: ' + key)
    if not identifier(operator) or approval.get('operator') != operator:
        raise ValueError('Named operator must match the signed approval record')
    for key in ['official_use_approved', 'cutoff_verified', 'private_storage_approved',
                'native_mapping_approved', 'identity_review_approved', 'accounting_approved',
                'recovery_and_no_rerun_approved']:
        if approval.get(key) is not True:
            raise ValueError('Human approval required: ' + key)
    references = approval.get('signed_references')
    for role in ['organizer', 'legal_organizational', 'technical_reviewer', 'reconciliation_lead',
                 'independent_checker', 'operator', 'witness']:
        if not isinstance(references, dict) or not identifier(references.get(role)):
            raise ValueError('Signed approval reference required: ' + role)
    return {**result, 'approval_sha256': digest(approval), 'tool_sha256': bindings['tool_sha256'],
            'human_signatures_authenticated': False, 'selection_performed': False}


def official_draw(snapshot, approval, source_path, operator, custody_dir):
    """Human-invoked only after independent approval; never run for this task.

    The permanent campaign lock is claimed before randomness. Any partial result
    must be preserved and escalated; there is no force/restart/unlock option.
    """
    checks = approval_check(snapshot, approval, source_path, operator)
    if datetime.now(timezone.utc) < DRAW_AT:
        raise ValueError('Official selection cannot begin before November 15, 2026 at 6 PM Eastern')
    folder = Path(custody_dir).resolve()
    repo = Path(__file__).resolve().parents[1]
    if folder == repo or repo in folder.parents:
        raise ValueError('Official custody directory must be outside the repository and public website')
    folder.mkdir(parents=True, exist_ok=True)
    # Organizer must designate ONE custody directory and independently keep its lock.
    lock = folder / (CAMPAIGN + '.started.json')
    with lock.open('x', encoding='utf-8') as handle:
        json.dump({'campaign_id': CAMPAIGN, 'operator': operator,
                   'started_at_utc': datetime.now(timezone.utc).isoformat(), **checks}, handle, indent=2)
        handle.flush()
        os.fsync(handle.fileno())
    # Originals and approval are preserved before the first selection.
    for name, value in [('approved-snapshot.json', snapshot), ('approval.json', approval)]:
        with (folder / name).open('x', encoding='utf-8') as handle:
            json.dump(value, handle, indent=2)
    with (folder / 'selection-events.jsonl').open('x', encoding='utf-8') as transcript:
        def record_event(event):
            transcript.write(canonical(event) + '\n')
            transcript.flush()
            os.fsync(transcript.fileno())
        result = _select(snapshot, rehearsal=False, event_sink=record_event)
    result['approval_sha256'] = checks['approval_sha256']
    result['tool_sha256'] = checks['tool_sha256']
    # Authorization remains a human decision, never a program-generated claim.
    with (folder / 'official-audit.json').open('x', encoding='utf-8') as handle:
        json.dump(result, handle, indent=2)
    with (folder / 'official-results.csv').open('x', newline='', encoding='utf-8') as handle:
        writer = csv.writer(handle)
        writer.writerow(['rank', 'percentage', 'ticket_id', 'person_id', 'removed_count'])
        for row in result['selections']:
            writer.writerow([row['rank'], row['percentage'], "'" + row['ticket_id'],
                             "'" + row['person_id'], len(row['removed_ticket_ids'])])
    return {'selection_performed': True, 'record_directory': str(folder),
            'final_event_sha256': result['final_event_sha256'],
            'human_result_verification_required': True}


def verify_rehearsal(snapshot, audit):
    """Check recorded pool transitions without selecting or changing any winner.

    A self-consistent transcript cannot prove randomness or prevent an operator
    from replacing the entire transcript. Independent custody is still required.
    """
    if not isinstance(snapshot, dict) or snapshot.get('campaign_id') != 'SYNTHETIC-NO-PRIZES' or snapshot.get('synthetic') is not True:
        raise ValueError('Only synthetic rehearsal audit verification is enabled')
    return _verify_transcript(snapshot, audit, rehearsal=True)


def verify_official(snapshot, audit, approval, source_path, operator):
    checks = approval_check(snapshot, approval, source_path, operator)
    return _verify_transcript(snapshot, audit, rehearsal=False,
                              approval_sha256=checks['approval_sha256'], tool_sha256=checks['tool_sha256'])


def _verify_transcript(snapshot, audit, *, rehearsal, approval_sha256=None, tool_sha256=None):
    result = validate(snapshot)
    if result['unique_people'] < 6:
        raise ValueError('At least six eligible verified people required')
    if not isinstance(audit, dict) or audit.get('rehearsal_only') is not rehearsal or audit.get('official_draw_authorized') is not False:
        raise ValueError('Audit type or authorization metadata mismatch')
    metadata = {
        'randomness': 'Python secrets.randbelow: OS cryptographic randomness, rejection sampling',
        'source_sha256': snapshot['source_sha256'], 'snapshot_sha256': result['snapshot_sha256'],
        'excluded_ticket_ids': [row['ticket_id'] for row in result['excluded']],
    }
    for key, value in metadata.items():
        if audit.get(key) != value:
            raise ValueError('Audit metadata mismatch: ' + key)
    events = audit.get('selections')
    if not isinstance(events, list) or len(events) != len(PRIZES):
        raise ValueError('Exactly six recorded selections required')
    pool, previous, last_time = result['eligible'], result['snapshot_sha256'], None
    for rank, (percentage, event) in enumerate(zip(PRIZES, events), 1):
        if not isinstance(event, dict):
            raise ValueError('Audit event must be an object')
        index = event.get('selected_index')
        if type(index) is not int or not 0 <= index < len(pool):
            raise ValueError('Invalid recorded selection index')
        stamp = event.get('timestamp_utc')
        if not isinstance(stamp, str):
            raise ValueError('Missing audit timestamp')
        instant = datetime.fromisoformat(stamp)
        if instant.utcoffset() != timezone.utc.utcoffset(instant) or (last_time is not None and instant < last_time):
            raise ValueError('Audit timestamps must be chronological UTC values')
        if not rehearsal and instant < DRAW_AT:
            raise ValueError('Official event timestamp precedes the approved drawing time')
        last_time = instant
        chosen = pool[index]
        expected = {
            'rank': rank, 'percentage': percentage, 'pool_size': len(pool), 'pool_sha256': digest(pool),
            'selected_index': index, 'ticket_id': chosen['ticket_id'], 'order_id': chosen['order_id'],
            'person_id': chosen['person_id'],
            'removed_ticket_ids': [row['ticket_id'] for row in pool if row['person_id'] == chosen['person_id']],
            'timestamp_utc': stamp, 'previous_event_sha256': previous,
        }
        previous = digest(expected)
        expected['event_sha256'] = previous
        # Canonical comparison also rejects bool/float substitutions for integer fields.
        if canonical(event) != canonical(expected):
            raise ValueError('Audit pool, winner, removal or hash mismatch at rank ' + str(rank))
        pool = [row for row in pool if row['person_id'] != chosen['person_id']]
    expected_audit = {'rehearsal_only': rehearsal, 'official_draw_authorized': False, **metadata,
                      **({'human_approval_required': True, 'approval_sha256': approval_sha256,
                          'tool_sha256': tool_sha256} if not rehearsal else {}),
                      'selections': events, 'final_event_sha256': previous}
    if canonical(audit) != canonical(expected_audit):
        raise ValueError('Audit final digest or envelope mismatch')
    return {'verified_selections': len(events), 'unique_winners': len({e['person_id'] for e in events}),
            'snapshot_sha256': result['snapshot_sha256'], 'final_event_sha256': previous,
            'official_draw_authorized': False}


def synthetic():
    tickets = []
    # Person A has three plus seven entries in distinct orders.
    for order, person, count in [('A1', 'A', 3), ('A2', 'A', 7), ('B', 'B', 1),
                                  ('C', 'C', 3), ('D', 'D', 7), ('E', 'E', 1), ('F', 'F', 1)]:
        for index in range(count):
            tickets.append({'ticket_id': f'{order}-{index+1}', 'order_id': order,
                            'person_id': person, 'status': 'active', 'identity_status': 'verified'})
    tickets.append({'ticket_id': 'VOID-1', 'order_id': 'VOID', 'person_id': 'VOID',
                    'status': 'refunded', 'identity_status': 'verified'})
    return {'schema_version': 1, 'campaign_id': 'SYNTHETIC-NO-PRIZES', 'synthetic': True,
            'source_sha256': digest(tickets), 'reviewed_by': 'SYNTHETIC TEST',
            'review_reference': 'Fictional fixture; no real people or orders',
            'complete_export_reviewed': True, 'identity_reconciliation_approved': True,
            'statuses_reviewed': True, 'tickets': tickets}


def write_results(folder, snapshot, result):
    # Exclusive directory prevents accidentally replacing a prior rehearsal.
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=False)
    (folder / 'synthetic-input.json').write_text(json.dumps(snapshot, indent=2), encoding='utf-8')
    (folder / 'audit.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    with (folder / 'results.csv').open('x', newline='', encoding='utf-8') as handle:
        writer = csv.writer(handle)
        writer.writerow(['REHEARSAL ONLY', 'rank', 'percentage', 'ticket_id', 'person_id', 'removed_count'])
        for row in result['selections']:
            writer.writerow(['NO PRIZES', row['rank'], row['percentage'],
                             "'" + row['ticket_id'], "'" + row['person_id'], len(row['removed_ticket_ids'])])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('validate').add_argument('snapshot', type=Path)
    sub.add_parser('rehearse').add_argument('--output', type=Path, required=True)
    check = sub.add_parser('preflight', help='Read-only source and campaign integrity checks; no drawing')
    check.add_argument('snapshot', type=Path)
    check.add_argument('--source', type=Path, required=True)
    check.add_argument('--campaign', required=True)
    audit_check = sub.add_parser('verify-rehearsal', help='Verify a synthetic audit without random selection')
    audit_check.add_argument('snapshot', type=Path)
    audit_check.add_argument('audit', type=Path)
    for command in ['check-approval', 'draw-approved', 'verify-official']:
        release = sub.add_parser(command, help='Human approval required; see operations guide')
        release.add_argument('snapshot', type=Path)
        release.add_argument('--approval', type=Path, required=True)
        release.add_argument('--source', type=Path, required=True)
        release.add_argument('--operator', required=True)
        if command == 'draw-approved':
            release.add_argument('--custody-dir', type=Path, required=True)
        if command == 'verify-official':
            release.add_argument('--audit', type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == 'validate':
            result = validate(load(args.snapshot))
            print(json.dumps({'eligible_tickets': len(result['eligible']), 'excluded_tickets': len(result['excluded']),
                              'unique_people': result['unique_people'], 'snapshot_sha256': result['snapshot_sha256'],
                              'source_sha256_verified': False, 'official_draw_authorized': False}))
        elif args.command == 'preflight':
            print(json.dumps(preflight(load(args.snapshot), args.source, args.campaign)))
        elif args.command == 'verify-rehearsal':
            print(json.dumps(verify_rehearsal(load(args.snapshot), load(args.audit))))
        elif args.command in {'check-approval', 'draw-approved', 'verify-official'}:
            snapshot, approval = load(args.snapshot), load(args.approval)
            if args.command == 'check-approval':
                print(json.dumps(approval_check(snapshot, approval, args.source, args.operator)))
            elif args.command == 'verify-official':
                print(json.dumps(verify_official(snapshot, load(args.audit), approval, args.source, args.operator)))
            else:
                print(json.dumps(official_draw(snapshot, approval, args.source, args.operator, args.custody_dir)))
        else:
            snapshot = synthetic()
            result = rehearse(snapshot)
            write_results(args.output, snapshot, result)
            print('Synthetic rehearsal complete: six distinct people; no prize allocation. ' + str(args.output))
    except (ValueError, OSError, RuntimeError) as error:
        if args.command == 'draw-approved':
            parser.exit(2, 'Drawing stopped. Preserve any custody/start/transcript files; do not rerun or remove the lock. '
                        'Escalate under the approved recovery procedure. Error: ' + str(error) + '\n')
        parser.error(str(error))
    except KeyboardInterrupt:
        if args.command == 'draw-approved':
            parser.exit(130, 'Drawing interrupted. Preserve custody/start/transcript files; do not rerun or remove the lock.\n')
        raise


if __name__ == '__main__':
    main()
