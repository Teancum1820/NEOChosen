"""Create review artifacts in a NEW folder from fictional fixtures only.

Never opens a production register, confirms paper, or selects random winners.
"""
import argparse
import json
import tempfile
from pathlib import Path

from raffle_ops import prize_example, simulate_draw, strict_json
from raffle_print import batch, connect, register_report, sync


def rehearse(output):
    root = Path(__file__).resolve().parents[1]
    document = strict_json((root / 'tests/fixtures/raffle-six-winners.sample.json').read_text())
    campaign = document['campaign_id']
    if not campaign.startswith('SAMPLE-'):
        raise ValueError('Fictional campaign fixture required')
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=False)
    with tempfile.TemporaryDirectory() as temporary:
        db = connect(Path(temporary) / 'sample.sqlite')
        try:
            result = sync(db, document, campaign)
            prepared = batch(db, output, campaign, sample=True)
            repeated = sync(db, document, campaign)
            assert repeated['snapshot_sha256'] == result['snapshot_sha256']
            try:
                batch(db, output, campaign, sample=True)
            except ValueError as error:
                if 'No new eligible tickets' not in str(error):
                    raise
            else:
                raise AssertionError('Duplicate sample batch was not refused')
            report = register_report(db, campaign)
            assert not report['ready_entries']
        finally:
            db.close()
    draw = simulate_draw(result['ledger'], ['3012', '3001', '3002', '3019', '3022', '3023'])
    prize = prize_example(result['accounting']['included_ticket_sales_cents'])
    summary = {
        'simulation_only': True, 'physical_rehearsal_completed': False,
        'summary': result['summary'], 'accounting': result['accounting'],
        'prepared_stub_count': prepared['count'], 'confirmed_paper_count': 0,
        'repeat_import_idempotent': True, 'repeat_batch_refused': True,
        'source_fixture': 'tests/fixtures/raffle-six-winners.sample.json',
    }
    for name, value in [('sample-summary.json', summary), ('sample-register-report.json', report),
                        ('sample-draw-simulation.json', draw), ('sample-prize-report.json', prize)]:
        (output / name).write_text(json.dumps(value, indent=2) + '\n', encoding='utf-8')
    (output / 'README.md').write_text(
        '# SAMPLE ONLY - not valid drawing entries\n\n'
        'Generated from the fictional six-person fixture by scripts/raffle_rehearsal.py. '
        'Open the batch HTML to review printing and its JSON manifest to reconcile numbers. '
        'There are 29 eligible sample stubs; 3 refunded sample tickets are excluded. '
        'Files were prepared, not physically printed, checked or placed into custody. '
        'The explicit simulated selections produce C, A, B, D, E, F; C loses all 10 '
        'remaining entries across two orders after the first selection. No real winner was selected. '
        'The illustrative prize basis is $440, six prizes total $176 and retained funds $264 '
        'before expenses. HALF_UP cent rounding is illustrative, not approved policy. '
        'Use one set of sample stubs only. Keep all sample paper out of the real drawing.\n',
        encoding='utf-8')
    return summary


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True, help='New review-artifact directory')
    print(json.dumps(rehearse(parser.parse_args().output), indent=2))
