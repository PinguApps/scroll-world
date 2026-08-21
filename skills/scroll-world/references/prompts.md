# Prompt templates & intake

Everything here is fill-in-the-slots. Keep the **style preamble** byte-for-byte identical
across all scene stills — that identical text is what makes the world feel like one place.

## Contents

1. Intake and locked choices
2. Shared style preamble
3. Scene-image prompts and review
4. Architecture A leg prompts
5. Architecture B dive/connector prompts
6. Kling v3 Pro motion clause
7. First-segment comparison fan-out
8. Homepage copy fields

## Intake checklist (SKILL Phase 2)

Collect and write down:

- `SUBJECT` — the business + one-line pitch.
- `BRAND_NAME` — display name.
- `PALETTE` — 4–6 named hexes, e.g. `taro #9B7EBD, cream #F5EDE0, caramel #C88A5A, matcha #8FB98A, plum #3A2E48`. Pick ONE as the scene **background** colour (usually the lightest) and one as the primary **accent**.
- `TONE` — a word or two (cozy/premium, playful, industrial…).
- `STYLE` — the art direction (default below).
- `WORLD_TOPOLOGY` — `floating-island` or `connected/full-bleed`. Lock this explicitly.
  Do not default a named real location to a detached island.
- `LOCALITY` — architecture, road/ground materials, vegetation, weather/light, coastline or
  topography, and other cues that make a named place read correctly. Use brand colours as
  accents when applying them to roads, water, or terrain would change the geographic reading.
- `SECTIONS[]` — ordered list; for each: `id`, `label`, `subject` (what is in the scene), `eyebrow`, `title`, `body` (≤ 1 sentence), `tags[]` (0–3). Last section = hero product + CTA.
- `CAMERA` — fly-through (architecture B: dives plus aerial hops) | walkthrough
  (architecture A: expressive, always-forward legs) | locked-iso (architecture A plus
  the fixed-angle clause below). **Always ask** and explain the feel/trade-off of each.
- `MOBILE` — yes/no. **Always asked** (SKILL Phase 2), presented to the user
  with the ~2× credit cost stated.
- `VIDEO_PROVIDER` — `wan` or `fal.ai`. Ask unless the invocation already selected it.
- `VIDEO_MODEL` — current top Wan model (presently Wan 3.0), or exactly
  `fal-ai/kling-video/v3/pro/image-to-video`. Store provider/model in
  `.scroll-world/review/run-manifest.json` and never silently switch them during a run.
- `VIDEO_TIER` — Wan uses `720P` draft/previz and `1080P` production with the same model.
  fal/Kling Pro exposes no resolution parameter: use the same Pro endpoint, verify returned
  dimensions, and never substitute Standard or upscale a lower result.
- `GENERATE_AUDIO` — no. The site is muted and native audio materially increases cost.
- `STILLS_SOURCE` — direct ChatGPT/Codex image generation. Never use a video-provider image command.
  Use one approved image model/style path throughout; if the direct tool is unavailable,
  ask the user for supplied images or approval for another image source.
- `MOBILE=yes` means the **native 9:16 portrait chain** (pipeline §9):
  portrait renders of every dive/connector + `clipMobile`/`connectorsMobile`/`stillMobile`
  wiring + the full mobile QA. The approved crop fallback in pipeline §9 makes no provider
  generation request and is a stopgap only.
- `REVISION_ALLOWANCE` — 25–50% beyond the accepted-media base for simple empty scenes
  with modest motion. Use 50–100%+ when the brief includes strict no-text/glyph constraints,
  moving people or vehicles, literal UI/screens, exact named geography/topology, dependent
  architecture-A legs, native portrait, or complex transformations. The first boundary leg
  may need extra headroom because its defects propagate. This is scope headroom, never
  permission to auto-reroll: every still and video candidate goes through `review-workflow.md`.
- `FAN_OUT` — optional named first-segment branches when the user wants to compare major
  directions. Record each branch's still/prompt/video independently and lock one winner
  before continuing the journey.

## Style preamble (default: clay diorama)

Reuse verbatim in every scene prompt. Swap the bracketed bits for the locked topology,
locality, and brand palette.

```
Isometric low-poly 3D diorama. [WORLD_TOPOLOGY CLAUSE] [LOCALITY CLAUSE].
Soft matte clay 3D render,
rounded toy-model shapes, gentle warm studio lighting, soft long shadows, tilt-shift
miniature look. Cohesive color palette of [PALETTE]. Highly detailed, centered
composition, absolutely no text, no letters, no numbers, no logos, no watermarks,
no pseudo-text, no decorative glyphs.
```

Topology clauses:

- **Floating island:** “The scene floats as a small rounded island on a plain solid
  [BG_HEX] background with a soft contact shadow beneath it.”
- **Connected/full-bleed:** “Continuous terrain and neighbourhood extend through every
  frame edge; this is part of a larger connected world, never a detached or floating island.”

Keep the locality clause byte-identical across scenes. It should name only stable visual
cues from the locked brief, not stereotypes or invented landmarks.

Alternate directions (swap the first two sentences, keep the palette/no-text tail):

- **Flat papercraft:** "Isometric layered papercraft diorama built from premium matte
  cardstock. Use precise die-cut edges, deliberate folds, fine paper fibres, stacked depth
  planes, and soft contact shadows between layers; keep the finish editorial and refined."
- **Glossy toy:** "Isometric premium vinyl-toy diorama with smooth moulded forms. Use
  controlled semi-gloss plastic shading, crisp silhouettes, translucent details only where
  physically plausible, soft rim light, and the finish of a sophisticated collectible."
- **Claymation:** "Isometric stop-motion set handmade from plasticine. Use visible but
  restrained fingerprints, sculpting marks, gently imperfect edges, expressive modelled
  forms, and softbox lighting that reads as a premium practical-animation stage."
- **Neon night:** "Isometric night miniature with rain-dark surfaces, warm interiors, and
  restrained neon ambience. Attach every teal, coral, or amber glow to a visible blank
  canopy edge, window reveal, handrail, or architectural fixture; use wet reflections,
  moody rim light, and deep cinematic shadows."
- **Photoreal architectural:** "Ultra-photorealistic architectural photography of one
  cohesive environment. Use accurate construction, premium natural materials, restrained
  interiors, a cinematic wide-angle lens, warm golden-hour light, controlled verticals,
  editorial composition, realistic reflections, and shallow but practical depth of field."
- **Architectural maquette:** "Isometric professional architectural presentation model
  built from precision-cut foamboard, museum board, basswood, and translucent acrylic.
  Use exact massing, crisp joins, restrained material samples, soft gallery lighting, and
  the calm clarity of a competition maquette."
- **British model village:** "Isometric practical model village grounded in recognisable
  British vernacular architecture. Use finely built masonry, slate roofs, realistic road
  proportions, hedges, coastal-weather patina, tiny warm interiors, and restrained
  museum-quality model-railway craftsmanship."
- **Hand-painted resin miniature:** "Isometric cast-resin miniature with individually
  hand-painted surfaces. Use fine brush variation, subtle edge highlights, matte varnish,
  carefully weathered stone and metal, crisp sculpted detail, and premium tabletop-display
  lighting."
- **Low-poly game world:** "Isometric low-poly environment with intentional faceted
  geometry and a production-ready game-art finish. Use simplified architectural masses,
  restrained texture density, clean baked-light gradients, stable edges, readable material
  separation, and calm atmospheric depth."
- **Frosted acrylic and glass:** "Isometric architectural world assembled from frosted
  acrylic, translucent resin, and clear glass. Use crisp opaque structural cores, controlled
  refraction, softly glowing edges, limited internal reflections, and precise studio lighting
  so every building keeps a strong readable silhouette."
- **Gouache storybook:** "Isometric storybook scene painted in opaque gouache on subtly
  textured paper. Use confident matte brush shapes, layered colour, softened but deliberate
  edges, simplified perspective, restrained dry-brush detail, and warm editorial lighting."
- **Watercolour and ink:** "Isometric architectural illustration drawn with controlled
  waterproof ink and transparent watercolour washes. Use assured line weight, selective
  pigment blooms, visible paper grain, luminous layered colour, generous tonal hierarchy,
  and clean silhouettes around every focal subject."
- **Layered paper collage:** "Isometric editorial collage assembled from cut and gently
  torn coloured paper. Use visible paper fibres, overlapping shape planes, tactile edge
  variation, shallow parallax, selective abstract printed texture,
  and a carefully art-directed magazine finish."
- **Felt and wool stop-motion:** "Isometric stop-motion world handmade from needle-felted
  wool, stitched fabric, and compact textile forms. Use visible fibres, neat seams, soft
  tactile volume, miniature practical lighting, and firmly shaped edges that remain coherent
  at small scale."
- **Wooden toy town:** "Isometric town carved from hardwood and painted wood. Use visible
  natural grain, rounded joinery, matte painted accents, small inset windows, simple durable
  forms, and warm workshop lighting with a premium heirloom-toy finish."
- **Blueprint and technical drawing:** "Axonometric technical illustration on a deep
  blueprint field. Use precise luminous drafting lines, selective solid cutaway masses,
  measured line-weight hierarchy, sparse cyan and warm accent highlights, clean junctions,
  and an elegant unlabelled architectural-visualisation finish."
- **Retro-futurist:** "Isometric optimistic retro-futurist world shaped by mid-century
  industrial design. Use sweeping but plausible architecture, warm analogue materials,
  streamlined civic details, softly integrated technology, sun-faded colour blocking,
  tactile model-making, and cinematic 1960s–1970s concept-art lighting."
- **Solarpunk:** "Isometric near-future community where technology and ecology are visibly
  integrated. Use plausible timber and stone construction, abundant region-appropriate
  planting, passive shading, solar surfaces, water management, warm daylight, and crafted
  credible human-scale infrastructure."
- **Cinematic photoreal:** "Photorealistic cinematic location still with grounded,
  lived-in environmental detail. Use a natural 35 mm film perspective, realistic weather
  and surface wear, motivated practical light, subtle coastal atmosphere, restrained film
  grain, truthful colour, and deep enough focus to preserve the complete camera route."
- **Graphic cel-shaded 3D:** "Isometric 3D world rendered with graphic cel shading. Use
  clean contour lines, two-to-three deliberate tonal bands per material, controlled ambient
  shadows, bold readable silhouettes, restrained texture, and polished animation-production
  design with disciplined graphic effects."
- **Monochrome with brand accents:** "Isometric world rendered primarily in one restrained
  neutral material family. Preserve believable material values and depth, then apply the
  approved brand colours only to focal doors, windows, routes, and service moments; use
  disciplined contrast and soft studio lighting."

Photoreal branches use connected/full-bleed topology and real openings such as streets,
doors, or glazing for camera travel. Keep the approved art direction through the identical
text preamble; use reference inputs only when the selected image tool can preserve composition
without cloning one scene into every section.

After the style is approved, derive one concise `[STYLE VIDEO TAIL]` from the selected
direction: retain
the medium, materials, lighting, edge/shading language, topology, locality, and palette;
omit still-only composition wording. Record it with the branch and reuse it byte-for-byte
in every video prompt. The tail is complete when a frame from any leg can be identified as
the approved medium without relying on its subject matter.

## Scene still prompt (SKILL Phase 4)

```
[STYLE PREAMBLE]
Subject: [SECTION.subject — describe the scene: the building/space, a few
characters doing the work, the props that signal this stage of the business].
```

Tips:
- Name concrete props (they anchor the scene): tanks, cauldrons, conveyor, crates, awning, string lights, benches, scooters, map pins.
- For the final "hero product" section, drop the diorama-island framing and prompt a
  single oversized product centerpiece floating on the same background with a few small
  orbiting props.
- **Compose for the centre.** The page renders every clip `object-fit:cover`. Keep the
  focal subject horizontally centred with a little headroom, and don't park anything
  essential at the far left/right edges. Mobile ships its own native 9:16 chain
  (pipeline §9), so this is not about surviving a crop — but a centred composition makes
  the portrait renders open cleanly from the same still, and it keeps the dive's focal
  point where the camera actually flies.
- Use 3:2 for an explicitly approved floating-island concept that may be recomposed; use 16:9 for full-bleed
  desktop art. Native full-bleed mobile uses a separately generated 9:16 composition.
  Request the direct image tool's high-quality output; retain the exact original pixels.

Generate one still candidate only, present the actual image with prompt/model/dimensions/
quality, and wait for explicit thumbs-up or thumbs-down. Preserve rejected revisions.
Only approved stills may condition video. After every scene still is individually approved,
present an approved-files-only contact sheet and wait for separate cohesion approval before
generating video.

## Leg prompt — architecture A, continuous forward take (SKILL Phase 4)

`--first-frame = previous leg's ACTUAL last frame` (leg 0: the first scene's still).
**No `--last-frame`.** The bolded clauses are the motion-handoff contract — keep them
verbatim; the mid-leg move is where the expression goes.

The locked provider receives the exact previous frame as its start frame. Keep the approved
scene concept, shared style preamble, palette, props, and destination explicit in the prompt;
never replace the previous rendered boundary with a concept still.

```
Single continuous cinematic camera move, no cuts. **Continue the same steady forward
glide.** [MID-LEG MOVE — optional, from the library below.] The camera moves into
[SCENE i] toward [FOCAL POINT]. **In the final second, settle into a steady forward
glide toward [the doorway / opening / direction of the next scene].**
[STYLE VIDEO TAIL]. Smooth continuous motion, subtle parallax. No text, no captions.
```

For `CAMERA = locked-iso`, omit the mid-leg move and include this clause in every leg:

```
The camera keeps exactly the same high isometric angle throughout—no rotation, no orbit,
no tilt. It travels straight and level while the world slides beneath the same view.
```

Keep the normal opening/closing forward-drift handoff clauses. Reject a leg whose angle
rotates materially before allowing its final frame to condition the next leg.

### Mid-leg move library (pick by concept; omit for a plain glide)

Reversals are safe *inside* a leg (it's one continuous render) — only a seam may never
reverse. That's why "ease back out" is fine mid-leg.

- **Half-orbit** (product, luxury): "sweeping in a smooth half-orbit around [the hero
  object], keeping it centered, then continuing past it"
- **Crane-up reveal** (scale, atriums, campuses): "rising smoothly as the full scale of
  [the space] reveals below"
- **Low lateral track** (production lines, counters, shelves): "tracking low and level
  alongside [the line], foreground objects sliding past in parallax"
- **Push-in + ease back** (craft, detail): "pushing in close to [the craft moment] until
  it nearly fills the frame, then easing gently back out"
- **Rise-and-swoop** (travel, outdoors): "climbing in a gentle arc over [the terrain],
  then swooping down toward [the next focal point]"

After rendering each leg, **check its last frame** before generating the next: it should
read as a frame from a calm forward glide (no motion blur sideways, no half-finished
orbit). Present the full candidate for thumbs-up/down. If rejected, apply the user's
feedback and revise this leg only; a bad or unapproved handoff frame must never feed the
next leg.

## Dive-in clip prompt (SKILL Phase 4)

`--first-frame = the scene still` (solid-bg version).

```
Single continuous cinematic camera move, no cuts. Begin high and far, looking down at the
whole [SECTION.subject] within its environment. The camera glides forward
and descends toward it, sweeping in toward [FOCAL POINT — the counter/the cauldrons/the
people], as if flying inside. As the camera pushes in, the roof and upper structure
gently lift and open away to reveal the warm interior. [STYLE VIDEO TAIL]. Smooth continuous motion,
subtle parallax. No text, no captions.
```

For scenes with no building to open (a field, a plaza, a road), replace the roof clause
with "the camera flies low across [the scene] toward [focal point]."

Generate dives only within the independently approved provider batch/concurrency rules; review
each candidate separately. Lock the approved dive set before any connector generation.

Submit through the locked adapter in `video-providers.md`. Use the approved start frame,
`prompt`, an 8-second starting duration, and generated audio off. Wan uses `720P` for draft
or `1080P` for production. fal/Kling accepts no resolution field and must use `prompt`, never
`multi_prompt`.

## Connector clip prompt (SKILL Phase 4)

`--first-frame = dive_i LAST frame` (extracted), `--last-frame = dive_{i+1} FIRST frame`
(extracted). Both from the RENDERED videos, not the stills.

```
Single continuous cinematic camera move, no cuts. The camera smoothly pulls up and back
out of [SCENE i], rising into the sky, then glides forward across the connected
world and arrives above [SCENE i+1], beginning to descend toward it. One connected
world in the approved medium, seamless flowing aerial transition. [STYLE VIDEO TAIL]. Smooth
continuous motion. No text, no captions.
```

For the last connector into a hero-product finale: "…glides forward and the world
dissolves toward a single giant [PRODUCT] floating in soft [BG] space, arriving in front
of it."

Submit through the locked adapter in `video-providers.md` with the approved start/end frames,
`prompt`, a 5-second starting duration, and generated audio off. Both endpoints must share
the intended aspect ratio. For fal/Kling, use `end_image_url` and never `multi_prompt`.

Generate connectors only within the independently approved provider batch/concurrency rules.
Review each separately and show both required seam frames beside its candidate boundary
frames; technical frame matching does not replace human approval of the motion between them.

## Kling v3 Pro motion clause

For the fal/Kling adapter, remove contradictory “slow motion” or barely-moving camera
language from the chosen template and append this to every video prompt:

```
The camera glides decisively at a brisk, clearly perceptible pace from the first second,
covering substantial visible distance throughout the shot. Maintain smooth cinematic
acceleration and continuous motion; never hover, stall, crawl, or move imperceptibly.
```

Keep subject motion readable and natural. Put `static`, frozen/stalled motion, slow camera,
cuts/cutaways, flicker, artifacts, text, and logos in the adapter's negative prompt. Use the
single `prompt` field only; `multi_prompt` is forbidden because it creates shot cutaways.

## First-segment comparison fan-out

When the user requests alternative directions, create named branches such as `v01` clay,
`v02` photoreal, and `v03` locked-isometric. If visual direction changes, generate and
approval-gate a separate start still for each branch before its video. If only camera motion
changes, branches may share one approved start still.

Present every candidate independently, then present the approved trial videos together for
one explicit branch choice. Persist the winning provider/model, style preamble, camera clause,
prompt, and exact start media. Preserve but quarantine non-winning branches; never draw prompt
details, frames, or feedback from them unless the user explicitly reopens that branch.

## Copy per section (for the engine config)

- `eyebrow` — 2–4 words, uppercase feel (a value-prop label).
- `title` — 3–6 words, the beat's headline. First section = the site's hero line; last =
  the payoff + it carries the CTA.
- `body` — one sentence, plain-spoken, from the visitor's side.
- `tags` — 0–3 short proof chips (e.g. "Fresh-cooked", "30-min delivery").
