# Pipeline: approved images + provider-locked video

## Contents

1. Preflight and fixed settings
2. Candidate naming and approval ledger
3. Images outside the video provider
4. Provider submission and result handling
5. Architecture A legs
6. Architecture B dives and connectors
7. Optional first-segment fan-out
8. Approved-only encoding and posters
9. Mobile delivery
10. Failure handling

Use native PowerShell on Windows and native Bash on Unix-like systems. Do not pass paths
between shells. Every `wan` call made by an agent must use `--output json`. Never install,
update, authenticate, buy credits, or switch accounts without explicit user approval. Read
`video-providers.md` completely before any video-provider call.

## 1. Preflight and fixed settings

Before media work:

```powershell
ffmpeg -version
ffprobe -version
```

Ask for or read the user's provider/model choice and immediately write
`.scroll-world/review/run-manifest.json`. Then run only that adapter's preflight from
`video-providers.md`. Stop if authentication or model access is invalid. Summarize only the
necessary account/authentication state and live concurrency; never expose credentials or
unrelated profile data.

Lock these settings for the build:

```text
VIDEO_PROVIDER = wan | fal.ai
VIDEO_MODEL = current top Wan model | fal-ai/kling-video/v3/pro/image-to-video
WAN_DRAFT_RESOLUTION = 720P
WAN_PRODUCTION_RESOLUTION = 1080P
VIDEO_AUDIO = false
DESKTOP_INPUT_ASPECT = 16:9
PORTRAIT_INPUT_ASPECT = 9:16
MAX_VIDEO_CONCURRENCY = min(3, selected provider's live/reported limit)
```

Do not switch provider/model for drafts. For Wan, re-check the current top model and use
720P/1080P. fal/Kling Pro exposes no resolution parameter: do not invent one or switch to
Standard; verify returned dimensions and reject a sub-1080 production source. For both,
create exact 16:9 or 9:16 boundary frames before submission and never mix aspects in a chain.

Use explicit fixed durations for scroll pacing. Eight seconds is a good section-leg/dive
starting point; five seconds is a good connector starting point. Do not use Smart Duration
for a frame-locked chain because section timing must remain predictable.

## 2. Candidate naming and approval ledger

Create a project-local `.scroll-world/` working root. Keep prompts, manifests, approval
ledgers, candidates, raw masters, proxies, contact sheets, extracted boundaries, and all
other intermediate media beneath it. Ensure that root is ignored by version control and
keep it out of the app's published assets. Only after approval and encoding, copy the exact
web-consumed files into the project's configured final delivery/output location. Prefix
scene media with its two-digit narrative order and retain `_rNN` as the final stem suffix:

```text
01_desktop-still-farm_r01.png
01_desktop-leg-farm_r01.mp4
01_desktop-dive-farm_r01.mp4
01-02_desktop-connector-farm-to-shop_r01.mp4
01_portrait-dive-farm_r01.mp4
01_desktop-dive-farm_v02_r01.mp4
```

Use the same scene ordinal for its still, leg, dive, extracted boundary frames, posters, and
delivery assets. Name a connector with both endpoint ordinals (`01-02_`). Insert optional
fan-out variant `_vNN` immediately before `_rNN`. Zero-pad order and revision to at least two
digits. Never overwrite a candidate or use a glob to infer order/approval.

Maintain `.scroll-world/review/approval-ledger.md`. Record order, slot, optional branch, orientation,
revision, prompt path, input SHA-256 hashes, provider, model/endpoint, resolution when
provider-controlled, returned dimensions, duration, audio setting, request/task ID, saved
raw path, review status, feedback, and approved path. Record measured billing data only when
readily available; do not turn every review into a price update.

Before paid video generation:

1. Show the accepted-media count plus revision allowance and live provider concurrency.
2. Get explicit permission for one representative paid video.
3. Generate that clip through the locked provider.
4. After it finishes, estimate the remaining work once using `video-providers.md` and ask
   whether to continue. Do not repeat price throughout unless scope materially changes.

## 3. Images outside the video provider

Use the direct ChatGPT/Codex image-generation tool for every stochastic image. Do not call
Wan, fal, or Kling image generation from this skill.

For each image slot:

1. Build the prompt from `prompts.md`, keeping the shared style preamble byte-identical.
2. Generate one high-quality candidate and preserve it with a revisioned name.
3. Present the actual image, prompt, image tool/model when exposed, dimensions, and revision.
4. Ask for `👍 Approve` or `👎 Reject` plus feedback.
5. On rejection, revise only what the feedback warrants and generate one new revision.
6. Use the pixels in later prompts or video-provider inputs only after explicit approval.

After every scene still is individually approved, show an approved-files-only contact sheet
and obtain a separate cohesion approval. If direct image generation is unavailable, stop
and ask the user to supply images or approve another image source.

Concept images are conditioning inputs, not public posters. Public posters come from exact
frame 0 of approved videos.

### Conditioning-frame hazard gate

Before any approved still or extracted boundary frame is uploaded to a video provider:

1. Inspect the original at full resolution, not only a chat preview or contact sheet.
2. Inspect native-resolution crops around awnings/canopies, signs, doors/plaques, number
   plates, screens/UI, tiny people, vehicles, posts, wires, and other thin props.
3. Reject or clean any unwanted glyph, malformed anatomy, disappearing object, stray line,
   or topology defect before submission.
4. Record the inspected input hash in the approval ledger.

Prompts rarely remove defects already present in conditioning pixels. Treat every such
defect as chain-blocking: a contaminated start or boundary frame must not condition video.

## 4. Provider submission and result handling

Create a candidate-specific directory and prompt file. Submit with the exact locked adapter
from `video-providers.md`; never use provider auto-selection. Persist the full request payload,
request/task ID, provider/model, input hashes, and target candidate path immediately.

Wan tasks may take several hours and must remain resumable from the stored task ID. fal/Kling
normally finishes in minutes, so wait through its queue/status flow and keep the user updated.
Neither elapsed time nor a transient status authorizes duplicate submission.

Provider queue records and result URLs are not durable storage. As soon as a job reports
completion, fetch its result, download it into `.scroll-world/`, and validate the local file
before doing unrelated work. Preserve the request/task ID and all status/result URLs even
after download; follow the provider-specific ambiguous-result recovery contract rather than
resubmitting.

After download, verify the exact candidate:

```powershell
ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height,r_frame_rate `
  -show_entries format=duration -of json $candidatePath
```

Reject audible generated sound. Always use `-an` during delivery encoding even when the
request disabled audio. A valid file and matching technical metadata still require review.

### Concurrency

Immediately before every submission, refresh the selected provider's live/reported
concurrency. Never have more than three skill-created video tasks in flight. For Wan, never
exceed available `taskQuota.video`. For fal/Kling, assume one concurrent request unless the
live MCP/account reports a higher limit.

Parallel submission is allowed only when all are true:

- the user explicitly authorized that named batch;
- the jobs are independent (for example, approved architecture-B dives);
- each slot has one candidate, not multiple speculative revisions;
- every result will be presented and approved separately;
- no result is used in another prompt/input until that exact candidate is approved.

Architecture-A legs are always sequential. Architecture-B connectors can be parallel only
after all endpoint-providing dives are approved. If uncertain, submit one candidate.

## 5. Architecture A: continuous forward legs

Leg 1 starts from the approved first-scene still. Every later leg starts from the exact
final rendered frame of its approved predecessor. Generate and review one leg before the
next because the dependency is strict.

Submit through the locked adapter with `$exactApprovedStart`, no end frame, the exact leg
prompt, an 8-second starting duration, and generated audio off. For fal/Kling, append the
required brisk-glide clause and use the negative prompt from `video-providers.md`.

After download, extract the final frame from the exact candidate:

```powershell
ffmpeg -v error -y -sseof -1 -i $candidateVideo -vf reverse -frames:v 1 -q:v 2 $candidateLastFrame
```

Present the full video plus first/25%/50%/75%/final review frames. Only after approval may
`$candidateLastFrame` become the next leg's `--first-frame`. If an approved upstream leg is
replaced, invalidate every downstream leg and explain the regeneration scope.

Architecture A uses approved legs as section clips and has no connectors.

## 6. Architecture B: dives and connectors

### Dives

Each dive starts from its exact approved scene still:

Submit through the locked adapter with `$approvedSceneStill`, no end frame, the exact dive
prompt, an 8-second starting duration, and generated audio off. For fal/Kling, use only
`prompt`, append the brisk-glide clause, and never send `multi_prompt`.

Dives are independent and may use up to the safe live concurrency after the representative
clip and explicit batch approval. Present each candidate separately. Lock the complete dive
set before connector work.

### Exact boundary frames

For adjacent dives, connector start is dive i's final rendered frame and connector end is
dive i+1's first rendered frame. Use only exact approved ledger paths:

```powershell
ffmpeg -v error -y -ss 0 -i $approvedDive -frames:v 1 -q:v 2 $approvedFirst
ffmpeg -v error -y -sseof -1 -i $approvedDive -vf reverse -frames:v 1 -q:v 2 $approvedLast
```

Never use concept stills as connector endpoints.

### Connectors

Submit through the locked adapter with `$approvedPreviousLast` and `$approvedNextFirst`, the
exact connector prompt, a 5-second starting duration, and generated audio off. For
fal/Kling, map these to `start_image_url` and `end_image_url`, and use only `prompt`.

Present the candidate and endpoint comparisons. A connector must be explicitly approved
before it enters the delivery manifest. Replacing a dive invalidates its adjacent
connector(s).

## 7. Optional first-segment fan-out

Fan out only when the user asks to compare named directions or variations. Record every
branch in `.scroll-world/review/run-manifest.json` with `branchId`, concept, provider/model, prompt path,
input path/hash, status, and candidate paths.

- If art direction/composition differs, create and approve a separate start still for each
  branch before generating that branch's first video.
- If only motion prompting differs, reuse the same exact approved start still.
- Name variants with `_vNN_rNN`, for example
  `01_desktop-dive-community_v02_r01.mp4`.
- Independent branches may use only the selected provider's safe concurrency. fal/Kling
  normally runs them sequentially because its default concurrency is one.
- Present each piece of media with its own thumbs-up/down. Then present the viable first
  videos together and ask for one explicit winning branch.
- Lock that winner before generating scene 2 or any connector. Preserve non-winning branches
  as inactive; never let their frames, prompts, or feedback condition the winning chain.

Fan-out authorization covers only the named candidates requested by the user. It is not
permission for speculative extra variations or automatic rerolls.

## 8. Approved-only encoding and posters

Retain raw provider masters. Encode only exact approved ledger paths. Production sources
must be 1080p; never upscale a 720p or otherwise undersized draft.

```powershell
ffmpeg -v error -y -i $approvedSource -an `
  -vf 'unsharp=5:5:0.8:5:5:0.0' `
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p `
  -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart $deliveryVideo
```

Verify width/height/duration/fps with `ffprobe`. Extract each public poster from exact frame
0 of its approved section video, never from a concept still:

```powershell
ffmpeg -v error -y -ss 0 -i $approvedSource -frames:v 1 -q:v 2 $poster
ffmpeg -v error -y -i $poster -vf 'scale=1280:-2' -c:v libwebp -quality 84 $fullPoster
ffmpeg -v error -y -i $poster -vf 'scale=960:-2' -c:v libwebp -quality 82 $poster960
ffmpeg -v error -y -i $poster -vf 'scale=640:-2' -c:v libwebp -quality 80 $poster640
ffmpeg -v error -y -i $poster -vf 'scale=32:-2,gblur=sigma=2' -c:v libwebp -quality 28 $lqip
```

Never upscale poster derivatives: omit a requested width above the source width. Visually
compare all derivatives with the approved frame 0. Build exact approved section and
connector manifests; do not use revision globs.

## 9. Mobile delivery

### Native portrait chain

When the user approves native mobile, finish and lock desktop first. Generate a complete,
independent 9:16 chain using portrait-approved stills and portrait-rendered boundaries. For
Wan, use the locked top model at `720P` for portrait tests and `1080P` for production. For
fal/Kling, use the locked Pro endpoint without a resolution field and verify a 1080p
portrait source. Encode delivery files to 720 pixels wide, CRF 23, GOP 4.

```powershell
ffmpeg -v error -y -i $approvedPortraitSource -an `
  -vf 'scale=720:-2,unsharp=5:5:0.6:5:5:0.0' `
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p `
  -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart $mobileDelivery
```

Extract portrait posters from exact frame 0. Produce 720- and 480-wide first-picture
sources plus a portrait LQIP. Wire `stillMobile`, `clipMobile`, and `connectorsMobile`.
Desktop approval never approves portrait media.

### Approved crop fallback

If the user explicitly accepts a desktop-derived fallback, encode a smaller landscape file
with GOP 4 and let `object-fit: cover` crop it. Present the crop for thumbs-up/down because
it may lose the focal subject. Label it as a fallback, never “native mobile”.

## 10. Failure handling

- Follow provider-specific recovery in `video-providers.md` and `media-gotchas.md`.
- On an ambiguous Wan creation response, inspect `wan task list --media-type video --output
  json` before resubmitting. Never duplicate a possibly successful task.
- On concurrency codes `4007`, `50000`, or `100101`, wait for existing tasks and refresh
  auth status. Do not treat them as credit failures.
- On `50001`, report insufficient currently usable credits. On `50004`, inspect credits,
  auth status, and in-flight tasks before explaining the cause.
- On `LOCAL_FILE_VALIDATION_FAILED`, follow structured `details.actual`, `details.limits`,
  and `details.suggestedFix`. Never modify a source in place. Ask before cropping, padding,
  upscaling, extending, or inventing audio.
- On content-safety codes `9007`, `9008`, `9012`, or `10017`, preserve the candidate and
  ask the user to revise or replace the affected input. Never silently downgrade the model.
- On membership code `4018`, stop and tell the user an eligible Wan membership is required.
- Treat `taskQuota.video` only as available concurrency. Use `wan credits --output json`
  for credits.
- For fal/Kling, inspect the existing queue request ID/status before retrying. Correct MCP
  authentication without exposing `FAL_KEY`; never switch to multi-prompt, elements,
  Standard, or another model as error recovery.

After every result, return to `review-workflow.md`. A successful task is still unapproved
until the user sees it and gives an explicit thumbs-up.
