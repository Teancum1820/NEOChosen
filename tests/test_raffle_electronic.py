import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import raffle_electronic as draw


class ElectronicRehearsalTests(unittest.TestCase):
    def setUp(self):
        self.data = draw.synthetic()

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


if __name__ == '__main__':
    unittest.main()
