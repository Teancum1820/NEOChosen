# Design QA checklist

## Global

- [ ] Typography has clear display/body roles, natural word spacing, readable line height, and no clipping.
- [ ] Section spacing and alignment follow shared tokens; focus is visible by keyboard.
- [ ] Text and controls have appropriate contrast on their actual surfaces.
- [ ] Check 320, 375, 390, 430, 768, 1024, and 1440px layouts.

## Photography

- [ ] No image is distorted; crop and focal point preserve important faces and instruments.
- [ ] Resolution is adequate at displayed size; approved talent imagery has no AI alterations.
- [ ] Images have useful alt text and intrinsic dimensions; hero is prioritized and does not shift layout.

## Sponsors

- [ ] Great Lakes weekend presenting hierarchy is clear; event presenting and other tiers use confirmed assignments.
- [ ] Approved logos only, with clear space, native proportions, and legibility at 390px.
- [ ] No logo is stretched or recolored without approval.

## Mobile

- [ ] No horizontal overflow; navigation opens/closes and can be used by keyboard.
- [ ] Sponsor credits remain readable; interactive targets are around 44px where practical.
- [ ] Forms and tickets remain usable without accidental production submissions during testing.

## Events

- [ ] Every card clearly states date, time, venue, registration action, and free versus ticketed status.
- [ ] CTA destinations resolve to the intended route or registration URL.

Record intentional visual changes with reviewed Playwright baselines. Generated responsive screenshots and CI artifacts support the manual review; they do not replace it.
