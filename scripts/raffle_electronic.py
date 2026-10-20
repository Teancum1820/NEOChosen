"""Offline electronic drawing candidate. CLI rehearses SYNTHETIC data only.

No provider calls, notifications, payments, or official drawing authorization.
Use validate for a privately reviewed normalized export; see the operations guide.
"""
import argparse
import copy
import csv
import hashlib
import json
import secrets
from datetime import datetime, timezone
from pathlib import Path

PRIZES = (20, 6, 5, 4, 3, 2)
STATUSES = {'active', 'canceled', 'voided', 'refunded', 'invalid', 'ineligible'}


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
        ord(char) >= 32 for char in value)


def validate(snapshot):
    if not isinstance(snapshot, dict) or snapshot.get('schema_version') != 1:
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
        if row.get('status') not in STATUSES:
            raise ValueError('Unmapped ticket status')
        if row.get('identity_status') not in {'verified', 'pending'}:
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


def rehearse(snapshot):
    # Real campaign data cannot reach the random-selection path, even on import.
    if snapshot.get('campaign_id') != 'SYNTHETIC-NO-PRIZES' or snapshot.get('synthetic') is not True:
        raise ValueError('Only synthetic rehearsal selection is enabled; official use requires separate review')
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
        pool = [r for r in pool if r['person_id'] != chosen['person_id']]
    return {'rehearsal_only': True, 'official_draw_authorized': False,
            'randomness': 'Python secrets.randbelow: OS cryptographic randomness, rejection sampling',
            'source_sha256': snapshot['source_sha256'], 'snapshot_sha256': result['snapshot_sha256'],
            'excluded_ticket_ids': [r['ticket_id'] for r in result['excluded']],
            'selections': selections, 'final_event_sha256': previous}


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
    args = parser.parse_args()
    if args.command == 'validate':
        result = validate(load(args.snapshot))
        print(json.dumps({'eligible_tickets': len(result['eligible']), 'excluded_tickets': len(result['excluded']),
                          'unique_people': result['unique_people'], 'snapshot_sha256': result['snapshot_sha256'],
                          'official_draw_authorized': False}))
    else:
        snapshot = synthetic()
        result = rehearse(snapshot)
        write_results(args.output, snapshot, result)
        print('Synthetic rehearsal complete: six distinct people; no prize allocation. ' + str(args.output))


if __name__ == '__main__':
    main()
