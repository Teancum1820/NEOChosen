"""Synthetic reviewed-mapping tests; these do not verify a native Zeffy schema."""
import copy
import csv
import hashlib
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from raffle_import import import_mapped_csv
from raffle_ops import canonical_json, reconcile, strict_json
from raffle_print import CAMPAIGN, batch, connect, register_report, sync

FIXTURES = Path(__file__).parent / 'fixtures'


class MappedCSVTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.mapping = strict_json((FIXTURES / 'raffle-mapping.sample.json').read_text())
        self.envelope = strict_json((FIXTURES / 'raffle-envelope.sample.json').read_text())
        self.csv = self.root / 'synthetic.csv'
        self.csv.write_bytes((FIXTURES / 'raffle-transactions.sample.csv').read_bytes())
        self.records = list(csv.DictReader(io.StringIO(self.csv.read_text())))

    def write_records(self, records=None):
        with self.csv.open('w', encoding='utf-8-sig', newline='') as stream:
            writer = csv.DictWriter(stream, fieldnames=self.records[0].keys())
            writer.writeheader()
            writer.writerows(self.records if records is None else records)

    def run_import(self):
        return import_mapped_csv(self.csv, self.mapping, self.envelope)

    def cli(self, script, *args):
        return subprocess.run([sys.executable, str(ROOT / 'scripts' / script), *args],
                              capture_output=True, text=True)

    def test_fixture_counts_two_people_and_audit_hashes(self):
        before = copy.deepcopy((self.mapping, self.envelope))
        doc = self.run_import()
        result = reconcile(doc['transactions'])
        self.assertEqual(result['summary']['included_entries'], 23)
        self.assertEqual(result['summary']['distinct_eligible_purchasers'], 2)
        self.assertEqual(result['accounting']['settled_gross_ticket_sales_cents'], 35000)
        self.assertEqual(doc['adapter']['source_sha256'], hashlib.sha256(self.csv.read_bytes()).hexdigest())
        self.assertEqual(doc['adapter']['mapping_sha256'], hashlib.sha256(canonical_json(self.mapping).encode()).hexdigest())
        self.assertFalse(doc['adapter']['native_schema_verified_by_tool'])
        self.assertEqual((self.mapping, self.envelope), before)

    def test_mapping_requires_explicit_review_evidence_and_native_ids(self):
        for field in ('mapping_reviewed', 'native_ids_verified', 'reviewed_by', 'reviewed_at',
                      'evidence_reference', 'version'):
            for value in (None, False, ''):
                with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                    import_mapped_csv(self.csv, dict(self.mapping, **{field: value}), self.envelope)
        with self.assertRaises(ValueError):
            import_mapped_csv(self.csv, dict(self.mapping, version=True), self.envelope)

    def test_future_mapping_or_incomplete_envelope_refused(self):
        self.mapping['reviewed_at'] = '2999-01-01T00:00:00Z'
        with self.assertRaises(ValueError):
            self.run_import()
        self.mapping['reviewed_at'] = '2026-10-01T00:01:00Z'
        for field in ('complete_snapshot_verified', 'person_references_verified',
                      'ticket_statuses_verified', 'authoritative_snapshot_verified'):
            with self.subTest(field=field), self.assertRaises(ValueError):
                import_mapped_csv(self.csv, self.mapping, dict(self.envelope, **{field: False}))

    def test_columns_must_all_be_explicit_and_distinct(self):
        original = copy.deepcopy(self.mapping['columns'])
        for columns in ({k: v for k, v in original.items() if k != 'transaction_id'},
                        dict(original, transaction_id=original['purchaser_ref']),
                        dict(original, transaction_id='Nonexistent header')):
            self.mapping['columns'] = columns
            with self.assertRaises(ValueError):
                self.run_import()

    def test_status_maps_must_be_explicit_and_valid(self):
        original = copy.deepcopy(self.mapping['status_maps'])
        for maps in ({}, dict(original, payment_status={}),
                     dict(original, payment_status={'REVIEWED SETTLED': 'succeeded'})):
            self.mapping['status_maps'] = maps
            with self.assertRaises(ValueError):
                self.run_import()

    def test_unmapped_status_does_not_infer_settlement(self):
        for field in ('Payment review', 'Eligibility review', 'Refund review', 'Ticket review'):
            with self.subTest(field=field):
                old = self.records[0][field]
                self.records[0][field] = 'Succeeded'
                self.write_records()
                with self.assertRaisesRegex(ValueError, 'unmapped'):
                    self.run_import()
                self.records[0][field] = old

    def test_mapped_held_states_retain_order_revenue_and_native_numbers(self):
        for field, value in (('Payment review', 'PENDING'), ('Eligibility review', 'PENDING'),
                             ('Refund review', 'PARTIAL'), ('Ticket review', 'VOID')):
            with self.subTest(field=field):
                original = copy.deepcopy(self.records)
                self.records[0][field] = value
                self.write_records()
                result = reconcile(self.run_import()['transactions'])
                self.assertEqual(result['summary']['held_orders'], 1)
                self.assertEqual(result['summary']['included_entries'], 20)
                self.assertEqual(len(result['ledger']), 23)
                expected = 30000 if field == 'Payment review' else 35000
                self.assertEqual(result['accounting']['settled_gross_ticket_sales_cents'], expected)
                self.records = original

    def test_money_is_exact_raffle_only_integer_cents(self):
        for field in ('Raffle cents', 'Refund cents'):
            for value in ('50.00', '$50', '5e3', '-1', '01', 'True', ' 0', ''):
                with self.subTest(field=field, value=value):
                    old = self.records[0][field]
                    self.records[0][field] = value
                    self.write_records()
                    with self.assertRaises(ValueError):
                        self.run_import()
                    self.records[0][field] = old
        self.records[0]['Raffle cents'] = '6000'
        self.write_records()
        result = reconcile(self.run_import()['transactions'])
        self.assertIn('payment_package_total_mismatch', next(o for o in result['orders'] if o['transaction_id'] == 'SAMPLE-50')['reason'])

    def test_duplicate_rows_collapse_and_conflicting_ids_hold(self):
        self.write_records(self.records * 2)
        result = reconcile(self.run_import()['transactions'])
        self.assertEqual(result['summary']['duplicate_rows_ignored'], 3)
        self.assertEqual(result['accounting']['settled_gross_ticket_sales_cents'], 35000)
        conflict = dict(self.records[0], **{'Payment review': 'PENDING'})
        self.write_records(self.records + [conflict])
        result = reconcile(self.run_import()['transactions'])
        self.assertEqual(result['summary']['included_entries'], 20)
        self.assertEqual(result['accounting']['unresolved_order_ids'], ['SAMPLE-50'])

    def test_mapped_import_preserves_leading_zero_ticket_text(self):
        packages = strict_json(self.records[0]['Complete package JSON'])
        packages[0]['ticket_numbers'] = ['00123', '000', '0']
        self.records[0]['Complete package JSON'] = json.dumps(packages)
        packages = strict_json(self.records[1]['Complete package JSON'])
        packages[0]['ticket_numbers'][0] = '123'
        self.records[1]['Complete package JSON'] = json.dumps(packages)
        self.write_records()
        document = self.run_import()
        self.assertEqual(document['transactions'][0]['packages'][0]['ticket_numbers'], ['00123', '000', '0'])
        result = reconcile(document['transactions'])
        self.assertEqual(result['summary']['included_entries'], 23)
        self.assertTrue({'00123', '123', '000', '0'} <= {e['ticket_number'] for e in result['ledger']})

    def test_packages_reject_ambiguous_json_but_hold_invalid_packages(self):
        for value in ('[{"quantity":1,"quantity":2}]', '[NaN]', '{}', '[]', '[Infinity]'):
            self.records[0]['Complete package JSON'] = value
            self.write_records()
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.run_import()
        self.records[0]['Complete package JSON'] = '[null]'
        self.write_records()
        self.assertEqual(reconcile(self.run_import()['transactions'])['summary']['held_orders'], 1)

    def test_csv_rejects_duplicate_missing_and_ragged_headers_or_rows(self):
        original = self.csv.read_text()
        malformed = [original.replace('Campaign,Order,', 'Campaign,Campaign,', 1),
                     original.replace('Campaign,Order,', 'Campaign,Missing,', 1),
                     original + '\nonly,three,columns\n', original + '\n' + ','.join(['x'] * 11)]
        for value in malformed:
            self.csv.write_text(value)
            with self.subTest(value=value[-50:]), self.assertRaises(ValueError):
                self.run_import()

    def test_wrong_campaign_missing_identity_and_padded_refs_refused(self):
        for field, value in (('Campaign', 'OTHER'), ('Order', ''),
                             ('Reviewed person', ' SAMPLE-PERSON-A')):
            old = self.records[0][field]
            self.records[0][field] = value
            self.write_records()
            with self.subTest(field=field), self.assertRaises(ValueError):
                self.run_import()
            self.records[0][field] = old

    def test_empty_csv_requires_separate_review_and_no_preexisting_transactions(self):
        self.write_records([])
        with self.assertRaises(ValueError):
            self.run_import()
        self.envelope['empty_snapshot_verified'] = True
        self.assertEqual(self.run_import()['transactions'], [])
        self.envelope['transactions'] = []
        with self.assertRaises(ValueError):
            self.run_import()

    def test_adapter_to_sample_register_keeps_numbers_and_cannot_print_live(self):
        db = connect(self.root / 'test.sqlite')
        self.addCleanup(db.close)
        doc = self.run_import()
        campaign = self.envelope['campaign_id']
        first = sync(db, doc, campaign)
        self.assertEqual(sync(db, doc, campaign)['snapshot_sha256'], first['snapshot_sha256'])
        with self.assertRaises(ValueError):
            batch(db, self.root / 'live', campaign)
        prepared = batch(db, self.root / 'sample', campaign, sample=True)
        self.assertEqual(prepared['count'], 23)
        self.assertEqual(register_report(db, campaign)['ready_entries'], [])

    def test_cli_sample_campaign_import_sync_batch_and_report_without_confirmation(self):
        mapping = self.root / 'mapping.json'
        envelope = self.root / 'envelope.json'
        output = self.root / 'normalized.json'
        mapping.write_text(json.dumps(self.mapping))
        envelope.write_text(json.dumps(self.envelope))
        args = [str(self.csv), '--mapping', str(mapping), '--envelope', str(envelope), '--output', str(output)]
        imported = self.cli('raffle_import.py', *args)
        self.assertEqual(imported.returncode, 0, imported.stderr)
        self.assertIn('NOT been verified', imported.stdout)
        before = output.read_bytes()
        self.assertNotEqual(self.cli('raffle_import.py', *args).returncode, 0)
        self.assertEqual(output.read_bytes(), before)
        database = ['--database', str(self.root / 'register.sqlite'),
                    '--campaign', self.envelope['campaign_id']]
        synced = self.cli('raffle_print.py', *database, 'sync', str(output))
        self.assertEqual(synced.returncode, 0, synced.stderr)
        self.assertEqual(json.loads(synced.stdout)['summary']['included_entries'], 23)
        live = self.cli('raffle_print.py', *database, 'batch', '--output', str(self.root / 'live'))
        self.assertNotEqual(live.returncode, 0)
        prepared = self.cli('raffle_print.py', *database, 'batch', '--sample', '--output', str(self.root / 'batches'))
        self.assertEqual(prepared.returncode, 0, prepared.stderr)
        self.assertEqual(json.loads(prepared.stdout)['count'], 23)
        report = self.cli('raffle_print.py', *database, 'report')
        self.assertEqual(report.returncode, 0, report.stderr)
        report = json.loads(report.stdout)
        self.assertEqual(report['campaign_id'], self.envelope['campaign_id'])
        self.assertEqual(len(report['entries']), 23)
        self.assertTrue(all(e['physical_state'] == 'prepared' for e in report['entries']))
        self.assertEqual(report['ready_entries'], [])
        self.assertTrue(report['sample_only'])
        self.assertFalse(report['official_draw_authorized'])
        # Ambiguous duplicate object keys must also fail at the register CLI boundary.
        output.write_text(before.decode().replace('"currency": "USD"', '"currency": "EUR", "currency": "USD"'))
        self.assertNotEqual(self.cli('raffle_print.py', *database, 'sync', str(output)).returncode, 0)

    def test_cli_omitted_campaign_keeps_live_default_and_rejects_sample_snapshot(self):
        output = self.root / 'normalized.json'
        document = self.run_import()
        output.write_text(json.dumps(document))
        database = ['--database', str(self.root / 'default.sqlite')]
        rejected = self.cli('raffle_print.py', *database, 'sync', str(output))
        self.assertNotEqual(rejected.returncode, 0)
        self.assertIn('Wrong campaign', rejected.stderr)
        document['campaign_id'] = CAMPAIGN
        for row in document['transactions']:
            row['campaign_id'] = CAMPAIGN
        output.write_text(json.dumps(document))
        synced = self.cli('raffle_print.py', *database, 'sync', str(output))
        self.assertEqual(synced.returncode, 0, synced.stderr)
        report = self.cli('raffle_print.py', *database, 'report')
        self.assertEqual(report.returncode, 0, report.stderr)
        report = json.loads(report.stdout)
        self.assertEqual(report['campaign_id'], CAMPAIGN)
        self.assertEqual(len(report['entries']), 23)
        self.assertEqual(report['ready_entries'], [])

    def test_cli_invalid_campaign_rejected_before_creating_database(self):
        for index, campaign in enumerate(('', '   ', ' SAMPLE-CAMPAIGN', 'SAMPLE-CAMPAIGN\n')):
            database = self.root / f'invalid-{index}.sqlite'
            result = self.cli('raffle_print.py', '--database', str(database),
                              '--campaign', campaign, 'report')
            with self.subTest(campaign=campaign):
                self.assertEqual(result.returncode, 2, result.stderr)
                self.assertIn('--campaign requires', result.stderr)
                self.assertFalse(database.exists())


if __name__ == '__main__':
    unittest.main()
