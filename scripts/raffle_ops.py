"""Offline reconciliation rehearsal. Never creates or modifies Zeffy tickets.

The CLI accepts fictional fixtures only. A real export adapter and approved
rules are prerequisites to using this design with purchaser records.
"""
import argparse
import copy
import csv
import hashlib
import json
import re
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

PACKAGES = {2000: 1, 5000: 3, 10000: 7}
PERCENTAGES = (20, 6, 5, 4, 3, 2)


def aware_time(value):
    if not isinstance(value, str) or not re.search(r'(Z|[+-]\d{2}:\d{2})$', value):
        raise ValueError('Explicit UTC offset required')
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def sales_allowed(now, opening, closing, authorized=False):
    """Pure mock gate. Never schedules or opens an actual campaign."""
    start, stop, current = map(aware_time, (opening, closing, now))
    if stop <= start:
        raise ValueError('Closing must follow opening')
    return authorized is True and start <= current < stop


def reconcile(transactions):
    """Validate a complete normalized snapshot; preserve native ticket numbers.

    Exact duplicate orders collapse. Conflicting versions require a fresh
    authoritative snapshot, never last-row-wins. Refunds are review holds,
    not an invented final refund policy. Amounts are integer USD cents.
    """
    groups = defaultdict(list)
    for index, tx in enumerate(transactions):
        key = (tx.get('campaign_id'), tx.get('transaction_id'))
        if not all(isinstance(k, str) and k.strip() for k in key):
            raise ValueError(f'Missing campaign/transaction key at input row {index + 1}')
        if tx not in groups[key]:
            groups[key].append(copy.deepcopy(tx))
    owners = defaultdict(set)
    prepared = []
    for key, versions in sorted(groups.items()):
        tx = versions[0]
        reasons = []
        if len(versions) != 1:
            reasons.append('conflicting_transaction_versions')
        if not isinstance(tx.get('purchaser_ref'), str) or not tx['purchaser_ref'].strip():
            reasons.append('missing_purchaser_reference')
        if tx.get('payment_status') != 'settled':
            reasons.append('payment_not_settled')
        if tx.get('eligibility_status') != 'approved':
            reasons.append('eligibility_not_approved')
        if tx.get('refund_status') != 'none' or tx.get('refunded_cents') != 0:
            reasons.append('refund_or_reversal_review')
        amount = tx.get('ticket_sales_cents')
        if type(amount) is not int or amount < 0:
            reasons.append('invalid_amount')
        refunded = tx.get('refunded_cents')
        if (type(refunded) is not int or refunded < 0
                or (type(amount) is int and refunded > amount)):
            reasons.append('invalid_refund_amount')
        expected_amount = 0
        entries = []
        packages = tx.get('packages')
        if not isinstance(packages, list) or not packages:
            reasons.append('missing_packages')
            packages = []
        for package in packages:
            price, qty = package.get('price_cents'), package.get('quantity')
            numbers = package.get('ticket_numbers')
            if type(price) is not int or price not in PACKAGES or type(qty) is not int or qty < 1:
                reasons.append('invalid_package')
                continue
            expected_amount += price * qty
            if not isinstance(numbers, list) or len(numbers) != PACKAGES[price] * qty:
                reasons.append('ticket_count_mismatch')
                numbers = numbers if isinstance(numbers, list) else []
            for number in numbers:
                if not isinstance(number, str) or not re.fullmatch(r'[1-9][0-9]*', number):
                    reasons.append('invalid_native_ticket_number')
                    continue
                native_key = (key[0], number)
                if any(e['ticket_number'] == number for e in entries):
                    reasons.append('duplicate_ticket_within_transaction')
                owners[native_key].add(key)
                entries.append({'campaign_id': key[0], 'transaction_id': key[1],
                                'purchaser_ref': tx.get('purchaser_ref', ''),
                                'ticket_number': number, 'package_price_cents': price})
        if amount != expected_amount:
            reasons.append('payment_package_total_mismatch')
        # Reserve numbers from conflicting versions too, so another order cannot
        # claim them while the conflict is unresolved.
        for version in versions[1:]:
            for package in version.get('packages', []):
                for number in package.get('ticket_numbers', []):
                    if isinstance(number, str):
                        owners[(key[0], number)].add(key)
        prepared.append((key, tx, entries, reasons))
    ledger, orders = [], []
    collisions = {key for key, txs in owners.items() if len(txs) > 1}
    for key, tx, entries, reasons in prepared:
        if any(key in owners[number] for number in collisions):
            reasons.append('ticket_number_collision')
        reasons = sorted(set(reasons))
        include = not reasons
        # A unique ledger key is campaign + native number. Ambiguous rows remain
        # in the audit ledger with inclusion false; never silently choose an owner.
        for entry in entries:
            entry.update(payment_status=tx.get('payment_status'),
                         eligibility_status=tx.get('eligibility_status'),
                         refund_status=tx.get('refund_status'),
                         drawing_inclusion=include, reason=';'.join(reasons))
            ledger.append(entry)
        orders.append({'campaign_id': key[0], 'transaction_id': key[1],
                       'purchaser_ref': tx.get('purchaser_ref', ''),
                       'ticket_sales_cents': tx.get('ticket_sales_cents'),
                       'refunded_cents': tx.get('refunded_cents'),
                       'payment_status': tx.get('payment_status'),
                       'eligibility_status': tx.get('eligibility_status'),
                       'refund_status': tx.get('refund_status'),
                       'included_entries': len(entries) if include else 0,
                       'drawing_inclusion': include, 'reason': ';'.join(reasons)})
    ledger.sort(key=lambda row: (row['campaign_id'], int(row['ticket_number']), row['transaction_id']))
    valid = [row for row in ledger if row['drawing_inclusion']]
    return {'orders': orders, 'ledger': ledger,
            'summary': {'input_rows': len(transactions), 'unique_orders': len(groups),
                        'duplicate_rows_ignored': len(transactions) - sum(map(len, groups.values())),
                        'included_entries': len(valid),
                        'distinct_eligible_purchasers': len({e['purchaser_ref'] for e in valid}),
                        'held_orders': sum(not o['drawing_inclusion'] for o in orders),
                        'included_ticket_sales_cents': sum(o['ticket_sales_cents'] for o in orders if o['drawing_inclusion']),
                        'launch_authorized': False}}


def exclude_winner(ledger, purchaser_ref):
    """Rehearse removal of ALL of one person's orders; does not select a winner."""
    return [row for row in ledger if row['drawing_inclusion'] and row['purchaser_ref'] != purchaser_ref]


def prize_example(gross_cents, refunded_cents=0):
    """Illustration only. Refund eligibility and cent rounding need approval."""
    if any(type(v) is not int or v < 0 for v in (gross_cents, refunded_cents)) or refunded_cents > gross_cents:
        raise ValueError('Invalid revenue')
    basis = gross_cents - refunded_cents
    awards = [int((Decimal(basis) * Decimal(p) / 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
              for p in PERCENTAGES]
    return {'fictional_example': True, 'gross_cents': gross_cents, 'refunded_cents': refunded_cents,
            'eligible_basis_cents': basis, 'percentages': PERCENTAGES, 'awards_cents': awards,
            'total_prizes_cents': sum(awards), 'retained_before_expenses_cents': basis - sum(awards),
            'rounding_and_refund_policy': 'ILLUSTRATIVE ONLY - accountant and final rules must approve'}


def sample_transactions():
    def tx(ident, person, packages):
        return {'campaign_id': 'SAMPLE-NOT-A-CAMPAIGN', 'transaction_id': ident,
                'purchaser_ref': person, 'payment_status': 'settled',
                'eligibility_status': 'approved', 'refund_status': 'none', 'refunded_cents': 0,
                'ticket_sales_cents': sum(p['price_cents'] * p['quantity'] for p in packages),
                'packages': packages}
    def pkg(price, qty, start, count):
        return {'price_cents': price, 'quantity': qty,
                'ticket_numbers': [str(n) for n in range(start, start + count)]}
    return [tx('SAMPLE-50', 'SAMPLE-PERSON-A', [pkg(5000, 1, 1001, 3)]),
            tx('SAMPLE-100', 'SAMPLE-PERSON-B', [pkg(10000, 1, 1004, 7)]),
            tx('SAMPLE-MULTIPLE', 'SAMPLE-PERSON-A', [pkg(5000, 2, 1011, 6), pkg(10000, 1, 1017, 7)])]


def csv_write(file, rows):
    def safe(value):
        text = str(value)
        return "'" + text if text.lstrip().startswith(('=', '+', '-', '@')) else value
    with file.open('w', newline='', encoding='utf-8') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows({k: safe(v) for k, v in row.items()} for row in rows)


def render_stubs(file, ledger):
    """Fictional demonstration only; uniform 3.5 x 1.75 inch cut rectangles."""
    if any(e['campaign_id'] != 'SAMPLE-NOT-A-CAMPAIGN' or not e['purchaser_ref'].startswith('SAMPLE-') for e in ledger):
        raise ValueError('PDF demonstration accepts fictional samples only')
    if not ledger or any(e['drawing_inclusion'] is not True for e in ledger):
        raise ValueError('Only included sample entries may be printed')
    if len({(e['campaign_id'], e['ticket_number']) for e in ledger}) != len(ledger):
        raise ValueError('Duplicate stubs refused')
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    c = canvas.Canvas(str(file), pagesize=letter, invariant=1)
    c.setTitle('SAMPLE ONLY - NEO Chosen Cash Raffle drawing stubs')
    for index, entry in enumerate(ledger):
        slot = index % 10
        if slot == 0:
            if index:
                c.showPage()
            c.setFont('Helvetica-Bold', 13)
            c.drawString(54, 753, 'SAMPLE ONLY - NOT VALID DRAWING ENTRIES')
            c.setFont('Helvetica', 9)
            c.drawString(54, 737, f'Fictional data | {len(ledger)} stubs total | Print at 100% scale')
            c.drawString(54, 43, f'NEO Chosen Cash Raffle | page {index // 10 + 1} | Cut on outlines')
        x = 54 + (slot % 2) * 252
        y = 702 - (slot // 2) * 126
        c.setStrokeColorRGB(.65, .65, .65)
        c.rect(x, y - 126, 252, 126)
        c.setFillColorRGB(0, 0, 0)
        c.setFont('Helvetica-Bold', 10)
        c.drawString(x + 12, y - 19, 'NEO Chosen Cash Raffle')
        c.setFont('Helvetica', 9)
        c.drawString(x + 12, y - 36, 'SAMPLE ONLY - FICTIONAL')
        c.setFont('Helvetica-Bold', 16)
        c.drawString(x + 12, y - 62, 'Ticket ' + entry['ticket_number'])
        c.setFont('Helvetica', 9)
        c.drawString(x + 12, y - 82, entry['purchaser_ref'])
        c.drawString(x + 12, y - 98, 'Order: ' + entry['transaction_id'])
        c.drawString(x + 12, y - 114, 'Not a Zeffy-issued ticket or proof of payment')
    c.save()


def make_samples(output):
    output.mkdir(parents=True, exist_ok=True)
    transactions = sample_transactions()
    result = reconcile(transactions)
    (output / 'sample-transactions.json').write_text(json.dumps(transactions, indent=2) + '\n', encoding='utf-8')
    (output / 'sample-summary.json').write_text(json.dumps(result['summary'], indent=2) + '\n', encoding='utf-8')
    (output / 'sample-prize-calculation.json').write_text(json.dumps(prize_example(1020000, 20000), indent=2) + '\n', encoding='utf-8')
    csv_write(output / 'sample-transaction-report.csv', result['orders'])
    csv_write(output / 'sample-entry-ledger.csv', result['ledger'])
    manifest = []
    for name, order in [('sample-50-stubs.pdf', 'SAMPLE-50'), ('sample-100-stubs.pdf', 'SAMPLE-100'),
                        ('sample-multiple-stubs.pdf', 'SAMPLE-MULTIPLE'), ('sample-all-stubs.pdf', None)]:
        entries = [e for e in result['ledger'] if e['drawing_inclusion'] and (order is None or e['transaction_id'] == order)]
        file = output / name
        render_stubs(file, entries)
        manifest.append({'file': name, 'stub_count': len(entries),
                         'ticket_numbers': ';'.join(e['ticket_number'] for e in entries),
                         'sha256': hashlib.sha256(file.read_bytes()).hexdigest(),
                         'physical_print_status': 'NOT PRINTED', 'checked_by': ''})
    csv_write(output / 'sample-print-manifest.csv', manifest)
    return result['summary']


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['sample'])
    parser.add_argument('--output', type=Path, default=Path('docs/raffle-samples'))
    args = parser.parse_args()
    print(json.dumps(make_samples(args.output), indent=2))
