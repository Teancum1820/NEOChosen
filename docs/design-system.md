# NEOChosen design system foundation

`site.css` is the single theme layer for new visual values. Tokens use a category and semantic role, such as `--color-text-primary`, `--type-h2`, or `--space-section-md`. Existing `--site-*` names remain aliases so this foundation does not restyle production pages. New component work should consume tokens rather than add isolated colors and dimensions. Radius tokens use `--neo-radius-*` to avoid colliding with current page-local radius variables.

## Color and hierarchy

Dark brand background and light text support the existing event identity. Gold marks primary emphasis and focus; teal is a restrained secondary accent. Light/elevated surfaces, subtle borders, error, and success values are available for future forms and content. Always check contrast in the actual surrounding surface. Great Lakes is the weekend presenting sponsor; event presenting credits and other tiers remain distinct. Use approved sponsor artwork at its native aspect ratio, with clear space and no recoloring.

## Type

Cinzel is the display face for hero and major headings. Montserrat is the body, navigation, event-detail, and form face. Cormorant Garamond is an optional accent used sparingly. The semantic scale runs from `--type-display` through H1–H4, large/body/small, and eyebrow. Use `--leading-tight` for display text and `--leading-body` for reading text; preserve normal word spacing and allow wrapping at small widths. Existing page-local typography will be migrated in the design PR after visual review.

## Space, layout, and responsive behavior

Use the `--space-*` scale for component rhythm and `--space-section-*` for sections. `--content-narrow`, `--content-standard`, `--content-wide`, and `--content-full` define reading and page widths. New work should adapt fluidly and be reviewed at 320, 375, 390, 430, 768, 1024, and 1440px. Avoid fixed heights on text blocks. Tokens include radius and shadow levels for the same purpose.

## Motion

`--motion-fast`, `--motion-standard`, `--motion-slow`, and `--easing-standard` support subtle hover/fade/translate effects. New components must honor `prefers-reduced-motion`; no animation package is needed for this static site.

## Photography and images

Keep approved talent photography and logos unaltered. Provide meaningful alt text, intrinsic width and height, and a focal point with `object-position` where cropped. The future-facing `design-system/image.mjs` helper emits these attributes, responsive `srcset`, lazy loading, and opt-in hero priority. Generate WebP/AVIF variants with `npm run images:optimize` only after reviewing their use; originals remain in place. The current production pages do not yet use that helper.

## Component review

`npm run storybook` opens **Design System / NEOChosen**, a development-only review page with token samples and current built-site fragments for event cards, sponsor cards, sponsor credits, navigation, performers, CTA, and forms. It is outside `dist/`. The next visual PR should replace workshop-only primitives with site components when a component is reused publicly.

Tailwind and shadcn/ui would require introducing a client component architecture into this static HTML site; neither is included. Motion would add runtime weight without a current need.
