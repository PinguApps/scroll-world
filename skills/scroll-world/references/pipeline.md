# Pipeline: approved images + Wan 3.0 video

## Contents

1. Preflight and fixed settings
2. Candidate naming and approval ledger
3. Images outside Wan
4. Wan submission and result handling
5. Architecture A legs
6. Architecture B dives and connectors
7. Approved-only encoding and posters
8. Mobile delivery
9. Failure handling

Use native PowerShell on Windows and native Bash on Unix-like systems. Do not pass paths
between shells. Every `wan` call made by an agent must use `--output json`. Never install,
update, authenticate, buy credits, or switch accounts without explicit user approval.

## 1. Preflight and fixed settings

Before the first Wan command in a session:

```powershell
wan --version
wan update --check --output json
wan --help
wan auth status --output json
wan auth list --output json
wan credits --output json
wan task list --page-size 10 --media-type video --output json
ffmpeg -version
ffprobe -version
```

If an update is available, ask before running it; if the user declines, stop video generation
because the current top model cannot be guaranteed. Stop if authentication or membership is
invalid. Read `taskQuota.video` as the number of video submissions available now; it is not
a daily generation allowance or credit balance. Summarize only authentication state, active
site/account label, quotas, and credits; do not repeat profile/address data from auth output.

Lock these settings for the build:

```text
VIDEO_MODEL = current top Wan model (Wan 3.0 / modelVersion=3_0 at authoring time)
DRAFT_RESOLUTION = 720P
PRODUCTION_RESOLUTION = 1080P
VIDEO_AUDIO = false
DESKTOP_INPUT_ASPECT = 16:9
PORTRAIT_INPUT_ASPECT = 9:16
MAX_VIDEO_CONCURRENCY = min(3, live taskQuota.video)
```

Do not select an older model for drafts. Re-run the version/update check for a later build
instead of treating `wan3.0` as permanently top. With current Wan 3.0 frame-to-video, omit
`--ratio` (or use only `adaptive`): output follows the first frame. Therefore create exact
16:9 or 9:16 boundary frames before submission and do not mix aspects within a chain.

Use explicit fixed durations for scroll pacing. Eight seconds is a good section-leg/dive
starting point; five seconds is a good connector starting point. Do not use Smart Duration
for a frame-locked chain because section timing must remain predictable.

## 2. Candidate naming and approval ledger

Create project-local `review/` and scratch/output directories. Keep every revision:

```text
desktop-still-farm-r01.png
desktop-leg-farm-r01.mp4
desktop-dive-farm-r01.mp4
desktop-connector-01-r01.mp4
portrait-dive-farm-r01.mp4
```

Maintain `review/approval-ledger.md`. Record slot, orientation, revision, prompt path,
input SHA-256 hashes, model/modelVersion, resolution, duration, audio setting, Wan task ID,
pre/post credits, saved raw path, dimensions, review status, feedback, and approved path.
Never overwrite a candidate and never use globs to discover an approved input.

Before paid video generation:

1. Show the accepted-media count plus revision allowance.
2. Show live Wan credits and available video concurrency.
3. Get explicit spend approval.
4. Generate one representative 720p clip, review it, then recalibrate the remaining plan.

## 3. Images outside Wan

Use the direct ChatGPT/Codex image-generation tool for every stochastic image. Do not call
`wan text2image`, `wan image2image`, or `wan sequential_image` in this skill.

For each image slot:

1. Build the prompt from `prompts.md`, keeping the shared style preamble byte-identical.
2. Generate one high-quality candidate and preserve it with a revisioned name.
3. Present the actual image, prompt, image tool/model when exposed, dimensions, and revision.
4. Ask for `👍 Approve` or `👎 Reject` plus feedback.
5. On rejection, revise only what the feedback warrants and generate one new revision.
6. Use the pixels in later prompts or Wan inputs only after explicit approval.

After every scene still is individually approved, show an approved-files-only contact sheet
and obtain a separate cohesion approval. If direct image generation is unavailable, stop
and ask the user to supply images or approve another non-Wan image source.

Concept images are conditioning inputs, not public posters. Public posters come from exact
frame 0 of approved videos.

## 4. Wan submission and result handling

### Command contracts

Single first frame:

```powershell
wan frame2video `
  --first-frame <approved-frame-path> `
  --prompt <prompt-text> `
  --resolution 720P `
  --duration 8 `
  --audio-output=false `
  --output json
```

First and last frame:

```powershell
wan frame2video `
  --first-frame <approved-start-path> `
  --last-frame <approved-end-path> `
  --prompt <prompt-text> `
  --resolution 720P `
  --duration 5 `
  --audio-output=false `
  --output json
```

Use `1080P` for every production render. `720P` is only for tests/previz. Do not pass
`--generation-mode`, `--think-mode`, `--thinking-mode`, uploaded audio, or a legacy
`--model` override. Local PNG/JPEG/WebP inputs are validated and uploaded automatically.

Run `--dry-run` first when changing command shape or media inputs. Confirm the JSON request
contains `modelVersion: "3_0"`, `audio: false`, the intended resolution, `baseImage`, and
`tailImage` when supplied. A dry run does not prove visual quality and is not approval.

### Safe PowerShell candidate submission

Use a candidate-specific directory and prompt file. The example submits one authorized job:

```powershell
$candidate = 'desktop-connector-01-r01'
$candidateDir = Join-Path $work $candidate
New-Item -ItemType Directory -Force -Path $candidateDir | Out-Null

$auth = wan auth status --output json | ConvertFrom-Json
if (-not $auth.ok -or -not $auth.authenticated) { throw 'Wan authentication required.' }
if ([int]$auth.data.taskQuota.video -lt 1) { throw 'No Wan video submission slot is currently available.' }

$before = wan credits --output json | ConvertFrom-Json
$prompt = Get-Content -Raw -LiteralPath (Join-Path $work 'conn_01.txt')
$submission = wan frame2video `
  --first-frame $approvedStart `
  --last-frame $approvedEnd `
  --prompt $prompt `
  --resolution $resolution `
  --duration 5 `
  --audio-output=false `
  --output json | ConvertFrom-Json

$taskId = $submission.taskId
if (-not $taskId) { throw 'Wan did not return a task ID.' }
$submission | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $candidateDir 'submission.json')
```

Do not block silently for minutes. Poll with short `wan result get <taskId> --output json`
calls and keep the user updated. After success, save the watermark-free result:

```powershell
$result = wan result get $taskId --save --save-dir $candidateDir --output json | ConvertFrom-Json
if ($result.statusLabel -ne 'succeeded' -or $result.savedFiles.Count -lt 1) {
  throw "Wan task $taskId did not produce a saved video."
}

$raw = $result.savedFiles[0].path
$candidatePath = Join-Path $work "$candidate.mp4"
if (Test-Path -LiteralPath $candidatePath) { throw "Candidate path already exists: $candidatePath" }
Copy-Item -LiteralPath $raw -Destination $candidatePath
$after = wan credits --output json | ConvertFrom-Json
$measuredDeduction = [int]$before.availableCount - [int]$after.availableCount
ffprobe -v error -show_entries stream=width,height,r_frame_rate -show_entries format=duration `
  -of json $candidatePath
```

`--save` selects the watermark-free `downloadUrl` by default. Use `--with-watermark` only
when the user explicitly asks. Record the result's `savedFiles[].watermark` value.

Also inspect stream types. Wan may retain an effectively silent AAC track even when the
request records `audio: false`; measure it rather than assuming. Reject any audible generated
sound, and always use `-an` in delivery encoding so the homepage asset has no audio stream.

### Concurrency

Immediately before every submission, refresh auth status. Never have more than three
skill-created video tasks in flight, and never exceed the lower available
`taskQuota.video`. The live quota already accounts for in-flight tasks.

Parallel submission is allowed only when all are true:

- the user explicitly approved that named batch's spend;
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

```powershell
wan frame2video `
  --first-frame $exactApprovedStart `
  --prompt (Get-Content -Raw -LiteralPath $legPrompt) `
  --resolution $resolution `
  --duration 8 `
  --audio-output=false `
  --output json
```

After download, extract the final frame from the exact candidate:

```powershell
ffmpeg -v error -y -sseof -1 -i $candidateVideo -vf reverse -frames:v 1 -q:v 2 $candidateLastFrame
```

Present the full video plus first/25%/50%/75%/final review frames. Only after approval may
`$candidateLastFrame` become the next leg's `--first-frame`. If an approved upstream leg is
replaced, invalidate and recost every downstream leg.

Architecture A uses approved legs as section clips and has no connectors.

## 6. Architecture B: dives and connectors

### Dives

Each dive starts from its exact approved scene still:

```powershell
wan frame2video `
  --first-frame $approvedSceneStill `
  --prompt (Get-Content -Raw -LiteralPath $divePrompt) `
  --resolution $resolution `
  --duration 8 `
  --audio-output=false `
  --output json
```

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

```powershell
wan frame2video `
  --first-frame $approvedPreviousLast `
  --last-frame $approvedNextFirst `
  --prompt (Get-Content -Raw -LiteralPath $connectorPrompt) `
  --resolution $resolution `
  --duration 5 `
  --audio-output=false `
  --output json
```

Present the candidate and endpoint comparisons. A connector must be explicitly approved
before it enters the delivery manifest. Replacing a dive invalidates its adjacent
connector(s).

## 7. Approved-only encoding and posters

Retain Wan raw masters. Encode only exact approved ledger paths. Production sources must be
1080p; never upscale a 720p draft.

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

## 8. Mobile delivery

### Native portrait chain

When the user approves native mobile, finish and lock desktop first. Generate a complete,
independent 9:16 chain using portrait-approved stills and portrait-rendered boundaries. Use
Wan 3.0 at `720P` for portrait tests and `1080P` for production sources; encode delivery
files to 720 pixels wide, CRF 23, GOP 4.

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

## 9. Failure handling

- On an ambiguous creation response, inspect `wan task list --media-type video --output
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

After every result, return to `review-workflow.md`. A successful task is still unapproved
until the user sees it and gives an explicit thumbs-up.
