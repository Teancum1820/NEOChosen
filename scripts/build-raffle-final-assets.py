"""Update established editable raffle SVGs; preserve the original review files.

Uses existing local qrcode/zxing dependencies and Inkscape. No studio integration.
Run only after live ticket sales are verified. Raster files are SVG exports.
"""
import hashlib
import json
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = ROOT / 'source-assets/raffle-review-2026-10-19'
SOURCE = ROOT / 'source-assets/raffle-final-2026-10-20'
OUTPUT = ROOT / 'docs/raffle-finalization-2026-10-20/graphics'
sys.path.insert(0, str(OLD / '.deps'))
import qrcode
import zxingcpp
from PIL import Image

URL = 'https://neochosen.com/raffle/'
SVG = 'http://www.w3.org/2000/svg'
INKSCAPE = Path('C:/Program Files/Inkscape/bin/inkscape.exe')
ET.register_namespace('', SVG)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')


def tag(name):
    return '{' + SVG + '}' + name


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def main():
    SOURCE.mkdir(parents=True, exist_ok=True)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, border=4)
    qr.add_data(URL)
    qr.make(fit=True)
    matrix = qr.get_matrix()
    report = []
    for shape in ['square', 'story']:
        old = OLD / f'raffle-{shape}-draft-v1.svg'
        tree = ET.parse(old)
        root = tree.getroot()
        root.find(tag('title')).text = 'NEO Chosen Cash Raffle — Tickets available now'
        root.find(tag('desc')).text = 'KHG raffle; electronic drawing November 15, 2026 at 6 PM Eastern; sales close 5 PM Eastern. QR: ' + URL
        for text in root.iter(tag('text')):
            value = text.text or ''
            text.text = value.replace('DRAFT REVIEW  /  SALES CLOSED', 'TICKETS AVAILABLE NOW').replace(
                'PROPOSED TICKET PACKAGES', 'TICKET PACKAGES').replace(
                'Six cash prizes. One community.', 'Six cash prizes. One great cause.').replace(
                'Proposed terms • Final approval and eligibility details pending.',
                'No minimum dollar prize is guaranteed. Winners need not be present.').replace(
                'neochosen.com', 'neochosen.com/raffle/').replace('RAFFLE INFORMATION', 'GET RAFFLE TICKETS').replace(
                'RAFFLE INFO', 'GET TICKETS').replace('Drawing 6 PM Eastern', 'Electronic drawing 6 PM Eastern')
            if 'Electronic drawing' in (text.text or '') and shape == 'square':
                text.set('font-size', '23')
            if 'Six cash prizes. One great cause.' == text.text and shape == 'square':
                text.set('font-size', '26')
        for group in root.findall(tag('g')):
            if group.get('id') == '01 Review status':
                group.find(tag('rect')).set('fill', '#1B3648')
            if group.get('id') == '07 Information QR':
                for child in list(group):
                    if child.tag != tag('text'):
                        group.remove(child)
                layout = json.loads((OLD / f'raffle-{shape}-draft-v1.layout.json').read_text())
                x, y, width, _ = layout['qr_bounds']
                cell = width / len(matrix)
                ET.SubElement(group, tag('rect'), x=str(x), y=str(y), width=str(width), height=str(width), fill='white')
                for r, row in enumerate(matrix):
                    for c, dark in enumerate(row):
                        if dark:
                            ET.SubElement(group, tag('rect'), x=str(x+c*cell), y=str(y+r*cell),
                                          width=str(cell), height=str(cell), fill='black')
        svg = SOURCE / f'raffle-{shape}-v2.svg'
        png = OUTPUT / f'raffle-{shape}-v2.png'
        tree.write(svg, encoding='utf-8', xml_declaration=True)
        subprocess.run([str(INKSCAPE), str(svg), '--export-type=png', '--export-area-page',
                        '--export-filename=' + str(png)], check=True, capture_output=True)
        with Image.open(png) as image:
            assert image.size == (1080, 1080 if shape == 'square' else 1920)
            for w in [1080, 540]:
                resized = image.resize((w, image.height*w//1080), Image.Resampling.LANCZOS)
                assert [r.text for r in zxingcpp.read_barcodes(resized)] == [URL]
            webp = png.with_suffix('.webp')
            image.save(webp, quality=90, method=6)
            assert [r.text for r in zxingcpp.read_barcodes(Image.open(webp))] == [URL]
        query = subprocess.run([str(INKSCAPE), str(svg), '--query-all'], check=True, capture_output=True, text=True)
        for line in query.stdout.splitlines():
            parts = line.split(',')
            if len(parts) == 5 and parts[0].startswith('text-'):
                x, y, w, h = map(float, parts[1:])
                assert x >= 28 and x+w <= 1052 and y >= 0 and y+h <= int(root.get('height')), parts
        report.append({'shape': shape, 'source_original_sha256': sha(old), 'svg_sha256': sha(svg),
                       'png_sha256': sha(png), 'webp_sha256': sha(webp), 'decoded_full_and_half_size': URL,
                       'text_bounds': 'PASS', 'logos': 'Existing embedded artwork preserved',
                       'live_sales_evidence': '2026-10-20 public Zeffy enabled Add controls'})
    qr.make_image().save(OUTPUT / 'raffle-direct-qr.png')
    assert [r.text for r in zxingcpp.read_barcodes(Image.open(OUTPUT / 'raffle-direct-qr.png'))] == [URL]
    (OUTPUT / 'validation.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print('Exported two established layouts; all four full/half QR decodes and WebP decodes passed.')


if __name__ == '__main__':
    main()
