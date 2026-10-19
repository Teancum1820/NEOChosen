"""Build local DRAFT raffle artwork; never modifies website or publishes.

Requires Pillow, qrcode 8.2, zxing-cpp 3.1.1 and Inkscape.
See source-assets/raffle-review-2026-10-19/README.md for reproduction.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import html
import json
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-assets/raffle-review-2026-10-19"
DOCS = ROOT / "docs/raffle-review-2026-10-19"
sys.path.insert(0, str(SOURCE / ".deps"))
import qrcode
import zxingcpp
from PIL import Image, ImageDraw, ImageFont

URL = "https://neochosen.com/raffle/"
INK = "#112636"
GOLD = "#E8BD73"
CREAM = "#FFF9ED"
MUTED = "#C7D6DC"
PANEL = "#1B3648"
RED = "#9C263C"
INKSCAPE = Path("C:/Program Files/Inkscape/bin/inkscape.exe")
FONT = Path("C:/Windows/Fonts/arial.ttf")
BOLD = Path("C:/Windows/Fonts/arialbd.ttf")
LOGOS = {
    "khg": ROOT / "images/partners/kirtland-heritage-group.webp",
    "great-lakes": ROOT / "images/great-lakes-auto-group-black.png",
}
PRIZES = [20, 6, 5, 4, 3, 2]
PACKAGES = [(20, 1), (50, 3), (100, 7)]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def qr_matrix():
    matrix = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, box_size=1, border=4)
    matrix.add_data(URL)
    matrix.make(fit=True)
    return matrix.get_matrix()


class Art:
    def __init__(self, height):
        self.height = height
        self.layers = {}
        self.texts = []
        self.current = "background"

    def layer(self, name):
        self.current = name

    def add(self, value):
        self.layers.setdefault(self.current, []).append(value)

    def rect(self, x, y, w, h, fill, radius=0, **attrs):
        extra = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" {extra}/>')

    def text(self, value, x, y, size, fill=CREAM, bold=False, anchor="start", max_width=None):
        ident = f"text-{len(self.texts):03d}"
        font = ImageFont.truetype(str(BOLD if bold else FONT), size)
        width = font.getlength(value)
        if max_width is not None and width > max_width:
            raise ValueError(f"Text exceeds allotted width: {value!r}: {width} > {max_width}")
        left = x - (width / 2 if anchor == "middle" else width if anchor == "end" else 0)
        if left < 30 or left + width > 1050:
            raise ValueError(f"Text exceeds safe horizontal area: {value!r}")
        self.texts.append({"id": ident, "text": value, "x": x, "baseline": y,
                           "font_size": size, "width": round(width, 2), "layer": self.current})
        self.add(f'<text id="{ident}" x="{x}" y="{y}" font-family="Arial" font-size="{size}" '
                 f'font-weight="{700 if bold else 400}" text-anchor="{anchor}" '
                 f'fill="{fill}">{html.escape(value)}</text>')

    def logo(self, name, x, y, w, h):
        image_path = SOURCE / "assets" / ("khg-render.png" if name == "khg" else "great-lakes-auto-group-black.png")
        data = base64.b64encode(image_path.read_bytes()).decode("ascii")
        self.add(f'<image id="logo-{name}" x="{x}" y="{y}" width="{w}" height="{h}" '
                 f'preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,{data}"/>')

    def qr(self, x, y, cell=6):
        rows = qr_matrix()
        side = len(rows) * cell
        self.rect(x, y, side, side, "#FFFFFF")
        cells = " ".join(f"M{x+c*cell},{y+r*cell}h{cell}v{cell}h-{cell}z"
                         for r, row in enumerate(rows) for c, dark in enumerate(row) if dark)
        self.add(f'<path id="qr-modules" fill="#000000" shape-rendering="crispEdges" d="{cells}"/>')
        self.qr_bounds = [x, y, side, side]

    def save(self, path):
        layers = "\n".join(f'<g id="{name}" inkscape:groupmode="layer" inkscape:label="{name}">'
                           + "\n".join(elements) + "</g>" for name, elements in self.layers.items())
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
 xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
 width="1080" height="{self.height}" viewBox="0 0 1080 {self.height}">
<title>NEO Chosen Cash Raffle — DRAFT REVIEW / SALES CLOSED</title>
<desc>Proposed terms, pending final approval. Kirtland Heritage Group is the raffle operator.
Great Lakes Auto Group is the NEO Chosen Weekend Presenting Sponsor only.
QR information destination: {URL} Original editable vector composition with approved existing logos.
Navy, gold and ivory are review design choices, not a claim of official brand standards.</desc>
<defs><linearGradient id="wash" x1="0" y1="0" x2="1" y2="1">
<stop stop-color="#112636"/><stop offset="1" stop-color="#234B59"/></linearGradient></defs>
{layers}</svg>'''
        path.write_text(svg, encoding="utf-8")
        write_json(path.with_suffix(".layout.json"), {"size": [1080, self.height], "texts": self.texts,
                                                      "qr_bounds": self.qr_bounds})


def base(height):
    a = Art(height)
    a.rect(0, 0, 1080, height, INK)
    a.add(f'<path d="M680 68H1080V{height*.55}C700 {height*.35} 880 260 680 68Z" fill="url(#wash)"/>')
    a.add('<circle cx="1000" cy="250" r="170" fill="none" stroke="#E8BD73" stroke-width="1" opacity=".18"/>')
    a.add('<circle cx="1000" cy="250" r="200" fill="none" stroke="#E8BD73" stroke-width="1" opacity=".12"/>')
    a.layer("01 Review status")
    a.rect(0, 0, 1080, 76 if height == 1080 else 96, RED)
    a.text("DRAFT REVIEW  /  SALES CLOSED", 540, 49 if height == 1080 else 61,
           32 if height == 1080 else 38, bold=True, anchor="middle")
    a.layer("02 Editable title")
    return a


def packages(a, y, height, price_size):
    a.layer("04 Proposed packages")
    a.text("PROPOSED TICKET PACKAGES", 60, y - 14, 19, MUTED, bold=True)
    for i, (price, entries) in enumerate(PACKAGES):
        x = 60 + i * 328
        a.rect(x, y, 304, height, CREAM, radius=10)
        a.text(f"${price}", x+152, y+price_size+10, price_size, INK, True, "middle")
        a.text(f"{entries} {'ticket' if entries == 1 else 'tickets'}", x+152, y+height-19,
               25 if height < 130 else 28, INK, anchor="middle")


def square():
    a = base(1080)
    a.text("KHG COMMUNITY FUNDRAISER", 60, 117, 19, MUTED, True)
    a.text("NEO CHOSEN", 60, 183, 62, bold=True)
    a.text("CASH RAFFLE", 60, 262, 80, GOLD, True)
    a.text("Six cash prizes. One community.", 60, 303, 27)
    a.layer("03 Cash prizes")
    a.rect(60, 327, 960, 169, PANEL, radius=12)
    a.text("GRAND PRIZE", 84, 364, 19, MUTED, True)
    a.text("20%", 80, 452, 91, GOLD, True)
    a.add('<path d="M395 351V470" stroke="#6B8290" stroke-width="1"/>')
    a.text("6% / 5% / 4% / 3% / 2%", 428, 382, 35, bold=True, max_width=565)
    a.text("40% TOTAL ACROSS SIX CASH PRIZES", 428, 423, 22, GOLD, True, max_width=565)
    a.text("Percentages of eligible gross raffle-ticket sales", 428, 462, 20, max_width=565)
    packages(a, 540, 103, 43)
    a.layer("05 Schedule")
    a.text("NOVEMBER 15, 2026", 60, 694, 35, bold=True)
    a.text("Drawing 6 PM Eastern  /  Ticket cutoff 5 PM Eastern", 60, 733, 27, GOLD)
    a.layer("06 Approved logos and roles")
    a.rect(60, 788, 700, 210, "#FFFFFF", radius=10)
    a.logo("khg", 78, 801, 266, 133)
    a.text("RAFFLE OPERATOR", 211, 963, 20, INK, True, "middle")
    a.text("Kirtland Heritage Group", 211, 987, 18, INK, anchor="middle")
    a.add('<path d="M367 810V978" stroke="#D9DEE1"/>')
    a.logo("great-lakes", 405, 815, 308, 137)
    a.text("NEO Chosen Weekend", 558, 963, 19, INK, anchor="middle")
    a.text("Presenting Sponsor only", 558, 988, 19, INK, True, "middle")
    a.layer("07 Information QR")
    a.text("RAFFLE INFO", 909, 774, 18, MUTED, True, "middle")
    a.qr(798, 788)
    a.text("neochosen.com/raffle/", 60, 1035, 29, GOLD, True)
    a.layer("08 Approval note")
    a.text("Proposed terms • Final approval and eligibility details pending.", 60, 1064, 19, MUTED)
    return a


def story():
    a = base(1920)
    a.text("KHG COMMUNITY FUNDRAISER", 60, 224, 25, MUTED, True)
    a.text("NEO CHOSEN", 60, 311, 78, bold=True)
    a.text("CASH RAFFLE", 60, 420, 104, GOLD, True)
    a.text("Six cash prizes. One community.", 60, 478, 33)
    a.layer("03 Cash prizes")
    a.rect(60, 532, 960, 264, PANEL, radius=14)
    a.text("GRAND PRIZE", 90, 580, 23, MUTED, True)
    a.text("20%", 82, 725, 143, GOLD, True)
    a.add('<path d="M498 560V765" stroke="#6B8290" stroke-width="1"/>')
    a.text("40%", 545, 649, 80, bold=True)
    a.text("TOTAL PRIZE SHARE", 548, 696, 25, GOLD, True)
    a.text("Across six cash prizes", 548, 737, 26)
    for i, (label, pct) in enumerate(zip(["2ND", "3RD", "4TH", "5TH", "6TH"], PRIZES[1:])):
        x = 60+i*192
        a.rect(x, 826, 178, 122, PANEL, radius=8)
        a.text(label, x+89, 860, 20, MUTED, True, "middle")
        a.text(f"{pct}%", x+89, 918, 48, bold=True, anchor="middle")
    a.text("Percentages of eligible gross raffle-ticket sales", 60, 989, 27, MUTED)
    packages(a, 1045, 139, 56)
    a.layer("05 Schedule")
    a.text("NOVEMBER 15, 2026", 60, 1257, 47, bold=True)
    a.text("Drawing 6 PM Eastern", 60, 1311, 33, GOLD, True)
    a.text("Ticket cutoff 5 PM Eastern", 60, 1353, 29)
    a.layer("06 Approved logos and roles")
    a.rect(380, 1402, 640, 264, "#FFFFFF", radius=12)
    a.logo("khg", 399, 1429, 275, 138)
    a.text("RAFFLE OPERATOR", 536, 1603, 20, INK, True, "middle")
    a.text("Kirtland Heritage Group", 536, 1632, 18, INK, anchor="middle")
    a.add('<path d="M691 1428V1638" stroke="#D9DEE1"/>')
    a.logo("great-lakes", 716, 1438, 277, 123)
    a.text("NEO Chosen Weekend", 854, 1603, 19, INK, anchor="middle")
    a.text("Presenting Sponsor only", 854, 1632, 19, INK, True, "middle")
    a.layer("07 Information QR")
    a.qr(60, 1402, cell=8)
    a.text("RAFFLE INFORMATION", 208, 1732, 20, MUTED, True, "middle")
    a.text("neochosen.com/raffle/", 380, 1732, 34, GOLD, True)
    a.layer("08 Approval note")
    a.text("Proposed terms • Final approval and eligibility details pending.", 60, 1780, 24, MUTED)
    return a


def stage():
    (SOURCE / "assets").mkdir(parents=True, exist_ok=True)
    DOCS.mkdir(parents=True, exist_ok=True)
    records = []
    for key, path in LOGOS.items():
        dest = SOURCE / "assets" / path.name
        shutil.copyfile(path, dest)
        assert sha(path) == sha(dest), f"Staged logo differs from original: {key}"
        records.append({"id": key, "original_repo_path": path.relative_to(ROOT).as_posix(),
                        "staged_path": dest.relative_to(ROOT).as_posix(), "sha256": sha(path),
                        "staged_sha256": sha(dest), "dimensions": list(Image.open(path).size),
                        "credit": "Kirtland Heritage Group" if key == "khg" else "Great Lakes Auto Group",
                        "approval_evidence": "User explicitly approved existing KHG and GreatLakes logos in repo for this assignment.",
                        "rights": "User-directed use for local DRAFT review; no additional license terms asserted."})
    with Image.open(LOGOS["khg"]) as im:
        im.save(SOURCE / "assets/khg-render.png")
    with Image.open(LOGOS["khg"]) as im, Image.open(SOURCE / "assets/khg-render.png") as rendered:
        assert im.convert("RGBA").tobytes() == rendered.convert("RGBA").tobytes()
    records.append({"id": "khg-render", "path": "assets/khg-render.png",
                    "sha256": sha(SOURCE / "assets/khg-render.png"),
                    "derived_from_sha256": sha(LOGOS["khg"]),
                    "operation": "Lossless WebP-to-PNG container conversion; decoded RGBA pixels identical. No crop/recolor."})
    write_json(SOURCE / "asset-manifest.json", {"approval_state": "DRAFT", "assets": records,
               "qr_destination": URL, "qr_error_correction": "Q", "qr_quiet_zone_modules": 4,
               "fact_sources": ["User assignment 2026-10-19", "source-assets/raffle-preview/public-launch.html",
                                "source-assets/raffle-preview/official-rules.html"],
               "fonts": [{"family": "Arial", "path": str(p), "sha256": sha(p)} for p in [FONT, BOLD]],
               "font_substitutions": [], "palette": "Provisional navy/gold/ivory; not asserted official branding."})
    write_json(SOURCE / "project.json", {"name": "NEO Chosen raffle review 2026-10-19", "category": "SocialMedia",
               "approval_state": "DRAFT", "version": "v1", "dimensions": [[1080, 1080], [1080, 1920]],
               "formats": ["SVG", "PNG"], "engine": "Original layered SVG, Inkscape PNG export",
               "scope_note": "User limits writes to assigned repo paths; studio create_project/create_vector_design only support studio-root outputs, so equivalent project metadata and custom compositions are created in assigned paths."})


def validate(svg, png, height, inkscape):
    root = ET.parse(svg).getroot()
    assert root.attrib["width"] == "1080" and root.attrib["height"] == str(height)
    ns = {"s": "http://www.w3.org/2000/svg"}
    texts = ["".join(n.itertext()) for n in root.findall(".//s:text", ns)]
    for value in ["DRAFT REVIEW  /  SALES CLOSED", "20%", "NOVEMBER 15, 2026",
                  "RAFFLE OPERATOR", "Kirtland Heritage Group", "NEO Chosen Weekend", "Presenting Sponsor only"]:
        assert value in texts, value
    assert sum(PRIZES) == 40
    assert all(f"${price}" in texts and f"{n} {'ticket' if n == 1 else 'tickets'}" in texts for price, n in PACKAGES)
    assert all(f"{p}%" in " ".join(texts) for p in PRIZES)
    combined = " ".join(texts)
    assert "Drawing 6 PM Eastern" in combined and "cutoff 5 PM Eastern" in combined
    assert "Final approval and eligibility details pending." in combined
    assert "nationwide" not in " ".join(texts).lower()
    assert len(root.findall(".//s:image", ns)) == 2
    assert all(n.attrib.get("{http://www.w3.org/1999/xlink}href", "").startswith("data:image/png;base64,")
               for n in root.findall(".//s:image", ns))
    with Image.open(png) as im:
        assert im.size == (1080, height)
        decoded = zxingcpp.read_barcodes(im.convert("RGB"))
        assert [r.text for r in decoded] == [URL], decoded
        small = im.resize((540, height//2), Image.Resampling.LANCZOS)
        assert [r.text for r in zxingcpp.read_barcodes(small.convert("RGB"))] == [URL]
    query = subprocess.run([str(inkscape), str(svg), "--query-all"], capture_output=True, text=True, check=True)
    bounds = {}
    for line in query.stdout.splitlines():
        parts = line.split(",")
        if len(parts) == 5 and parts[0].startswith("text-"):
            ident, *coords = parts
            x, y, w, h = map(float, coords)
            assert x >= 28 and x+w <= 1052 and y >= 0 and y+h <= height, (ident, coords)
            bounds[ident] = [x, y, w, h]
    assert len(bounds) == len(texts)
    return {"svg": svg.relative_to(ROOT).as_posix(), "png": png.relative_to(ROOT).as_posix(),
            "dimensions": [1080, height], "qr_full_size": URL, "qr_half_size": URL,
            "embedded_logos": 2, "editable_text_nodes": len(texts), "text_bounds": "PASS (Inkscape actual glyph bounds)",
            "required_copy": "PASS", "sha256_svg": sha(svg), "sha256_png": sha(png),
            "visual_review": "PENDING_AGENT_INSPECTION", "human_approval": "DRAFT"}


def update_checksums():
    files = [p for folder in [SOURCE, DOCS] for p in folder.rglob("*")
             if p.is_file() and ".deps" not in p.parts and "__pycache__" not in p.parts
             and p.name != "SHA256SUMS.txt"]
    files.append(Path(__file__).resolve())
    (DOCS / "SHA256SUMS.txt").write_text(
        "\n".join(sha(p) + "  " + p.relative_to(ROOT).as_posix() for p in sorted(files)) + "\n",
        encoding="utf-8")


def standalone_qr(inkscape):
    """Export the same module matrix without changing the reviewed graphics."""
    DOCS.mkdir(parents=True, exist_ok=True)
    preserved = [p for folder in [SOURCE, DOCS] for p in folder.glob("raffle-*-draft-v1.*")]
    before = {p: sha(p) for p in preserved}
    rows = qr_matrix()
    cell = 20
    side = len(rows) * cell
    art = Art(side)
    art.qr(0, 0, cell)
    svg = DOCS / "raffle-info-qr-v1.svg"
    png = DOCS / "raffle-info-qr-v1.png"
    svg.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="{side}" height="{side}" viewBox="0 0 {side} {side}">
<title>Raffle information QR</title>
<desc>Exact payload: {URL} Four-module white quiet zone. Error correction Q.
Reusable information asset; associated raffle graphics retain DRAFT REVIEW / SALES CLOSED banners.</desc>
{"".join(art.layers["background"])}</svg>''', encoding="utf-8")
    subprocess.run([str(inkscape), str(svg), "--export-type=png", "--export-area-page",
                    f"--export-filename={png}", f"--export-width={side}", f"--export-height={side}"],
                   capture_output=True, text=True, check=True, timeout=120)
    root = ET.parse(svg).getroot()
    assert root.attrib["width"] == str(side) and root.attrib["height"] == str(side)
    decoded_sizes = []
    with Image.open(png) as im:
        assert im.size == (side, side)
        rgb = im.convert("RGB")
        for r, row in enumerate(rows):
            for c, dark in enumerate(row):
                assert rgb.getpixel((c*cell+cell//2, r*cell+cell//2)) == ((0, 0, 0) if dark else (255, 255, 255))
        for width in [side, side//2, len(rows)*4]:
            resized = rgb.resize((width, width), Image.Resampling.LANCZOS)
            assert [result.text for result in zxingcpp.read_barcodes(resized)] == [URL]
            decoded_sizes.append(width)
    # Compare every module to both approved renders, rather than checking the URL alone.
    matches = []
    for name in ["square", "story"]:
        layout = json.loads((SOURCE / f"raffle-{name}-draft-v1.layout.json").read_text(encoding="utf-8"))
        x, y, width, _ = layout["qr_bounds"]
        embedded_cell = width // len(rows)
        with Image.open(DOCS / f"raffle-{name}-draft-v1.png") as im:
            rgb = im.convert("RGB")
            for r, row in enumerate(rows):
                for c, dark in enumerate(row):
                    assert rgb.getpixel((x+c*embedded_cell+embedded_cell//2, y+r*embedded_cell+embedded_cell//2)) == (
                        (0, 0, 0) if dark else (255, 255, 255))
        matches.append(name)
    assert all(sha(p) == digest for p, digest in before.items())
    record = {"id": "raffle-info-qr-v1", "origin": "Generated locally from the same QR matrix as embedded graphics",
              "payload": URL, "dimensions": [side, side], "matrix_modules_with_quiet_zone": len(rows),
              "quiet_zone_modules": 4, "error_correction": "Q", "pixels_per_module": cell,
              "svg": svg.relative_to(ROOT).as_posix(), "sha256_svg": sha(svg),
              "png": png.relative_to(ROOT).as_posix(), "sha256_png": sha(png)}
    manifest_path = SOURCE / "asset-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["standalone_qr"] = record
    write_json(manifest_path, manifest)
    report = {"status": "PASS", **record, "independent_decoder": "zxing-cpp",
              "decoded_at_widths": decoded_sizes, "decoded_payload": URL,
              "exact_module_match_to_embedded_pngs": matches,
              "existing_draft_graphic_sha256_unchanged": True, "quiet_zone_and_module_pixels": "PASS",
              "visual_review": "PENDING_AGENT_INSPECTION"}
    write_json(DOCS / "qr-validation-v1.json", report)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inkscape", type=Path, default=INKSCAPE)
    parser.add_argument("--qr-only", action="store_true", help="Export standalone QR and preserve existing reviewed graphics")
    args = parser.parse_args()
    if args.qr_only:
        report = standalone_qr(args.inkscape)
        update_checksums()
        print(json.dumps(report, indent=2))
        return
    stage()
    reports = []
    for name, art in [("square", square()), ("story", story())]:
        stem = f"raffle-{name}-draft-v1"
        svg = SOURCE / f"{stem}.svg"
        png = DOCS / f"{stem}.png"
        art.save(svg)
        result = subprocess.run([str(args.inkscape), str(svg), "--export-type=png", "--export-area-page",
                                 f"--export-filename={png}", "--export-width=1080", f"--export-height={art.height}"],
                                capture_output=True, text=True, check=True)
        reports.append(validate(svg, png, art.height, args.inkscape))
    sheet = Image.new("RGB", (1120, 1040), "#E9EDF0")
    draw = ImageDraw.Draw(sheet)
    for i, (report, label) in enumerate(zip(reports, ["SQUARE / 1080 × 1080", "STORY / 1080 × 1920"])):
        draw.text((20+i*560, 12), label, fill=INK, font=ImageFont.truetype(str(BOLD), 21))
        with Image.open(ROOT / report["png"]) as im:
            im.thumbnail((540, 960), Image.Resampling.LANCZOS)
            sheet.paste(im.convert("RGB"), (10+i*560, 55))
    sheet.save(DOCS / "contact-sheet-v1.png")
    write_json(DOCS / "validation-v1.json", {"status": "AUTOMATED_CHECKS_PASS", "approval": "DRAFT",
               "engine_version": subprocess.check_output([str(args.inkscape), "--version"], text=True).strip(),
               "prize_percentages": PRIZES, "prize_total_percent": sum(PRIZES), "packages": PACKAGES,
               "fonts": "Arial regular/bold installed; no substitutions", "outputs": reports,
               "visual_review": "PENDING_AGENT_INSPECTION"})
    standalone_qr(args.inkscape)
    update_checksums()
    print(json.dumps({"status": "PASS", "outputs": [r["png"] for r in reports], "qr": URL}, indent=2))


if __name__ == "__main__":
    main()
