import copy
import json
import sys
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from raffle_ops import sample_transactions
from raffle_print import (CAMPAIGN, batch, confirm, confirm_quarantine, connect, sync,
                          physical_exception, register_report)


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
                    'complete_snapshot_verified': True, 'authoritative_snapshot_verified': True,
                    'native_ids_verified': True, 'person_references_verified': True,
                    'ticket_statuses_verified': True, 'currency': 'USD',
                    'reviewed_by': 'Fixture reviewer', 'source_as_of': '2026-10-01T00:00:00Z',
                    'reviewed_at': '2026-10-01T00:01:00Z', 'transactions': rows}

    def advance(self, day=2):
        self.doc.update(source_as_of=f'2026-10-{day:02}T00:00:00Z',
                        reviewed_at=f'2026-10-{day:02}T00:01:00Z')

    def confirm(self, ident, operator='Operator A', witness='Witness B'):
        return confirm(self.db, ident, operator, witness, 'TEST SEALED BOX 1')

    def quarantine(self, numbers, operator='Operator A', witness='Witness B'):
        return confirm_quarantine(self.db, numbers, operator, witness, custody_ref='TEST QUARANTINE BOX')

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
            self.confirm(prepared['batch'], 'A', 'A')
        self.confirm(prepared['batch'])
        with self.assertRaises(ValueError):
            self.confirm(prepared['batch'])
        self.assertEqual(len(register_report(self.db)['ready_entries']), 23)

    def test_refund_refresh_flags_every_prepared_ticket_for_physical_removal(self):
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        self.doc['transactions'][1]['refund_status'] = 'full'
        self.doc['transactions'][1]['refunded_cents'] = 10000
        self.advance()
        result = sync(self.db, self.doc)
        self.assertEqual(len(result['physical_removal_required']), 7)
        with self.assertRaises(ValueError):
            self.confirm(prepared['batch'])
        self.quarantine([str(n) for n in range(1004, 1011)])
        self.confirm(prepared['batch'])
        self.assertEqual(len(register_report(self.db)['ready_entries']), 16)

    def test_leading_zero_native_strings_survive_reimports_and_one_time_print_batch(self):
        self.doc['transactions'][0]['packages'][0]['ticket_numbers'] = ['00123', '000', '0']
        self.doc['transactions'][1]['packages'][0]['ticket_numbers'][0] = '123'
        first = sync(self.db, self.doc)
        self.assertEqual(first['summary']['included_entries'], 23)
        self.assertEqual(sync(self.db, copy.deepcopy(self.doc))['snapshot_sha256'], first['snapshot_sha256'])
        self.assertEqual(self.db.execute('SELECT count(*) FROM entries').fetchone()[0], 23)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        manifest = json.loads(Path(prepared['manifest']).read_text())
        markup = Path(prepared['file']).read_text()
        for number in ('00123', '123', '000', '0'):
            with self.subTest(number=number):
                self.assertEqual(manifest['ticket_numbers'].count(number), 1)
                self.assertEqual(markup.count('Ticket ' + number + '</p>'), 1)
                stored = self.db.execute('SELECT number,typeof(number) FROM entries WHERE number=?',
                                         (number,)).fetchone()
                self.assertEqual(tuple(stored), (number, 'text'))
        self.assertEqual(len(manifest['ticket_numbers']), 23)
        self.advance()
        self.doc['transactions'].reverse()
        self.doc['transactions'] *= 2
        self.assertEqual(sync(self.db, self.doc)['summary']['included_entries'], 23)
        with self.assertRaisesRegex(ValueError, 'repeat printing refused'):
            batch(self.db, self.root / 'batches', sample=True)
        report = register_report(self.db)
        self.assertEqual(len(report['entries']), 23)
        self.assertTrue({'00123', '123', '000', '0'} <= {e['number'] for e in report['entries']})
        self.assertEqual(report['ready_entries'], [])
        self.assertEqual(self.db.execute('SELECT count(*) FROM batches').fetchone()[0], 1)

    def test_missing_tickets_require_quarantine_and_invalid_claims_are_refused(self):
        sync(self.db, self.doc)
        batch(self.db, self.root / 'batches', sample=True)
        self.doc['transactions'] = self.doc['transactions'][1:]
        self.advance()
        result = sync(self.db, self.doc)
        self.assertEqual(len(result['physical_removal_required']), 3)
        with self.assertRaises(ValueError):
            self.quarantine(['9999'])
        with self.assertRaises(ValueError):
            self.quarantine(['1001'], 'A', 'A')

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

    def test_duplicate_identical_orders_collapse_and_conflicts_hold_old_entries(self):
        self.doc['transactions'].append(copy.deepcopy(self.doc['transactions'][0]))
        self.assertEqual(sync(self.db, self.doc)['summary']['included_entries'], 23)
        self.doc['transactions'][-1]['payment_status'] = 'failed'
        self.advance()
        self.assertEqual(sync(self.db, self.doc)['summary']['included_entries'], 20)
        self.assertEqual(self.db.execute('SELECT sum(eligible) FROM entries').fetchone()[0], 20)
        self.assertEqual(self.db.execute('SELECT count(*) FROM snapshot_documents').fetchone()[0], 2)

    def test_ownership_changes_hold_entire_order_without_reassigning_native_numbers(self):
        sync(self.db, self.doc)
        self.doc['transactions'][0]['purchaser_ref'] = 'DIFFERENT PERSON'
        self.advance()
        self.assertEqual(sync(self.db, self.doc)['summary']['included_entries'], 20)
        self.assertEqual(self.db.execute('SELECT sum(eligible) FROM entries').fetchone()[0], 20)
        self.assertEqual(self.db.execute("SELECT purchaser_ref FROM entries WHERE number='1001'").fetchone()[0], 'SAMPLE-PERSON-A')

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
        self.doc['transactions'][0]['purchaser_ref'] = 'SAMPLE-<script>alert(1)</script>'
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        markup = Path(prepared['file']).read_text()
        self.assertNotIn('<script>', markup)
        self.assertIn('&lt;script&gt;', markup)

    def test_canonical_reimport_and_stale_replay_are_safe(self):
        first = sync(self.db, self.doc)
        old = copy.deepcopy(self.doc)
        self.doc['transactions'] = self.doc['transactions'][::-1] * 2
        self.assertEqual(sync(self.db, self.doc)['snapshot_sha256'], first['snapshot_sha256'])
        self.assertEqual(self.db.execute('SELECT count(*) FROM audit_events').fetchone()[0], 1)
        self.doc = copy.deepcopy(old)
        self.doc['transactions'][0]['payment_status'] = 'failed'
        with self.assertRaisesRegex(ValueError, 'same-time'):
            sync(self.db, self.doc)
        self.advance()
        sync(self.db, self.doc)
        with self.assertRaisesRegex(ValueError, 'Stale'):
            sync(self.db, old)
        self.assertEqual(self.db.execute('SELECT sum(eligible) FROM entries').fetchone()[0], 20)

    def test_required_envelope_attestations_are_fail_closed(self):
        for field in ('complete_snapshot_verified', 'authoritative_snapshot_verified', 'native_ids_verified',
                      'person_references_verified', 'ticket_statuses_verified', 'currency',
                      'reviewed_by', 'reviewed_at', 'source_as_of'):
            for value in (None, False, ''):
                with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                    sync(self.db, dict(self.doc, **{field: value}))
        self.assertEqual(self.db.execute('SELECT count(*) FROM snapshots').fetchone()[0], 0)

    def test_recovery_is_sticky_across_snapshot_changes_and_eligibility_restoration(self):
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        self.confirm(prepared['batch'])
        self.doc['transactions'][0]['eligibility_status'] = 'pending'
        self.advance()
        sync(self.db, self.doc)
        self.quarantine(['1001', '1002', '1003'])
        self.advance(3)
        self.doc['source_reference'] += ' refreshed'
        self.assertEqual(sync(self.db, self.doc)['physical_removal_required'], [])
        self.doc['transactions'][0]['eligibility_status'] = 'approved'
        self.advance(4)
        sync(self.db, self.doc)
        self.assertEqual(len(register_report(self.db)['ready_entries']), 20)
        physical_exception(self.db, ['1001', '1002', '1003'], 'restore', 'A', 'B',
                           'Intact originals checked', 'SEALED BOX 2')
        self.assertEqual(len(register_report(self.db)['ready_entries']), 23)
        self.doc['transactions'][0]['eligibility_status'] = 'pending'
        self.advance(5)
        self.assertEqual(len(sync(self.db, self.doc)['physical_removal_required']), 3)

    def test_eligibility_restoration_cannot_cancel_unresolved_removal(self):
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        self.doc['transactions'][0]['payment_status'] = 'pending'
        self.advance()
        sync(self.db, self.doc)
        self.doc['transactions'][0]['payment_status'] = 'settled'
        self.advance(3)
        self.assertEqual(len(sync(self.db, self.doc)['physical_removal_required']), 3)
        with self.assertRaises(ValueError):
            self.confirm(prepared['batch'])

    def test_damage_void_retains_reservation_and_refuses_automatic_replacement(self):
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        self.confirm(prepared['batch'])
        with self.assertRaises(ValueError):
            physical_exception(self.db, ['1001'], 'void', 'A', 'B', 'Damaged', 'BOX')
        physical_exception(self.db, ['1001'], 'damage_hold', 'A', 'B', 'Damaged', 'BOX')
        self.quarantine(['1001'])
        physical_exception(self.db, ['1001'], 'void', 'A', 'B', 'Destroyed under witness', 'VOID LOG 1')
        sync(self.db, self.doc)
        self.assertEqual(len(register_report(self.db)['ready_entries']), 22)
        with self.assertRaises(ValueError):
            batch(self.db, self.root / 'batches', sample=True)
        with self.assertRaises(ValueError):
            physical_exception(self.db, ['1001'], 'restore', 'A', 'B', 'Cannot restore void', 'BOX')

    def test_exception_validation_is_atomic(self):
        sync(self.db, self.doc)
        batch(self.db, self.root / 'batches', sample=True)
        with self.assertRaises(ValueError):
            physical_exception(self.db, ['1001', '9999'], 'damage_hold', 'A', 'B', 'Damage', 'BOX')
        self.assertEqual(self.db.execute("SELECT physical_state FROM entries WHERE number='1001'").fetchone()[0], 'prepared')

    def test_held_numberless_orders_remain_in_persistent_audit(self):
        self.doc['transactions'][0]['packages'] = []
        sync(self.db, self.doc)
        report = register_report(self.db)
        self.assertEqual(len(report['orders']), 3)
        self.assertEqual(len(report['entries']), 20)
        self.assertTrue(any('missing_packages' in o['reason'] for o in report['orders']))

    def test_ambiguous_new_owners_never_silently_choose_a_register_owner(self):
        self.doc['transactions'][1]['packages'][0]['ticket_numbers'][0] = '1001'
        result = sync(self.db, self.doc)
        self.assertEqual(result['summary']['included_entries'], 13)
        self.assertIsNone(self.db.execute("SELECT * FROM entries WHERE number='1001'").fetchone())

    def test_manifest_and_paper_confirmation_require_integrity_and_custody(self):
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        self.assertEqual(register_report(self.db)['ready_entries'], [])
        with self.assertRaises(ValueError):
            confirm(self.db, prepared['batch'], 'A', 'B')
        Path(prepared['manifest']).write_text('{}')
        with self.assertRaisesRegex(ValueError, 'manifest'):
            self.confirm(prepared['batch'])
        self.assertEqual(register_report(self.db)['ready_entries'], [])

    def test_sample_and_live_printing_cannot_mix(self):
        sync(self.db, self.doc)
        with self.assertRaises(ValueError):
            batch(self.db, self.root / 'batches')
        extra = copy.deepcopy(self.doc['transactions'][0])
        extra.update(transaction_id='REVIEWED-NATIVE-EXAMPLE', purchaser_ref='REVIEWED-PERSON-EXAMPLE')
        extra['packages'][0]['ticket_numbers'] = ['2001', '2002', '2003']
        self.doc['transactions'].append(extra)
        self.advance()
        sync(self.db, self.doc)
        with self.assertRaises(ValueError):
            batch(self.db, self.root / 'batches', sample=True)

    def test_partial_sample_identities_cannot_leak_into_live_printing(self):
        for sample_field in ('transaction_id', 'purchaser_ref', 'campaign_id'):
            with self.subTest(sample_field=sample_field):
                db = connect(self.root / (sample_field + '.sqlite'))
                self.addCleanup(db.close)
                doc = copy.deepcopy(self.doc)
                campaign = 'SAMPLE-NOT-A-CAMPAIGN' if sample_field == 'campaign_id' else CAMPAIGN
                doc['campaign_id'] = campaign
                for i, row in enumerate(doc['transactions']):
                    row.update(campaign_id=campaign, transaction_id=f'REVIEWED-ORDER-{i}',
                               purchaser_ref=f'REVIEWED-PERSON-{i}')
                    if sample_field != 'campaign_id':
                        row[sample_field] = f'SAMPLE-{i}'
                sync(db, doc, campaign)
                with self.assertRaises(ValueError):
                    batch(db, self.root / sample_field, campaign)
                self.assertEqual(db.execute('SELECT count(*) FROM batches').fetchone()[0], 0)

    def test_live_register_cannot_start_sample_batches_after_identity_refresh(self):
        for row in self.doc['transactions']:
            row['transaction_id'] = row['transaction_id'].replace('SAMPLE-', 'REVIEWED-')
            row['purchaser_ref'] = row['purchaser_ref'].replace('SAMPLE-', 'REVIEWED-')
        sync(self.db, self.doc)
        batch(self.db, self.root / 'live')
        self.assertIs(register_report(self.db)['sample_only'], False)
        extra = sample_transactions()[0]
        extra['campaign_id'] = CAMPAIGN
        extra['packages'][0]['ticket_numbers'] = ['2001', '2002', '2003']
        self.doc['transactions'].append(extra)
        self.advance()
        sync(self.db, self.doc)
        with self.assertRaisesRegex(ValueError, 'separate registers'):
            batch(self.db, self.root / 'sample', sample=True)

    def test_invalid_person_containers_are_held_and_remain_auditable(self):
        for index, person in enumerate((['bad'], {'bad': 'ref'}, 123, True, None)):
            with self.subTest(person=person):
                db = connect(self.root / f'invalid-person-{index}.sqlite')
                self.addCleanup(db.close)
                doc = copy.deepcopy(self.doc)
                doc['transactions'][0]['purchaser_ref'] = person
                result = sync(db, doc)
                self.assertEqual(result['summary']['included_entries'], 20)
                self.assertEqual(result['summary']['held_orders'], 1)
                report = register_report(db)
                held = next(o for o in report['orders'] if o['transaction_id'] == 'SAMPLE-50')
                self.assertEqual(held['purchaser_ref'], person)
                self.assertIn('missing_purchaser_reference', held['reason'])
                self.assertEqual(len(report['entries']), 23)

    def test_report_revenue_matches_sync_even_when_eligibility_is_held(self):
        self.doc['transactions'][0]['eligibility_status'] = 'pending'
        self.doc['transactions'][1].update(refund_status='partial', refunded_cents=1000)
        result = sync(self.db, self.doc)
        report = register_report(self.db)
        self.assertEqual(report['accounting'], result['accounting'])
        self.assertEqual(report['accounting']['settled_net_ticket_sales_cents'], 34000)
        self.assertEqual(report['accounting']['included_ticket_sales_cents'], 20000)
        self.assertIsNone(report['sample_only'])
        self.assertFalse(report['official_draw_authorized'])

    def test_checker_whitespace_and_case_do_not_create_two_people(self):
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        for operator, witness in (('Operator A', ' operator   a '), ('ALICE\tSMITH', 'alice smith')):
            with self.subTest(operator=operator), self.assertRaises(ValueError):
                self.confirm(prepared['batch'], operator, witness)
        self.assertEqual(register_report(self.db)['ready_entries'], [])

    def test_future_and_pre_capture_review_timestamps_are_refused(self):
        for metadata in ({'source_as_of': '2999-01-01T00:00:00Z'},
                         {'reviewed_at': '2999-01-01T00:00:00Z'},
                         {'reviewed_at': '2026-09-30T23:59:59Z'},
                         {'source_as_of': '2026-10-01T00:00:00'}):
            with self.subTest(metadata=metadata), self.assertRaises(ValueError):
                sync(self.db, dict(self.doc, **metadata))
        self.assertEqual(self.db.execute('SELECT count(*) FROM snapshots').fetchone()[0], 0)

    def test_physical_confirmation_cannot_cross_selected_campaign(self):
        sync(self.db, self.doc)
        prepared = batch(self.db, self.root / 'batches', sample=True)
        with self.assertRaisesRegex(ValueError, 'selected campaign'):
            confirm(self.db, prepared['batch'], 'FICTIONAL A', 'FICTIONAL B',
                    'FICTIONAL BOX', campaign='SAMPLE-OTHER-CAMPAIGN')
        self.assertIsNone(self.db.execute('SELECT checked_at FROM batches').fetchone()[0])
        self.assertEqual(register_report(self.db)['ready_entries'], [])

    def test_mid_sync_database_failure_rolls_back_snapshot_entries_and_audit(self):
        sync(self.db, self.doc)
        before = register_report(self.db)
        self.doc['transactions'][0]['payment_status'] = 'failed'
        self.advance()
        with patch('raffle_print.audit', side_effect=RuntimeError('Injected failure')):
            with self.assertRaises(RuntimeError):
                sync(self.db, self.doc)
        self.assertEqual(register_report(self.db), before)
        self.assertEqual(self.db.execute('SELECT count(*) FROM snapshots').fetchone()[0], 1)

    def test_manifest_write_failure_removes_html_and_rolls_back_database(self):
        sync(self.db, self.doc)
        real_open = Path.open
        def failing_open(path, *args, **kwargs):
            if path.suffix == '.json' and args and args[0] == 'xb':
                raise OSError('Injected manifest failure')
            return real_open(path, *args, **kwargs)
        with patch.object(Path, 'open', failing_open), self.assertRaises(OSError):
            batch(self.db, self.root / 'batches', sample=True)
        self.assertEqual(list((self.root / 'batches').iterdir()), [])
        self.assertEqual(self.db.execute('SELECT count(*) FROM batches').fetchone()[0], 0)

    def test_second_connection_sees_reservations_and_refuses_duplicate_batch(self):
        sync(self.db, self.doc)
        other = connect(self.root / 'private.sqlite')
        self.addCleanup(other.close)
        batch(self.db, self.root / 'batches', sample=True)
        with self.assertRaises(ValueError):
            batch(other, self.root / 'other-batches', sample=True)

    def test_legacy_prepared_entries_migrate_to_recovery_hold(self):
        import sqlite3
        file = self.root / 'legacy.sqlite'
        legacy = sqlite3.connect(file)
        legacy.executescript('''CREATE TABLE entries(campaign TEXT,number TEXT,transaction_id TEXT,
            purchaser_ref TEXT,eligible INTEGER,reason TEXT,snapshot TEXT,batch TEXT,PRIMARY KEY(campaign,number));
            INSERT INTO entries VALUES('campaign','1','tx','person',1,'','hash','old-batch');''')
        legacy.close()
        migrated = connect(file)
        self.addCleanup(migrated.close)
        self.assertEqual(migrated.execute('SELECT physical_state FROM entries').fetchone()[0], 'removal_required')


if __name__ == '__main__':
    unittest.main()
