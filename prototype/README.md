# Elegant HTML prototype

Design review only. Sample names, addresses, photos and wishes. Forms do not transmit/store data. Maps are visual placeholders. QR is deliberately non-payable. Audio is a visual control only; production loading/tab coordination is specified in ../docs/design.md.

Open index.html directly, or run `python3 -m http.server 4321 --directory prototype` from the project root.

Review links: `/index.html?side=bride` and `/index.html?side=groom`. These query links are for reviewing this HTML prototype; production uses /bride and /groom with / redirecting to /bride.

The footer button replays the envelope. Gallery and QR modals work; gallery supports arrow keys, Escape and mobile horizontal swipe.

No external font, animation library or map request is required. Photos are copied from the supplied reference source for provisional visual review. Replace with approved couple assets for production.

Publish only the prototype directory for a shareable static preview. Local localhost URLs cannot be opened by friends on other devices. A public Vercel preview has not been deployed by this step.

Self-contained file: elegant-preview.html (about 5 MB). Send this file and open it in a browser; it includes images. The review bar switches bride/groom and offers an initial Traditional palette variant. These controls are prototype-only, not production theme controls. Rebuild with python3 prototype/package-preview.py.
