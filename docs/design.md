# Wedding page — design and decisions

Status: HTML prototype approved by the couple. Astro implementation now exists; live Sheets/Vercel integration and final wedding assets remain to be configured.

## Understanding

- Personal wedding invitation for approximately 500 guests, mobile first, hosted on Vercel Hobby.
- Astro + TypeScript + Tailwind CSS, Prettier. Static invitation pages with small client interactions and server endpoints for Sheets.
- Shared content/configuration; no admin UI, accounts, OTP, live theme switch, zoom, or heavy animation library in the first version.
- Two build-time themes: Elegant (default, white/ivory, restrained accents) and Traditional (restrained red on a light background).
- Groom manages one private Google spreadsheet: Groom RSVP, Bride RSVP, Wishes.
- Mock content/assets clearly identified until actual wedding information is supplied.

## Routes and content

- `/` redirects to `/bride`; `/bride` and `/groom` are prerendered.
- Both pages show both venues and both gift QR codes. Invitation copy, emphasized event, RSVP and approved wishes depend on route.
- Sections: envelope entry, single-image portrait hero with centered names/date; countdown in invitation section, couple, love story, venues, gallery, wishes, RSVP, gifts/footer.
- Event titles, dates/times/timezone, addresses, map URLs and invitation text are configuration, not component literals.
- Explicit production site URL powers canonical, og:url, absolute OG image URLs and route-specific share metadata. Never emit localhost in production metadata.

## Configuration and source boundaries

- WeddingTheme enum: Elegant, Traditional; config references enum. Theme registry selects the stylesheet at build time.
- Theme CSS variables define semantic colors, surfaces, text, borders, interactions and spacing where appropriate. Components reference tokens; changing palette does not require enum changes.
- Central typed wedding config exports route/event data and references typed gallery/music/gift data. Secrets remain server environment variables.
- Proposed directories: src/config, src/types, src/themes, src/styles, src/layouts, src/components, src/scripts, src/server, src/pages, tests.
- Static Astro components by default. Add React only for a demonstrated need, not for all interactive elements.

## Entry and loading

- Two textured vertical invitation leaves with a central wax seal appear while the hero image loads, inspired by the TikTok reference. Automatically opens after hero load and decode, with a short transform/opacity transition.
- No wait for gallery, Maps, audio or wishes. Bounded timeout/error fallback reveals usable invitation; no indefinite intro.
- Hero is one image, not a slideshow. Provide responsive sizes and priority loading; reserve image geometry.
- Envelope must not permanently hide content if scripting fails. Reduced motion removes nonessential opening animation.
- System fonts. Gallery thumbnails lazy-load; full-size images load on opening. Reserve Maps geometry and defer embed near its section, with loading placeholder and directions link.

## Audio

- First visit defaults off. Load audio in background after hero is ready; explicit play before then starts audio loading immediately.
- Play when enough data is available, not after the full MP3 download. Loading follows actual buffering/playback; error/autoplay rejection offers a clear retry.
- Save user on/off preference in localStorage. Returning enabled visits attempt playback when ready, subject to autoplay policy.
- Only one tab may play across bride/groom on the same origin/browser profile. Preference and playback ownership are separate state.
- A tab with playback ownership prevents passive restoration in another tab. Explicit enable elsewhere stops the previous owner before playback starts.
- Ownership lifecycle must cover reload, close, suspension and failed playback; use browser coordination with an exclusive lock where available and a tested fallback. Do not claim coordination across devices/profiles.

## Gallery and QR

- 10–20 configurable images; editorial arrangement with varied portrait/landscape rhythm and straightforward mobile tap targets.
- Gallery available before interaction script loads. Lightbox: contain image, swipe previous/next, wraparound, counter, close/backdrop, Escape/arrow keys, focus handling and scroll restoration.
- No pinch zoom in first version. Distinguish horizontal swipe from vertical gesture.
- Both QR cards appear on both routes. Popup displays only selected QR and recipient identity.
- Static mock QR labeled non-payable; replace image paths and recipient/bank fields in config later. No payment integration.

## Forms and Sheets

- Both RSVP forms: name, phone, attendance; guest count only when attending.
- Groom attending form: shared bus or own transport. Bus seats equal guest count when shared bus selected, otherwise zero.
- Bride has no transport question. No bus pickup/time yet; groom communicates arrangements via Zalo manually.
- Normalize phone numbers; key is side + normalized phone. Re-submission updates existing row; retain creation time and update modification time.
- No OTP. Accepted risk: someone knowing another guest phone can overwrite that RSVP.
- Server validates payload, route/side and guest counts. Clear hidden values when attendance changes. Prevent double submission and serialize/conflict-handle updates so retries/concurrent requests do not create duplicate rows.
- Success only after storage confirmation. Preserve inputs on error, support retry; timeout results require reconciliation/idempotent retry.
- Wishes: name/message/side/status/timestamps. Submission remains pending; manager approves in Sheet.
- Public API filters by side and approved status, returning only public fields. Never expose spreadsheet or RSVP phone data.
- Fetch wishes near section; short cache proposed (about one minute), loading/empty/error/retry states. Approval does not require rebuild.
- Server-side Sheets credentials/authentication, bounded input sizes and proportionate abuse controls. API remains separate from page rendering.

## Design and motion

- design-taste-frontend: restrained production guardrail. high-end-visual-design: subtle interactions.
- TikTok reference: large wedding photography, bright invitation-like vertical layout, rhythmic photo clusters. Inspiration only, no claim to reproduce exact fonts/assets.
- System fonts supersede skill font defaults. User constraints supersede cinematic/nav/nested-card defaults.
- CSS transform/opacity transitions and small IntersectionObserver reveals. No GSAP/Motion dependency initially; no scroll hijacking, continuous decorative effects or forced pinning.
- Content visible and usable without animation. Reduced motion, keyboard focus, contrast, touch target sizing and accessible modal semantics required.

## Performance and reliability assumptions

- Lab target: hero LCP around or below 2.5 seconds on agreed simulated mobile/4G settings; CLS below 0.1. Not a guarantee on every network/device.
- Core invitation independent of Sheets availability. API failures must not block reading the page.
- 500 invited people is not 500 simultaneous submissions. Assess actual request/asset usage against current hosting quotas.
- Groom owns data management; user owns config/build/deploy maintenance. Personal noncommercial hosting assumed.

## Decision log

| Decision                                          | Alternatives                                    | Reason                                                                                          |
| ------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Astro + TypeScript + Tailwind                     | Next.js; Astro with React everywhere; plain CSS | Static content with small independent interactions; typed config; consistent responsive styling |
| New source                                        | Extend mock directly                            | User explicitly requests build from scratch                                                     |
| Build-time theme enum and CSS tokens              | Runtime switching; literal colors               | Simple reuse and no client theme-switch cost                                                    |
| System fonts and restrained CSS motion            | Downloaded fonts; GSAP scroll effects           | Mobile load and usability priority                                                              |
| Bride/groom routes, root to bride                 | Extra side field; selection landing             | Fewer form fields and safer sharing for bride guests                                            |
| Shared venues/QR; side-specific invite and wishes | Entirely separate pages or mixed wish feed      | Complete event information, clear RSVP grouping                                                 |
| One private spreadsheet, separate tabs            | Multiple spreadsheets                           | One manager and clear separation of different RSVP fields                                       |
| Approved wishes fetched after build               | Instant public wishes; rebuild per approval     | Moderation with simple Sheet workflow                                                           |
| Update RSVP by phone + side, no OTP               | Append duplicates; verified updates             | Simple guest flow; overwrite risk accepted                                                      |
| Shared bus seats = attending guest count          | Extra seat field                                | User confirms all registered guests use same transport choice                                   |
| Auto-open envelope after hero                     | Click to open; await every asset                | Desired invitation experience with limited waiting                                              |
| Single-tab audio ownership                        | Simultaneous playback                           | Prevent overlapping music                                                                       |
| 10–20 gallery photos, lightbox without zoom       | Larger gallery; pinch zoom                      | Scope and mobile interaction agreed                                                             |

## Open implementation decisions / required inputs

- Layout and Elegant palette approved; final real wedding content/assets pending.
- Actual names, timezone-aware event dates/times, venues, Maps, photos, audio and final QR/OG assets.
- Google spreadsheet/account access and credentials at integration stage; no secret values in docs.
- Concrete Sheets API/auth choice, cache strategy, concurrency and browser audio fallback validated during technical design.
- Agree test device/network configuration; Messenger/Safari physical-device verification may require user participation.
