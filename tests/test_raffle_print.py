import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from raffle_ops import sample_transactions
from raffle_print import CAMPAIGN, batch, confirm, confirm_quarantine, connect, sync


class PrintRegisterTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.db = connect(self.root / 'private.sqlite')
        self.addCleanup(self.db.close)
        rows = sample_transactions()
        for row in rows:
            row['campaign_id'] = CAMPAIGN
        self.doc = {'campaign_id': CAMPAIGN, 'source_reference': 'FICTIONAL TEST DATA',
                    'complete_snapshot_verified': True, 'transactions': rows}

    def test_23_stubs_once_with_native_numbers_and_separate_paper_confirmation(self):
        result = sync(self.db, self.doc)
        self.assertEqual(result['summary']['included_entries'], 23)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        self.assertEqual(prepared['count'], 23)
        manifest = json.loads(Path(prepared['manifest']).read_text())
        self.assertEqual(manifest['ticket_numbers'], [str(n) for n in range(1001, 1024)])
        self.assertEqual(manifest['physical_status'], 'NOT CONFIRMED')
        sync(self.db, self.doc)
        with self.assertRaises(ValueError):
            batch(self.db, self.root / 'batches', sample=True)
        with self.assertRaises(ValueError):
            confirm(self.db, prepared['batch'], 'A', 'A')
        confirm(self.db, prepared['batch'], 'Operator A', 'Witness B')
        with self.assertRaises(ValueError):
            confirm(self.db, prepared['batch'], 'Operator A', 'Witness B')

    def test_refund_refresh_flags_every_prepared_ticket_for_physical_removal(self):
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        self.doc['transactions'][1]['refund_status'] = 'full'
        self.doc['transactions'][1]['refunded_cents'] = 10000
        result = sync(self.db, self.doc)
        self.assertEqual(len(result['physical_removal_required']), 7)
        with self.assertRaises(ValueError):
            confirm(self.db, prepared['batch'], 'A', 'B')
        confirm_quarantine(self.db, [str(n) for n in range(1004, 1011)], 'A', 'B')
        confirm(self.db, prepared['batch'], 'A', 'B')

    def test_missing_tickets_require_quarantine_and_invalid_claims_are_refused(self):
        sync(self.db, self.doc)
        batch(self.db, self.root / 'batches', sample=True)
        self.doc['transactions'] = self.doc['transactions'][1:]
        result = sync(self.db, self.doc)
        self.assertEqual(len(result['physical_removal_required']), 3)
        with self.assertRaises(ValueError):
            confirm_quarantine(self.db, ['9999'], 'A', 'B')
        with self.assertRaises(ValueError):
            confirm_quarantine(self.db, ['1001'], 'A', 'A')

    def test_failed_missing_eligibility_and_canceled_orders_cannot_print(self):
        self.doc['transactions'][0]['payment_status'] = 'failed'
        self.doc['transactions'][1]['eligibility_status'] = 'pending'
        self.doc['transactions'][2]['refund_status'] = 'canceled'
        result = sync(self.db, self.doc)
        self.assertEqual(result['summary']['included_entries'], 0)
        with self.assertRaises(ValueError):
            batch(self.db, self.root / 'batches', sample=True)

    def test_wrong_campaign_and_unverified_complete_snapshot_refused(self):
        self.doc['campaign_id'] = 'OTHER'
        with self.assertRaises(ValueError):
            sync(self.db, self.doc)
        self.doc['campaign_id'] = CAMPAIGN
        self.doc['complete_snapshot_verified'] = False
        with self.assertRaises(ValueError):
            sync(self.db, self.doc)

    def test_duplicate_identical_orders_collapse_and_conflicts_refused(self):
        self.doc['transactions'].append(copy.deepcopy(self.doc['transactions'][0]))
        self.assertEqual(sync(self.db, self.doc)['summary']['included_entries'], 23)
        self.doc['transactions'][-1]['payment_status'] = 'failed'
        with self.assertRaises(ValueError):
            sync(self.db, self.doc)

    def test_ownership_changes_rollback_entire_refresh(self):
        sync(self.db, self.doc)
        self.doc['transactions'][0]['purchaser_ref'] = 'DIFFERENT PERSON'
        with self.assertRaises(ValueError):
            sync(self.db, self.doc)
        self.assertEqual(self.db.execute('SELECT sum(eligible) FROM entries').fetchone()[0], 23)

    def test_output_failure_rolls_back_reservations_and_removes_partial_files(self):
        sync(self.db, self.doc)
        folder = self.root / 'batches'
        folder.mkdir()
        # First prepare establishes deterministic names, then rehearse a fresh register
        # encountering an already-existing file rather than overwriting it.
        prepared = batch(self.db, folder, sample=True)
        fresh = connect(self.root / 'fresh.sqlite')
        self.addCleanup(fresh.close)
        sync(fresh, self.doc)
        with self.assertRaises(FileExistsError):
            batch(fresh, folder, sample=True)
        self.assertEqual(fresh.execute('SELECT count(*) FROM entries WHERE batch IS NOT NULL').fetchone()[0], 0)
        self.assertTrue(Path(prepared['file']).exists())

    def test_html_escapes_private_references(self):
        self.doc['transactions'][0]['purchaser_ref'] = '<script>alert(1)</script>'
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        markup = Path(prepared['file']).read_text()
        self.assertNotIn('<script>', markup)
        self.assertIn('&lt;script&gt;', markup)


if __name__ == '__main__':
    unittest.main()
