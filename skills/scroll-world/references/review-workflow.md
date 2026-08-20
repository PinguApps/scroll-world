# Approval-gated media review

Every stochastic image and video candidate is a human review checkpoint—including brand,
scene, social and portrait image generation. Generate images one at a time. Up to three
independent video candidates may run concurrently only after the user authorizes that named
batch and only within the selected provider's live/reported limit. Wan uses available
`taskQuota.video`; fal/Kling defaults to one unless the account reports more. Never parallelize dependency-linked clips or
competing revisions of one slot. Deterministic derivatives such as resizes, LQIPs and
extracted frames do not need a new thumbs-up, but must be visually compared with their
approved source. If any derivative will itself be used in a future prompt or generation
input, present it with the same thumbs-up/down gate first.

## Candidate cycle

1. Generate one candidate per slot/revision. Prefix scene media with its zero-padded order,
   keep `_rNN` last, and name connectors with both endpoint orders, for example
   `01_desktop-still-shop_r01.png`, `01_desktop-dive-shop_r01.mp4`, or
   `01-02_mobile-connector-shop-to-market_r02.mp4`. Insert `_vNN` before `_rNN` for a
   fan-out branch. Never overwrite a prior candidate.
2. Record order, branch when applicable, provider, model/modelVersion or endpoint,
   resolution when provider-controlled, returned dimensions, duration, aspect ratio, audio
   setting, prompt, input hashes, quality, request/task ID, output path, and creation time.
   Record billing data only when readily available.
   Mark fields that do not apply to a still as such.
3. Present the actual full-resolution still in chat. For video, create a lightweight review
   proxy if the raw file is awkward to display, plus first, 25%, 50%, 75%, and final-frame
   stills. Play the complete proxy at normal speed; contact sheets do not prove temporal
   quality. For reversible scroll motion, also inspect reverse playback. Show native-resolution
   crops of high-risk regions and the final boundary. For seams, show the required endpoint
   beside the candidate endpoint.
4. Ask for:
   - 👍 Approve.
   - 👎 Reject, followed by what is wrong.
   - Optional structured notes: camera movement, speed, composition, scene fidelity,
     style/colour consistency, artifacts, people/text/logos, framing/crop, opening frame,
     final frame, or seam continuity.
5. Stop. Silence, elapsed time, or a technically valid render is never approval.
6. On approval, mark the exact candidate immutable in the ledger. Only then may its pixels,
   frames, video, or review feedback be used in any future prompt or dependent generation.
7. On rejection, preserve it and log the notes. If the feedback is precise and the
   revision stays within the already approved allowance, a thumbs-down authorizes one
   revised candidate. Otherwise show the proposed prompt/input change and scope impact,
   then ask before generating.
8. Repeat until approved or the user explicitly abandons/substitutes that slot.

Before asking, state any objective defect already found. Do not invite approval for a
candidate known to violate the locked brief; still preserve it and obtain generation authority
before a replacement when the existing allowance does not cover one.

Maintain `.scroll-world/review/approval-ledger.md` (or equivalent project artifact) with one row per
image or video candidate: media type, order, slot, branch, orientation, revision, provider,
model, request/job ID, settings, status, feedback, and approved filename. Include rejected
generations in the final approximate spend summary. Treat Wan `taskQuota.video` as
concurrency, never credits or a daily allowance.

## Dependency rules

### Scene stills

Generate and approve every still individually before generating any video that uses it.
An approval locks the exact pixels, not merely the prompt. After all stills are individually
approved, show a contact sheet containing only those approved files and request a separate
world-level cohesion approval. If a still is reopened after video generation starts, every
video directly or transitively conditioned by that still is potentially invalid; identify
the affected regeneration scope before proceeding.

### Architecture A — continuous legs

Approve leg 1 before extracting its final frame and generating leg 2. The next leg starts
only from the exact approved predecessor frame. If an earlier approved leg is later
replaced, every downstream leg is invalid because its starting pixels changed. Explain
the regeneration scope before reopening it.

### Architecture B — dives and connectors

Generate one candidate per dive slot and review each separately; independent submissions may
share an explicitly approved safe-concurrency batch. Lock that approved dive set before
creating connectors. Apply the same per-candidate review rule to independent connectors.
Replacing a dive after connector work invalidates its adjacent connector(s); replacing a
connector affects only that connector.

### Optional fan-out branches

Every branch still/video gets its own thumbs-up/down before it can condition that branch's
next media. Branch approval means the candidate is viable for comparison; it does not select
the branch for production. After presenting the viable first videos together, require one
explicit winning branch. Mark the others inactive and exclude them from all future prompt,
frame, contact-sheet, and manifest inputs unless the user explicitly reopens one.

### Draft to production

Use an approved draft image/video to validate story, composition, prompt, and motion intent,
but production is a new stochastic render. Review every final-resolution candidate
independently. Do not upscale a draft and call it the production master.

### Desktop and native mobile

Finish and lock desktop first. Then create the independent 9:16 chain with its own ledger
entries and approvals. Desktop approval never carries over to portrait. An FFmpeg crop
fallback makes no provider generation request, but still requires visual approval because
it may lose the focal subject.

## Review standards

Approve only when:

- Every still clearly represents its intended section, respects the approved composition,
  palette and art direction, contains no unwanted text/logos/artifacts, and has enough safe
  framing for its target orientation.
- The opening frame matches its required source.
- The opening frame is meaningful and clean enough to become the public frame-0 poster and
  reduced-motion fallback.
- There is no rapid flashing, unsafe flicker, or unintended generated audio.
- The intended subject/action is readable throughout.
- No person, vehicle, prop, or other subject appears or disappears unexpectedly.
- Once a visible subject starts moving, it continues coherently or stops for an explicit,
  visible reason; it does not freeze mid-action, collide implausibly, or pop through an
  occluder. People retain complete, plausible anatomy throughout.
- Camera velocity and direction satisfy the handoff contract.
- No unwanted text, logos, anatomy/geometry failures, flicker, or style drift remain.
- Every generated light/effect line has a visible source, stays on its intended surface,
  and does not become an unexplained beam through the sky or environment.
- The final frame is usable for the next dependency.
- Architecture B connectors match both boundary frames and read naturally in both scroll
  directions.

After all candidates are approved, process and encode only the approved filenames. Never let
a shell glob accidentally select a rejected image or video revision.
