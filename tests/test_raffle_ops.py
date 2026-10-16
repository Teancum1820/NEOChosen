import copy
import csv
import hashlib
import importlib.util
import json
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('raffle_ops', Path(__file__).parents[1] / 'scripts/raffle_ops.py')
ops = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ops)


class ReconciliationTests(unittest.TestCase):
    def setUp(self):
        self.txs = ops.sample_transactions()

    def count(self, rows):
        return ops.reconcile(rows)['summary']['included_entries']

    def test_packages_and_combined_purchase(self):
        self.assertEqual([self.count([t]) for t in self.txs], [3, 7, 13])
        self.assertEqual(self.count(self.txs), 23)

    def test_twenty_dollar_package(self):
        t = self.txs[0]
        t['ticket_sales_cents'] = 2000
        t['packages'] = [{'price_cents': 2000, 'quantity': 1, 'ticket_numbers': ['1']}]
        self.assertEqual(self.count([t]), 1)

    def test_idempotent_and_order_independent(self):
        self.assertEqual(ops.reconcile(self.txs)['ledger'], ops.reconcile(self.txs[::-1] * 2)['ledger'])
        self.assertEqual(self.count(self.txs * 2), 23)

    def test_conflicting_duplicate_quarantines_order(self):
        other = copy.deepcopy(self.txs[0])
        other['payment_status'] = 'refunded'
        self.assertEqual(self.count([self.txs[0], other]), 0)

    def test_failed_pending_canceled_and_unknown_payments(self):
        for state in ['failed', 'pending', 'canceled', 'refunded', 'chargeback', 'unknown', None]:
            with self.subTest(state=state):
                t = copy.deepcopy(self.txs[0])
                t['payment_status'] = state
                self.assertEqual(self.count([t]), 0)

    def test_full_partial_refund_and_reversal_hold(self):
        for status, amount in [('full', 5000), ('partial', 1000), ('reversed', 0), ('unknown', 0)]:
            t = copy.deepcopy(self.txs[0])
            t.update(refund_status=status, refunded_cents=amount)
            self.assertEqual(self.count([t]), 0)

    def test_refund_refresh_does_not_reissue_numbers(self):
        before = ops.reconcile(self.txs)['ledger']
        self.txs[0].update(refund_status='full', refunded_cents=5000)
        after = ops.reconcile(self.txs)['ledger']
        self.assertEqual([e['ticket_number'] for e in before], [e['ticket_number'] for e in after])
        self.assertEqual(sum(e['drawing_inclusion'] for e in after), 20)

    def test_missing_purchaser_or_eligibility(self):
        for key in ['purchaser_ref', 'eligibility_status', 'refund_status', 'ticket_sales_cents']:
            t = copy.deepcopy(self.txs[0])
            del t[key]
            self.assertEqual(self.count([t]), 0)

    def test_invalid_refund_values(self):
        for value in [False, '0', -1, 5001, None]:
            t = copy.deepcopy(self.txs[0])
            t['refunded_cents'] = value
            self.assertEqual(self.count([t]), 0)

    def test_missing_transaction_identity_stops_import(self):
        del self.txs[0]['transaction_id']
        with self.assertRaises(ValueError):
            ops.reconcile(self.txs)

    def test_number_namespace_is_campaign(self):
        other = copy.deepcopy(self.txs[0])
        other['campaign_id'] = 'SAMPLE-OTHER-CAMPAIGN'
        self.assertEqual(self.count([self.txs[0], other]), 6)

    def test_pdf_refuses_held_real_or_duplicate_entries(self):
        ledger = ops.reconcile(self.txs)['ledger'][:1]
        with self.assertRaises(ValueError):
            ops.render_stubs(Path('never-written.pdf'), ledger * 2)
        ledger[0]['drawing_inclusion'] = False
        with self.assertRaises(ValueError):
            ops.render_stubs(Path('never-written.pdf'), ledger)
        ledger[0]['campaign_id'] = 'REAL-CAMPAIGN'
        with self.assertRaises(ValueError):
            ops.render_stubs(Path('never-written.pdf'), ledger)

    def test_invalid_amount_or_package(self):
        for amount in [-1, 4999, '5000', True, None]:
            t = copy.deepcopy(self.txs[0])
            t['ticket_sales_cents'] = amount
            self.assertEqual(self.count([t]), 0)
        for qty in [0, -1, 1.5, True, '1']:
            t = copy.deepcopy(self.txs[0])
            t['packages'][0]['quantity'] = qty
            self.assertEqual(self.count([t]), 0)

    def test_missing_or_duplicate_numbers(self):
        for numbers in [[], ['1', '2'], ['1', '1', '2'], ['1', '2', '03'], ['1', '2', 3]]:
            t = copy.deepcopy(self.txs[0])
            t['packages'][0]['ticket_numbers'] = numbers
            self.assertEqual(self.count([t]), 0)

    def test_collision_holds_both_transactions(self):
        self.txs[1]['packages'][0]['ticket_numbers'][0] = '1001'
        self.assertEqual(self.count(self.txs), 13)

    def test_dollars_counted_once_per_order(self):
        result = ops.reconcile(self.txs * 2)
        self.assertEqual(result['summary']['included_ticket_sales_cents'], 35000)
        self.assertEqual(len(result['orders']), 3)

    def test_multiple_orders_for_one_winner(self):
        ledger = ops.reconcile(self.txs)['ledger']
        remaining = ops.exclude_winner(ledger, 'SAMPLE-PERSON-A')
        self.assertEqual(len(remaining), 7)
        self.assertEqual({r['purchaser_ref'] for r in remaining}, {'SAMPLE-PERSON-B'})

    def test_prize_formula(self):
        example = ops.prize_example(1020000, 20000)
        self.assertEqual(example['awards_cents'], [200000, 60000, 50000, 40000, 30000, 20000])
        self.assertEqual(example['total_prizes_cents'], 400000)
        self.assertEqual(example['retained_before_expenses_cents'], 600000)
        with self.assertRaises(ValueError):
            ops.prize_example(100, 101)

    def test_committed_sample_files_match_reconciliation(self):
        folder = Path(__file__).parents[1] / 'docs/raffle-samples'
        result = ops.reconcile(json.loads((folder / 'sample-transactions.json').read_text()))
        with (folder / 'sample-entry-ledger.csv').open(newline='') as handle:
            rows = list(csv.DictReader(handle))
        self.assertEqual([r['ticket_number'] for r in rows], [e['ticket_number'] for e in result['ledger']])
        self.assertEqual(len(rows), 23)
        with (folder / 'sample-print-manifest.csv').open(newline='') as handle:
            manifests = list(csv.DictReader(handle))
        self.assertEqual([int(m['stub_count']) for m in manifests], [3, 7, 13, 23])
        for m in manifests:
            self.assertEqual(hashlib.sha256((folder / m['file']).read_bytes()).hexdigest(), m['sha256'])
            numbers = m['ticket_numbers'].split(';')
            self.assertEqual(len(numbers), len(set(numbers)))
            self.assertEqual(len(numbers), int(m['stub_count']))
            self.assertEqual(m['physical_print_status'], 'NOT PRINTED')
        summary = json.loads((folder / 'sample-summary.json').read_text())
        self.assertEqual(summary, result['summary'])

    def test_open_close_boundaries_and_manual_authorization(self):
        opening = '2026-10-01T13:00:00-04:00'
        closing = '2026-11-15T17:00:00-05:00'
        for now, expected in [('2026-10-01T16:59:59Z', False), ('2026-10-01T17:00:00Z', True),
                              ('2026-11-15T21:59:59Z', True), ('2026-11-15T22:00:00Z', False),
                              ('2026-11-15T22:00:01Z', False)]:
            self.assertEqual(ops.sales_allowed(now, opening, closing, True), expected)
            self.assertFalse(ops.sales_allowed(now, opening, closing))
        with self.assertRaises(ValueError):
            ops.sales_allowed('2026-11-15T17:00:00', opening, closing, True)


if __name__ == '__main__':
    unittest.main()
