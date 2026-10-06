# Wedding invitation

Astro + TypeScript + Tailwind, based on the approved HTML prototype. The invitation is prerendered; only the RSVP and wishes APIs run on Vercel. No React or animation library is loaded.

## Run

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4322/bride/` or `/groom/`. The root redirects to the bride. The older prototype remains in `prototype/`, served separately on port 4321.

```sh
npm run check
npm run test
npm run format:check
npm run build
```

## Change wedding information

Edit `src/config/wedding.ts`: names, parents, dates (ISO with timezone offset), venues, Maps links/embed URLs, story, hero, gallery, music, gift recipients and QR images, and SEO. Both routes rebuild from this one file. Names in photos, audio and image metadata are sample assets from the reference project; replace them for the real wedding.

- Choose `WeddingTheme.Elegant` or `WeddingTheme.Traditional` in config. Palette tokens are in `src/themes/elegant.css` and `traditional.css`. Only the selected palette reaches the page; no runtime theme toggle.
- Place WebP photos in `public/images/`. Config references `/images/filename.webp`. Astro creates responsive WebP versions at build time. Gallery originals load when the lightbox opens. There are 11 sample photos; replace with 10–20 actual photos.
- `music.src` points to an MP3 in `public/music/`; set it to an empty string to hide music. The sample MP3 is about 2.3 MB. It is deferred until hero readiness; slow connections/data saver defer until a tap. Compress/replace it before launch.
- Maps use the embed URL from Google Maps Share → Embed a map (`https://www.google.com/maps/embed?...`). An empty embed URL displays an honest pending-location state and a directions link. Actual addresses/embeds are not configured yet.
- Gift QR images are deliberately nonpayable mocks. Replace each QR, recipient, bank/account and set `isMock: false`. Both routes show both recipients, with separate labeled dialogs.

## Connect private Google Sheets

1. Create a private spreadsheet owned by the groom. Open Extensions → Apps Script, paste `integrations/sheets-script.js`.
2. In Apps Script Project Settings → Script Properties add `SHARED_SECRET` with a long random value. Keep it private.
3. Run `setupSheets()` once and authorize Google access. It records `SPREADSHEET_ID` in script properties and creates `Bride RSVP`, `Groom RSVP`, `Wishes` with headers. Do not rename/reorder columns.
4. Deploy → New deployment → Web app. Execute as **Me**, access **Anyone**. The script checks the server-only secret for every request; do not share its secret or publish the spreadsheet.
5. Copy `.env.example` to `.env` locally. Set `SHEETS_SCRIPT_URL` to the deployment `/exec` URL and `SHEETS_SCRIPT_SECRET` to the same secret. Add both to Vercel Environment Variables. They never use a `PUBLIC_` prefix.
6. Set `SITE_URL` to the actual public Vercel/custom domain before building/deploying. Local builds use `https://wedding.example.com` for metadata until configured; never share that placeholder as a real invitation. Canonical and OG URLs use this setting, not request origin or localhost.
7. Verify one RSVP, a repeat using the same phone, a decline, a bride entry and a groom bus entry. Phone columns stay text. RSVP updates retain creation time, update modification time, and bus seats equal guest count.
8. Wishes begin with `pending`. Change `status` to `approved` in the Wishes tab to publish, or `rejected` to hide. Public results are filtered by invitation side and expose name/message only. Vercel edge cache expires after ~60 seconds.

The script uses a script lock to serialize writes across Vercel function instances. Duplicate wish retries are deduplicated; repeated RSVP updates target phone + side. Identical wishes remain deduplicated permanently. Short rate controls and a honeypot reduce accidental/spam submissions; they are not a bot-proof service. No OTP is used, as agreed: someone knowing another guest's phone can overwrite that RSVP.

The app reports success only after the backend confirms storage. Without Sheets configuration, APIs return an honest unavailable message and retain form inputs. The live Google account deployment cannot be verified until the owner configures it. See `docs/validation.md` for completed checks and outstanding integration/device checks.

## Loading, motion and music

Hero gets priority and responsive dimensions. The two invitation leaves open after hero load/decode, with a 3.5 second fallback. System fonts, opacity/transform motion and one-time IntersectionObserver reveals avoid scroll listeners. Reduced-motion users skip nonessential animation. Gallery has lazy thumbnails, keyboard/swipe lightbox, focus restoration and no zoom. Maps/wishes load near their section.

First music visit defaults off; preference is stored locally. Returning enabled visits attempt playback, but browser autoplay can require another tap. Playback starts once the browser has enough buffered data; buffering and errors update the control. Web Locks enforce one active tab on supported browsers; BroadcastChannel/storage lease coordinates fallback browsers. Explicit enable in a new tab stops the old tab before acquiring ownership. Hidden tabs stop playback to release ownership on mobile suspension. Storage permissions, private modes and older browsers may affect fallback coordination; physical Safari/Messenger browser testing remains required.

## Vercel

Import the repository with the Astro preset, install `npm ci`, build `npm run build`. The adapter outputs `.vercel/output` with static `/bride/` and `/groom/` plus `/api/rsvp` and `/api/wishes` server routes. Configure the three environment variables above and redeploy. Actual public deployment is not performed by this implementation task.

`path-to-regexp` is overridden to the compatible patched 6.x version for Vercel's routing dependency. Keep the lockfile committed; re-run audit/check/build when updating packages.
