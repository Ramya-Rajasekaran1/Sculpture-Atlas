---
name: Turntable fidelity
description: Source-footage interaction constraints and limits of synthetic rotation views.
---

Keep the footage-based sculpture viewer user-controlled, without autoplay.

**Why:** The user requested that the videos respond to mouse, touch, clicks, or keys rather than play on their own.

**How to apply:** Rotation affordances and input smoothing are welcome; do not turn the viewer into an automatically playing video.

Prefer authentic source-video viewpoints over optical-flow interpolation or crossfading neighboring rotation frames. A brief crossfade when switching sculptures may use a snapshot of the exact outgoing source frame, but never synthesize intermediate carved views.

**Why:** Tests of the supplied sculptures produced texture warping, block artifacts, and doubled carving edges in synthetic intermediate views.

**How to apply:** Improve input cadence and decoding without claiming new geometry. For artwork changes, dissolve the captured outgoing frame into the new sculpture's authentic first view; for finer angular detail, obtain denser authentic source views while preserving consistent foreground cutouts.

Captured mouse pointers and recording controls must not appear in any scan view, including views reached only while dragging.

**Why:** The user repeated the cursor-removal request after earlier cleanup covered only some views of the recording.

**How to apply:** Check the complete source sequence rather than only the initial frame or thumbnail. Preserve interaction pointers separately from pointers baked into the footage.
