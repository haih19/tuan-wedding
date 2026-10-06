# Prototype validation

- Reviewed hero at 390 × 844 and 1280 × 900; no horizontal overflow at those widths.
- Textured invitation leaves and wax seal automatically reveal the decoded hero; replay provided. Hero names/date are centered near the bottom; countdown sits below in the invitation.
- Bride hides transport fields; groom shows shared bus/self transport. Declining attendance hides guest-count/transport region.
- Gallery dialog opened; next-image control and keyboard navigation verified. QR dialog identifies selected recipient.
- Self-contained HTML loads gallery and works without adjacent image files.
- No browser console errors observed during review.
- Physical-device swipe, production API, audio and real Maps are not verified/implemented in this design prototype.
- Traditional currently demonstrates restrained red tokens on shared layout; full theme differentiation remains subject to visual review.

- Added staggered hero text after the invitation starts opening, and one-time scroll reveals with IntersectionObserver. Motion uses opacity/transform, honors reduced motion, and reveals focused form/gallery elements.
