# Lighthouse baseline

Measured September 29, 2026 with `npm run lighthouse` on the local production `dist/` build. Lighthouse CI ran one mobile audit per page on this Windows workstation; scores can shift with Chrome version and external asset response times. Reports are generated in ignored `.lighthouseci/` and uploaded by CI.

| Route | Performance | Accessibility | Best Practices | SEO | LCP |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 69 | 96 | 79 | 100 | 16.9s |
| `/sponsors/` | 70 | 100 | 79 | 91 | 17.3s |
| `/chesterland/` | 70 | 100 | 100 | 100 | 15.6s |

The long LCP and third-party dependencies are the main performance concerns. Lighthouse also flags image delivery/render blocking, a missing sponsors-page meta description, and homepage iframe-title/label-name issues. The homepage and sponsors pages receive a 79 Best Practices score, including third-party cookie and Chrome Issues findings. These are existing-site findings; this PR does not change page content, forms, or external sources. `axe` finds no serious/critical WCAG-tagged violations in the four tested routes; Lighthouse's finer findings still need review.

The professional targets are Performance 85, Accessibility 95, Best Practices 95, and SEO 95. Initial CI failure floors are 55/90/75/90 to catch material regressions without making the present site permanently red. The next redesign should improve image delivery and external-resource behavior, then raise these floors after multiple stable CI runs. A single-run local result is a starting measurement, not a field Core Web Vitals claim.
