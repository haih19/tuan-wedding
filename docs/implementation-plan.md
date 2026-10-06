# Implementation plan

Implementation is in place. Read README.md for setup and docs/validation.md for verified behavior and outstanding checks. The original steps below remain as the implementation checklist.

1. Visual design: draft mobile-first Elegant composition and Traditional variation; review envelope, hero, gallery, forms and QR modal. Establish color/spacing/motion tokens and responsive behavior.
2. Foundation: initialize Astro/TypeScript/Tailwind/Prettier, theme enum/registry, typed config and sample assets. Confirm production build includes selected theme only.
3. Static invitation: bride/groom pages, root redirect, route-aware invitations, shared venues, gallery markup, gifts, metadata and config-driven content.
4. Client behavior: hero-ready envelope, countdown, lazy Maps, gallery/QR accessible modals, audio loading/preferences/exclusive ownership. Avoid animation dependencies.
5. Data integration: private Sheets adapter, separate RSVP tabs, validated upsert/idempotency, wishes submission/moderation/filter/cache. Integrate forms with truthful status and retries.
6. Verification: type/build/format checks; meaningful tests for phone normalization, side routing, RSVP updates and transport counts, approved-wish filtering. Browser tests for forms, lightbox/QR, envelope fallbacks, reduced motion and multiple audio tabs.
7. Performance: inspect production bundles and selected theme CSS; measure mobile Lighthouse and scroll behavior with actual assets. Check image/audio/Maps request scheduling and reserved geometry.
8. Deployment: configure Vercel and server secrets, deploy when authorized, verify canonical/OG images on production and preview routes. Test Messenger links and Safari/mobile interactions; document any unverified environments.
9. Handoff: README explaining config, palettes, assets, themes, Sheet approval workflow, deployment and maintenance. Record final validation results and remaining limitations.

Completion requires real backend save/update verification, side-filtered moderated wishes, no overlapping audio in supported tested browsers, production metadata without localhost, and explicit reporting of any mock assets or checks needing account/device access.
