"""Explicit reviewed CSV-to-normalized adapter. NOT a native Zeffy importer.

One CSV row represents one complete transaction, with a JSON packages cell.
The caller must supply every column and status mapping, verified native IDs,
human person crosswalk review, and a complete authoritative snapshot envelope.
No joins, settlement inference, identifiers or ticket numbers are generated.
Output uses exclusive creation; this module never opens a print register.
"""
import argparse
import csv
import hashlib
import io
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from raffle_ops import aware_time, canonical_json, reconcile, strict_json
from raffle_print import validate_envelope

FIELDS = {'campaign_id', 'transaction_id', 'purchaser_ref', 'payment_status',
          'eligibility_status', 'refund_status', 'ticket_status',
          'ticket_sales_cents', 'refunded_cents', 'packages'}
STATUSES = {
    'payment_status': {'settled', 'pending', 'failed', 'canceled', 'refunded', 'chargeback', 'unknown'},
    'eligibility_status': {'approved', 'pending', 'ineligible', 'unknown'},
    'refund_status': {'none', 'full', 'partial', 'canceled', 'reversed', 'disputed', 'unknown'},
    'ticket_status': {'active', 'canceled', 'void', 'mixed', 'unknown'},
}


def import_mapped_csv(file, mapping, envelope):
    """Validate reviewed inputs and return a normalized envelope; no side effects."""
    if not isinstance(envelope, dict) or 'transactions' in envelope:
        raise ValueError('Supply envelope metadata only; transactions come exclusively from CSV')
    campaign = envelope.get('campaign_id')
    validate_envelope(dict(envelope, transactions=[]), campaign)
    if not isinstance(campaign, str) or not campaign.strip():
        raise ValueError('Verified native campaign ID required')
    if (not isinstance(mapping, dict) or type(mapping.get('version')) is not int
            or mapping['version'] != 1 or mapping.get('mapping_reviewed') is not True
            or mapping.get('native_ids_verified') is not True):
        raise ValueError('Version 1 reviewed mapping and verified native IDs required')
    for key in ('reviewed_by', 'evidence_reference'):
        if not isinstance(mapping.get(key), str) or not mapping[key].strip():
            raise ValueError('Mapping requires ' + key)
    if aware_time(mapping.get('reviewed_at')) > datetime.now(timezone.utc):
        raise ValueError('Future mapping review refused')
    columns = mapping.get('columns')
    if (not isinstance(columns, dict) or set(columns) != FIELDS
            or any(not isinstance(c, str) or not c for c in columns.values())
            or len(set(columns.values())) != len(FIELDS)):
        raise ValueError('Map every normalized field to a distinct exact CSV header')
    status_maps = mapping.get('status_maps')
    if not isinstance(status_maps, dict) or set(status_maps) != set(STATUSES):
        raise ValueError('Explicit reviewed mappings for all status fields required')
    for field, allowed in STATUSES.items():
        values = status_maps[field]
        if (not isinstance(values, dict) or not values or any(
                not isinstance(k, str) or not k or not isinstance(v, str) or v not in allowed
                for k, v in values.items())):
            raise ValueError('Invalid status mapping: ' + field)
    raw = Path(file).read_bytes()
    reader = csv.DictReader(io.StringIO(raw.decode('utf-8-sig'), newline=''), strict=True)
    headers = reader.fieldnames
    if (not headers or len(set(headers)) != len(headers)
            or not set(columns.values()).issubset(headers)):
        raise ValueError('Missing or duplicate CSV headers')
    transactions = []
    for index, record in enumerate(reader, 2):
        if None in record or any(v is None for v in record.values()):
            raise ValueError(f'CSV row {index}: wrong number of columns')
        tx = {field: record[header] for field, header in columns.items()}
        if any(not value or value != value.strip() for value in tx.values()):
            raise ValueError(f'CSV row {index}: missing or padded mapped value')
        for field, values in status_maps.items():
            if tx[field] not in values:
                raise ValueError(f'CSV row {index}: unmapped {field}')
            tx[field] = values[tx[field]]
        for field in ('ticket_sales_cents', 'refunded_cents'):
            if not re.fullmatch(r'0|[1-9][0-9]*', tx[field]):
                raise ValueError(f'CSV row {index}: {field} must be integer USD cents')
            tx[field] = int(tx[field])
        tx['packages'] = strict_json(tx['packages'])
        if not isinstance(tx['packages'], list) or not tx['packages']:
            raise ValueError(f'CSV row {index}: complete normalized package JSON required')
        transactions.append(tx)
    if not transactions and envelope.get('empty_snapshot_verified') is not True:
        raise ValueError('Empty CSV requires explicit empty_snapshot_verified review')
    document = dict(envelope, transactions=transactions, adapter={
        'type': 'explicit-reviewed-csv-v1', 'source_sha256': hashlib.sha256(raw).hexdigest(),
        'mapping_sha256': hashlib.sha256(canonical_json(mapping).encode()).hexdigest(),
        'mapping_evidence_reference': mapping['evidence_reference'],
        'native_schema_verified_by_tool': False})
    validate_envelope(document, campaign)
    reconcile(transactions)  # Validate identities/JSON; review holds remain visible.
    return document


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv', type=Path)
    parser.add_argument('--mapping', type=Path, required=True)
    parser.add_argument('--envelope', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    document = import_mapped_csv(args.csv, strict_json(args.mapping.read_text(encoding='utf-8-sig')),
                                 strict_json(args.envelope.read_text(encoding='utf-8-sig')))
    with args.output.open('x', encoding='utf-8') as handle:
        handle.write(json.dumps(document, indent=2, allow_nan=False) + '\n')
    print('Reviewed mapped snapshot created. Native Zeffy schema has NOT been verified by this tool.')
