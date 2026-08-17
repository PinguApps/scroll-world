---
name: scroll-world
description: Build a production-quality immersive AI-generated, scroll-scrubbed homepage in a Blazor Web App. Use for scroll cinematics, 3D or diorama worlds, fly-through landing pages, or turning a business journey into an interactive homepage. Covers discovery, brand identity, approval-gated still generation outside Wan, Wan 3.0 video generation through the wan CLI, responsive encoding, a proven smooth scroll engine, homepage SSR/SEO/AEO, Blazor InteractiveAuto lifecycle, accessibility, regression tests, and Lighthouse/browser QA. Supporting pages are outside scope except minimal placeholders needed for navigation.
---

# Scroll World for Blazor

Build and integrate one exceptional homepage:

- A spectacular scroll-scrubbed homepage.
- Server-rendered, crawlable homepage copy and metadata.
- Existing destinations reused where available; missing destinations may be minimal placeholder routes.
- A homepage that does not download or start Blazor on a fresh direct visit.
- Blazor InteractiveAuto on interactive pages; once started, it remains available when enhanced navigation returns home.
- Smooth, accumulated wheel scrolling with native touch and middle-button autoscroll.
- Verified homepage performance, accessibility, SEO/AEO, media lifecycle, and route behaviour.

Do not design or write substantive service, about, contact, legal, blog, or other supporting
pages. Do not take ownership of site-wide SEO/AEO, schema, robots, or sitemap work. Preserve
existing pages and SEO infrastructure unless a homepage integration change strictly requires
touching them.

The camera moves in pre-rendered video. Scroll controls time. The page never renders 3D in real time.

## Non-negotiable implementation contract

Preserve these defaults unless the user explicitly requests a different behaviour:

1. No scroll stops, snap points, or wheel-event-per-section navigation.
2. Desktop wheel deltas accumulate into one target. Rapid input must travel farther, never overwrite unfinished travel.
3. Smooth toward that target with frame-time-aware easing. Use `wheelMultiplier: 1` and `wheelResponse: 18` as the baseline.
4. Native scrolling owns touch, keyboard, scrollbar dragging, and Chrome middle-button autoscroll. A middle-button press cancels custom wheel/navigation animations.
5. Route dots animate for `navigationDuration: 1800`; each section may set `focus` to its most meaningful frame. Default `0.5`; finales often need `0.85–0.95` after visual QA.
6. Copy remains fully visible and motionless throughout a section. Crossing even 1 px into the next section triggers a quick independent fade. Reverse scroll reverses the section change.
7. Video seeking is demand-driven, coalesced while the decoder is busy, and jumps directly to the newest target. Never run a permanent 60 fps scrub loop.
8. Keep only nearby media loaded. Abort fetches, remove videos, and revoke Blob URLs when distant or disposed.
9. Leaving home removes every listener/frame/media resource. Non-home pages use native scrolling only.
10. Enhanced navigation resets the destination to scroll 0 atomically: unmount on navigation start, suppress remount during transition, set `scrollTo(... behavior: "instant")` at navigation end, then remount.
11. The initial homepage is SSR-only. If `[data-scroll-world-first-still]` exists on initial load, do not fetch `_framework/blazor.web.js`, server circuits, boot JSON, or WASM.
12. Non-home pages start Blazor after first paint/idle. Use InteractiveAuto so the first interactive visit can use Server while WASM downloads and later visits can use cached WASM.
13. If Blazor already started on another page, enhanced navigation home keeps that runtime and mounts the scroll world normally.
14. The first image is a server-rendered responsive `<picture>` built from the approved
    first video’s exact frame 0, with a tiny blurred LQIP fallback. When native mobile
    exists, the picture selects the approved portrait frame 0. Adopt it into the engine
    instead of duplicating it. Defer later posters.
15. Render meaningful headings, descriptions, and internal links in SSR HTML. The visual JS copy layer is `aria-hidden`; its duplicate CTA links are removed from tab order.

Use the canonical engine at `references/scrub-engine.js`. Do not rewrite or simplify its scheduling, scroll ownership, media cleanup, or lifecycle without adding regression coverage.

## Phase 1 — Inspect before changing anything

Read repository instructions and inspect the solution, current render modes, routes, layouts, asset pipeline, tests, and styling conventions. Preserve an existing design system. If none exists, use Tailwind CSS and build small project-local components; do not introduce a component library.

Confirm the app is a server-hosted Blazor Web App capable of InteractiveAuto. If it lacks a WebAssembly client or enabling Auto requires a structural conversion, explain that change and get approval before doing it.

Audit prerequisites without mutating the machine or account:

- `wan` installed and current. Run `wan --version`, `wan update --check --output json`,
  `wan auth status --output json`, and `wan credits --output json`. If an update exists,
  ask before running it; if the user declines, stop video generation because the current
  top model cannot be guaranteed. Treat `taskQuota.video` as currently available concurrent video
  submission slots, not a daily allowance. Never submit more than three video tasks or the
  lower live quota.
- `ffmpeg` and `ffprobe` on PATH.
- A native script route for the media pipeline: PowerShell 7 on Windows or Bash 3.2+ with
  `jq` on Unix-like systems. Do not assume one shell from another.
- Python 3 + Pillow only if knockout or LQIP tooling needs it.
- A direct ChatGPT/Codex image-generation tool for every stochastic still. Never use Wan's
  image commands in this skill. If direct image generation is unavailable, stop and ask the
  user to supply images or approve another non-Wan image source.
- A supported .NET SDK, the repository’s JS package runner when applicable, and an
  existing Chrome/Edge or browser-automation route for real interaction QA.
- An existing Lighthouse installation/runner for performance auditing.

If anything is missing, report the exact requirement and command. Never install tools, authenticate, switch workspaces, buy/use credits, or change account state without explicit approval. Run generation only after the user approves the estimated spend.

## Phase 2 — Interview and lock the brief

Ask only decisions that change the result. Group questions into short rounds.

1. Subject, audience, location/service area, offers, proof, objections, CTA, contact details, and one-sentence commercial goal.
2. Brand source: import from an existing site, supplied kit, or propose a full identity for approval. Capture name, voice, typography direction, and 4–6 named colours.
3. Art direction and ordered journey. Propose 5–7 scenes derived from the customer journey or value chain. Every scene needs subject, eyebrow, headline, body, up to three tags, service link if relevant, and intended focal moment.
4. Camera style, always ask by feel and record as `CAMERA`:
   - **Fly through the world**: expressive dives and aerial hops; architecture B. Recommend
     for miniature/map-like diorama worlds. Direction reverses at seams by design.
   - **One continuous walkthrough**: expressive but always-forward legs; architecture A.
     Recommend for grounded or photoreal worlds.
   - **Locked isometric glide**: one fixed angle with the world moving beneath it;
     architecture A plus the locked-isometric prompt clause. Calmest and cheapest to re-roll.
   Explain the trade-off in one line each. Phase 4 implements this choice; it does not silently
   re-decide it.
5. Mobile media, always ask: desktop only or a second native 9:16 chain. Explain that
   native portrait approximately doubles video spend and may add `N` portrait image
   generations when separate compositions are required. Never silently call a centre
   crop “mobile-optimised.”
6. Quality, always inspect the current CLI and account state. Use the top Wan video model;
   with the current CLI this is Wan 3.0 (`modelVersion=3_0`). Do not select an older model
   for cheaper drafts. Re-check the CLI default before each build so “top model” does not
   become a stale hard-coded assumption.

   | Tier | Wan settings | Purpose |
   |---|---|---|
   | Draft/previz | Wan 3.0, `720P`, generated audio off | Motion, composition, and seam validation |
   | Production | Wan 3.0, `1080P`, generated audio off | Required final master |

   Generate all stochastic stills with the direct ChatGPT/Codex image-generation tool,
   using one approved style/model path throughout. Never call `wan text2image`,
   `wan image2image`, or `wan sequential_image` from this skill. Disable generated video
   audio with `--audio-output=false`; the homepage is muted.
7. CTA destinations: reuse existing routes/external destinations, or ask permission to create
   minimal “Coming soon” placeholders for missing internal routes. A placeholder contains only
   a heading, short status sentence, and link home; never turn it into a substantive page.
8. Deployment/media origin: local assets for development or a CDN. Capture the canonical
   production origin for homepage canonical/social metadata and homepage JSON-LD.

Calculate `N images + (2N−1) accepted videos` for architecture B, or `N images + N
accepted sequential legs` for A. Native mobile doubles video work and adds `N` image
generations when it needs separately generated portrait compositions; a reviewed
floating-island canvas derivative adds no generation. Show accepted-media base work
separately from a realistic 25–50% revision allowance (more for ambitious motion). Report
the live Wan credit balance and current video concurrency; never invent a fixed price when
the CLI does not expose one.

Use staged spend approval because live prices vary:

1. Approve the preflight estimate before any paid generation.
2. Generate/review one image candidate through the non-Wan image tool and confirm the
   remaining image plan before continuing.
3. After the approved image set/cohesion gate, generate/review one representative 720p Wan
   video, measure the credit change, recalculate the remaining video budget, and confirm it
   before continuing.

Never treat a budget allowance as permission to batch or auto-reroll.

Write down the approved choices and success criteria before generating.

## Phase 3 — Design the homepage

Create a distinctive identity and homepage story before media. The homepage is the “look at
me” overview. Its links may target existing pages, approved external destinations, or minimal
placeholder routes.

Write only the concise content needed by the cinematic sections and semantic homepage layer.
Avoid keyword stuffing, invented testimonials, fake reviews, fake pricing, fake credentials,
or unsupported claims. Do not flesh out linked pages.

Implement homepage title, description, canonical, Open Graph/Twitter metadata, accessible
heading hierarchy, and only truthful homepage JSON-LD. Use `WebPage`, `WebSite`, and a
truthful `Organization`/`LocalBusiness` only when the required facts are supplied.
Homepage-visible offers may use truthful `Offer`/`Service` relationships. Do not create or
overhaul site-wide robots, sitemap, breadcrumbs, supporting-page schema, FAQ schema, or
supporting-page metadata. Report any existing crawl rule that blocks the homepage. Read
`references/homepage-foundation.md` before implementation.

Target WCAG 2.2 AA for skill-created homepage UI and reject rapid flashing/flicker. Do not
add analytics, tracking pixels, cookies, consent tooling, or legal pages unless explicitly
requested; preserve and report existing site behaviour instead.

## Phase 4 — Generate a seamless media chain

Read `references/prompts.md`, `references/pipeline.md`, and `references/media-gotchas.md` completely before generating.

Use `wan frame2video` for every generated clip. Pass local boundary-frame paths directly;
the CLI validates and uploads them. Use `--first-frame` for each section leg/dive and add
`--last-frame` for architecture-B connectors. With Wan 3.0 frame-to-video, let the output
ratio follow the input frame (`adaptive`); prepare approved 16:9 desktop or 9:16 portrait
boundary frames before submission. Always pass `--resolution 720P` for tests or
`--resolution 1080P` for production, `--audio-output=false`, and `--output json`.

Before submissions, read `taskQuota.video` from `wan auth status --output json`. The maximum
parallelism is `min(3, taskQuota.video)`. Architecture-A legs remain sequential because each
depends on the previous approved final frame. Architecture-B dives/connectors may use the
available slots only when candidates are independent, the user approved the batch spend,
and every candidate still receives its own review. Never start downstream prompting from an
unapproved candidate.

Use one byte-identical style preamble, palette, lens/lighting language, and still source
throughout. Generate and approve every stochastic image through
`references/review-workflow.md`, exactly one candidate at a time. After every scene still is
individually approved, present a contact sheet of approved stills for final world-level
cohesion approval. Do not begin video generation before that approval.

Generate all media through the approval gate in `references/review-workflow.md`:

1. Generate one image candidate at a time. Generate at most three independent video
   candidates concurrently, never exceeding the lower live Wan quota; use one-at-a-time
   whenever dependency order requires it.
2. Download it and present the actual candidate with its prompt, model/source, dimensions,
   quality/settings, revision number, and measured credit deduction where applicable. For
   video, also create review frames/proxy and report duration.
3. Wait for an explicit thumbs-up/approval or thumbs-down with feedback.
4. On rejection, preserve the old candidate, record the fault, revise only what the
   feedback warrants, and generate one replacement within the approved revision budget.
5. Only an approved still may condition a video. Only an approved video may provide a
   boundary frame or allow the next video to begin.

Approval never transfers to a stochastic re-render: final-resolution images/videos and native
portrait variants require their own review. Desktop approval does not approve mobile.

The seam rule is absolute:

- Architecture A: each next leg starts from the previous leg’s actual final rendered
  frame. End and begin with the same gentle forward drift. No connectors. Use the exact
  first frame plus the locked scene/style prompt; never substitute a concept still for the
  previous leg’s exact start frame.
- Architecture B: connector start = previous dive’s actual final frame; connector end = next dive’s actual first frame. Never use the original concept still as a connector endpoint.

Use the current top Wan video model across the complete chain. At present that is Wan 3.0.
Verify with the current CLI before the first candidate and never silently fall back to an
older model.

Keep raw outputs. Production source renders are 1080p. Encode H.264 at CRF
about 20, GOP 8, fixed keyframe interval, yuv420p, no audio, faststart, with restrained
sharpening. Native mobile is portrait, typically 720 px wide, CRF about 23, GOP 4. Never
upscale a lower-resolution source. Do not use all-intra without measured evidence. The
engine fetches clips to Blob URLs so seekability does not depend on host byte-range support.

After videos are approved, extract posters from each approved section clip’s exact frame 0;
do not publish the 3:2 concept inputs as video posters. Generate desktop first-picture
sources at 640, 960, and full width, plus a tiny blurred placeholder. For native mobile,
also generate portrait first-picture sources (normally 480 and 720 wide) and a portrait
LQIP. The placeholder is the initial CSS background, not a replacement for the eagerly
loaded high-priority first image.

## Phase 5 — Integrate with Blazor

Read `references/blazor-integration.md` completely. Copy/adapt:

- `references/scrub-engine.js` → `wwwroot/js/scrollWorld/engine.js`.
- `assets/blazor/scroll-world-index.js.template` → `wwwroot/js/scrollWorld/index.js`.
- `assets/blazor/app-bootstrap.js` → `wwwroot/js/app-bootstrap.js`.
- `assets/blazor/BlazorWarmup.razor` → a shared client component.
- `assets/blazor/Home.razor.template` → the homepage structure.
- `assets/blazor/scroll-world.css.template` → critical first-frame/LQIP and theme CSS.
- `assets/blazor/App.razor.integration.template` → root SSR/runtime wiring.
- `assets/blazor/Placeholder.razor.template` → optional minimal destination for a missing route.

Replace every `{{PLACEHOLDER}}`; never ship template tokens. Keep the config data-driven. Tune `scroll`, `linger`, and `focus` against actual rendered frames rather than assuming equal pacing. A scene’s copy transition is boundary-based; `linger` affects video time only.

Use the project’s existing JS/CSS bundler if present and keep equivalent resolved import
paths. If it has none, the templates are browser-valid ES modules under `wwwroot/js`.
Include the project-specific scroll-world CSS in the existing stylesheet pipeline or root
head and verify its LQIP appears before JavaScript. Remove the stock
`<ResourcePreloader />` and stock `blazor.web.js` script. Load only the application module
normally; it loads `blazor.web.js` away from a fresh homepage.

## Phase 6 — Test and tune

Read `references/qa.md`. Add regression tests in the repository’s established test stack. For Blazor UI, follow its behavioural/Reqnroll/bUnit conventions if present. At minimum cover the pure scroll helpers and source/lifecycle contracts from `assets/tests/scroll-world-engine.test.mjs.template`.

Verify in a real browser, not only unit tests:

- Slow wheel, rapid wheel bursts, reversing direction, scrollbar drag, middle-button autoscroll, route dots, touch, keyboard, reduced motion.
- Visible keyboard focus and programmatic current state for route controls.
- Copy changes exactly at boundaries and remains fully settled otherwise.
- Every scene’s meaningful stop, especially the finale; tune `focus` visually.
- Home → other route starts at 0 without a visible pre-navigation rush; other route → home also starts at 0.
- No scroll engine handlers or media work on non-home routes.
- Fresh direct homepage after an extended idle makes zero Blazor framework/server/WASM requests.
- Direct interactive page hydrates; InteractiveAuto works; then enhanced navigation home keeps the existing runtime and mounts the cinematic.
- Only nearby clips remain loaded; leaving home aborts/revokes everything.
- Seams in both directions, desktop and opted-in mobile. Judge composition and props, not
  raw PSNR: codec/detail shimmer can produce a modest score on a visually correct seam.

Build and run all relevant tests. Run Lighthouse against the homepage in a production build
with consistent desktop and mobile profiles for performance, accessibility, best practices,
and SEO; inspect the homepage SSR HTML as a crawler; validate its JSON-LD and links. Aim for
all Lighthouse categories ≥95, local desktop LCP <1 s when realistic, CLS <0.1, INP
<200 ms, no long tasks during scroll, and no framework cost on a fresh homepage. These are
measured targets—not a promise of sub-second field/mobile LCP or a licence to hide content
or falsify results. Report results and remaining media/CDN risks honestly.

## Phase 7 — Handoff

Deliver:

- The finished Blazor homepage integration and generated assets.
- A short list of approved choices and tuned per-section pacing/focus values.
- Build/test/Lighthouse/network results.
- Media spend, Wan task IDs/model, and rerolls.
- Any deployment assumptions. For a CDN such as Bunny, recommend versioned immutable URLs, Brotli for text assets, correct MIME/CORS, long cache lifetimes, and byte-range support; Blob loading still provides robust local seekability.
- A clear note if mobile is desktop fallback/crop rather than native portrait.
- A clear boundary note that substantive supporting pages and site-wide SEO/AEO remain
  outside this skill.

Do not claim completion until the solution builds, relevant automated tests pass, browser behaviour is verified, and the fresh-home no-Blazor network assertion passes.

## Reference routing

- `references/prompts.md` — intake and image/video prompt patterns.
- `references/pipeline.md` — non-Wan still generation, Wan video generation, frame extraction, encoding, native mobile chain.
- `references/scrub-engine.js` — canonical engine; copy rather than reimplement.
- `references/blazor-integration.md` — exact SSR/InteractiveAuto and enhanced-navigation wiring.
- `references/homepage-foundation.md` — homepage SSR/SEO/AEO, accessibility, LQIP, and CDN.
- `references/qa.md` — regression and browser/performance matrix.
- `references/media-gotchas.md` — generation, seam, encoder, and device failure guide.
- `references/review-workflow.md` — mandatory per-candidate approval ledger and dependency gates.
- `references/knockout.py` — optional border-connected background knockout.
- `assets/blazor/*` — integration and critical-CSS templates.
- `assets/tests/*` — portable Node regression-test template.
