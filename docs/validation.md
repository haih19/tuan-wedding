# Implementation validation

## Completed

- Astro build produces prerendered `/bride/`, `/groom/`, root redirect and Vercel API functions. TypeScript check, meaningful tests and Prettier checks run before delivery.
- Server tests cover phone normalization, RSVP side/count/transport rules, spreadsheet upserts and creation timestamps, locking during writes, wish deduplication/moderation/side filtering, formula-safe cells and input/error boundaries. Apps Script tests use in-memory service doubles; they are not live Google tests.
- Browser: bride/groom invitations and event emphasis; bride has no transport controls, groom has bus/self; decline hides/disables dependent fields. Submission without credentials returns truthful unavailable status and preserves inputs.
- Browser: gallery link opens dialog, next changes `1 / 11` to `2 / 11`, Escape closes and restores focus. QR dialog shows the selected recipient only.
- Browser: MP3 starts after explicit tap. A passive second tab stays off; explicit activation in that tab changes the previous tab to off. This verifies the Web Locks path in the desktop browser used, not every fallback/Safari behavior.
- Chrome viewport verification at 390px: two gallery columns, no horizontal overflow, 11 images decoded successfully. Desktop uses three columns. Responsive image request returns WebP successfully after explicitly adding Sharp.
- Elegant and Traditional builds were both verified; only chosen palette is embedded in static pages. System font stack, no GSAP/React/runtime theme switch. Motion uses opacity/transform and IntersectionObserver, with CSS and runtime reduced-motion handling.
- Default sample MP3 about 2.3 MB. Client script 9,873 bytes raw / 4,013 bytes gzip in the final build. Responsive WebP assets are generated at build, full originals are requested by lightbox. Maps/wishes defer near viewport; music waits for hero readiness or user tap, and data saver defers background audio loading.
- npm audit after updating Astro/Vercel and patching routing dependency: zero known vulnerabilities at installation time.

## Required before sending the real invitation

1. Configure private Google Apps Script deployment and verify real Sheet writes/updates/approval. No access to the owner's Google account or deployed script was supplied in this task.
2. Replace sample wedding names, parents, dates, addresses, actual Maps embeds, photography/audio and mock QR. Configure real `SITE_URL` and social preview image. Local builds currently use a clearly documented example domain.
3. Deploy to Vercel; test production redirects/canonical/OG via Messenger. No live Vercel deployment was performed.
4. Measure production mobile Lighthouse/CWV with the final assets/network profile; no measured Lighthouse score or LCP guarantee is claimed here.
5. Test iPhone Safari/Messenger, reduced motion at OS level, audio autoplay rejection, background/suspension, denied storage, and older-browser lease fallback on physical devices. Web Locks is the stronger ownership path; fallback coordination is best-effort on browsers with unusual storage/suspension behavior.
