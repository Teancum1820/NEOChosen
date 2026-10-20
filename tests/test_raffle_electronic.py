import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import raffle_electronic as draw


class ElectronicRehearsalTests(unittest.TestCase):
    def setUp(self):
        self.data = draw.synthetic()

    def official_fixture(self, root):
        # Fictional records/approvals ONLY. No real approval, entrant or prize.
        data = copy.deepcopy(self.data)
        data['campaign_id'], data['synthetic'] = draw.CAMPAIGN, False
        source = root / 'FICTIONAL-source.txt'
        source.write_text('FICTIONAL INPUT: NO REAL PEOPLE OR PRIZES', encoding='utf-8')
        data['source_sha256'] = draw.file_sha256(source)
        approval = {'schema_version': 1, 'campaign_id': draw.CAMPAIGN,
                    'snapshot_sha256': draw.digest(data), 'source_sha256': data['source_sha256'],
                    'tool_sha256': draw.file_sha256(draw.__file__), 'prize_percentages': list(draw.PRIZES),
                    'drawing_at_utc': draw.DRAW_AT.isoformat(), 'operator': 'FICTIONAL TEST OPERATOR',
                    'signed_references': {role: 'FICTIONAL TEST REFERENCE' for role in [
                        'organizer', 'legal_organizational', 'technical_reviewer', 'reconciliation_lead',
                        'independent_checker', 'operator', 'witness']}}
        for key in ['official_use_approved', 'cutoff_verified', 'private_storage_approved',
                    'native_mapping_approved', 'identity_review_approved', 'accounting_approved',
                    'recovery_and_no_rerun_approved']:
            approval[key] = True
        return data, approval, source

    def test_one_three_and_seven_entries_preserve_weight(self):
        result = draw.validate(self.data)
        self.assertEqual(len(result['eligible']), 23)
        for person, count in [('A', 10), ('B', 1), ('C', 3), ('D', 7)]:
            self.assertEqual(sum(r['person_id'] == person for r in result['eligible']), count)

    def test_winner_excludes_all_separate_orders_before_next_selection(self):
        before = copy.deepcopy(self.data)
        with patch.object(draw.secrets, 'randbelow', return_value=0):
            result = draw.rehearse(self.data)
        first = result['selections'][0]
        self.assertEqual(first['person_id'], 'A')
        self.assertEqual(len(first['removed_ticket_ids']), 10)
        self.assertEqual(result['selections'][1]['pool_size'], 13)
        self.assertEqual(len({r['person_id'] for r in result['selections']}), 6)
        self.assertEqual([r['percentage'] for r in result['selections']], [20, 6, 5, 4, 3, 2])
        self.assertEqual(before, self.data)
        self.assertFalse(result['official_draw_authorized'])

    def test_audit_hash_chain_and_crypto_range(self):
        with patch.object(draw.secrets, 'randbelow', wraps=draw.secrets.randbelow) as rng:
            result = draw.rehearse(self.data)
        previous = result['snapshot_sha256']
        for event, call in zip(result['selections'], rng.call_args_list):
            self.assertEqual(event['previous_event_sha256'], previous)
            self.assertEqual(call.args, (event['pool_size'],))
            body = {k: v for k, v in event.items() if k != 'event_sha256'}
            previous = draw.digest(body)
            self.assertEqual(event['event_sha256'], previous)
        self.assertEqual(result['final_event_sha256'], previous)

    def test_duplicate_numbers_across_orders_fail(self):
        self.data['tickets'][1]['ticket_id'] = self.data['tickets'][0]['ticket_id']
        with self.assertRaisesRegex(ValueError, 'Duplicate ticket'):
            draw.validate(self.data)

    def test_canceled_refunded_void_invalid_and_ineligible_excluded(self):
        for status in draw.STATUSES - {'active'}:
            data = copy.deepcopy(self.data)
            data['tickets'][0]['status'] = status
            self.assertEqual(len(draw.validate(data)['eligible']), 22)
            self.assertNotIn(data['tickets'][0]['ticket_id'],
                             [e['ticket_id'] for e in draw.validate(data)['eligible']])

    def test_missing_invalid_identifiers_fail(self):
        for field in ['ticket_id', 'order_id', 'person_id']:
            for value in [None, '', 1, ' person ', 'bad\nvalue']:
                data = copy.deepcopy(self.data)
                data['tickets'][0][field] = value
                with self.assertRaises(ValueError):
                    draw.validate(data)

    def test_ambiguous_identity_and_conflicting_order_fail(self):
        self.data['tickets'][0]['identity_status'] = 'pending'
        with self.assertRaisesRegex(ValueError, 'Human identity review'):
            draw.validate(self.data)
        self.data = draw.synthetic()
        self.data['tickets'][1]['person_id'] = 'DIFFERENT'
        with self.assertRaisesRegex(ValueError, 'Conflicting person'):
            draw.validate(self.data)

    def test_fewer_than_six_and_exhaustion_fail_before_randomness(self):
        for count in [1, 3, 7]:
            self.data['tickets'] = draw.synthetic()['tickets'][:count]
            with patch.object(draw.secrets, 'randbelow') as rng:
                with self.assertRaisesRegex(ValueError, 'At least six'):
                    draw.rehearse(self.data)
                rng.assert_not_called()

    def test_empty_and_malformed_input(self):
        for value in [None, [], {}, {'schema_version': 2}]:
            with self.assertRaises(ValueError):
                draw.validate(value)
        self.data['tickets'] = []
        with self.assertRaisesRegex(ValueError, 'Nonempty'):
            draw.validate(self.data)

    def test_unreviewed_unknown_status_and_real_selection_blocked(self):
        for key in ['complete_export_reviewed', 'identity_reconciliation_approved', 'statuses_reviewed']:
            data = copy.deepcopy(self.data)
            data[key] = False
            with self.assertRaisesRegex(ValueError, 'Review required'):
                draw.validate(data)
        self.data['tickets'][0]['status'] = 'unknown'
        with self.assertRaisesRegex(ValueError, 'Unmapped'):
            draw.validate(self.data)
        self.data = draw.synthetic()
        self.data['campaign_id'] = 'REAL-CAMPAIGN'
        with self.assertRaisesRegex(ValueError, 'Only synthetic'):
            draw.rehearse(self.data)

    def test_import_errors_export_and_no_overwrite(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            bad = root / 'bad.json'
            for text in ['not json', '{"a":1,"a":2}', '{"x":NaN}']:
                bad.write_text(text)
                with self.assertRaises(ValueError):
                    draw.load(bad)
            with self.assertRaises(FileNotFoundError):
                draw.load(root / 'missing.json')
            folder = root / 'rehearsal'
            result = draw.rehearse(self.data)
            draw.write_results(folder, self.data, result)
            self.assertEqual(json.loads((folder / 'audit.json').read_text()), result)
            self.assertIn('REHEARSAL ONLY', (folder / 'results.csv').read_text())
            with self.assertRaises(FileExistsError):
                draw.write_results(folder, self.data, result)

    def test_malformed_schema_and_status_types_fail_closed(self):
        for version in [True, 1.0, '1']:
            data = copy.deepcopy(self.data)
            data['schema_version'] = version
            with self.assertRaises(ValueError):
                draw.validate(data)
        for field in ['status', 'identity_status']:
            for value in [[], {}, None, True]:
                data = copy.deepcopy(self.data)
                data['tickets'][0][field] = value
                with self.assertRaises(ValueError):
                    draw.validate(data)
        for value in [None, [], 'bad']:
            with self.assertRaises(ValueError):
                draw.rehearse(value)

    def test_invisible_and_control_identifiers_rejected(self):
        for value in ['bad\x7fvalue', 'bad\u202evalue', 'bad\u200bvalue']:
            self.data['tickets'][0]['person_id'] = value
            with self.assertRaises(ValueError):
                draw.validate(self.data)

    def test_preflight_binds_exact_original_bytes_and_campaign(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / 'native-export.bin'
            source.write_bytes(b'original\r\nprovider bytes\x00')
            self.data['source_sha256'] = draw.file_sha256(source)
            before = copy.deepcopy(self.data)
            result = draw.preflight(self.data, source, 'SYNTHETIC-NO-PRIZES')
            self.assertTrue(result['source_sha256_verified'])
            self.assertFalse(result['official_draw_authorized'])
            self.assertEqual(self.data, before)
            with self.assertRaisesRegex(ValueError, 'Campaign'):
                draw.preflight(self.data, source, 'WRONG-CAMPAIGN')
            source.write_bytes(b'changed source')
            with self.assertRaisesRegex(ValueError, 'source SHA256'):
                draw.preflight(self.data, source, 'SYNTHETIC-NO-PRIZES')
            with self.assertRaises(FileNotFoundError):
                draw.preflight(self.data, Path(temp) / 'missing', 'SYNTHETIC-NO-PRIZES')

    def test_preflight_refuses_fewer_than_six_people(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / 'source'
            source.write_text('fixture')
            self.data['source_sha256'] = draw.file_sha256(source)
            self.data['tickets'] = self.data['tickets'][:10]
            with self.assertRaisesRegex(ValueError, 'At least six'):
                draw.preflight(self.data, source, 'SYNTHETIC-NO-PRIZES')

    def test_audit_verifier_never_selects_and_preserves_input(self):
        audit = draw.rehearse(self.data)
        before = copy.deepcopy((self.data, audit))
        with patch.object(draw.secrets, 'randbelow') as rng:
            result = draw.verify_rehearsal(self.data, audit)
            rng.assert_not_called()
        self.assertEqual(result['unique_winners'], 6)
        self.assertEqual(before, (self.data, audit))
        self.assertFalse(result['official_draw_authorized'])

    def test_audit_verifier_rejects_tampered_pools_identity_and_exclusions(self):
        original = draw.rehearse(self.data)
        for field, value in [('pool_sha256', '0' * 64), ('pool_size', 999),
                             ('person_id', 'SOMEONE ELSE'), ('ticket_id', 'FAKE'),
                             ('removed_ticket_ids', []), ('rank', True),
                             ('percentage', 6), ('selected_index', True)]:
            audit = copy.deepcopy(original)
            audit['selections'][0][field] = value
            # Even recomputing the edited event's hash must not validate bad transitions.
            event = audit['selections'][0]
            event['event_sha256'] = draw.digest({k: v for k, v in event.items() if k != 'event_sha256'})
            with self.assertRaises(ValueError, msg=field):
                draw.verify_rehearsal(self.data, audit)
        for field, value in [('snapshot_sha256', '0' * 64), ('excluded_ticket_ids', []),
                             ('final_event_sha256', '0' * 64), ('official_draw_authorized', True),
                             ('selections', original['selections'][:5])]:
            audit = copy.deepcopy(original)
            audit[field] = value
            with self.assertRaises(ValueError, msg=field):
                draw.verify_rehearsal(self.data, audit)

    def test_audit_verifier_rejects_invalid_timestamp_and_real_campaign(self):
        original = draw.rehearse(self.data)
        for value in ['', None, '2026-10-20T12:00:00', '2026-10-20T12:00:00+01:00']:
            audit = copy.deepcopy(original)
            audit['selections'][0]['timestamp_utc'] = value
            with self.assertRaises(ValueError):
                draw.verify_rehearsal(self.data, audit)
        self.data['campaign_id'] = 'REAL-CAMPAIGN'
        with self.assertRaises(ValueError):
            draw.verify_rehearsal(self.data, original)

    def test_cli_rehearsal_and_read_only_audit_verification(self):
        script = str(Path(draw.__file__).resolve())
        with tempfile.TemporaryDirectory() as temp:
            output = Path(temp) / 'rehearsal'
            run = subprocess.run([sys.executable, script, 'rehearse', '--output', str(output)],
                                 capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stderr)
            check = subprocess.run([sys.executable, script, 'verify-rehearsal',
                                    str(output / 'synthetic-input.json'), str(output / 'audit.json')],
                                   capture_output=True, text=True)
            self.assertEqual(check.returncode, 0, check.stderr)
            self.assertEqual(json.loads(check.stdout)['verified_selections'], 6)
            bad = subprocess.run([sys.executable, script, 'validate', str(Path(temp) / 'missing')],
                                 capture_output=True, text=True)
            self.assertEqual(bad.returncode, 2)
            self.assertNotIn('Traceback', bad.stderr)

    def test_official_approval_check_is_read_only(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            data, approval, source = self.official_fixture(root)
            before = copy.deepcopy((data, approval))
            with patch.object(draw.secrets, 'randbelow') as rng:
                result = draw.approval_check(data, approval, source, approval['operator'])
                rng.assert_not_called()
            self.assertFalse(result['selection_performed'])
            self.assertFalse(result['human_signatures_authenticated'])
            self.assertFalse(result['official_draw_authorized'])
            self.assertEqual(before, (data, approval))
            self.assertEqual(list(root.iterdir()), [source])

    def test_official_binding_and_approval_failures_prevent_selection(self):
        with tempfile.TemporaryDirectory() as temp:
            data, approval, source = self.official_fixture(Path(temp))
            for key in ['campaign_id', 'snapshot_sha256', 'source_sha256', 'tool_sha256',
                        'prize_percentages', 'drawing_at_utc', 'operator', 'signed_references',
                        'official_use_approved', 'cutoff_verified', 'private_storage_approved',
                        'native_mapping_approved', 'identity_review_approved', 'accounting_approved',
                        'recovery_and_no_rerun_approved']:
                altered = copy.deepcopy(approval)
                altered[key] = None
                with patch.object(draw.secrets, 'randbelow') as rng:
                    with self.assertRaises(ValueError, msg=key):
                        draw.official_draw(data, altered, source, approval['operator'], Path(temp) / 'custody')
                    rng.assert_not_called()
            for role in approval['signed_references']:
                altered = copy.deepcopy(approval)
                del altered['signed_references'][role]
                with self.assertRaisesRegex(ValueError, 'reference required'):
                    draw.approval_check(data, altered, source, approval['operator'])
            data['synthetic'] = True
            with self.assertRaisesRegex(ValueError, 'synthetic: false'):
                draw.approval_check(data, approval, source, approval['operator'])

    def test_official_start_time_and_public_repository_guards(self):
        class BeforeDrawing(datetime):
            @classmethod
            def now(cls, tz=None):
                return datetime(2026, 11, 15, 22, 59, tzinfo=timezone.utc)
        class AfterDrawing(datetime):
            @classmethod
            def now(cls, tz=None):
                return datetime(2026, 11, 15, 23, 1, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as temp:
            data, approval, source = self.official_fixture(Path(temp))
            custody = Path(temp) / 'custody'
            with patch.object(draw, 'datetime', BeforeDrawing), patch.object(draw.secrets, 'randbelow') as rng:
                with self.assertRaisesRegex(ValueError, 'cannot begin before'):
                    draw.official_draw(data, approval, source, approval['operator'], custody)
                rng.assert_not_called()
            self.assertFalse(custody.exists())
            public = Path(draw.__file__).resolve().parents[1] / 'artifacts' / 'NEVER-CREATE'
            with patch.object(draw, 'datetime', AfterDrawing), patch.object(draw.secrets, 'randbelow') as rng:
                with self.assertRaisesRegex(ValueError, 'outside the repository'):
                    draw.official_draw(data, approval, source, approval['operator'], public)
                rng.assert_not_called()
            self.assertFalse(public.exists())

    def test_fictional_official_path_persists_each_event_and_blocks_repeat(self):
        class FictionalClock(datetime):
            @classmethod
            def now(cls, tz=None):
                return datetime(2026, 11, 15, 23, 1, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as temp:
            data, approval, source = self.official_fixture(Path(temp))
            custody = Path(temp) / 'FICTIONAL-custody'
            with patch.object(draw, 'datetime', FictionalClock), patch.object(draw.secrets, 'randbelow', return_value=0):
                result = draw.official_draw(data, approval, source, approval['operator'], custody)
            self.assertTrue(result['human_result_verification_required'])
            audit = draw.load(custody / 'official-audit.json')
            transcript = [json.loads(line) for line in (custody / 'selection-events.jsonl').read_text().splitlines()]
            self.assertEqual(transcript, audit['selections'])
            self.assertEqual(len(transcript), 6)
            self.assertEqual(len(transcript[0]['removed_ticket_ids']), 10)
            self.assertEqual(draw.load(custody / 'approved-snapshot.json'), data)
            with patch.object(draw.secrets, 'randbelow') as rng:
                self.assertEqual(draw.verify_official(data, audit, approval, source, approval['operator'])['unique_winners'], 6)
                rng.assert_not_called()
            with patch.object(draw, 'datetime', FictionalClock), patch.object(draw.secrets, 'randbelow') as rng:
                with self.assertRaises(FileExistsError):
                    draw.official_draw(data, approval, source, approval['operator'], custody)
                rng.assert_not_called()
            audit['approval_sha256'] = '0' * 64
            with self.assertRaises(ValueError):
                draw.verify_official(data, audit, approval, source, approval['operator'])

    def test_interrupted_fictional_selection_preserves_lock_and_completed_events(self):
        class FictionalClock(datetime):
            @classmethod
            def now(cls, tz=None):
                return datetime(2026, 11, 15, 23, 1, tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as temp:
            data, approval, source = self.official_fixture(Path(temp))
            custody = Path(temp) / 'FICTIONAL-interrupted'
            with patch.object(draw, 'datetime', FictionalClock), patch.object(draw.secrets, 'randbelow', side_effect=[0, 0, RuntimeError('FICTIONAL interruption')]):
                with self.assertRaisesRegex(RuntimeError, 'FICTIONAL interruption'):
                    draw.official_draw(data, approval, source, approval['operator'], custody)
            self.assertTrue((custody / (draw.CAMPAIGN + '.started.json')).exists())
            self.assertEqual(len((custody / 'selection-events.jsonl').read_text().splitlines()), 2)
            self.assertFalse((custody / 'official-audit.json').exists())
            with patch.object(draw, 'datetime', FictionalClock), patch.object(draw.secrets, 'randbelow') as rng:
                with self.assertRaises(FileExistsError):
                    draw.official_draw(data, approval, source, approval['operator'], custody)
                rng.assert_not_called()

    def test_cli_approval_validation_without_selection(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            data, approval, source = self.official_fixture(root)
            snapshot, signed = root / 'FICTIONAL-snapshot.json', root / 'FICTIONAL-approval.json'
            snapshot.write_text(json.dumps(data), encoding='utf-8')
            signed.write_text(json.dumps(approval), encoding='utf-8')
            result = subprocess.run([sys.executable, str(Path(draw.__file__).resolve()), 'check-approval', str(snapshot),
                                     '--approval', str(signed), '--source', str(source), '--operator', approval['operator']],
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertFalse(json.loads(result.stdout)['selection_performed'])


if __name__ == '__main__':
    unittest.main()
